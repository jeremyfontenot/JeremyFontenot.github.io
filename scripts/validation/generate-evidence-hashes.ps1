Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Generating evidence integrity hashes..."

$EvidenceRoot = ".\evidence-library"
$OutputFile = ".\evidence-library\integrity\evidence-hashes.json"

$TextExtensions = @(
  ".md", ".txt", ".csv", ".json", ".yaml", ".yml", ".ps1", ".svg", ".html", ".xml", ".gitkeep"
)

function Get-NormalizedSha256 {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  $Extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()

  if ($TextExtensions -contains $Extension) {
    $Text = Get-Content -LiteralPath $Path -Raw
    $Normalized = $Text -replace "`r`n", "`n"
    $Bytes = [System.Text.Encoding]::UTF8.GetBytes($Normalized)
  } else {
    $Bytes = [System.IO.File]::ReadAllBytes($Path)
  }

  $Sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    return ([System.BitConverter]::ToString($Sha.ComputeHash($Bytes))).Replace("-", "")
  } finally {
    $Sha.Dispose()
  }
}

$Files = Get-ChildItem $EvidenceRoot -Recurse -File | Where-Object {
  $_.FullName -notmatch "\\integrity\\" -and
  $_.Extension -notin @(".json")
}

$Results = @()

foreach ($File in $Files) {
  $Hash = Get-NormalizedSha256 -Path $File.FullName

  $Results += [PSCustomObject]@{
    path = $File.FullName.Replace((Get-Location).Path + "\", "")
    sha256 = $Hash
    size = $File.Length
    lastModified = $File.LastWriteTimeUtc.ToString("o")
  }

  Write-Host "Hashed: $($File.Name)"
}

$Results | ConvertTo-Json -Depth 3 | Set-Content $OutputFile

Write-Host ""
Write-Host "Evidence hash inventory generated:" -ForegroundColor Green
Write-Host $OutputFile -ForegroundColor Green
