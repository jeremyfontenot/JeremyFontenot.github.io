param(
  [string]$RootPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$PolicyPath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'repository-policy.json'),
  [string]$ReportPath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'internal\reports\phase3')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $PolicyPath)) {
  throw 'repository-policy.json is required before policy validation can run.'
}

$policy = Get-Content -LiteralPath $PolicyPath -Raw | ConvertFrom-Json

foreach ($field in @('schemaVersion', 'repositoryName', 'policyMode', 'canonicalZones', 'generatedZones', 'immutableArchiveZones', 'protectedEvidenceZones', 'remediationExclusions', 'orphanSuppressionRules', 'duplicateSuppressionRules', 'metadata')) {
  if (-not $policy.PSObject.Properties.Name.Contains($field)) {
    throw ('Repository policy is missing required field: ' + $field)
  }
}

& (Join-Path $PSScriptRoot 'Invoke-RepositoryValidation.ps1') -RootPath $RootPath -ReportPath (Join-Path $RootPath 'internal\reports\phase2') | Out-Null
& (Join-Path $PSScriptRoot 'generate-governance-reports.ps1') -RootPath $RootPath -PolicyPath $PolicyPath -OutputPath $ReportPath | Out-Null

$policyReport = Get-Content -LiteralPath (Join-Path $ReportPath 'policy-validation-report.md') -Raw
$archiveReport = Get-Content -LiteralPath (Join-Path $ReportPath 'archive-integrity-report.md') -Raw

$advisoryCounts = [pscustomobject]@{
  PolicyMode = $policy.policyMode
  ArchiveZones = $policy.immutableArchiveZones.Count
  EvidenceZones = $policy.protectedEvidenceZones.Count
  PolicyReportLength = $policyReport.Length
  ArchiveReportLength = $archiveReport.Length
}
$advisoryCounts | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 -Path (Join-Path $ReportPath 'policy-validation-report.json')

Write-Host ('Policy validation completed. Reports are available at ' + $ReportPath)
