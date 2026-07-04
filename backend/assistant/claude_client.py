"""
Thin wrapper around the Anthropic API implementing the tool-use loop for the
warehouse AI assistant. Kept separate from views.py so the HTTP layer stays
simple and this part is easy to unit test / swap providers later.
"""
import json
import logging

from django.conf import settings

from .tools import TOOL_SPECS, TOOLS_BY_NAME, ToolPermissionError

logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-6"
MAX_TOOL_ITERATIONS = 6

SYSTEM_PROMPT = """You are the AI assistant embedded in a Warehouse Management System.
You can answer questions about products, inventory, warehouses, stock movements, and
notifications, and you can perform a small number of real actions (recording stock
movements, adjusting inventory) using the tools available to you.

Guidelines:
- Always use tools to look up real data rather than guessing numbers.
- Keep answers concise and use plain language. Use tables or bullet lists for
  multi-item results.
- Before calling a write/action tool (create_stock_movement, adjust_inventory_quantity),
  make sure you have the specific product SKU, quantity, and type. If the user's request
  is ambiguous, ask a clarifying question first instead of guessing.
- If a tool returns a permission error, tell the user plainly that their account role
  doesn't allow that action, and suggest who could do it (e.g. a Supervisor or Manager).
- If a tool call fails or a product/warehouse isn't found, say so clearly rather than
  inventing an answer.
- You are talking to: {username} (role: {role}).
"""


def _get_client():
    import anthropic
    api_key = getattr(settings, "ANTHROPIC_API_KEY", None)
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not configured on the server. "
            "Set it in your environment/.env file to enable the AI assistant."
        )
    return anthropic.Anthropic(api_key=api_key)


def _claude_tools():
    return [
        {"name": t["name"], "description": t["description"], "input_schema": t["input_schema"]}
        for t in TOOL_SPECS
    ]


def _execute_tool(name, tool_input, user):
    spec = TOOLS_BY_NAME.get(name)
    if not spec:
        return {"error": f"Unknown tool '{name}'"}
    try:
        result = spec["func"](user, **tool_input)
        return result
    except ToolPermissionError as e:
        return {"error": str(e), "permission_denied": True}
    except TypeError as e:
        logger.warning("Bad tool arguments for %s: %s", name, e)
        return {"error": f"Invalid arguments for {name}: {e}"}
    except Exception as e:
        logger.exception("Tool %s failed", name)
        return {"error": f"Tool '{name}' failed: {e}"}


def run_chat(user, history, user_message):
    """
    history: list of {"role": "user"|"assistant", "content": str} from prior turns
    user_message: the new user message (str)

    Returns dict: {"reply": str, "tools_used": [str, ...]}
    """
    client = _get_client()

    messages = [{"role": h["role"], "content": h["content"]} for h in history]
    messages.append({"role": "user", "content": user_message})

    system = SYSTEM_PROMPT.format(
        username=getattr(user, "username", "unknown"),
        role=getattr(user, "role", "VIEWER"),
    )

    tools_used = []

    for _ in range(MAX_TOOL_ITERATIONS):
        response = client.messages.create(
            model=MODEL,
            max_tokens=1500,
            system=system,
            tools=_claude_tools(),
            messages=messages,
        )

        if response.stop_reason != "tool_use":
            final_text = "".join(
                block.text for block in response.content if block.type == "text"
            ).strip()
            return {"reply": final_text or "I don't have a response for that.", "tools_used": tools_used}

        # Append assistant turn (which may include text + tool_use blocks)
        messages.append({"role": "assistant", "content": response.content})

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            tools_used.append(block.name)
            result = _execute_tool(block.name, block.input or {}, user)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": json.dumps(result, default=str),
            })

        messages.append({"role": "user", "content": tool_results})

    return {
        "reply": "I wasn't able to finish that request after several tool calls — could you rephrase or narrow it down?",
        "tools_used": tools_used,
    }
