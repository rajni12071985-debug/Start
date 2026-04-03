"""
Splices store_replacement.js into app.js, replacing lines 981–1153.
Lines are 1-indexed. We replace from the comment block before
generateStorePage through the closing brace of closeStorePage.
"""

APP_JS      = r'c:\Users\PRAGATI\OneDrive\Desktop\STARTIFY\app.js'
REPLACEMENT = r'c:\Users\PRAGATI\OneDrive\Desktop\STARTIFY\store_replacement.js'

with open(APP_JS, 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

with open(REPLACEMENT, 'r', encoding='utf-8') as f:
    new_code = f.read()

# Find the start line: the comment line just before generateStorePage
start_line = None  # 0-indexed
for i, line in enumerate(lines):
    if 'function generateStorePage()' in line:
        # Walk back to find the comment block start
        j = i - 1
        while j >= 0 and (lines[j].strip().startswith('/*') or
                          lines[j].strip().startswith('*') or
                          lines[j].strip() == '' or
                          '13.' in lines[j] or
                          'GENERATE STORE PAGE' in lines[j]):
            j -= 1
        start_line = j + 1  # first line to replace (0-indexed)
        break

if start_line is None:
    print("ERROR: Could not find generateStorePage")
    exit(1)

# Find end line: closing brace of closeStorePage
end_line = None  # 0-indexed, exclusive
for i in range(len(lines) - 1, start_line, -1):
    if 'function closeStorePage()' in lines[i]:
        # Find its closing }
        for j in range(i + 1, min(i + 10, len(lines))):
            if lines[j].strip() == '}':
                end_line = j + 1  # exclusive
                break
        break

if end_line is None:
    print("ERROR: Could not find end of closeStorePage")
    exit(1)

print(f"Replacing lines {start_line+1}–{end_line} (0-indexed {start_line}–{end_line-1})")
print(f"Removed {end_line - start_line} lines, inserting replacement...")

kept_before = lines[:start_line]
kept_after  = lines[end_line:]

result = ''.join(kept_before) + '\n' + new_code + '\n' + ''.join(kept_after)

with open(APP_JS, 'w', encoding='utf-8') as f:
    f.write(result)

print(f"SUCCESS — app.js updated. Total lines: {len(result.splitlines())}")
