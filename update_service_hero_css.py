import re

with open('service.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace align-items: flex-end; with align-items: center; justify-content: center; text-align: center;
content = re.sub(
    r'\.service-hero\s*\{[^}]*\}',
    lambda m: m.group(0).replace('align-items: flex-end;', 'align-items: center;\n    justify-content: center;\n    text-align: center;'),
    content
)

with open('service.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated service.css")
