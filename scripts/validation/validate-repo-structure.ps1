Write-Host "Validating repository structure..."

$RequiredPaths = @(
  ".github",
  "assets",
  "docs",
  "scripts",
  "evidence-library"
)

$Missing = @()

foreach ($Path in $RequiredPaths) {
  if (-not (Test-Path $Path)) {
    $Missing += $Path
  }
}

if ($Missing.Count -gt 0) {
  Write-Host ""
  Write-Host "Missing required paths:" -ForegroundColor Red
  $Missing | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
  exit 1
}

Write-Host ""
Write-Host "Repository structure validation passed." -ForegroundColor Green
