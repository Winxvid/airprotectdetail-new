with open('service.css', 'r') as f:
    css = f.read()

open_braces = css.count('{')
close_braces = css.count('}')

print(f"Open braces: {open_braces}")
print(f"Close braces: {close_braces}")
