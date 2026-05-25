Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Validating public content quality..."

$TargetFiles = Get-ChildItem -Path . -Recurse -File -Include *.html,*.md,*.txt | Where-Object {
  $_.DirectoryName -notmatch "node_modules" -and
  $_.DirectoryName -notmatch "\\.git" -and
  $_.FullName -notmatch "\\artifacts\\"
}

$BlockedTerms = @(
  "lorem ipsum",
  "todo",
  "placeholder",
  "sample text",
  "coming soon",
  "test content",
  "dummy",
  "fake evidence"
)

$Failures = @()

foreach ($File in $TargetFiles) {
  $Content = Get-Content $File.FullName -Raw

  foreach ($Term in $BlockedTerms) {
    if ($Content -match [regex]::Escape($Term)) {
      $Failures += "$($File.FullName) contains blocked term: $Term"
      Write-Host "Blocked content found: $($File.FullName) -> $Term" -ForegroundColor Red
    }
  }
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Content validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Content validation passed." -ForegroundColor Green
