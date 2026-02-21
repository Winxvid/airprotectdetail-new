import re, glob, os

# Read index footer block
with open('/Users/frankiegarcia/Desktop/airprotectdetail copy/index.html','r') as f:
    main = f.read()

# extract <footer class="section-padding" id="footer" ...> ... </footer>
footer_match = re.search(r'(<footer[^>]*id="footer"[\s\S]*?</footer>)', main)
if not footer_match:
    print('Main footer not found!')
    exit(1)
new_footer = footer_match.group(1)

# Now replace each service page footer
count = 0
for path in glob.glob('/Users/frankiegarcia/Desktop/airprotectdetail copy/services/*.html'):
    with open(path,'r') as f:
        content = f.read()
    # find the existing <footer>..</footer> (first occurrence)
    old = re.search(r'(<footer[\s\S]*?</footer>)', content)
    if old:
        new_content = content[:old.start()] + new_footer + content[old.end():]
        with open(path,'w') as f:
            f.write(new_content)
        count += 1
        print(f'Updated footer in {os.path.basename(path)}')
    else:
        print(f'No footer found in {os.path.basename(path)}')

print(f'Done. Updated {count} service pages.')
