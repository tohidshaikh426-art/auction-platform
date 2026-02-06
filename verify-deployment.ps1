# Deployment Verification Script for Windows
# Run this after deploying to verify everything is working

Write-Host "🔍 Verifying Auction Platform Deployment" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

function Test-Url {
    param(
        [string]$Url,
        [string]$Name
    )
    
    Write-Host "Checking $Name... " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✓ OK" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
}

function Test-Api {
    param(
        [string]$Url,
        [string]$Name
    )
    
    Write-Host "Checking $Name API... " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✓ OK" -ForegroundColor Green
        Write-Host "  Response: $($response.Content)" -ForegroundColor Yellow
        return $true
    }
    catch {
        Write-Host "✗ FAILED" -ForegroundColor Red
        return $false
    }
}

# Get deployment URLs
$frontendUrl = Read-Host "Frontend URL (e.g., https://your-frontend.vercel.app)"
$backendUrl = Read-Host "Backend URL (e.g., https://your-backend.vercel.app)"

Write-Host ""
Write-Host "Running verification tests..." -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Test results tracking
$testResults = @()

# Test frontend
$frontendResult = Test-Url -Url $frontendUrl -Name "Frontend"
$testResults += [PSCustomObject]@{Test = "Frontend"; Result = $frontendResult}

# Test backend health endpoint
$healthResult = Test-Api -Url "$backendUrl/api/health" -Name "Backend Health"
$testResults += [PSCustomObject]@{Test = "Backend Health"; Result = $healthResult}

# Test auth endpoint
$authResult = Test-Url -Url "$backendUrl/api/auth/login" -Name "Auth Endpoint"
$testResults += [PSCustomObject]@{Test = "Auth Endpoint"; Result = $authResult}

Write-Host ""
Write-Host "📋 Test Results Summary:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
$testResults | Format-Table -AutoSize

$failedTests = $testResults | Where-Object { $_.Result -eq $false }
if ($failedTests.Count -eq 0) {
    Write-Host "🎉 All automated tests passed!" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Some tests failed. See details above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Manual Tests to Perform:" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host "1. Open $frontendUrl in your browser"
Write-Host "2. Try to login as admin (username: admin, password: admin123)"
Write-Host "3. Check if the admin dashboard loads"
Write-Host "4. Try to create a bidder account"
Write-Host "5. Test real-time bidding functionality"
Write-Host "6. Check browser console for any errors"

Write-Host ""
Write-Host "🔧 Troubleshooting Tips:" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host "- If frontend doesn't load, check Vercel deployment logs"
Write-Host "- If backend API fails, verify environment variables in Vercel"
Write-Host "- If database connection fails, check Supabase connection string"
Write-Host "- If WebSocket connections fail, verify CORS settings"
Write-Host "- Check browser developer tools for specific error messages"

Write-Host ""
Write-Host "For detailed troubleshooting, see DEPLOYMENT_STEPS.md" -ForegroundColor Yellow