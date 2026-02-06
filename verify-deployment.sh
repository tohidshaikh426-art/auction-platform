#!/bin/bash

# Deployment Verification Script
# Run this after deploying to verify everything is working

echo "🔍 Verifying Auction Platform Deployment"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check URL
check_url() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name... "
    
    if curl -s -f -m 10 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Function to check API response
check_api() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name API... "
    
    response=$(curl -s -f -m 10 "$url" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        echo -e "${GREEN}✓ OK${NC}"
        echo "  Response: $response"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

echo "Please enter your deployment URLs:"
read -p "Frontend URL (e.g., https://your-frontend.vercel.app): " frontend_url
read -p "Backend URL (e.g., https://your-backend.vercel.app): " backend_url

echo ""
echo "Running verification tests..."
echo "============================="

# Test frontend
check_url "$frontend_url" "Frontend"

# Test backend health endpoint
check_api "$backend_url/api/health" "Backend Health"

# Test auth endpoint
check_url "$backend_url/api/auth/login" "Auth Endpoint"

echo ""
echo "📋 Manual Tests to Perform:"
echo "=========================="
echo "1. Open $frontend_url in your browser"
echo "2. Try to login as admin (username: admin, password: admin123)"
echo "3. Check if the admin dashboard loads"
echo "4. Try to create a bidder account"
echo "5. Test real-time bidding functionality"
echo "6. Check browser console for any errors"

echo ""
echo "🔧 Troubleshooting Tips:"
echo "======================="
echo "- If frontend doesn't load, check Vercel deployment logs"
echo "- If backend API fails, verify environment variables in Vercel"
echo "- If database connection fails, check Supabase connection string"
echo "- If WebSocket connections fail, verify CORS settings"
echo "- Check browser developer tools for specific error messages"

echo ""
echo "For detailed troubleshooting, see DEPLOYMENT_STEPS.md"