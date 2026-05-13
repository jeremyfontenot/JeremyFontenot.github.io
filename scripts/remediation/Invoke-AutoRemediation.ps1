param(
  [switch]$DryRun,
  [Alias('Apply')]
  [switch]$Execute,
  [switch]$Force,
  [string]$RootPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$PolicyPath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'repository-policy.json'),
  [string]$QueuePath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'internal\remediation\remediation-queue.json'),
  [string]$ReportPath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'internal\reports\phase4')
)

$ErrorActionPreference = 'Stop'

if (-not $Execute -and -not $DryRun) { $DryRun = $true }
if ($Execute -and -not $Force) { $DryRun = $true }

function Get-PolicyZone {
  param(
    [string]$RelativePath,
    [object]$Policy
  )

  foreach ($zone in $Policy.canonicalZones) {
    if ($RelativePath -match $zone.pathRegex) { return [pscustomobject]@{ Name = $zone.name; Kind = 'canonical'; Bucket = 'docs'; Protected = $false } }
  }

  foreach ($zone in $Policy.generatedZones) {
    if ($RelativePath -match $zone.pathRegex) {
      return [pscustomobject]@{ Name = $zone.name; Kind = 'generated'; Bucket = if ($RelativePath -match '^public/') { 'public' } elseif ($RelativePath -match '^docs/assets/') { 'assets' } elseif ($RelativePath -match '^internal/') { 'internal' } else { 'internal' }; Protected = $false }
    }
  }

  foreach ($zone in $Policy.immutableArchiveZones) {
    if ($RelativePath -match $zone.pathRegex) { return [pscustomobject]@{ Name = $zone.name; Kind = 'archive'; Bucket = 'archive'; Protected = $true } }
  }

  foreach ($zone in $Policy.protectedEvidenceZones) {
    if ($RelativePath -match $zone.pathRegex) { return [pscustomobject]@{ Name = $zone.name; Kind = 'protected-evidence'; Bucket = 'public'; Protected = $true } }
  }

  if ($RelativePath -match '^public/') { return [pscustomobject]@{ Name = 'deployment-mirror'; Kind = 'generated'; Bucket = 'public'; Protected = $false } }
  if ($RelativePath -match '^assets/') { return [pscustomobject]@{ Name = 'public-assets'; Kind = 'canonical'; Bucket = 'assets'; Protected = $false } }
  if ($RelativePath -match '^(?:index\.html|contact\.html|documentation\.html|projects\.html|skills\.html)$') { return [pscustomobject]@{ Name = 'site-entrypoints'; Kind = 'canonical'; Bucket = 'public'; Protected = $false } }
  if ($RelativePath -match '^(?:README\.md|CONTRIBUTING\.md|SECURITY\.md|docs-governance\.md|archive-retention-policy\.md|repository-policy\.json|robots\.txt|sitemap\.xml|CNAME|\.nojekyll)$') { return [pscustomobject]@{ Name = 'repo-control-files'; Kind = 'canonical'; Bucket = 'internal'; Protected = $false } }
  if ($RelativePath -match '^(?:scripts/|\.github/|\.vscode/|internal/)') { return [pscustomobject]@{ Name = 'internal-control'; Kind = 'generated'; Bucket = 'internal'; Protected = $false } }

  return [pscustomobject]@{ Name = 'unclassified'; Kind = 'unclassified'; Bucket = 'docs'; Protected = $false }
}

function Convert-ToRelativePath {
  param([string]$Path)
  return [System.IO.Path]::GetRelativePath($RootPath, $Path) -replace '\\', '/'
}

function Test-ProtectedPath {
  param(
    [string]$RelativePath,
    [object]$Policy
  )

  foreach ($regex in $Policy.remediationExclusions.pathRegexes) {
    if ($RelativePath -match $regex) { return $true }
  }

  return $false
}

function Write-Line {
  param([System.Collections.Generic.List[string]]$Buffer, [string]$Line)
  $Buffer.Add($Line) | Out-Null
}

function Test-UnsafeCrossZoneAction {
  param(
    [object]$Item,
    [object]$Policy
  )

  if ($Item.action -notin @('rename', 'move') -or -not $Item.targetPath) { return $false }

  $sourceZone = Get-PolicyZone -RelativePath $Item.sourcePath -Policy $Policy
  $targetZone = Get-PolicyZone -RelativePath $Item.targetPath -Policy $Policy
  return ($sourceZone.Name -ne $targetZone.Name -or $sourceZone.Bucket -ne $targetZone.Bucket -or $sourceZone.Kind -ne $targetZone.Kind)
}

if (-not (Test-Path -LiteralPath $QueuePath)) {
  & (Join-Path $PSScriptRoot 'Generate-RemediationQueue.ps1') -RootPath $RootPath -PolicyPath $PolicyPath -QueuePath $QueuePath -ReportPath $ReportPath | Out-Null
}

$policy = Get-Content -LiteralPath $PolicyPath -Raw | ConvertFrom-Json
$queue = Get-Content -LiteralPath $QueuePath -Raw | ConvertFrom-Json
$items = @($queue.items)

New-Item -ItemType Directory -Force -Path $ReportPath | Out-Null

$report = New-Object System.Collections.Generic.List[string]
$risk = New-Object System.Collections.Generic.List[string]

Write-Line $report '# Execution Report'
Write-Line $report ''
Write-Line $report ('- Mode: ' + ($(if ($Execute -and $Force -and -not $DryRun) { 'execute' } else { 'dry-run' })))
Write-Line $report ('- Default mode: dry-run')
Write-Line $report ('- Explicit execute requested: ' + $Execute)
Write-Line $report ('- Queue items: ' + $items.Count)
Write-Line $report ('- Force override: ' + $Force)
Write-Line $report ''

$applied = 0
$skipped = 0
$protectedViolations = 0
$destructiveAttempts = 0

Write-Line $report '## Queue Summary'
Write-Line $report ''
foreach ($group in ($items | Group-Object type | Sort-Object Name)) {
  Write-Line $report ('### ' + $group.Name)
  foreach ($severityGroup in ($group.Group | Group-Object severity | Sort-Object Name)) {
    Write-Line $report ('- ' + $severityGroup.Name + ': ' + $severityGroup.Count)
  }
  Write-Line $report ''
}

Write-Line $report '## Skipped Items'
Write-Line $report ''

$preflightProtectedViolations = 0
$preflightDestructiveAttempts = 0
$preflightRisk = New-Object System.Collections.Generic.List[string]

if ($Execute -and $Force -and -not $DryRun) {
  foreach ($item in ($items | Sort-Object type, severity, sourcePath, targetPath, action)) {
    $sourceProtected = [bool]$item.policyContext.protectedZone
    $targetProtected = if ($item.targetPath) { Test-ProtectedPath -RelativePath $item.targetPath -Policy $policy } else { $false }
    $blocked = $sourceProtected -or $targetProtected
    if ($blocked -and $item.status -eq 'approved' -and $item.action -ne 'ignore') {
      $preflightProtectedViolations++
      Write-Line $preflightRisk ('- protected-zone violation: ' + $item.sourcePath + ' -> ' + $item.targetPath + ' (' + $item.type + ')')
    }

    if ($item.status -eq 'approved' -and (Test-UnsafeCrossZoneAction -Item $item -Policy $policy)) {
      $preflightDestructiveAttempts++
      Write-Line $preflightRisk ('- unsafe cross-zone action blocked: ' + $item.sourcePath + ' -> ' + $item.targetPath + ' (' + $item.type + ')')
    }

    if ($item.action -notin @('fix_link', 'rename', 'move', 'ignore', 'archive')) {
      $preflightDestructiveAttempts++
      Write-Line $preflightRisk ('- unsupported action: ' + $item.action + ' for ' + $item.sourcePath)
    }
  }
}

if ($Execute -and $Force -and -not $DryRun -and ($preflightProtectedViolations -gt 0 -or $preflightDestructiveAttempts -gt 0)) {
  Write-Line $report '## Outcome'
  Write-Line $report ''
  Write-Line $report ('- Applied: 0')
  Write-Line $report ('- Skipped: ' + $items.Count)
  Write-Line $report ('- Protected zone violations: ' + $preflightProtectedViolations)
  Write-Line $report ('- Destructive attempts: ' + $preflightDestructiveAttempts)
  $report | Set-Content -Encoding UTF8 -Path (Join-Path $ReportPath 'execution-report.md')

  $riskReport = New-Object System.Collections.Generic.List[string]
  Write-Line $riskReport '# Risk Assessment Report'
  Write-Line $riskReport ''
  Write-Line $riskReport ('- Policy source: ' + (Convert-ToRelativePath $PolicyPath))
  Write-Line $riskReport ('- Protected zone violations: ' + $preflightProtectedViolations)
  Write-Line $riskReport ('- Destructive attempts: ' + $preflightDestructiveAttempts)
  Write-Line $riskReport ('- Protected exclusions: /archive, /_content, /evidence/public')
  Write-Line $riskReport ''
  Write-Line $riskReport '## Risk Events'
  Write-Line $riskReport ''
  foreach ($line in $preflightRisk) { Write-Line $riskReport $line }
  Write-Line $riskReport ''
  Write-Line $riskReport '## Protected Zone Exclusions'
  Write-Line $riskReport ''
  foreach ($path in @('/_content', '/archive', '/evidence/public')) {
    Write-Line $riskReport ('- ' + $path + ' (read-only by default)')
  }
  $riskReport | Set-Content -Encoding UTF8 -Path (Join-Path $ReportPath 'risk-assessment-report.md')

  throw 'Preflight validation blocked execute mode because protected or destructive actions were detected.'
}

foreach ($item in ($items | Sort-Object type, severity, sourcePath, targetPath, action)) {
  $sourceProtected = [bool]$item.policyContext.protectedZone
  $targetProtected = if ($item.targetPath) { Test-ProtectedPath -RelativePath $item.targetPath -Policy $policy } else { $false }
  $blocked = $sourceProtected -or $targetProtected

  if ($blocked -and $item.status -eq 'approved' -and $item.action -ne 'ignore') {
    $protectedViolations++
    Write-Line $risk ('- protected-zone violation: ' + $item.sourcePath + ' -> ' + $item.targetPath + ' (' + $item.type + ')')
  }

  if ($item.status -eq 'approved' -and (Test-UnsafeCrossZoneAction -Item $item -Policy $policy)) {
    $destructiveAttempts++
    Write-Line $risk ('- unsafe cross-zone action blocked: ' + $item.sourcePath + ' -> ' + $item.targetPath + ' (' + $item.type + ')')
  }

  if ($item.action -eq 'archive' -and $sourceProtected) {
    $skipped++
    Write-Line $report ('- ' + $item.type + ' | ' + $item.sourcePath + ' | skipped: protected archive/evidence zone')
    continue
  }

  if ($item.status -ne 'approved') {
    $skipped++
    Write-Line $report ('- ' + $item.type + ' | ' + $item.sourcePath + ' | skipped: status=' + $item.status)
    continue
  }

  if (-not $Execute -or -not $Force -or $DryRun) {
    $skipped++
    Write-Line $report ('- ' + $item.type + ' | ' + $item.sourcePath + ' | dry-run only')
    continue
  }

  switch ($item.action) {
    'fix_link' {
      $fullSource = Join-Path $RootPath ($item.sourcePath -replace '/', '\\')
      if (-not (Test-Path -LiteralPath $fullSource)) {
        $destructiveAttempts++
        Write-Line $risk ('- missing source for fix_link: ' + $item.sourcePath)
        continue
      }

      $current = Get-Content -LiteralPath $fullSource -Raw
      if ($current.Contains($item.referenceValue)) {
        $updated = $current.Replace($item.referenceValue, $item.proposedReference)
        Set-Content -LiteralPath $fullSource -Value $updated -Encoding UTF8
        $applied++
        Write-Line $report ('- applied fix_link: ' + $item.sourcePath + ' -> ' + $item.proposedReference)
      } else {
        $skipped++
        Write-Line $report ('- skipped fix_link: ' + $item.sourcePath + ' (reference not found)')
      }
    }
    'rename' {
      $fullSource = Join-Path $RootPath ($item.sourcePath -replace '/', '\\')
      $fullTarget = Join-Path $RootPath ($item.targetPath -replace '/', '\\')
      if ((Test-Path -LiteralPath $fullSource) -and -not (Test-Path -LiteralPath $fullTarget)) {
        $targetDirectory = Split-Path -Parent $fullTarget
        if (-not (Test-Path -LiteralPath $targetDirectory)) { New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null }
        Move-Item -LiteralPath $fullSource -Destination $fullTarget
        $applied++
        Write-Line $report ('- applied rename: ' + $item.sourcePath + ' -> ' + $item.targetPath)
      } else {
        $destructiveAttempts++
        Write-Line $risk ('- rename blocked or target exists: ' + $item.sourcePath + ' -> ' + $item.targetPath)
      }
    }
    'move' {
      $fullSource = Join-Path $RootPath ($item.sourcePath -replace '/', '\\')
      $fullTarget = Join-Path $RootPath ($item.targetPath -replace '/', '\\')
      if ((Test-Path -LiteralPath $fullSource) -and -not (Test-Path -LiteralPath $fullTarget)) {
        $targetDirectory = Split-Path -Parent $fullTarget
        if (-not (Test-Path -LiteralPath $targetDirectory)) { New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null }
        Move-Item -LiteralPath $fullSource -Destination $fullTarget
        $applied++
        Write-Line $report ('- applied move: ' + $item.sourcePath + ' -> ' + $item.targetPath)
      } else {
        $destructiveAttempts++
        Write-Line $risk ('- move blocked or target exists: ' + $item.sourcePath + ' -> ' + $item.targetPath)
      }
    }
    'ignore' {
      $skipped++
      Write-Line $report ('- ignored: ' + $item.sourcePath + ' (' + $item.reason + ')')
    }
    'archive' {
      $skipped++
      Write-Line $report ('- archive recommendation logged only: ' + $item.sourcePath)
    }
    default {
      $destructiveAttempts++
      Write-Line $risk ('- unsupported action: ' + $item.action + ' for ' + $item.sourcePath)
    }
  }
}

Write-Line $report ''
Write-Line $report '## Outcome'
Write-Line $report ''
Write-Line $report ('- Applied: ' + $applied)
Write-Line $report ('- Skipped: ' + $skipped)
Write-Line $report ('- Protected zone violations: ' + $protectedViolations)
Write-Line $report ('- Destructive attempts: ' + $destructiveAttempts)
Write-Line $report ('- Policy source: ' + (Convert-ToRelativePath $PolicyPath))

$report | Set-Content -Encoding UTF8 -Path (Join-Path $ReportPath 'execution-report.md')

$riskReport = New-Object System.Collections.Generic.List[string]
Write-Line $riskReport '# Risk Assessment Report'
Write-Line $riskReport ''
Write-Line $riskReport ('- Policy source: ' + (Convert-ToRelativePath $PolicyPath))
Write-Line $riskReport ('- Protected zone violations: ' + $protectedViolations)
Write-Line $riskReport ('- Destructive attempts: ' + $destructiveAttempts)
Write-Line $riskReport ('- Protected exclusions: /archive, /_content, /evidence/public')
Write-Line $riskReport ''
Write-Line $riskReport '## Risk Events'
Write-Line $riskReport ''
if ($risk.Count -eq 0) {
  Write-Line $riskReport '- None.'
} else {
  foreach ($line in $risk) { Write-Line $riskReport $line }
}
Write-Line $riskReport ''
Write-Line $riskReport '## Protected Zone Exclusions'
Write-Line $riskReport ''
foreach ($path in @('/_content', '/archive', '/evidence/public')) {
  Write-Line $riskReport ('- ' + $path + ' (read-only by default)')
}

$riskReport | Set-Content -Encoding UTF8 -Path (Join-Path $ReportPath 'risk-assessment-report.md')

if ($Execute -and $Force -and -not $DryRun -and ($protectedViolations -gt 0 -or $destructiveAttempts -gt 0)) {
  throw 'Protected zone violation or destructive action attempt detected.'
}

Write-Host ('Execution report written to ' + (Join-Path $ReportPath 'execution-report.md'))
