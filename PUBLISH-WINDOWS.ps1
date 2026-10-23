# Run from the extracted project folder:
# powershell -ExecutionPolicy Bypass -File .\PUBLISH-WINDOWS.ps1
# The script uses its own location as the Git root to prevent nested-folder mistakes.
$ErrorActionPreference = 'Stop'
$repo = 'https://github.com/hirques/ops-control-dashboard.git'
Set-Location -LiteralPath $PSScriptRoot
if (!(Test-Path -LiteralPath '.\package.json') -or !(Test-Path -LiteralPath '.\README.md')) {
    throw 'Open the extracted project directory that contains package.json and README.md.'
}
if (!(Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is not installed.' }
if (!(Test-Path -LiteralPath '.\.git')) {
    git init
    if ($LASTEXITCODE -ne 0) { throw 'git init failed' }
}
$actual = (git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or [IO.Path]::GetFullPath($actual).TrimEnd('\','/') -ne [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\','/')) {
    throw 'The Git root is not the folder containing this script. Stop to avoid a nested repository.'
}
$origin = (git remote get-url origin 2>$null)
if ($LASTEXITCODE -ne 0) {
    git remote add origin $repo
} elseif ($origin -ne $repo) {
    throw "origin points to '$origin'; expected '$repo'. No remote changes were made."
}
git add -A
if ($LASTEXITCODE -ne 0) { throw 'git add failed' }
$pending = (git diff --cached --name-only)
if ($pending) {
    git commit -m 'feat: add interactive infrastructure operations dashboard'
    if ($LASTEXITCODE -ne 0) { throw 'git commit failed. Check your configured Git author name/email.' }
}
git branch -M main
if ($LASTEXITCODE -ne 0) { throw 'git branch failed' }
git push -u origin main
if ($LASTEXITCODE -ne 0) { throw 'git push failed. Confirm that the repository exists and that you are signed in.' }
Write-Host 'Published: https://github.com/hirques/ops-control-dashboard' -ForegroundColor Green
