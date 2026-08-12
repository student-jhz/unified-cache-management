# Build the Chinese (zh_CN) documentation locally and start a preview server.
#
# Usage:
#   .\build_zh.ps1          # build only
#   .\build_zh.ps1 -Serve   # build and serve at http://localhost:8000/zh/
#
# Requirements:
#   pip install -r requirements-docs.txt

param(
    [switch]$Serve
)

$ErrorActionPreference = "Continue"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

$env:DOCS_LANGUAGE = "zh_CN"

Write-Host "==> Building Chinese (zh_CN) docs..."
sphinx-build -b html source build/html_zh @args 2>&1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Built docs at: docs/build/html_zh/index.html"

if ($Serve) {
    Write-Host "==> Serving at http://localhost:8000/html_zh/ (Ctrl+C to stop)"
    python -m http.server 8000 -d build -b localhost
}
