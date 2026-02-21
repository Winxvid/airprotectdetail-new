import cssutils
import logging

cssutils.log.setLevel(logging.CRITICAL)
try:
    sheet = cssutils.parseFile('service.css')
    print("CSS parsed successfully")
except Exception as e:
    print(f"Error parsing CSS: {e}")
