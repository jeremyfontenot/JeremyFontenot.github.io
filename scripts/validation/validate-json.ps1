Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host 'Validating JSON files...'

$JsonFiles = Get-ChildItem -Path . -Recurse -Filter '*.json' -File | Where-Object {
  $_.FullName -notmatch '[\\/]node_modules[\\/]'
}

if (-not $JsonFiles) {
  Write-Host 'No JSON files found.' -ForegroundColor Yellow
  exit 0
}

$Failures = [System.Collections.Generic.List[string]]::new()

foreach ($File in $JsonFiles) {
  try {
    Get-Content -Path $File.FullName -Raw -ErrorAction Stop | ConvertFrom-Json -AsHashtable -ErrorAction Stop | Out-Null
    Write-Host "Valid: $($File.FullName)"
  } catch {
    $Failures.Add($File.FullName)
    Write-Host "Invalid JSON: $($File.FullName)" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
  }
}

if ($Failures.Count -gt 0) {
  Write-Host ''
  Write-Host ("JSON validation failed for {0} file(s)." -f $Failures.Count) -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host 'JSON validation passed.' -ForegroundColor Green
