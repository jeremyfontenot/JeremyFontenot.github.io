Write-Host "Validating JSON files..."

$JsonFiles = Get-ChildItem -Path . -Recurse -Filter "*.json" -File | Where-Object {
  $_.DirectoryName -notmatch "node_modules"
}

$Failures = @()

foreach ($File in $JsonFiles) {
  try {
    Get-Content $File.FullName -Raw | ConvertFrom-Json -AsHashtable | Out-Null
    Write-Host "Valid: $($File.FullName)"
  } catch {
    $Failures += $File.FullName
    Write-Host "Invalid: $($File.FullName)" -ForegroundColor Red
  }
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "JSON validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "JSON validation passed." -ForegroundColor Green
