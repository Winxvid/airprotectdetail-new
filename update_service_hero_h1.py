import re

with open('service.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'\.service-hero h1\s*\{[^}]*\}',
    lambda m: m.group(0).replace('margin-bottom: 1rem;', 'margin-bottom: 0;'),
    content
)

with open('service.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated service.css h1")
