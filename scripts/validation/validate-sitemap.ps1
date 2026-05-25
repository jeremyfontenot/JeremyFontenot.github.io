Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Validating sitemap.xml..."

if (-not (Test-Path ".\sitemap.xml")) {
  Write-Host "Missing sitemap.xml" -ForegroundColor Red
  exit 1
}

try {
  [xml]$Sitemap = Get-Content ".\sitemap.xml" -Raw
} catch {
  Write-Host "sitemap.xml is not valid XML." -ForegroundColor Red
  exit 1
}

$Urls = $Sitemap.urlset.url.loc

if (-not $Urls) {
  Write-Host "sitemap.xml does not contain any URL entries." -ForegroundColor Red
  exit 1
}

foreach ($Url in $Urls) {
  if ($Url -notmatch "^https://") {
    Write-Host "Non-HTTPS sitemap URL found: $Url" -ForegroundColor Red
    exit 1
  }
  Write-Host "Valid sitemap URL: $Url"
}

Write-Host ""
Write-Host "Sitemap validation passed." -ForegroundColor Green
