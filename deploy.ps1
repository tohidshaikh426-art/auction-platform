# Auction Platform Deployment Script for Windows
# This script helps deploy the auction platform to Vercel with Supabase

Write-Host "🚀 Auction Platform Deployment Helper" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the auction-platform root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found backend and frontend directories" -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "🔧 Initializing git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit"
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Deployment Steps:"
Write-Host "1. Create Supabase project at https://supabase.com"
Write-Host "2. Get your DATABASE_URL from Supabase dashboard"
Write-Host "3. Create GitHub repository and push code"
Write-Host "4. Deploy backend to Vercel"
Write-Host "5. Deploy frontend to Vercel"
Write-Host ""

$supabaseReady = Read-Host "Have you created your Supabase project? (y/n)"

if ($supabaseReady -ne "y") {
    Write-Host "Please create your Supabase project first, then run this script again" -ForegroundColor Yellow
    exit 0
}

$databaseUrl = Read-Host "Enter your Supabase DATABASE_URL"
$githubUsername = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter your repository name"

# Generate a random JWT secret
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host ""
Write-Host "🔧 Setting up environment variables..." -ForegroundColor Yellow

# Create production environment file for backend
$envContent = @"
DATABASE_URL=$databaseUrl
JWT_SECRET=$jwtSecret
NODE_ENV=production
ALLOWED_ORIGINS=
"@
$envContent | Out-File -FilePath "backend\.env.production" -Encoding UTF8

Write-Host ""
Write-Host "🔧 Pushing to GitHub..." -ForegroundColor Yellow
git remote add origin "https://github.com/$githubUsername/$repoName.git" 2>$null
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "✅ Setup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Go to https://vercel.com and import your GitHub repository"
Write-Host "2. Deploy the backend first (root directory: backend)"
Write-Host "3. Add these environment variables to your backend:"
Write-Host "   - DATABASE_URL: $databaseUrl"
Write-Host "   - JWT_SECRET: $jwtSecret"
Write-Host "   - NODE_ENV: production"
Write-Host "   - ALLOWED_ORIGINS: [your-frontend-url]"
Write-Host ""
Write-Host "4. After backend deployment, deploy frontend (root directory: frontend)"
Write-Host "5. Add this environment variable to your frontend:"
Write-Host "   - VITE_API_URL: [your-backend-url]"
Write-Host ""
Write-Host "📝 Detailed instructions are in DEPLOYMENT_STEPS.md" -ForegroundColor Cyan