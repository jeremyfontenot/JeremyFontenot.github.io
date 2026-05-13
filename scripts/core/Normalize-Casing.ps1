param(
  [string]$RootPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [switch]$Apply,
  [switch]$IncludeArchive,
  [switch]$AllowProtectedZones
)

$ErrorActionPreference = 'Stop'

function Get-TargetFiles {
  param([string]$BasePath)

  Get-ChildItem -LiteralPath $BasePath -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\.git\\' -and $_.FullName -notmatch '\\internal\\reports\\phase2\\' -and (
      $AllowProtectedZones -or $_.FullName -notmatch '\\(_content|archive|evidence\\public)\\'
    )
  }
}

$plan = foreach ($file in Get-TargetFiles -BasePath $RootPath) {
  $relative = [System.IO.Path]::GetRelativePath($RootPath, $file.FullName) -replace '\\', '/'
  $lower = ($relative -split '/') | ForEach-Object { $_.ToLowerInvariant() }
  $canonical = $lower -join '/'
  if ($canonical -ne $relative) {
    [pscustomobject]@{
      CurrentPath = $relative
      ProposedPath = $canonical
    }
  }
}

$reportPath = Join-Path $RootPath 'internal\reports\phase2\casing-normalization-plan.csv'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $reportPath) | Out-Null
$plan | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $reportPath

if ($Apply) {
  foreach ($item in $plan) {
    $current = Join-Path $RootPath ($item.CurrentPath -replace '/', '\\')
    $proposed = Split-Path -Leaf ($item.ProposedPath -replace '/', '\\')
    if (Test-Path -LiteralPath $current) {
      $tempName = [System.IO.Path]::GetRandomFileName()
      Rename-Item -LiteralPath $current -NewName $tempName
      Rename-Item -LiteralPath (Join-Path (Split-Path -Parent $current) $tempName) -NewName $proposed
    }
  }
}

Write-Host ('Casing plan written to ' + $reportPath)
