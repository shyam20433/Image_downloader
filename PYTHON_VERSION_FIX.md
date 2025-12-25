# Fix for Python 3.13 compatibility issue
# The bing-image-downloader library uses imghdr which was removed in Python 3.13
# Solution: Use Python 3.11 (specified in runtime.txt)

# If you still get errors on Render, try these alternatives:

# Option 1: Use a different image downloader library
# pip install google-images-download
# pip install icrawler

# Option 2: Fork and fix bing-image-downloader
# The issue is in bing.py line 4: import imghdr
# Replace with: from PIL import Image

# For now, make sure runtime.txt has: python-3.11.0
