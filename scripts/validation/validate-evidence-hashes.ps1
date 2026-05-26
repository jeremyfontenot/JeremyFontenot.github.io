Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Validating evidence hash integrity..."

$HashInventory = ".\evidence-library\integrity\evidence-hashes.json"

if (-not (Test-Path $HashInventory)) {
  Write-Host "Missing evidence hash inventory." -ForegroundColor Red
  exit 1
}

$Entries = Get-Content $HashInventory -Raw | ConvertFrom-Json
$Failures = @()

foreach ($Entry in $Entries) {
  if (-not (Test-Path $Entry.path)) {
    $Failures += "Missing file: $($Entry.path)"
    Write-Host "Missing file: $($Entry.path)" -ForegroundColor Red
    continue
  }

  $CurrentHash = Get-FileHash $Entry.path -Algorithm SHA256

  if ($CurrentHash.Hash -ne $Entry.sha256) {
    $Failures += "Hash mismatch: $($Entry.path)"
    Write-Host "Hash mismatch: $($Entry.path)" -ForegroundColor Red
    continue
  }

  Write-Host "Hash verified: $($Entry.path)"
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Evidence hash validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Evidence hash validation passed." -ForegroundColor Green
