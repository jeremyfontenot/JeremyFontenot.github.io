param(
  [string]$RootPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$OutputPath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'internal\reports\phase2')
)

$ErrorActionPreference = 'Stop'

function Convert-ToRelativePath {
  param([string]$Path)
  return [System.IO.Path]::GetRelativePath($RootPath, $Path) -replace '\\', '/'
}

function Resolve-RepositoryReference {
  param(
    [string]$SourceFile,
    [string]$Reference
  )

  $clean = $Reference.Trim([char[]]@('"', '''', ' ', '<', '>'))
  if (-not $clean) { return $null }

  if ($clean -match '^(?:https?:|mailto:|tel:|javascript:|data:|//)') {
    return [pscustomobject]@{
      IsExternal = $true
      ResolvedPath = $null
      Exists = $null
    }
  }

  $clean = ($clean -replace '[#?].*$', '').Trim()
  if (-not $clean) { return $null }
  if ($clean -notmatch '[\\/\.]') { return $null }
  if ($clean -match '^[A-Za-z]:[\\/]' -or $clean -match '^/(?:Users|home|mnt)/') { return $null }
  if ($clean -match '^\$\{.*\}$') { return $null }

  $decoded = [Uri]::UnescapeDataString($clean)
  $candidate = if ($decoded.StartsWith('/')) {
    Join-Path $RootPath ($decoded.TrimStart('/').Replace('/', '\'))
  } else {
    Join-Path (Split-Path -Parent $SourceFile) ($decoded.Replace('/', '\'))
  }

  $probe = @($candidate)
  if ($decoded.EndsWith('/')) {
    $probe += @(
      (Join-Path $candidate 'index.html'),
      (Join-Path $candidate 'index.htm'),
      (Join-Path $candidate 'index.md')
    )
  } elseif (-not [System.IO.Path]::HasExtension($candidate)) {
    $probe += @(
      (Join-Path $candidate 'index.html'),
      (Join-Path $candidate 'index.htm'),
      (Join-Path $candidate 'index.md')
    )
  }

  foreach ($path in $probe) {
    if (Test-Path -LiteralPath $path) {
      return [pscustomobject]@{
        IsExternal = $false
        ResolvedPath = (Resolve-Path -LiteralPath $path).Path
        Exists = $true
      }
    }
  }

  return [pscustomobject]@{
    IsExternal = $false
    ResolvedPath = $candidate
    Exists = $false
  }
}

New-Item -ItemType Directory -Force -Path $OutputPath | Out-Null

$scanFiles = Get-ChildItem -LiteralPath $RootPath -Recurse -File | Where-Object {
  $_.FullName -notmatch '\\.git\\' -and $_.FullName -notmatch '\\internal\\reports\\phase2\\'
}

$allRows = foreach ($file in $scanFiles) {
  [pscustomobject]@{
    FullPath = $file.FullName
    RelativePath = Convert-ToRelativePath $file.FullName
    Extension = $file.Extension.ToLowerInvariant()
    Length = $file.Length
  }
}

# Duplicate inventory
$hashRows = foreach ($row in $allRows) {
  try {
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $row.FullPath).Hash
  } catch {
    $hash = 'ERROR'
  }

  [pscustomobject]@{
    Hash = $hash
    SizeBytes = $row.Length
    Path = $row.RelativePath
  }
}

$duplicateGroups = $hashRows | Where-Object { $_.Hash -ne 'ERROR' } | Group-Object Hash | Where-Object { $_.Count -gt 1 } | Sort-Object -Property Count, Name -Descending
$duplicateRows = foreach ($group in $duplicateGroups) {
  foreach ($item in ($group.Group | Sort-Object Path)) {
    [pscustomobject]@{
      Hash = $item.Hash
      Count = $group.Count
      SizeBytes = $item.SizeBytes
      Path = $item.Path
    }
  }
}

$duplicateRows | Export-Csv -NoTypeInformation -Encoding UTF8 -Path (Join-Path $OutputPath 'duplicate-inventory.csv')

$duplicateMd = New-Object System.Collections.Generic.List[string]
$duplicateMd.Add('# Duplicate File Inventory')
$duplicateMd.Add('')
$duplicateMd.Add(('- Total files scanned: ' + $allRows.Count))
$duplicateMd.Add(('- Duplicate hash groups: ' + $duplicateGroups.Count))
$duplicateMd.Add(('- Duplicate files found: ' + (($duplicateGroups | ForEach-Object { $_.Count }) | Measure-Object -Sum | ForEach-Object { $_.Sum })))
$duplicateMd.Add('')
foreach ($group in $duplicateGroups) {
  $duplicateMd.Add(('## SHA256 ' + $group.Name))
  $duplicateMd.Add(('- Count: ' + $group.Count))
  $duplicateMd.Add(('- Size: ' + ($group.Group[0].SizeBytes) + ' bytes'))
  $duplicateMd.Add('')
  foreach ($item in ($group.Group | Sort-Object Path)) {
    $duplicateMd.Add(('- ' + $item.Path))
  }
  $duplicateMd.Add('')
}
$duplicateMd -join [Environment]::NewLine | Set-Content -Encoding UTF8 -Path (Join-Path $OutputPath 'duplicate-inventory.md')

# Reference graph and orphan detection
$textExtensions = @('.html', '.htm', '.md', '.markdown', '.txt', '.csv', '.json', '.xml', '.yml', '.yaml', '.js', '.css', '.svg', '.ps1')
$referenceRows = New-Object System.Collections.Generic.List[object]
$brokenRows = New-Object System.Collections.Generic.List[object]
$inboundCounts = @{}
$outboundCounts = @{}

$patterns = @(
  '(?i)(?:href|src|action|poster|data-copy)\s*=\s*["'']([^"'']+)["'']',
  '(?i)!\[[^\]]*\]\(([^)]+)\)',
  '(?i)\[[^\]]+\]\(([^)]+)\)',
  '(?i)url\(([^)]+)\)'
)

foreach ($source in $allRows | Where-Object { $textExtensions -contains $_.Extension }) {
  $content = try { Get-Content -LiteralPath $source.FullPath -Raw } catch { '' }
  if (-not $content) { continue }

  $outboundSet = New-Object System.Collections.Generic.HashSet[string]
  foreach ($pattern in $patterns) {
    foreach ($match in [regex]::Matches($content, $pattern)) {
      $reference = $match.Groups[1].Value
      $resolved = Resolve-RepositoryReference -SourceFile $source.FullPath -Reference $reference
      if (-not $resolved -or $resolved.IsExternal) { continue }

      $resolvedPath = $resolved.ResolvedPath
      $resolvedRel = Convert-ToRelativePath $resolvedPath
      [void]$outboundSet.Add($resolvedRel)

      if (-not $inboundCounts.ContainsKey($resolvedRel)) { $inboundCounts[$resolvedRel] = 0 }
      $inboundCounts[$resolvedRel]++

      $referenceRows.Add([pscustomobject]@{
        Source = $source.RelativePath
        Reference = $reference
        Target = $resolvedRel
        Exists = [bool]$resolved.Exists
      })

      if (-not $resolved.Exists) {
        $brokenRows.Add([pscustomobject]@{
          Source = $source.RelativePath
          Reference = $reference
          ResolvedTarget = $resolvedRel
        })
      }
    }
  }

  $outboundCounts[$source.RelativePath] = $outboundSet.Count
}

$graphRows = foreach ($row in $allRows) {
  [pscustomobject]@{
    Path = $row.RelativePath
    Type = $row.Extension.TrimStart('.')
    Inbound = if ($inboundCounts.ContainsKey($row.RelativePath)) { $inboundCounts[$row.RelativePath] } else { 0 }
    Outbound = if ($outboundCounts.ContainsKey($row.RelativePath)) { $outboundCounts[$row.RelativePath] } else { 0 }
    Exists = $true
  }
}

$graphRows | Export-Csv -NoTypeInformation -Encoding UTF8 -Path (Join-Path $OutputPath 'reference-graph.csv')
$brokenRows | Export-Csv -NoTypeInformation -Encoding UTF8 -Path (Join-Path $OutputPath 'broken-references.csv')

$graphMd = New-Object System.Collections.Generic.List[string]
$graphMd.Add('# Reference Graph Report')
$graphMd.Add('')
$graphMd.Add(('- Sources scanned: ' + ($allRows | Where-Object { $textExtensions -contains $_.Extension }).Count))
$graphMd.Add(('- Nodes with inbound references: ' + (($graphRows | Where-Object { $_.Inbound -gt 0 }).Count)))
$graphMd.Add(('- Nodes with no inbound references: ' + (($graphRows | Where-Object { $_.Inbound -eq 0 }).Count)))
$graphMd.Add(('- Broken references: ' + $brokenRows.Count))
$graphMd.Add('')
$graphMd.Add('## Broken Relative Paths')
$graphMd.Add('')
if ($brokenRows.Count -eq 0) {
  $graphMd.Add('- None detected by the current scan.')
} else {
  foreach ($row in ($brokenRows | Sort-Object Source, Reference)) {
    $graphMd.Add(('- ' + $row.Source + ' -> ' + $row.Reference + ' => ' + $row.ResolvedTarget))
  }
}
$graphMd.Add('')
$graphMd.Add('## Unreferenced Nodes')
$graphMd.Add('')
foreach ($group in (($graphRows | Where-Object { $_.Inbound -eq 0 -and $_.Path -notmatch '^(README\.md|\.gitignore|\.nojekyll|CNAME|robots\.txt|sitemap\.xml)$' }) | Group-Object Type | Sort-Object Name)) {
  $graphMd.Add(('### ' + $group.Name))
  foreach ($item in ($group.Group | Sort-Object Path)) {
    $graphMd.Add(('- ' + $item.Path))
  }
  $graphMd.Add('')
}
$graphMd -join [Environment]::NewLine | Set-Content -Encoding UTF8 -Path (Join-Path $OutputPath 'reference-graph.md')

$orphanExtensions = @('.html', '.htm', '.md', '.markdown', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.pdf', '.ps1', '.js')
$orphanRows = $graphRows | Where-Object { $orphanExtensions -contains ('.' + $_.Type) -and $_.Inbound -eq 0 } | Sort-Object Path

$orphanMd = New-Object System.Collections.Generic.List[string]
$orphanMd.Add('# Orphan Asset Report')
$orphanMd.Add('')
$orphanMd.Add(('- Candidate orphans: ' + $orphanRows.Count))
$orphanMd.Add(('- Scope: HTML, markdown, images, PDFs, scripts'))
$orphanMd.Add('')
foreach ($group in ($orphanRows | Group-Object Type | Sort-Object Name)) {
  $orphanMd.Add(('## ' + $group.Name))
  foreach ($item in ($group.Group | Sort-Object Path)) {
    $orphanMd.Add(('- ' + $item.Path))
  }
  $orphanMd.Add('')
}
$orphanMd -join [Environment]::NewLine | Set-Content -Encoding UTF8 -Path (Join-Path $OutputPath 'orphan-asset-report.md')
$orphanRows | Export-Csv -NoTypeInformation -Encoding UTF8 -Path (Join-Path $OutputPath 'orphan-asset-report.csv')

$summary = New-Object System.Collections.Generic.List[string]
$summary.Add('# Phase 2 Report Summary')
$summary.Add('')
$summary.Add(('- Duplicate groups: ' + $duplicateGroups.Count))
$summary.Add(('- Duplicate files: ' + (($duplicateGroups | ForEach-Object { $_.Count }) | Measure-Object -Sum | ForEach-Object { $_.Sum })))
$summary.Add(('- Broken references: ' + $brokenRows.Count))
$summary.Add(('- Orphan candidates: ' + $orphanRows.Count))
$summary.Add(('- Report output: internal/reports/phase2/'))
$summary -join [Environment]::NewLine | Set-Content -Encoding UTF8 -Path (Join-Path $OutputPath 'phase2-summary.md')

Write-Host ('Reports written to ' + $OutputPath)