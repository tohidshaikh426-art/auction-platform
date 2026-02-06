# Auction Platform Deployment Guide - Vercel + Supabase

## Prerequisites
- Node.js installed
- GitHub account
- Vercel account (can sign up with GitHub)
- Supabase account

## Step 1: Create Supabase Database

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: auction-platform
   - **Database Password**: [Create a strong password]
   - **Region**: Choose closest to your users
4. Click "Create Project" (wait 1-2 minutes)

## Step 2: Get Supabase Connection Details

1. In your Supabase project dashboard, go to "Project Settings" → "Database"
2. Copy the **Connection string** (it looks like):
   ```
   postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
   ```
3. Also copy the **URL** for your project (needed for CORS)

## Step 3: Push Code to GitHub

1. Initialize git repository (if not already done):
   ```bash
   cd C:\Users\Asus\OneDrive\Desktop\auction\auction-platform
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name: auction-platform
   - Set to Public
   - Click "Create repository"

3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/auction-platform.git
   git branch -M main
   git push -u origin main
   ```

## Step 4: Deploy Backend to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Select your `auction-platform` repository
4. Configure settings:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm install`
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   DATABASE_URL=your_supabase_connection_string_here
   JWT_SECRET=your_random_jwt_secret_here
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   NODE_ENV=production
   ```

6. Click "Deploy"

## Step 5: Deploy Frontend to Vercel

1. In Vercel, click "New Project" again
2. Select the same `auction-platform` repository
3. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

5. Click "Deploy"

## Step 6: Update Configuration Files

After deployment, update these files with your actual URLs:

### Update frontend socket connection:
File: `frontend/src/services/socket.js`
```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(API_URL, {
  auth: {
    token: getToken(),
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

### Update backend CORS (if needed):
File: `backend/server.js`
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || 
  ["http://localhost:5173", "http://localhost:3000", "https://your-frontend.vercel.app"];
```

## Step 7: Run Database Migrations

The application will automatically create tables on first run, but you can also run migrations manually:

1. In your Supabase dashboard, go to "SQL Editor"
2. You can run the migration files manually if needed

## Step 8: Test Your Deployment

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Try logging in with:
   - Admin: username `admin`, password `admin123`
   - Bidder: Create a new account or use existing credentials

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Make sure `ALLOWED_ORIGINS` includes your frontend URL
   - Check browser console for specific error messages

2. **Database Connection Failed**:
   - Verify `DATABASE_URL` is correct
   - Check Supabase connection pool settings
   - Ensure your IP is not blocked

3. **Socket Connection Issues**:
   - Verify `VITE_API_URL` points to your backend
   - Check if WebSocket connections are allowed on Vercel

4. **Environment Variables Not Working**:
   - Redeploy after adding env vars
   - Check Vercel dashboard for correct values
   - For frontend vars, use `VITE_` prefix

### Useful Commands:

```bash
# Test locally first
cd backend
npm install
npm start

cd frontend
npm install
npm run dev
```

## Production Checklist

- [ ] Supabase project created and configured
- [ ] GitHub repository created and code pushed
- [ ] Backend deployed with correct environment variables
- [ ] Frontend deployed with VITE_API_URL set
- [ ] CORS origins configured properly
- [ ] Database tables created successfully
- [ ] Login functionality tested
- [ ] Bidding functionality tested
- [ ] WebSocket connections working
- [ ] Admin dashboard accessible

## URLs After Deployment

- **Frontend**: `https://your-frontend.vercel.app`
- **Backend API**: `https://your-backend.vercel.app`
- **Backend API Test**: `https://your-backend.vercel.app/api/auth/login`
- **Supabase Dashboard**: Your Supabase project URL

## Next Steps

1. Customize the admin credentials
2. Add more auction items
3. Configure custom domain (optional)
4. Set up monitoring and logging
5. Add SSL certificates if needed