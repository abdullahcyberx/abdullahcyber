$ErrorActionPreference = "Stop"
$repoUrl = "https://github.com/abdullahcyberx/abdullahcyber.git"
$workDir = Join-Path $env:TEMP "abdullahcyber-publish"
$sourceDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Preparing Abdullah Cyber portfolio for GitHub..." -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git is not installed. Install Git for Windows, then run this script again."
}

if (Test-Path $workDir) {
    Remove-Item $workDir -Recurse -Force
}

git clone $repoUrl $workDir
if ($LASTEXITCODE -ne 0) { throw "Could not clone the GitHub repository." }

Set-Location $workDir

git rm -r --ignore-unmatch .

Get-ChildItem -Path $sourceDir -Force | Where-Object {
    $_.Name -notin @("PUBLISH-TO-GITHUB.ps1", ".git")
} | ForEach-Object {
    Copy-Item $_.FullName -Destination $workDir -Recurse -Force
}

git add -A
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "No changes found. The repository is already up to date." -ForegroundColor Yellow
    exit 0
}

git commit -m "Launch production Abdullah Cyber portfolio"
if ($LASTEXITCODE -ne 0) { throw "Git commit failed." }

git branch -M main
git push -u origin main
if ($LASTEXITCODE -ne 0) {
    throw "Git push failed. Make sure you are signed in to the correct GitHub account."
}

Write-Host "Portfolio uploaded successfully." -ForegroundColor Green
Write-Host "Repository: https://github.com/abdullahcyberx/abdullahcyber" -ForegroundColor Green
