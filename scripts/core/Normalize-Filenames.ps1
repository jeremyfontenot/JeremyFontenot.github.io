param(
  [string]$RootPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [switch]$Apply,
  [switch]$IncludeArchive,
  [switch]$AllowProtectedZones
)

$ErrorActionPreference = 'Stop'

function Get-CanonicalName {
  param([string]$Name)

  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($Name)
  $extension = [System.IO.Path]::GetExtension($Name).ToLowerInvariant()
  $normalized = $baseName.ToLowerInvariant() -replace '[\s_]+', '-' -replace '[^a-z0-9.-]', '-' -replace '-{2,}', '-'
  $normalized = $normalized.Trim('-')
  if (-not $normalized) { $normalized = 'file' }
  return $normalized + $extension
}

function Get-TargetFiles {
  param([string]$BasePath)

  Get-ChildItem -LiteralPath $BasePath -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\.git\\' -and $_.FullName -notmatch '\\internal\\reports\\phase2\\' -and (
      $AllowProtectedZones -or $_.FullName -notmatch '\\(_content|archive|evidence\\public)\\'
    )
  }
}

$plan = foreach ($file in Get-TargetFiles -BasePath $RootPath) {
  $canonical = Get-CanonicalName -Name $file.Name
  if ($canonical -ne $file.Name) {
    [pscustomobject]@{
      CurrentPath = [System.IO.Path]::GetRelativePath($RootPath, $file.FullName) -replace '\\', '/'
      ProposedName = $canonical
      ProposedPath = ([System.IO.Path]::GetRelativePath($RootPath, (Join-Path $file.DirectoryName $canonical)) -replace '\\', '/')
    }
  }
}

$reportPath = Join-Path $RootPath 'internal\reports\phase2\filename-normalization-plan.csv'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $reportPath) | Out-Null
$plan | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $reportPath

if ($Apply) {
  foreach ($item in $plan) {
    $current = Join-Path $RootPath ($item.CurrentPath -replace '/', '\\')
    $target = Join-Path $RootPath ($item.ProposedPath -replace '/', '\\')
    if (Test-Path -LiteralPath $current) {
      Rename-Item -LiteralPath $current -NewName $item.ProposedName
    }
  }
}

Write-Host ('Filename plan written to ' + $reportPath)
