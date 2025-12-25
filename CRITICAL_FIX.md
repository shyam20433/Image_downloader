# CRITICAL FIX for Render Deployment

## The Problem
Render is ignoring `runtime.txt` and using Python 3.13 by default.

## The Solution
I've created `render.yaml` which Render will prioritize over `runtime.txt`.

## What You Need to Do NOW

### Step 1: Push the new render.yaml file

```powershell
cd "c:\Users\shyam\OneDrive\Desktop\image downloader"
git pull origin main
git add .
git commit -m "Add render.yaml to force Python 3.11"
git push origin main
```

### Step 2: In Render Dashboard - IMPORTANT!

Since you already created the service manually, you need to either:

**Option A: Delete and Recreate (Recommended)**
1. Go to https://dashboard.render.com/
2. Click on your `image-downloader` service
3. Go to **Settings** (bottom left)
4. Scroll down and click **"Delete Web Service"**
5. Confirm deletion
6. Go back to dashboard
7. Click **"New +"** → **"Web Service"**
8. Select your GitHub repo
9. Render will now use `render.yaml` automatically
10. Click **"Create Web Service"**

**Option B: Manual Environment Variable (Faster)**
1. Go to your service in Render dashboard
2. Click **"Environment"** tab (left sidebar)
3. Click **"Add Environment Variable"**
4. Key: `PYTHON_VERSION`
5. Value: `3.11.0`
6. Click **"Save Changes"**
7. Click **"Manual Deploy"** → **"Deploy latest commit"**

## Why This Happens
Render's auto-detection sometimes defaults to Python 3.13. The `render.yaml` file or environment variable forces it to use 3.11.

## Choose Your Option
- **Option A** is cleaner (fresh start)
- **Option B** is faster (just add env var)

Both will work! Pick whichever you prefer.
