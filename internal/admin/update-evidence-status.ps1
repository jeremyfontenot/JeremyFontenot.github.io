<#
Update evidence YAML status field.
Usage: .\update-evidence-status.ps1 -File evidence/experience/m365-baseline-report-2024-10-05.yaml -Status Verified
#>
param(
  [Parameter(Mandatory=$true)][string]$File,
  [Parameter(Mandatory=$true)][ValidateSet('Verified','Internal','Redacted')][string]$Status
)

if(-not (Test-Path $File)) { Write-Error "File not found: $File"; exit 1 }

$content = Get-Content -Raw -Path $File
if($content -match "^status:\s*.+$" -m) {
  $new = $content -replace "^status:\s*.+$(?m)", "status: $Status"
} else {
  $new = $content + "`nstatus: $Status`n"
}
Set-Content -Path $File -Value $new -Force
Write-Host "Updated status to $Status for $File"
