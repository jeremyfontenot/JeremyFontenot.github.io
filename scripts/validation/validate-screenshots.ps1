Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Validating screenshot capture..."

node .\scripts\lighthouse\capture-site-screenshots.js

if ($LASTEXITCODE -ne 0) {
  Write-Host "Screenshot capture failed." -ForegroundColor Red
  exit 1
}

$RequiredScreenshots = @(
  ".\artifacts\screenshots\current\home.png",
  ".\artifacts\screenshots\current\projects.png",
  ".\artifacts\screenshots\current\proof.png",
  ".\artifacts\screenshots\current\resume.png",
  ".\artifacts\screenshots\current\contact.png"
)

$Failures = @()

foreach ($Screenshot in $RequiredScreenshots) {
  if (-not (Test-Path $Screenshot)) {
    $Failures += "Missing screenshot: $Screenshot"
    Write-Host "Missing screenshot: $Screenshot" -ForegroundColor Red
    continue
  }

  $File = Get-Item $Screenshot

  if ($File.Length -lt 10000) {
    $Failures += "Screenshot appears too small or invalid: $Screenshot"
    Write-Host "Invalid screenshot size: $Screenshot" -ForegroundColor Red
  } else {
    Write-Host "Screenshot verified: $Screenshot"
  }
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Screenshot validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Screenshot validation passed." -ForegroundColor Green
