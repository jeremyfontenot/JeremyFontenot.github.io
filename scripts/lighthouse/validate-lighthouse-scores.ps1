Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Validating Lighthouse score reports..."

$ReportFiles = Get-ChildItem -Path .\artifacts\lighthouse -Filter "*.json" -File -ErrorAction SilentlyContinue

if (-not $ReportFiles) {
  Write-Host "No Lighthouse reports found. Skipping score validation." -ForegroundColor Yellow
  exit 0
}

$MinimumScore = 0.65
$Failures = @()

foreach ($File in $ReportFiles) {
  $Report = Get-Content $File.FullName -Raw | ConvertFrom-Json

  $Categories = @("performance", "accessibility", "best-practices", "seo")

  foreach ($Category in $Categories) {
    if ($Report.categories.$Category -and $null -ne $Report.categories.$Category.score) {
      $Score = [double]$Report.categories.$Category.score
      Write-Host "$($File.Name) [$Category] score: $Score"

      if ($Score -lt $MinimumScore) {
        $Failures += "$($File.Name) [$Category] below threshold: $Score"
        Write-Host "Below threshold: $($File.Name) [$Category] = $Score" -ForegroundColor Red
      }
    }
  }
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Lighthouse score validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Lighthouse score validation passed." -ForegroundColor Green
