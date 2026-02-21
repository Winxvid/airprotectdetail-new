import re

with open('service.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'\.service-hero \.container\s*\{[^}]*\}',
    lambda m: m.group(0).replace('z-index: 2;', 'z-index: 2;\n    width: 100%;'),
    content
)

with open('service.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated service.css container")
