# ==============================================================================
# Qaza Tracker — 1-Click Frontend Deploy Script (Vercel Production)
# ==============================================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "⚡ Building & Deploying Frontend to Vercel" -ForegroundColor Cyan
Write-Host "Target Project: missed-prayer-tracker" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\frontend"

Write-Host "`n📦 [1/2] Building frontend with production environment..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed. Please fix build errors."
    exit 1
}

Write-Host "`n🚀 [2/2] Deploying to Vercel (Production)..." -ForegroundColor Yellow
vercel --prod

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "🎉 Frontend deployment complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Set-Location "$PSScriptRoot"
