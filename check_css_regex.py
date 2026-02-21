import re

with open('service.css', 'r') as f:
    css = f.read()

# Find all media queries
media_queries = re.findall(r'@media[^{]+\{', css)
print(f"Found {len(media_queries)} media queries")

# Check if any media query is missing a closing brace
# A simple way is to count { and } inside the media query block
