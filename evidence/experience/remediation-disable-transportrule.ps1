# Remediation script: disable transport rule safely (example)
param(
  [Parameter(Mandatory=$true)]
  [string]$RuleId
)

# NOTE: This script requires Exchange Online PowerShell module and appropriate permissions.

Write-Host "Disabling transport rule $RuleId..."
# Connect-ExchangeOnline -UserPrincipalName admin@tenant.example.com
# Disable-TransportRule -Identity $RuleId
Write-Host "(Simulated) transport rule $RuleId disabled."

# Verify mail flow
Write-Host "Verifying MX routing and queues..."
# Get-TransportService | Select-Object Name,Status

Write-Host "Remediation complete. Log: remediation-log-$(Get-Date -Format yyyyMMddHHmm).txt"
