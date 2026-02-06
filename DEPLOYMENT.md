# Deployment Guide - GitHub & Vercel

## Step 1: Create GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `auction-platform` (or any name you prefer)
3. **Keep it PUBLIC** (for Vercel free tier)
4. Leave other options default
5. Click **"Create repository"**

## Step 2: Push Code to GitHub

Copy and run these commands in your terminal:

```bash
cd C:\Users\Asus\OneDrive\Desktop\auction\auction-platform

# Replace YOUR_USERNAME and YOUR_REPO with your GitHub details
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/john123/auction-platform.git
git branch -M main
git push -u origin main
```

After running, you'll be asked to authenticate. Use your GitHub token:
- Go to https://github.com/settings/tokens
- Generate a new token (check `repo` permission)
- Copy and paste it when prompted

## Step 3: Configure for Vercel Deployment

### Backend (Node.js/Express)

Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### Frontend (Vite)

Frontend will auto-build on Vercel with `npm run build`

## Step 4: Deploy on Vercel

### Deploy Frontend First

1. Go to **https://vercel.com**
2. Sign up with GitHub
3. Click **"New Project"**
4. Select your `auction-platform` repository
5. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.vercel.app
   ```
7. Click **"Deploy"**

### Deploy Backend

1. Go to **https://vercel.com**
2. Click **"New Project"**
3. Select your `auction-platform` repository again
4. Configure:
   - **Root Directory:** `backend`
   - **Framework Preset:** Other
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add **Environment Variables:**
   ```
   JWT_SECRET=your-production-secret-key-here
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   NODE_ENV=production
   ```
6. Click **"Deploy"**

## Step 5: Update Frontend API URL

After backend deployment, update frontend `.env`:

```
VITE_API_URL=https://your-backend-url-from-vercel.vercel.app
```

Then update `frontend/src/services/socket.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(API_URL, {
  auth: { token: getToken() },
});
```

## Step 6: Database Migration on Vercel

Since Vercel doesn't have persistent storage, use a cloud database:

### Option A: MongoDB (Recommended for Vercel)

1. Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `backend/config/db.js` to use MongoDB
5. Add to Vercel env vars:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

### Option B: Keep SQLite (Works but limited)

SQLite will store data in `/tmp/` which gets cleared on redeploy. For testing only.

## Quick Vercel Deployment Commands

Once repo is on GitHub:

```bash
# You can also use Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts for project setup
```

## Testing After Deployment

1. **Frontend:** `https://your-frontend.vercel.app`
2. **Backend API:** `https://your-backend.vercel.app/api/auth/login`
3. **Socket.io:** Should connect from frontend to backend

## Troubleshooting

### Socket connection fails
- Check `ALLOWED_ORIGINS` includes your Vercel frontend URL
- Verify backend URL in frontend `.env`
- Check browser console for CORS errors

### Database connection fails
- Verify MongoDB/database connection string in env vars
- Check IP whitelist in MongoDB Atlas
- Run migrations on new environment

### Env variables not working
- Use `VITE_` prefix for frontend env vars (for Vite)
- Redeploy after adding env vars
- Check Vercel dashboard for env var values

## Production Checklist

- [ ] GitHub repository created and code pushed
- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Vercel
- [ ] Environment variables set correctly
- [ ] Database configured (MongoDB recommended)
- [ ] CORS origins updated
- [ ] JWT_SECRET changed to strong random string
- [ ] Test login workflows
- [ ] Test bidding functionality
- [ ] Check error logs in Vercel dashboard

## Useful Links

- **Vercel:** https://vercel.com
- **GitHub:** https://github.com
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Vercel Node.js Docs:** https://vercel.com/docs/concepts/functions/serverless-functions
- **Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables

---

Once deployed, share the Vercel URLs with your bidders and admin!

**Your app will be live at:**
- 🎯 Frontend: `https://your-auction-platform.vercel.app`
- 🔧 Backend API: `https://your-auction-platform-api.vercel.app`
