# ==============================================================================
# Qaza Tracker — 1-Click Backend Deploy Script (Windows PowerShell)
# Target: Oracle Cloud Ubuntu VPS (129.151.149.136)
# ==============================================================================

$SSH_KEY = "D:\Cloud & Backups\Oracle\ssh-key-2026-08-16.key"
$REMOTE_HOST = "ubuntu@129.151.149.136"
$REMOTE_DIR = "/home/ubuntu/qaza-backend"
$LOCAL_DIR = "$PSScriptRoot\backend"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Deploying Qaza Tracker Backend to Oracle Cloud" -ForegroundColor Cyan
Write-Host "Target: $REMOTE_HOST" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Step 1: Check SSH Key
if (-not (Test-Path $SSH_KEY)) {
    Write-Error "SSH Key not found at: $SSH_KEY"
    exit 1
}

# Step 2: Sync Backend Files via SCP
Write-Host "`n[1/3] Uploading backend application code..." -ForegroundColor Yellow
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r "$LOCAL_DIR\app" "$LOCAL_DIR\requirements.txt" "$LOCAL_DIR\.env" "${REMOTE_HOST}:${REMOTE_DIR}/"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to upload backend files."
    exit 1
}
Write-Host "Files transferred successfully." -ForegroundColor Green

# Step 3: Install/Update Dependencies & Restart Service
Write-Host "`n[2/3] Updating dependencies and restarting service..." -ForegroundColor Yellow
$remoteBash = "cd /home/ubuntu/qaza-backend; ./venv/bin/pip install -r requirements.txt --quiet; sudo systemctl restart qaza-backend; sudo systemctl status qaza-backend --no-pager"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE_HOST" $remoteBash

# Step 4: Health Check
Write-Host "`n[3/3] Running health check against live server..." -ForegroundColor Yellow
Start-Sleep -Seconds 4

try {
    $res = Invoke-RestMethod -Uri "http://129.151.149.136/health" -TimeoutSec 10
    Write-Host "Health Check OK: $($res | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Warning "Health check returned an error. Check remote logs with SSH."
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "Deployment Complete! API is live at:" -ForegroundColor Green
Write-Host "   Docs:   http://129.151.149.136/docs" -ForegroundColor Cyan
Write-Host "   Health: http://129.151.149.136/health" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Green
