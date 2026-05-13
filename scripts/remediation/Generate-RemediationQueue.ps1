param(
  [string]$RootPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$PolicyPath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'repository-policy.json'),
  [string]$QueuePath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'internal\remediation\remediation-queue.json'),
  [string]$ReportPath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'internal\reports\phase4')
)

$ErrorActionPreference = 'Stop'

function Convert-ToRelativePath {
  param([string]$Path)
  return [System.IO.Path]::GetRelativePath($RootPath, $Path) -replace '\\', '/'
}

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
      return [pscustomobject]@{
        Name = $zone.name
        Kind = 'generated'
        Bucket = if ($RelativePath -match '^public/') { 'public' } elseif ($RelativePath -match '^docs/assets/') { 'assets' } elseif ($RelativePath -match '^internal/') { 'internal' } else { 'internal' }
        Protected = $false
      }
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

function Get-DeterministicGuid {
  param([string]$Seed)
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $hash = $sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Seed))
  } finally {
    $sha.Dispose()
  }

  $bytes = New-Object byte[] 16
  [System.Array]::Copy($hash, 0, $bytes, 0, 16)
  $bytes[6] = ($bytes[6] -band 0x0F) -bor 0x50
  $bytes[8] = ($bytes[8] -band 0x3F) -bor 0x80
  return [guid]::new($bytes).ToString()
}

function Get-NormalizedName {
  param([string]$Name)
  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($Name)
  $extension = [System.IO.Path]::GetExtension($Name).ToLowerInvariant()
  $normalized = $baseName.ToLowerInvariant() -replace '[\s_]+', '-' -replace '[^a-z0-9.-]', '-' -replace '-{2,}', '-'
  $normalized = $normalized.Trim('-')
  if (-not $normalized) { $normalized = 'file' }
  return $normalized + $extension
}

function Get-RelativeReference {
  param(
    [string]$SourcePath,
    [string]$TargetPath
  )

  $sourceDir = Split-Path -Parent (Join-Path $RootPath ($SourcePath -replace '/', '\\'))
  $targetFull = Join-Path $RootPath ($TargetPath -replace '/', '\\')
  return [System.IO.Path]::GetRelativePath($sourceDir, $targetFull) -replace '\\', '/'
}

function New-QueueItem {
  param(
    [string]$Type,
    [string]$Severity,
    [string]$SourcePath,
    [string]$TargetPath,
    [string]$Action,
    [string]$Status,
    [string]$Reason,
    [object]$PolicyContext,
    [string]$Recommendation,
    [string]$SourceReport,
    [string]$ReferenceValue,
    [string]$ProposedReference,
    [string]$LineageClassification,
    [string]$DuplicateRecommendation
  )

  $seed = ($Type + '|' + $SourcePath + '|' + $TargetPath)
  $resolvedZone = $null
  if (-not $PolicyContext.zone -and $policy) {
    $resolvedZone = Get-PolicyZone -RelativePath $SourcePath -Policy $policy
  }

  $effectiveZone = if ($PolicyContext.zone) { $PolicyContext.zone } elseif ($resolvedZone) { $resolvedZone.Bucket } else { $null }
  $effectiveZoneKind = if ($PolicyContext.zoneKind) { $PolicyContext.zoneKind } elseif ($resolvedZone) { $resolvedZone.Kind } else { $null }
  $effectiveZoneName = if ($PolicyContext.zoneName) { $PolicyContext.zoneName } elseif ($resolvedZone) { $resolvedZone.Name } else { $null }
  $effectiveCanonical = if ($null -ne $PolicyContext.canonicalZone) { [bool]$PolicyContext.canonicalZone } elseif ($resolvedZone) { $resolvedZone.Kind -eq 'canonical' } else { $false }
  $effectiveProtected = if ($null -ne $PolicyContext.protectedZone) { [bool]$PolicyContext.protectedZone } elseif ($resolvedZone) { [bool]$resolvedZone.Protected } else { $false }
  $effectiveImmutable = if ($null -ne $PolicyContext.immutableArchiveZone) { [bool]$PolicyContext.immutableArchiveZone } elseif ($resolvedZone) { $resolvedZone.Kind -eq 'archive' } else { $false }

  $classification = if ($effectiveZoneName -eq 'docs-assets-mirror') {
    'mirror'
  } elseif ($effectiveImmutable) {
    'archive'
  } elseif ($effectiveProtected) {
    'evidence'
  } elseif ($effectiveCanonical) {
    'canonical'
  } elseif ($effectiveZoneKind -eq 'generated') {
    'generated'
  } else {
    'unknown'
  }

  $allowed = ($Status -eq 'approved' -and $classification -ne 'unknown' -and -not $effectiveProtected -and -not $effectiveImmutable)
  $requiresOverride = ($effectiveProtected -or $effectiveImmutable -or $classification -eq 'unknown')

  [pscustomobject]@{
    id = Get-DeterministicGuid -Seed $seed
    type = $Type
    severity = $Severity
    sourcePath = $SourcePath
    targetPath = $TargetPath
    action = $Action
    zone = $effectiveZone
    classification = $classification
    status = $Status
    allowed = $allowed
    requiresOverride = $requiresOverride
    policyContext = [pscustomobject]@{
      canonicalZone = $effectiveCanonical
      protectedZone = $effectiveProtected
      immutableArchiveZone = $effectiveImmutable
      zoneKind = $effectiveZoneKind
      zoneName = $effectiveZoneName
    }
    recommendation = $Recommendation
    sourceReport = $SourceReport
    reason = $Reason
    referenceValue = $ReferenceValue
    proposedReference = $ProposedReference
    lineageClassification = $LineageClassification
    duplicateRecommendation = $DuplicateRecommendation
  }
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

function Add-UniqueQueueItem {
  param(
    [System.Collections.Generic.List[object]]$QueueItems,
    [System.Collections.Generic.HashSet[string]]$QueueIds,
    [object]$Item
  )

  if ($QueueIds.Add($Item.id)) {
    $QueueItems.Add($Item) | Out-Null
  }
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $QueuePath) | Out-Null
New-Item -ItemType Directory -Force -Path $ReportPath | Out-Null

$policy = Get-Content -LiteralPath $PolicyPath -Raw | ConvertFrom-Json
$brokenRefs = Import-Csv -LiteralPath (Join-Path $RootPath 'internal\reports\phase2\broken-references.csv')
$duplicateInventory = Import-Csv -LiteralPath (Join-Path $RootPath 'internal\reports\phase2\duplicate-inventory.csv')
$orphanInventory = Import-Csv -LiteralPath (Join-Path $RootPath 'internal\reports\phase2\orphan-asset-report.csv')
$referenceGraph = Import-Csv -LiteralPath (Join-Path $RootPath 'internal\reports\phase2\reference-graph.csv')
$intentionalOrphans = @()
$intentionalPath = Join-Path $RootPath 'internal\reports\phase3\intentional-orphans.json'
if (Test-Path -LiteralPath $intentionalPath) {
  $loaded = Get-Content -LiteralPath $intentionalPath -Raw | ConvertFrom-Json
  if ($loaded) {
    if ($loaded -is [System.Array]) { $intentionalOrphans = $loaded } else { $intentionalOrphans = @($loaded) }
  }
}

$queueItems = New-Object System.Collections.Generic.List[object]
$queueIds = New-Object 'System.Collections.Generic.HashSet[string]'
$suppressedItems = New-Object System.Collections.Generic.List[object]
$reportWarnings = New-Object System.Collections.Generic.List[object]

$intentionalSet = New-Object 'System.Collections.Generic.HashSet[string]'
foreach ($item in $intentionalOrphans) { [void]$intentionalSet.Add($item.path) }

# Broken links
foreach ($row in $brokenRefs | Sort-Object Source, Reference, ResolvedTarget) {
  $sourceExtension = [System.IO.Path]::GetExtension($row.Source).ToLowerInvariant()
  if (($sourceExtension -in @('.js', '.css')) -and $row.Reference -notmatch '[/\\]') {
    continue
  }
  $sourceZone = Get-PolicyZone -RelativePath $row.Source -Policy $policy
  $targetPath = if ($row.ResolvedTarget) { $row.ResolvedTarget } else { '' }
  $protected = $sourceZone.Protected -or (Test-ProtectedPath -RelativePath $row.Source -Policy $policy) -or ($targetPath -and (Test-ProtectedPath -RelativePath $targetPath -Policy $policy))
  $status = if ($protected) { 'rejected' } else { 'pending' }
  $severity = if ($sourceZone.Bucket -in @('docs', 'public')) { 'high' } elseif ($sourceZone.Bucket -eq 'assets') { 'medium' } else { 'low' }
  $reason = if ($protected) { 'Protected zone reference is immutable by policy.' } else { 'Broken relative reference detected in source document.' }
  $proposedReference = if ($targetPath) { Get-RelativeReference -SourcePath $row.Source -TargetPath $targetPath } else { '' }
  Add-UniqueQueueItem -QueueItems $queueItems -QueueIds $queueIds -Item (New-QueueItem -Type 'broken_link' -Severity $severity -SourcePath $row.Source -TargetPath $targetPath -Action 'fix_link' -Status $status -Reason $reason -PolicyContext [pscustomobject]@{ zone = $sourceZone.Bucket; canonicalZone = ($sourceZone.Kind -eq 'canonical'); protectedZone = $protected; immutableArchiveZone = ($sourceZone.Kind -eq 'archive'); zoneKind = $sourceZone.Kind; zoneName = $sourceZone.Name } -Recommendation 'fix_link' -SourceReport 'internal/reports/phase2/broken-references.csv' -ReferenceValue $row.Reference -ProposedReference $proposedReference -LineageClassification '' -DuplicateRecommendation '')
  if ($protected) {
    $reportWarnings.Add([pscustomobject]@{ type = 'protected_zone_violation'; sourcePath = $row.Source; targetPath = $targetPath; reason = $reason })
  }
}

# Orphans
foreach ($row in $orphanInventory | Sort-Object Path) {
  $zone = Get-PolicyZone -RelativePath $row.Path -Policy $policy
  $intentional = $intentionalSet.Contains($row.Path)
  $protected = $zone.Protected -or (Test-ProtectedPath -RelativePath $row.Path -Policy $policy)
  $status = if ($protected) { 'rejected' } elseif ($intentional) { 'rejected' } else { 'pending' }
  $action = if ($protected) { 'archive' } elseif ($intentional) { 'ignore' } else { 'ignore' }
  $recommendation = if ($protected) { 'archive' } elseif ($intentional) { 'ignore' } else { 'retain' }
  $reason = if ($protected) { 'Protected archive or evidence zone cannot be modified.' } elseif ($intentional) { 'Intentional orphan suppression rule matched.' } else { 'Unreferenced asset or document candidate.' }
  $severity = if ($zone.Bucket -eq 'docs') { 'medium' } elseif ($zone.Bucket -eq 'assets') { 'low' } elseif ($zone.Bucket -eq 'public') { 'medium' } else { 'low' }
  Add-UniqueQueueItem -QueueItems $queueItems -QueueIds $queueIds -Item (New-QueueItem -Type 'orphan' -Severity $severity -SourcePath $row.Path -TargetPath '' -Action $action -Status $status -Reason $reason -PolicyContext [pscustomobject]@{ zone = $zone.Bucket; canonicalZone = ($zone.Kind -eq 'canonical'); protectedZone = $protected; immutableArchiveZone = ($zone.Kind -eq 'archive'); zoneKind = $zone.Kind; zoneName = $zone.Name } -Recommendation $recommendation -SourceReport 'internal/reports/phase2/orphan-asset-report.csv' -ReferenceValue '' -ProposedReference '' -LineageClassification '' -DuplicateRecommendation '')
  if ($status -eq 'rejected') {
    $suppressedItems.Add([pscustomobject]@{ type = 'orphan'; path = $row.Path; reason = $reason })
  }
}

# Duplicate lineage classification
$duplicateGroups = $duplicateInventory | Group-Object Hash | Where-Object { $_.Count -gt 1 } | Sort-Object -Property Count, Name -Descending
foreach ($group in $duplicateGroups) {
  $members = $group.Group | Sort-Object Path
  $canonicalMember = $members | Where-Object { (Get-PolicyZone -RelativePath $_.Path -Policy $policy).Kind -eq 'canonical' } | Select-Object -First 1
  if (-not $canonicalMember) { $canonicalMember = $members | Select-Object -First 1 }

  foreach ($member in $members) {
    $zone = Get-PolicyZone -RelativePath $member.Path -Policy $policy
    $protected = $zone.Protected -or (Test-ProtectedPath -RelativePath $member.Path -Policy $policy)
    $classification = if ($member.Path -eq $canonicalMember.Path) {
      'canonical source'
    } elseif ($zone.Name -eq 'docs-assets-mirror' -or $member.Path -match '^docs/assets/' -or ($zone.Kind -eq 'generated' -and $zone.Bucket -eq 'public')) {
      'mirror'
    } elseif ($zone.Kind -eq 'archive' -or $zone.Bucket -eq 'archive') {
      'archive copy'
    } else {
      'accidental duplicate'
    }

    $recommendation = switch ($classification) {
      'canonical source' { 'retain' }
      'mirror' { 'ignore' }
      'archive copy' { 'archive' }
      default { 'dedupe' }
    }

    $action = switch ($recommendation) {
      'retain' { 'ignore' }
      'ignore' { 'ignore' }
      'archive' { 'archive' }
      'dedupe' { 'rename' }
      default { 'ignore' }
    }

    $status = if ($protected -and $recommendation -ne 'ignore') { 'rejected' } elseif ($classification -eq 'canonical source') { 'approved' } else { 'pending' }
    $reason = if ($protected -and $recommendation -ne 'ignore') { 'Protected archive/evidence duplicate cannot be remediated automatically.' } else { 'Duplicate lineage classified from duplicate inventory and policy zones.' }
    $targetPath = if ($classification -eq 'canonical source') { $member.Path } else { $canonicalMember.Path }
    Add-UniqueQueueItem -QueueItems $queueItems -QueueIds $queueIds -Item (New-QueueItem -Type 'duplicate' -Severity ($(if ($classification -eq 'accidental duplicate') { 'high' } elseif ($classification -eq 'archive copy') { 'medium' } else { 'low' })) -SourcePath $member.Path -TargetPath $targetPath -Action $action -Status $status -Reason $reason -PolicyContext [pscustomobject]@{ zone = $zone.Bucket; canonicalZone = ($zone.Kind -eq 'canonical'); protectedZone = $protected; immutableArchiveZone = ($zone.Kind -eq 'archive'); zoneKind = $zone.Kind; zoneName = $zone.Name } -Recommendation $recommendation -SourceReport 'internal/reports/phase2/duplicate-inventory.csv' -ReferenceValue '' -ProposedReference '' -LineageClassification $classification -DuplicateRecommendation $recommendation)
    if ($status -eq 'rejected') {
      $reportWarnings.Add([pscustomobject]@{ type = 'protected_zone_violation'; sourcePath = $member.Path; targetPath = $targetPath; reason = $reason })
    }
  }
}

# Naming and casing compliance from current repository surface
$repoFiles = Get-ChildItem -LiteralPath $RootPath -Recurse -File | Where-Object { $_.FullName -notmatch '\\.git\\' -and $_.FullName -notmatch '\\internal\\reports\\phase4\\' -and $_.FullName -notmatch '\\internal\\reports\\phase3\\' -and $_.FullName -notmatch '\\internal\\reports\\phase2\\' }
foreach ($file in $repoFiles | Sort-Object FullName) {
  $relative = Convert-ToRelativePath $file.FullName
  if ($relative -match '^(?:_content/|archive/|evidence/public/)') { continue }
  $zone = Get-PolicyZone -RelativePath $relative -Policy $policy
  $protected = $zone.Protected -or (Test-ProtectedPath -RelativePath $relative -Policy $policy)
  $normalizedName = Get-NormalizedName -Name $file.Name
  $targetPath = ($relative.Substring(0, [Math]::Max($relative.Length - $file.Name.Length, 0))) + $normalizedName
  if ($file.Name -match '[A-Z]') {
    Add-UniqueQueueItem -QueueItems $queueItems -QueueIds $queueIds -Item (New-QueueItem -Type 'casing' -Severity ($(if ($zone.Bucket -eq 'docs' -or $zone.Bucket -eq 'public') { 'medium' } else { 'low' })) -SourcePath $relative -TargetPath $targetPath -Action 'rename' -Status ($(if ($protected) { 'rejected' } else { 'pending' })) -Reason ($(if ($protected) { 'Protected zone file names are immutable by policy.' } else { 'Uppercase characters should be normalized for canonical lineage.' })) -PolicyContext [pscustomobject]@{ zone = $zone.Bucket; canonicalZone = ($zone.Kind -eq 'canonical'); protectedZone = $protected; immutableArchiveZone = ($zone.Kind -eq 'archive'); zoneKind = $zone.Kind; zoneName = $zone.Name } -Recommendation 'rename' -SourceReport 'repository-tree' -ReferenceValue '' -ProposedReference '' -LineageClassification '' -DuplicateRecommendation '')
  }
  if ($file.Name -match '[ _]') {
    Add-UniqueQueueItem -QueueItems $queueItems -QueueIds $queueIds -Item (New-QueueItem -Type 'naming' -Severity ($(if ($zone.Bucket -eq 'docs' -or $zone.Bucket -eq 'public') { 'medium' } else { 'low' })) -SourcePath $relative -TargetPath $targetPath -Action 'rename' -Status ($(if ($protected) { 'rejected' } else { 'pending' })) -Reason ($(if ($protected) { 'Protected zone file names are immutable by policy.' } else { 'Filename should use lowercase hyphenated naming.' })) -PolicyContext [pscustomobject]@{ zone = $zone.Bucket; canonicalZone = ($zone.Kind -eq 'canonical'); protectedZone = $protected; immutableArchiveZone = ($zone.Kind -eq 'archive'); zoneKind = $zone.Kind; zoneName = $zone.Name } -Recommendation 'rename' -SourceReport 'repository-tree' -ReferenceValue '' -ProposedReference '' -LineageClassification '' -DuplicateRecommendation '')
  }
}

$sortedQueue = $queueItems | Sort-Object type, severity, sourcePath, targetPath, action, status
$queueObject = [pscustomobject]@{
  schemaVersion = '1.0'
  generatedAt = (Get-Date).ToUniversalTime().ToString('o')
  policyPath = (Convert-ToRelativePath $PolicyPath)
  sourceReports = [pscustomobject]@{
    referenceGraph = 'internal/reports/phase2/reference-graph.csv'
    brokenReferences = 'internal/reports/phase2/broken-references.csv'
    duplicateInventory = 'internal/reports/phase2/duplicate-inventory.csv'
    orphanAssets = 'internal/reports/phase2/orphan-asset-report.csv'
    intentionalOrphans = 'internal/reports/phase3/intentional-orphans.json'
  }
  items = @($sortedQueue)
}

$queueObject | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path $QueuePath

$summary = New-Object System.Collections.Generic.List[string]
$summary.Add('# Remediation Queue Report')
$summary.Add('')
$summary.Add(('- Policy source: ' + (Convert-ToRelativePath $PolicyPath)))
$summary.Add('- Policy decisions: classification, suppression, and allowed/override flags are derived from repository-policy.json.')
$summary.Add('')
$summary.Add(('- Queue items: ' + $sortedQueue.Count))
$summary.Add(('- Broken links: ' + (($sortedQueue | Where-Object { $_.type -eq 'broken_link' }).Count)))
$summary.Add(('- Orphans: ' + (($sortedQueue | Where-Object { $_.type -eq 'orphan' }).Count)))
$summary.Add(('- Duplicates: ' + (($sortedQueue | Where-Object { $_.type -eq 'duplicate' }).Count)))
$summary.Add(('- Naming issues: ' + (($sortedQueue | Where-Object { $_.type -eq 'naming' }).Count)))
$summary.Add(('- Casing issues: ' + (($sortedQueue | Where-Object { $_.type -eq 'casing' }).Count)))
$summary.Add(('- Suppressed items: ' + $suppressedItems.Count))
$summary.Add('')
$summary.Add('## Grouped by Type')
$summary.Add('')
foreach ($group in ($sortedQueue | Group-Object type | Sort-Object Name)) {
  $summary.Add(('### ' + $group.Name))
  foreach ($severityGroup in ($group.Group | Group-Object severity | Sort-Object Name)) {
    $summary.Add(('- ' + $severityGroup.Name + ': ' + $severityGroup.Count))
  }
  $summary.Add('')
}
$summary.Add('## Skipped and Protected Items')
$summary.Add('')
if ($suppressedItems.Count -eq 0 -and ($sortedQueue | Where-Object { $_.status -eq 'rejected' }).Count -eq 0) {
  $summary.Add('- None.')
} else {
  foreach ($item in ($sortedQueue | Where-Object { $_.status -eq 'rejected' } | Sort-Object type, sourcePath)) {
    $summary.Add(('- ' + $item.type + ' -> ' + $item.sourcePath + ' (' + $item.reason + ')'))
  }
}
$summary | Set-Content -Encoding UTF8 -Path (Join-Path $ReportPath 'remediation-queue-report.md')

$orphanReport = New-Object System.Collections.Generic.List[string]
$orphanReport.Add('# Orphan Suppression Report')
$orphanReport.Add('')
$orphanReport.Add(('- Policy source: ' + (Convert-ToRelativePath $PolicyPath)))
$orphanReport.Add('- Orphans are suppressed when repository-policy.json matches an exclusion rule or a protected zone.')
$orphanReport.Add('')
$orphanReport.Add(('- Suppressed orphan items: ' + $suppressedItems.Count))
$orphanReport.Add('')
$orphanReport.Add('| Path | Reason |')
$orphanReport.Add('| --- | --- |')
if ($suppressedItems.Count -eq 0) {
  $orphanReport.Add('| None | No orphan suppression rules matched. |')
} else {
  foreach ($item in ($suppressedItems | Sort-Object path)) {
    $orphanReport.Add('| ' + $item.path + ' | ' + ($item.reason -replace '\|', '\\|') + ' |')
  }
}
$orphanReport | Set-Content -Encoding UTF8 -Path (Join-Path $ReportPath 'orphan-suppression-report.md')

$queueMd = New-Object System.Collections.Generic.List[string]
$queueMd.Add('# Remediation Queue')
$queueMd.Add('')
$queueMd.Add(('- Deterministic queue generated from phase 2 and phase 3 reports.'))
$queueMd.Add(('- Policy source: repository-policy.json.'))
$queueMd.Add(('- Protected zones are marked rejected and are never auto-remediated.'))
$queueMd.Add('')
$queueMd.Add('| Type | Severity | Source | Target | Action | Status | Recommendation |')
$queueMd.Add('| --- | --- | --- | --- | --- | --- | --- |')
foreach ($item in $sortedQueue) {
  $queueMd.Add('| ' + $item.type + ' | ' + $item.severity + ' | ' + $item.sourcePath + ' | ' + ($item.targetPath -replace '\|', '\\|') + ' | ' + $item.action + ' | ' + $item.status + ' | ' + $item.recommendation + ' |')
}
$queueMd | Set-Content -Encoding UTF8 -Path (Join-Path (Split-Path -Parent $QueuePath) 'remediation-queue.md')

$duplicateReport = New-Object System.Collections.Generic.List[string]
$duplicateReport.Add('# Duplicate Classification Report')
$duplicateReport.Add('')
$duplicateReport.Add(('- Policy source: ' + (Convert-ToRelativePath $PolicyPath)))
$duplicateReport.Add('- Duplicate lineage is classified from repository-policy.json zone preferences and suppression rules.')
$duplicateReport.Add('')
$duplicateReport.Add(('- Duplicate groups: ' + $duplicateGroups.Count))
$duplicateReport.Add('')
foreach ($group in $duplicateGroups) {
  $members = $group.Group | Sort-Object Path
  $canonicalMember = $members | Where-Object { (Get-PolicyZone -RelativePath $_.Path -Policy $policy).Kind -eq 'canonical' } | Select-Object -First 1
  if (-not $canonicalMember) { $canonicalMember = $members | Select-Object -First 1 }
  $duplicateReport.Add(('## ' + $group.Name))
  $duplicateReport.Add('')
  $duplicateReport.Add('| Path | Classification | Recommendation |')
  $duplicateReport.Add('| --- | --- | --- |')
  foreach ($member in $members) {
    $zone = Get-PolicyZone -RelativePath $member.Path -Policy $policy
    $classification = if ($member.Path -eq $canonicalMember.Path) {
      'canonical source'
    } elseif ($zone.Kind -eq 'generated' -and $zone.Bucket -eq 'public') {
      'mirror'
    } elseif ($zone.Kind -eq 'archive' -or $zone.Bucket -eq 'archive') {
      'archive copy'
    } else {
      'accidental duplicate'
    }
    $recommendation = switch ($classification) {
      'canonical source' { 'retain' }
      'mirror' { 'ignore' }
      'archive copy' { 'archive' }
      default { 'dedupe' }
    }
    $duplicateReport.Add('| ' + $member.Path + ' | ' + $classification + ' | ' + $recommendation + ' |')
  }
  $duplicateReport.Add('')
}
$duplicateReport | Set-Content -Encoding UTF8 -Path (Join-Path $ReportPath 'duplicate-classification-report.md')

Write-Host ('Remediation queue written to ' + $QueuePath)
