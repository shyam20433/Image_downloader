# Deploying to Render

This guide will help you deploy your Flask Image Downloader application to Render.

## Prerequisites

1. A [Render account](https://render.com/) (free tier available)
2. Your code pushed to a GitHub repository
3. Git installed on your computer

## Step 1: Push to GitHub

If you haven't already, push your code to GitHub:

```bash
cd "c:\Users\shyam\OneDrive\Desktop\image downloader"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Step 2: Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `image-downloader` (or your preferred name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: `Free`

5. Click **"Create Web Service"**

## Step 3: Wait for Deployment

Render will automatically:
- Install dependencies from `requirements.txt`
- Start your application using Gunicorn
- Provide you with a URL (e.g., `https://image-downloader-xxxx.onrender.com`)

## Important Notes

### ⚠️ Limitations on Free Tier

1. **Ephemeral Storage**: 
   - Downloaded images and ZIP files are temporary
   - Files are deleted when the service restarts or sleeps
   - This is normal for free tier hosting

2. **Service Sleep**:
   - Free services sleep after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds to wake up

3. **Session Storage**:
   - In-memory sessions are lost on restart
   - Users need to regenerate images after service restarts

### ✅ What Works

- Image generation and preview
- Image selection
- ZIP download (during the same session)
- All UI features

### 🔧 Workarounds

If you need persistent storage, you have these options:

1. **Upgrade to Paid Plan** ($7/month) - Gets persistent disk storage
2. **Use Cloud Storage** - Integrate AWS S3, Google Cloud Storage, or Cloudinary
3. **Use a Different Platform** - PythonAnywhere has persistent storage on free tier

## Troubleshooting

### Service won't start
- Check the logs in Render dashboard
- Verify `requirements.txt` has all dependencies
- Ensure `Procfile` is correctly configured

### Images not downloading
- This is expected on free tier due to ephemeral storage
- Images work during the same session
- Consider upgrading or using cloud storage

### Slow first load
- Free services sleep after inactivity
- First request wakes up the service (30-60 seconds)
- Subsequent requests are fast

## Alternative: Deploy to PythonAnywhere

If you need persistent storage on free tier:

1. Go to [PythonAnywhere](https://www.pythonanywhere.com/)
2. Create a free account
3. Upload your files
4. Configure a Flask web app
5. Files persist between sessions

## Need Help?

- [Render Documentation](https://render.com/docs)
- [Render Community Forum](https://community.render.com/)
