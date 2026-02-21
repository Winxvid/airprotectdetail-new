import re

with open('service.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove .service-hero .breadcrumb and its children
content = re.sub(r'\.service-hero \.breadcrumb\s*\{[^}]*\}\s*', '', content)
content = re.sub(r'\.service-hero \.breadcrumb a\s*\{[^}]*\}\s*', '', content)
content = re.sub(r'\.service-hero \.breadcrumb a:hover\s*\{[^}]*\}\s*', '', content)
content = re.sub(r'\.service-hero \.breadcrumb span\s*\{[^}]*\}\s*', '', content)

# Remove .service-hero .hero-subtitle
content = re.sub(r'\.service-hero \.hero-subtitle\s*\{[^}]*\}\s*', '', content)

with open('service.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned service.css")
