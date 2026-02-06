#!/bin/bash

# Auction Platform Deployment Script
# This script helps deploy the auction platform to Vercel with Supabase

echo "🚀 Auction Platform Deployment Helper"
echo "====================================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the auction-platform root directory"
    exit 1
fi

echo "✅ Found backend and frontend directories"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
    echo "✅ Git repository initialized"
fi

echo ""
echo "📋 Deployment Steps:"
echo "1. Create Supabase project at https://supabase.com"
echo "2. Get your DATABASE_URL from Supabase dashboard"
echo "3. Create GitHub repository and push code"
echo "4. Deploy backend to Vercel"
echo "5. Deploy frontend to Vercel"
echo ""

read -p "Have you created your Supabase project? (y/n): " supabase_ready

if [ "$supabase_ready" != "y" ]; then
    echo "Please create your Supabase project first, then run this script again"
    exit 0
fi

read -p "Enter your Supabase DATABASE_URL: " database_url
read -p "Enter your GitHub username: " github_username
read -p "Enter your repository name: " repo_name

echo ""
echo "🔧 Setting up environment variables..."
echo "DATABASE_URL=$database_url" > backend/.env.production
echo "JWT_SECRET=$(openssl rand -hex 32)" >> backend/.env.production
echo "NODE_ENV=production" >> backend/.env.production
echo "ALLOWED_ORIGINS=" >> backend/.env.production

echo ""
echo "🔧 Pushing to GitHub..."
git remote add origin https://github.com/$github_username/$repo_name.git 2>/dev/null || true
git branch -M main
git push -u origin main

echo ""
echo "✅ Setup complete! Next steps:"
echo "1. Go to https://vercel.com and import your GitHub repository"
echo "2. Deploy the backend first (root directory: backend)"
echo "3. Add these environment variables to your backend:"
echo "   - DATABASE_URL: $database_url"
echo "   - JWT_SECRET: $(grep JWT_SECRET backend/.env.production | cut -d'=' -f2)"
echo "   - NODE_ENV: production"
echo "   - ALLOWED_ORIGINS: [your-frontend-url]"
echo ""
echo "4. After backend deployment, deploy frontend (root directory: frontend)"
echo "5. Add this environment variable to your frontend:"
echo "   - VITE_API_URL: [your-backend-url]"
echo ""
echo "📝 Detailed instructions are in DEPLOYMENT_STEPS.md"