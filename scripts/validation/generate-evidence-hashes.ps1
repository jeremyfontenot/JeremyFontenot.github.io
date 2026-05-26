Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Generating evidence integrity hashes..."

$EvidenceRoot = ".\evidence-library"
$OutputFile = ".\evidence-library\integrity\evidence-hashes.json"

$Files = Get-ChildItem $EvidenceRoot -Recurse -File | Where-Object {
  $_.FullName -notmatch "\\integrity\\" -and
  $_.Extension -notin @(".json")
}

$Results = @()

foreach ($File in $Files) {
  $Hash = Get-FileHash $File.FullName -Algorithm SHA256

  $Results += [PSCustomObject]@{
    path = $File.FullName.Replace((Get-Location).Path + "\", "")
    sha256 = $Hash.Hash
    size = $File.Length
    lastModified = $File.LastWriteTimeUtc.ToString("o")
  }

  Write-Host "Hashed: $($File.Name)"
}

$Results | ConvertTo-Json -Depth 3 | Set-Content $OutputFile

Write-Host ""
Write-Host "Evidence hash inventory generated:" -ForegroundColor Green
Write-Host $OutputFile -ForegroundColor Green
