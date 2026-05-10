<#
Redact evidence files for public release.
Creates redacted copies in `evidence/public/` by replacing emails, ticket IDs, and organization names with [REDACTED].
#>
param(
  [string]$SourceDir = "evidence/experience",
  [string]$TargetDir = "evidence/public"
)

if(-not (Test-Path $TargetDir)) { New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null }

Get-ChildItem -Path $SourceDir -File | ForEach-Object {
  $in = Get-Content -Raw -Path $_.FullName
  # redact email addresses
  $out = $in -replace '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[REDACTED]'
  # redact Ticket/INC/SR numbers
  $out = $out -replace '\b(INC|SR|TKT|AR)-?\d{3,6}\b','[REDACTED]'
  # redact common placeholder client names (ClientX) and tenant-like tokens
  $out = $out -replace '\bClient[A-Za-z0-9_\-]{0,}\b','[REDACTED]'
  $out = $out -replace '\btenant\.[a-zA-Z0-9.-]+\b','[REDACTED]'
  $targetPath = Join-Path $TargetDir $_.Name
  Set-Content -Path $targetPath -Value $out -Force
  Write-Host "Redacted: $($_.Name) -> $targetPath"
}
