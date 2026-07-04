path = "src/pages/Landing.tsx"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

fixed_lines = []
fixed_count = 0
for line in lines:
    try:
        fixed = line.encode("cp1252").decode("utf-8")
        if fixed != line:
            fixed_count += 1
        fixed_lines.append(fixed)
    except (UnicodeEncodeError, UnicodeDecodeError):
        fixed_lines.append(line)

with open(path, "w", encoding="utf-8") as f:
    f.writelines(fixed_lines)

print(f"Fixed {fixed_count} lines out of {len(lines)}")
