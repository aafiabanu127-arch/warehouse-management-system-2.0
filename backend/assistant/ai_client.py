"""
Provider-agnostic AI client for the warehouse assistant.

Pick the provider with the AI_PROVIDER setting ('anthropic' | 'openai' | 'gemini' | 'groq').
Each provider function implements the same tool-use loop against tools.TOOL_SPECS
and returns the same shape: {"reply": str, "tools_used": [str, ...]}.

This is the only file that needs to change if you add a new provider or a new
model from an existing one — views.py and tools.py never need to know which
provider is active.
"""
import json
import logging

from django.conf import settings

from .tools import TOOL_SPECS, TOOLS_BY_NAME, ToolPermissionError

logger = logging.getLogger(__name__)

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


def _system_prompt(user):
    return SYSTEM_PROMPT.format(
        username=getattr(user, "username", "unknown"),
        role=getattr(user, "role", "VIEWER"),
    )


def _execute_tool(name, tool_input, user):
    spec = TOOLS_BY_NAME.get(name)
    if not spec:
        return {"error": f"Unknown tool '{name}'"}
    try:
        return spec["func"](user, **tool_input)
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
    Returns: {"reply": str, "tools_used": [str, ...]}
    """
    provider = getattr(settings, "AI_PROVIDER", "anthropic").lower()
    if provider == "anthropic":
        return _run_anthropic(user, history, user_message)
    if provider == "openai":
        return _run_openai(user, history, user_message)
    if provider == "gemini":
        return _run_gemini(user, history, user_message)
    if provider == "groq":
        return _run_groq(user, history, user_message)
    raise RuntimeError(
        f"Unknown AI_PROVIDER '{provider}'. Set it to 'anthropic', 'openai', 'gemini', or 'groq'."
    )


# ---------------------------------------------------------------------------
# ANTHROPIC (Claude)
# ---------------------------------------------------------------------------

def _anthropic_tools():
    return [
        {"name": t["name"], "description": t["description"], "input_schema": t["input_schema"]}
        for t in TOOL_SPECS
    ]


def _run_anthropic(user, history, user_message):
    import anthropic

    api_key = getattr(settings, "ANTHROPIC_API_KEY", None)
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured on the server.")
    client = anthropic.Anthropic(api_key=api_key)
    model = getattr(settings, "ANTHROPIC_MODEL", "claude-sonnet-4-6")

    messages = [{"role": h["role"], "content": h["content"]} for h in history]
    messages.append({"role": "user", "content": user_message})

    tools_used = []
    for _ in range(MAX_TOOL_ITERATIONS):
        response = client.messages.create(
            model=model,
            max_tokens=1500,
            system=_system_prompt(user),
            tools=_anthropic_tools(),
            messages=messages,
        )
        if response.stop_reason != "tool_use":
            text = "".join(b.text for b in response.content if b.type == "text").strip()
            return {"reply": text or "I don't have a response for that.", "tools_used": tools_used}

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

    return {"reply": _exhausted_message(), "tools_used": tools_used}


# ---------------------------------------------------------------------------
# OPENAI (GPT)
# ---------------------------------------------------------------------------

def _openai_tools():
    return [
        {
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t["description"],
                "parameters": t["input_schema"],
            },
        }
        for t in TOOL_SPECS
    ]


def _run_openai(user, history, user_message):
    from openai import OpenAI

    api_key = getattr(settings, "OPENAI_API_KEY", None)
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured on the server.")
    client = OpenAI(api_key=api_key)
    model = getattr(settings, "OPENAI_MODEL", "gpt-4.1")

    messages = [{"role": "system", "content": _system_prompt(user)}]
    messages += [{"role": h["role"], "content": h["content"]} for h in history]
    messages.append({"role": "user", "content": user_message})

    tools_used = []
    for _ in range(MAX_TOOL_ITERATIONS):
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=_openai_tools(),
        )
        choice = response.choices[0]
        msg = choice.message

        if not msg.tool_calls:
            return {"reply": (msg.content or "").strip() or "I don't have a response for that.",
                    "tools_used": tools_used}

        messages.append({
            "role": "assistant",
            "content": msg.content,
            "tool_calls": [tc.model_dump() for tc in msg.tool_calls],
        })
        for tc in msg.tool_calls:
            tools_used.append(tc.function.name)
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            result = _execute_tool(tc.function.name, args, user)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result, default=str),
            })

    return {"reply": _exhausted_message(), "tools_used": tools_used}


# ---------------------------------------------------------------------------
# GROQ (Llama / Kimi / etc. via Groq's OpenAI-compatible endpoint)
# ---------------------------------------------------------------------------

def _run_groq(user, history, user_message):
    # Groq exposes an OpenAI-compatible chat completions API, so we reuse the
    # openai SDK and tool-call loop, just pointed at Groq's base_url with a
    # Groq API key and model name.
    from openai import OpenAI

    api_key = getattr(settings, "GROQ_API_KEY", None)
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured on the server.")
    client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
    model = getattr(settings, "GROQ_MODEL", "llama-3.3-70b-versatile")

    messages = [{"role": "system", "content": _system_prompt(user)}]
    messages += [{"role": h["role"], "content": h["content"]} for h in history]
    messages.append({"role": "user", "content": user_message})

    tools_used = []
    for _ in range(MAX_TOOL_ITERATIONS):
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=_openai_tools(),
        )
        choice = response.choices[0]
        msg = choice.message

        if not msg.tool_calls:
            return {"reply": (msg.content or "").strip() or "I don't have a response for that.",
                    "tools_used": tools_used}

        messages.append({
            "role": "assistant",
            "content": msg.content,
            "tool_calls": [tc.model_dump() for tc in msg.tool_calls],
        })
        for tc in msg.tool_calls:
            tools_used.append(tc.function.name)
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            result = _execute_tool(tc.function.name, args, user)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result, default=str),
            })

    return {"reply": _exhausted_message(), "tools_used": tools_used}


# ---------------------------------------------------------------------------
# GEMINI (Google)
# ---------------------------------------------------------------------------

def _gemini_tools():
    from google.genai import types

    return [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name=t["name"],
                    description=t["description"],
                    parameters=t["input_schema"],
                )
                for t in TOOL_SPECS
            ]
        )
    ]


def _run_gemini(user, history, user_message):
    # Uses the current `google-genai` SDK (the old `google.generativeai`
    # package is deprecated and rejects the newer "AQ."-prefixed Auth Key
    # format that Google AI Studio now issues by default).
    from google import genai
    from google.genai import types

    api_key = getattr(settings, "GEMINI_API_KEY", None)
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured on the server.")
    client = genai.Client(api_key=api_key)
    model_name = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash")

    # Gemini chat history uses roles "user" / "model"
    gemini_history = [
        types.Content(
            role=("model" if h["role"] == "assistant" else "user"),
            parts=[types.Part(text=h["content"])],
        )
        for h in history
    ]

    config = types.GenerateContentConfig(
        system_instruction=_system_prompt(user),
        tools=_gemini_tools(),
    )
    chat = client.chats.create(model=model_name, history=gemini_history, config=config)

    tools_used = []
    message_to_send = user_message
    for _ in range(MAX_TOOL_ITERATIONS):
        response = chat.send_message(message_to_send)
        parts = response.candidates[0].content.parts

        function_calls = [p.function_call for p in parts if getattr(p, "function_call", None)]
        if not function_calls:
            text = "".join(getattr(p, "text", "") or "" for p in parts).strip()
            return {"reply": text or "I don't have a response for that.", "tools_used": tools_used}

        response_parts = []
        for fc in function_calls:
            tools_used.append(fc.name)
            args = dict(fc.args) if fc.args else {}
            result = _execute_tool(fc.name, args, user)
            response_parts.append(
                types.Part.from_function_response(
                    name=fc.name,
                    response={"result": json.dumps(result, default=str)},
                )
            )
        message_to_send = response_parts

    return {"reply": _exhausted_message(), "tools_used": tools_used}

def _exhausted_message():
    return (
        "I wasn't able to finish that request after several tool calls — "
        "could you rephrase or narrow it down?"
    )
