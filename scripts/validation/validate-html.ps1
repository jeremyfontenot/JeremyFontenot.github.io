Write-Host "Validating HTML files..."

$HtmlFiles = Get-ChildItem -Path . -Recurse -Filter "*.html" -File | Where-Object {
  $_.DirectoryName -notmatch "node_modules"
}

if (-not $HtmlFiles) {
  Write-Host "No HTML files found." -ForegroundColor Red
  exit 1
}

$Failures = @()

foreach ($File in $HtmlFiles) {
  $Content = Get-Content $File.FullName -Raw

  if ($Content -notmatch "<html") {
    $Failures += $File.FullName
    Write-Host "Missing html tag: $($File.FullName)" -ForegroundColor Red
    continue
  }

  if ($Content -notmatch "</html>") {
    $Failures += $File.FullName
    Write-Host "Missing closing html tag: $($File.FullName)" -ForegroundColor Red
    continue
  }

  Write-Host "Valid: $($File.FullName)"
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "HTML validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "HTML validation passed." -ForegroundColor Green
