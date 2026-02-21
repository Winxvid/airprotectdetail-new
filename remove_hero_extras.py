import os
import re

services_dir = 'services'

for filename in os.listdir(services_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(services_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove breadcrumb
        # It looks like: <div class="breadcrumb fade-in">...</div>
        # We can use regex to remove it.
        content = re.sub(r'<div class="breadcrumb[^>]*>.*?</div>', '', content, flags=re.DOTALL)
        
        # Remove subtitle
        # It looks like: <p class="hero-subtitle[^>]*>.*?</p>
        content = re.sub(r'<p class="hero-subtitle[^>]*>.*?</p>', '', content, flags=re.DOTALL)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Done removing breadcrumbs and subtitles.")
