import glob, os

base = os.path.dirname(os.path.abspath(__file__))
services_dir = os.path.join(base, 'services')

# The mega-menu dropdown that got accidentally put in the footer
old_footer = '''                    <li class="has-dropdown">
                        <a href="../index.html#packages" class="dropdown-toggle">Packages <i class="fa-solid fa-chevron-down dropdown-arrow"></i></a>
                        <div class="dropdown-menu mega-menu">
                            <div class="mega-col" style="border-right: none;">
                                <h4 class="mega-title"><i class="fa-solid fa-shield-halved"></i> Flightline Programs</h4>
                                <ul>
                                    <li><a href="flightline-standard.html">Flightline Standard</a></li>
                                    <li><a href="flightline-elite.html">Flightline Elite</a></li>
                                    <li><a href="flightline-command.html">Flightline Command</a></li>
                                </ul>
                            </div>
                        </div>
                    </li>
                    <li><a href="../index.html#footer">Contact</a></li>'''

new_footer = '''                    <li><a href="flightline-standard.html">Flightline Standard</a></li>
                    <li><a href="flightline-elite.html">Flightline Elite</a></li>
                    <li><a href="flightline-command.html">Flightline Command</a></li>
                    <li><a href="../index.html#footer">Contact</a></li>'''

count = 0
for f in glob.glob(os.path.join(services_dir, '*.html')):
    with open(f, 'r') as fh:
        content = fh.read()
    # Count how many times the pattern appears
    occurrences = content.count(old_footer)
    if occurrences > 1:
        # Replace only the LAST occurrence (footer), keep the first (header nav)
        # Find the last occurrence
        idx = content.rfind(old_footer)
        content = content[:idx] + new_footer + content[idx + len(old_footer):]
        with open(f, 'w') as fh:
            fh.write(content)
        count += 1
        print(f"Fixed footer in: {os.path.basename(f)} (had {occurrences} occurrences, replaced last)")
    elif occurrences == 1:
        print(f"OK (only 1 occurrence - header only): {os.path.basename(f)}")
    else:
        print(f"SKIPPED (pattern not found): {os.path.basename(f)}")

print(f"\nDone. Fixed {count} files.")
