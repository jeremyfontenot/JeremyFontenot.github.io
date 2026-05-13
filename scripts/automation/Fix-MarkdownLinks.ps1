param(
  [string]$RootPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$MappingCsv,
  [switch]$Apply,
  [switch]$AllowProtectedZones
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $MappingCsv)) {
  throw 'Provide a mapping CSV with OldPath and NewPath columns.'
}

$mappings = Import-Csv -LiteralPath $MappingCsv
$markdownFiles = Get-ChildItem -LiteralPath $RootPath -Recurse -File | Where-Object {
  @('.md', '.markdown', '.html', '.htm') -contains $_.Extension.ToLowerInvariant() -and $_.FullName -notmatch '\\internal\\reports\\phase2\\'
}

$plan = New-Object System.Collections.Generic.List[object]
foreach ($file in $markdownFiles) {
  $relative = [System.IO.Path]::GetRelativePath($RootPath, $file.FullName) -replace '\\', '/'
  if (-not $AllowProtectedZones -and $relative -match '^(?:_content/|archive/|evidence/public/)') {
    continue
  }
  $content = Get-Content -LiteralPath $file.FullName -Raw
  $updated = $content
  $changed = $false
  foreach ($mapping in $mappings) {
    if ([string]::IsNullOrWhiteSpace($mapping.OldPath) -or [string]::IsNullOrWhiteSpace($mapping.NewPath)) { continue }
    if ($updated.Contains($mapping.OldPath)) {
      $updated = $updated.Replace($mapping.OldPath, $mapping.NewPath)
      $changed = $true
    }
  }
  if ($changed) {
    $plan.Add([pscustomobject]@{
      Path = $relative
      Changed = $true
    })
    if ($Apply) {
      Set-Content -LiteralPath $file.FullName -Value $updated -Encoding UTF8
    }
  }
}

$reportPath = Join-Path $RootPath 'internal\reports\phase2\markdown-link-fix-plan.csv'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $reportPath) | Out-Null
$plan | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $reportPath
Write-Host ('Markdown link plan written to ' + $reportPath)
