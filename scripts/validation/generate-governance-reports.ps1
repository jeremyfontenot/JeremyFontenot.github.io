param(
  [string]$RootPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$PolicyPath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'repository-policy.json'),
  [string]$OutputPath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'internal\reports\phase3')
)

$ErrorActionPreference = 'Stop'

function Convert-ToRelativePath {
  param([string]$Path)
  return [System.IO.Path]::GetRelativePath($RootPath, $Path) -replace '\\', '/'
}

function Test-PathRegex {
  param(
    [string]$Path,
    [array]$Rules
  )

  foreach ($rule in $Rules) {
    if ($Path -match $rule.pathRegex) {
      return $rule
    }
  }

  return $null
}

function Get-FrontMatter {
  param([string]$Content)

  if (-not $Content.StartsWith("---`n") -and -not $Content.StartsWith("---`r`n")) {
    return $null
  }

  $lines = $Content -split "`r?`n"
  if ($lines.Count -lt 3 -or $lines[0].Trim() -ne '---') { return $null }

  $end = $null
  for ($index = 1; $index -lt $lines.Count; $index++) {
    if ($lines[$index].Trim() -eq '---') {
      $end = $index
      break
    }
  }

  if ($null -eq $end) { return $null }

  $data = @{}
  for ($index = 1; $index -lt $end; $index++) {
    $line = $lines[$index]
    if ($line -match '^(?<key>[A-Za-z0-9_-]+)\s*:\s*(?<value>.*)$') {
      $key = $matches.key.Trim()
      $value = $matches.value.Trim().Trim('"')
      $data[$key] = $value
    }
  }

  return [pscustomobject]@{
    Data = $data
    EndLine = $end + 1
  }
}

function Get-RepositoryFiles {
  Get-ChildItem -LiteralPath $RootPath -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\.git\\' -and $_.FullName -notmatch '\\internal\\reports\\phase2\\' -and $_.FullName -notmatch '\\internal\\reports\\phase3\\'
  }
}

function Get-ZoneClassification {
  param([string]$RelativePath, [object]$Policy)

  $zone = Test-PathRegex -Path $RelativePath -Rules $Policy.canonicalZones
  if ($zone) { return [pscustomobject]@{ Zone = $zone.name; Kind = 'canonical' } }

  $zone = Test-PathRegex -Path $RelativePath -Rules $Policy.generatedZones
  if ($zone) { return [pscustomobject]@{ Zone = $zone.name; Kind = 'generated' } }

  $zone = Test-PathRegex -Path $RelativePath -Rules $Policy.immutableArchiveZones
  if ($zone) { return [pscustomobject]@{ Zone = $zone.name; Kind = 'archive' } }

  $zone = Test-PathRegex -Path $RelativePath -Rules $Policy.protectedEvidenceZones
  if ($zone) { return [pscustomobject]@{ Zone = $zone.name; Kind = 'protected-evidence' } }

  return [pscustomobject]@{ Zone = 'unclassified'; Kind = 'unclassified' }
}

New-Item -ItemType Directory -Force -Path $OutputPath | Out-Null
$policy = Get-Content -LiteralPath $PolicyPath -Raw | ConvertFrom-Json
$files = Get-RepositoryFiles

$fileRows = foreach ($file in $files) {
  $rel = Convert-ToRelativePath $file.FullName
  $zoneInfo = Get-ZoneClassification -RelativePath $rel -Policy $policy
  [pscustomobject]@{
    Path = $rel
    FullPath = $file.FullName
    Extension = $file.Extension.ToLowerInvariant()
    Length = $file.Length
    Zone = $zoneInfo.Zone
    ZoneKind = $zoneInfo.Kind
  }
}

$policyReport = New-Object System.Collections.Generic.List[string]
$policyReport.Add('# Policy Validation Report')
$policyReport.Add('')
$policyReport.Add(('- Policy mode: ' + $policy.policyMode))
$policyReport.Add(('- Canonical zones: ' + $policy.canonicalZones.Count))
$policyReport.Add(('- Generated zones: ' + $policy.generatedZones.Count))
$policyReport.Add(('- Immutable archive zones: ' + $policy.immutableArchiveZones.Count))
$policyReport.Add(('- Protected evidence zones: ' + $policy.protectedEvidenceZones.Count))
$policyReport.Add('')
$policyReport.Add('## Schema Checks')
$policyReport.Add('')
$policyIssues = New-Object System.Collections.Generic.List[string]
foreach ($field in @('schemaVersion', 'repositoryName', 'policyMode', 'canonicalZones', 'generatedZones', 'immutableArchiveZones', 'protectedEvidenceZones', 'remediationExclusions', 'orphanSuppressionRules', 'duplicateSuppressionRules', 'metadata')) {
  if (-not $policy.PSObject.Properties.Name.Contains($field)) {
    $policyIssues.Add(('Missing top-level policy field: ' + $field))
  }
}
if ($policyIssues.Count -eq 0) {
  $policyReport.Add('- Policy schema fields are present.')
} else {
  foreach ($issue in $policyIssues) { $policyReport.Add(('- ' + $issue)) }
}

$frontmatterIssues = New-Object System.Collections.Generic.List[object]
$metadataFiles = $fileRows | Where-Object { $_.Extension -in '.md', '.markdown' }
foreach ($row in $metadataFiles) {
  $shouldRequire = $false
  foreach ($pattern in $policy.metadata.frontmatterRequiredFor) {
    $regex = '^' + [regex]::Escape($pattern).Replace('\*\*', '.*').Replace('\*', '[^/]*') + '$'
    if ($row.Path -match $regex) { $shouldRequire = $true; break }
  }

  $content = Get-Content -LiteralPath $row.FullPath -Raw
  $frontMatter = Get-FrontMatter -Content $content
  if (-not $frontMatter) {
    if ($shouldRequire) {
      $frontmatterIssues.Add([pscustomobject]@{ Path = $row.Path; Issue = 'missing frontmatter'; Severity = 'advisory' })
    }
    continue
  }

  $data = $frontMatter.Data
  foreach ($required in $policy.metadata.requiredFields) {
    if (-not $data.ContainsKey($required) -or [string]::IsNullOrWhiteSpace($data[$required])) {
      $frontmatterIssues.Add([pscustomobject]@{ Path = $row.Path; Issue = ('missing metadata field: ' + $required); Severity = 'advisory' })
    }
  }

  if ($data.ContainsKey('owner') -and $data.owner -ne 'jeremyfontenot') {
    $frontmatterIssues.Add([pscustomobject]@{ Path = $row.Path; Issue = 'owner tag does not match canonical owner'; Severity = 'advisory' })
  }
  if ($data.ContainsKey('classification') -and $policy.metadata.requiredTags.classification -notcontains $data.classification) {
    $frontmatterIssues.Add([pscustomobject]@{ Path = $row.Path; Issue = 'classification tag is not allowed by policy'; Severity = 'advisory' })
  }
  if ($data.ContainsKey('lifecycle') -and $policy.metadata.requiredTags.lifecycle -notcontains $data.lifecycle) {
    $frontmatterIssues.Add([pscustomobject]@{ Path = $row.Path; Issue = 'lifecycle tag is not allowed by policy'; Severity = 'advisory' })
  }
  if ($data.ContainsKey('archiveStatus') -and $policy.metadata.requiredTags.archiveStatus -notcontains $data.archiveStatus) {
    $frontmatterIssues.Add([pscustomobject]@{ Path = $row.Path; Issue = 'archiveStatus tag is not allowed by policy'; Severity = 'advisory' })
  }
}

$frontmatterIssues | Export-Csv -NoTypeInformation -Encoding UTF8 -Path (Join-Path $OutputPath 'frontmatter-validation.csv')

$policyReport.Add('')
$policyReport.Add('## Metadata Checks')
$policyReport.Add('')
if ($frontmatterIssues.Count -eq 0) {
  $policyReport.Add('- No metadata issues were detected in required markdown files.')
} else {
  foreach ($issue in $frontmatterIssues) {
    $policyReport.Add(('- ' + $issue.Path + ': ' + $issue.Issue + ' (' + $issue.Severity + ')'))
  }
}

$policyReport.Add('')
$policyReport.Add('## Canonical Ownership')
$policyReport.Add('')
$ownershipIssues = $fileRows | Where-Object {
  $_.ZoneKind -eq 'unclassified' -and ($_.Extension -in '.html', '.md', '.markdown', '.ps1', '.json', '.csv', '.xml', '.yml', '.yaml')
}
if ($ownershipIssues.Count -eq 0) {
  $policyReport.Add('- All repository files fall into a known ownership zone.')
} else {
  foreach ($item in $ownershipIssues | Sort-Object Path) {
    $policyReport.Add(('- ' + $item.Path + ' is unclassified and should be reviewed.'))
  }
}

$policyReport | Set-Content -Encoding UTF8 -Path (Join-Path $OutputPath 'policy-validation-report.md')

# Intentional orphan suppression
$referenceData = Import-Csv -LiteralPath (Join-Path $PSScriptRoot '..\internal\reports\phase2\reference-graph.csv')
$intentional = New-Object System.Collections.Generic.List[object]
$orphanCandidates = $fileRows | Where-Object { $_.Path -notin ($referenceData | Where-Object { $_.Inbound -gt 0 } | Select-Object -ExpandProperty Path) }

foreach ($candidate in $orphanCandidates | Sort-Object Path) {
  $matchedRule = $null
  foreach ($rule in $policy.orphanSuppressionRules) {
    $pathMatch = $false
    if ($rule.paths -and ($rule.paths -contains $candidate.Path)) { $pathMatch = $true }
    if (-not $pathMatch -and $rule.pathRegex -and $candidate.Path -match $rule.pathRegex) { $pathMatch = $true }
    if ($pathMatch) {
      if ($rule.extensions) {
        if ($rule.extensions -contains $candidate.Extension) { $matchedRule = $rule; break }
      } else {
        $matchedRule = $rule
        break
      }
    }
  }

  if ($matchedRule) {
    $intentional.Add([pscustomobject]@{
      path = $candidate.Path
      zone = $candidate.Zone
      zoneKind = $candidate.ZoneKind
      reason = $matchedRule.reason
    })
  }
}

$intentional | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 -Path (Join-Path $OutputPath 'intentional-orphans.json')

$intentionalMd = New-Object System.Collections.Generic.List[string]
$intentionalMd.Add('# Lineage Report')
$intentionalMd.Add('')
$intentionalMd.Add(('- Orphan candidates: ' + $orphanCandidates.Count))
$intentionalMd.Add(('- Intentional orphans: ' + $intentional.Count))
$intentionalMd.Add('')
foreach ($item in $intentional | Sort-Object path) {
  $intentionalMd.Add(('- ' + $item.path + ' -> ' + $item.reason))
}
$intentionalMd | Set-Content -Encoding UTF8 -Path (Join-Path $OutputPath 'lineage-report.md')

# Duplicate classification
$hashRows = foreach ($row in $fileRows) {
  [pscustomobject]@{
    Path = $row.Path
    Zone = $row.Zone
    ZoneKind = $row.ZoneKind
    Hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $row.FullPath).Hash
  }
}

$duplicateGroups = $hashRows | Group-Object Hash | Where-Object { $_.Count -gt 1 }
$duplicateMd = New-Object System.Collections.Generic.List[string]
$duplicateMd.Add('# Duplicate Lineage Classification Report')
$duplicateMd.Add('')
$duplicateMd.Add(('- Duplicate groups: ' + $duplicateGroups.Count))
$duplicateMd.Add('')

foreach ($group in $duplicateGroups | Sort-Object Count -Descending) {
  $members = $group.Group | Sort-Object Path
  $canonicalMember = $members | Where-Object { $_.ZoneKind -eq 'canonical' } | Select-Object -First 1
  $groupClass = if ($canonicalMember -and ($members.Count -gt 1)) { 'canonical source' } elseif (($members | Where-Object { $_.ZoneKind -eq 'generated' }).Count -gt 0) { 'generated derivative' } elseif (($members | Where-Object { $_.ZoneKind -match 'archive' }).Count -eq $members.Count) { 'historical archive duplicate' } else { 'accidental duplicate' }
  if ($members | Where-Object { $_.ZoneKind -eq 'generated' } | Measure-Object | Select-Object -ExpandProperty Count -ErrorAction SilentlyContinue) {
    if ($groupClass -eq 'canonical source') { $groupClass = 'mirrored deployment artifact' }
  }

  $duplicateMd.Add(('## ' + $group.Name))
  $duplicateMd.Add(('- Classification: ' + $groupClass))
  $duplicateMd.Add(('- Members: ' + $members.Count))
  $duplicateMd.Add('')
  $duplicateMd.Add('| Path | Lineage |')
  $duplicateMd.Add('| --- | --- |')
  foreach ($member in $members) {
    $lineage = switch ($member.ZoneKind) {
      'canonical' { 'canonical source' }
      'generated' { 'generated derivative' }
      'archive' { 'historical archive duplicate' }
      'protected-evidence' { 'protected evidence source' }
      default { 'accidental duplicate' }
    }
    $duplicateMd.Add('| ' + $member.Path + ' | ' + $lineage + ' |')
  }
  $duplicateMd.Add('')
}
$duplicateMd | Set-Content -Encoding UTF8 -Path (Join-Path $OutputPath 'duplicate-classification-report.md')

# Archive integrity
$protectedFiles = $fileRows | Where-Object { $_.ZoneKind -in @('archive', 'protected-evidence', 'generated') -or $_.Path -match '^public/_content/' }
$protectedDiff = @()
try {
  $baseRef = if ($env:GITHUB_BASE_REF) { 'origin/' + $env:GITHUB_BASE_REF + '...HEAD' } else { 'HEAD~1..HEAD' }
  $protectedDiff = git -C $RootPath diff --name-only $baseRef 2>$null | Where-Object { $_ }
} catch {
  $protectedDiff = @()
}

$archiveMd = New-Object System.Collections.Generic.List[string]
$archiveMd.Add('# Archive Integrity Report')
$archiveMd.Add('')
$archiveMd.Add(('- Protected zone files scanned: ' + $protectedFiles.Count))
$archiveMd.Add(('- Protected zone diff candidates: ' + ($protectedDiff | Measure-Object).Count))
$archiveMd.Add('')
$archiveMd.Add('## Protected Zone Inventory')
$archiveMd.Add('')
foreach ($group in ($protectedFiles | Group-Object ZoneKind | Sort-Object Name)) {
  $archiveMd.Add(('### ' + $group.Name))
  foreach ($item in ($group.Group | Sort-Object Path)) {
    $archiveMd.Add(('- ' + $item.Path))
  }
  $archiveMd.Add('')
}

$archiveMd.Add('## Mutation Check')
$archiveMd.Add('')
if (($protectedDiff | Measure-Object).Count -eq 0) {
  $archiveMd.Add('- No protected-zone mutation candidates were detected.')
} else {
  foreach ($path in $protectedDiff) {
    $archiveMd.Add(('- ' + $path))
  }
}

$archiveMd.Add('## Safeguards')
$archiveMd.Add('')
$archiveMd.Add('- Automatic remediation is blocked for /_content, /archive, and /evidence/public unless an explicit override flag is supplied.')
$archiveMd.Add('- Archive content remains immutable by default and is only reported, not modified.')
$archiveMd | Set-Content -Encoding UTF8 -Path (Join-Path $OutputPath 'archive-integrity-report.md')

Write-Host ('Governance reports written to ' + $OutputPath)
