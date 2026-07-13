$ErrorActionPreference = "Stop"

if (!(Test-Path .git)) {
    Write-Host "Error: Not a git repository." -ForegroundColor Red
    exit 1
}

Write-Host "Changed files:" -ForegroundColor Cyan
git status -s

if (!(Test-Path node_modules)) {
    Write-Host "Running npm ci..." -ForegroundColor Yellow
    npm ci
}

Write-Host "Running Validation..." -ForegroundColor Yellow
npm run validate

Write-Host "Running Security Check..." -ForegroundColor Yellow
npm run security

Write-Host "Building Site..." -ForegroundColor Yellow
npm run build

Write-Host "Running Content Update Test..." -ForegroundColor Yellow
npm run test:content-update

Write-Host "Scanning for Secrets..." -ForegroundColor Yellow
npm run scan:secrets

Write-Host "All checks passed successfully." -ForegroundColor Green

$commitMsg = Read-Host "Enter commit message (or press Enter to cancel)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    Write-Host "Publish cancelled." -ForegroundColor Yellow
    exit 0
}

git add .
git status -s

$confirm = Read-Host "Proceed with commit and push? (y/n)"
if ($confirm -match "^[yY]") {
    git commit -m $commitMsg
    git push origin feature/lightweight-json-manager
    Write-Host "Changes published successfully." -ForegroundColor Green
} else {
    Write-Host "Publish cancelled." -ForegroundColor Yellow
}
