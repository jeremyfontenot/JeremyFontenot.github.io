Write-Host "Validating HTML files..."

$HtmlFiles = Get-ChildItem -Path . -Filter "*.html" -File

if (-not $HtmlFiles) {
  Write-Host "No root HTML files found." -ForegroundColor Yellow
  exit 1
}

$HtmlFiles | ForEach-Object {
  Write-Host "Found: $($_.Name)"
}

Write-Host ""
Write-Host "HTML file inventory validation passed." -ForegroundColor Green
