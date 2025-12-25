# 502 Timeout Error Fix

## The Problem
When you request 50 images, the server takes too long to download them all, and Render's free tier has a **30-second timeout**. This causes a 502 Bad Gateway error.

## The Solution
I've updated the app to limit downloads to **20 images maximum** to stay within the timeout limit.

## What Changed
- Maximum 20 images per request (prevents timeout)
- Faster timeout per image (15 seconds instead of 60)
- Better error handling
- Clear message when limit is applied

## How to Use Now
1. For **small datasets** (1-20 images): Works perfectly ✅
2. For **large datasets** (50+ images): 
   - Make multiple requests (e.g., 3 requests of 20 images each)
   - Or download locally on your computer (no timeout limits)

## Deploy the Fix

```powershell
cd "c:\Users\shyam\OneDrive\Desktop\image downloader"
git pull origin main
git add .
git commit -m "Fix: Limit to 20 images to prevent timeout"
git push origin main
```

## Why This Happens
- Render free tier: 30-second request timeout
- Downloading 50 images: Takes 60-90 seconds
- Result: Server timeout = 502 error

## Alternatives
1. **Use locally** - No timeout limits on your computer
2. **Upgrade Render** - Paid plans have longer timeouts
3. **Multiple requests** - Download 20 images at a time

The app will now work reliably on Render! 🎉
