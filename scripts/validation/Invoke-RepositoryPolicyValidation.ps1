#!/usr/bin/env pwsh

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$phase2Dir = Join-Path $repoRoot 'internal/reports/phase2'
$phase3Dir = Join-Path $repoRoot 'internal/reports/phase3'
$artifactDir = Join-Path $repoRoot 'artifacts'
$activeInventoryPath = Join-Path $artifactDir 'active-html-files.txt'
$sitemapPath = Join-Path $repoRoot 'sitemap.xml'
$indexNowPath = Join-Path $repoRoot 'scripts/indexnow_payload.json'
$manifestPath = Join-Path $repoRoot 'docs/manifest.json'

$trackedZonePatterns = @(
  'sorted-documents/**',
  'legacy-site-backup/**',
  'proof-staging/**'
)

$privatePathRegex = '(?i)\b[a-z]:[\\/]+Users[\\/][^\s"''<>]+'
$placeholderRegex = '(?i)\b(lorem ipsum|todo\b|coming soon|insert .* here|auto-generated placeholder)\b'
$encodingMarkerChar = [string][char]0xFFFD

$binaryExtensions = @(
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp', '.tif', '.tiff', '.pdf', '.zip', '.7z', '.gz',
  '.woff', '.woff2', '.ttf', '.otf', '.eot', '.mp4', '.webm', '.mov', '.mp3', '.wav', '.flac'
)

$scanExtensions = @(
  '.html', '.htm', '.md', '.txt', '.json', '.js', '.mjs', '.css', '.yml', '.yaml', '.xml', '.ps1', '.py', '.csv', '.ts', '.tsx', '.toml', '.ini'
)

$results = New-Object System.Collections.Generic.List[object]

function New-CheckResult {
  param(
    [string]$Name,
    [string]$Status,
    [string]$Message,
    [string[]]$Details = @()
  )

  [pscustomobject]@{
    name    = $Name
    status  = $Status
    message = $Message
    details = @($Details)
  }
}

function Add-CheckResult {
  param(
    [string]$Name,
    [string]$Status,
    [string]$Message,
    [string[]]$Details = @()
  )

  $results.Add((New-CheckResult -Name $Name -Status $Status -Message $Message -Details $Details))
}

function Write-Step {
  param([string]$Message)

  Write-Host "`n==> $Message"
}

function Invoke-CheckedCommand {
  param(
    [string]$DisplayName,
    [string]$FilePath,
    [string[]]$Arguments = @()
  )

  Write-Step $DisplayName
  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$DisplayName failed with exit code $LASTEXITCODE"
  }
}

function Get-TrackedFiles {
  $files = & git ls-files
  if ($LASTEXITCODE -ne 0) {
    throw 'Unable to enumerate tracked files with git ls-files.'
  }

  return @($files | ForEach-Object { $_.Trim() } | Where-Object { $_ })
}

function Test-PathPrefix {
  param(
    [string]$Path,
    [string[]]$Prefixes
  )

  foreach ($prefix in $Prefixes) {
    $normalizedPrefix = $prefix.TrimEnd('/')
    if ($Path -eq $normalizedPrefix -or $Path.StartsWith($normalizedPrefix + '/')) {
      return $true
    }
  }

  return $false
}

function Test-ScannableTextFile {
  param([string]$Path)

  if ((Test-PathPrefix -Path $Path -Prefixes @('sorted-documents/', 'legacy-site-backup/', 'proof-staging/', 'artifacts/', 'internal/', '.git/', 'node_modules/', 'docs/archive/', 'docs/automation/', 'docs/m365-documentation-archive/', 'docs/brandguide-archive/', 'docs/curated/', 'scripts/')) -or $Path -in @('repo-structure.txt', 'repo-tree.json', 'repo-tree.md')) {
    return $false
  }

  if ($Path.EndsWith('.bak')) {
    return $false
  }

  $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
  if ($extension -eq '') {
    return $true
  }

  if ($binaryExtensions -contains $extension) {
    return $false
  }

  return $scanExtensions -contains $extension
}

function Get-FileContentSafe {
  param([string]$Path)

  try {
    return Get-Content -LiteralPath $Path -Raw -Encoding UTF8
  } catch {
    return $null
  }
}

function Add-Failure {
  param(
    [string]$Check,
    [string]$Message,
    [string[]]$Details = @()
  )

  Add-CheckResult -Name $Check -Status 'fail' -Message $Message -Details $Details
  Write-Host "::error::$Message"
  foreach ($detail in $Details) {
    Write-Host "::error::$detail"
  }
}

function Add-Pass {
  param(
    [string]$Check,
    [string]$Message,
    [string[]]$Details = @()
  )

  Add-CheckResult -Name $Check -Status 'pass' -Message $Message -Details $Details
}

New-Item -ItemType Directory -Force -Path $artifactDir, $phase2Dir, $phase3Dir | Out-Null

Write-Host 'Repository Governance Validation'
Write-Host "Repository root: $repoRoot"

Write-Step 'Refreshing active inventory and site audit'
Invoke-CheckedCommand -DisplayName 'node scripts/audit-site.mjs' -FilePath 'node' -Arguments @((Join-Path $repoRoot 'scripts/audit-site.mjs'))
Invoke-CheckedCommand -DisplayName 'python scripts/generate_sitemap_and_indexnow.py' -FilePath 'python' -Arguments @((Join-Path $repoRoot 'scripts/generate_sitemap_and_indexnow.py'))

Write-Step 'Running SEO verification pass'
Invoke-CheckedCommand -DisplayName 'pwsh scripts/verify_pass4.ps1' -FilePath 'pwsh' -Arguments @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $repoRoot 'scripts/verify_pass4.ps1'))

Write-Step 'Checking required repository files'
$requiredFiles = @(
  $sitemapPath,
  $indexNowPath,
  $manifestPath,
  $activeInventoryPath
)

$missingRequired = @()
foreach ($path in $requiredFiles) {
  if (-not (Test-Path -LiteralPath $path)) {
    $missingRequired += $path
  }
}

if ($missingRequired.Count -gt 0) {
  Add-Failure -Check 'required-files' -Message 'One or more required repository files are missing.' -Details $missingRequired
} else {
  Add-Pass -Check 'required-files' -Message 'All required repository files are present.'
}

Write-Step 'Checking tracked forbidden directories'
$trackedFiles = Get-TrackedFiles
$forbiddenTracked = @()
foreach ($pattern in $trackedZonePatterns) {
  $forbiddenTracked += @($trackedFiles | Where-Object { $_ -like $pattern })
}

$forbiddenTracked = @($forbiddenTracked | Sort-Object -Unique)
if ($forbiddenTracked.Count -gt 0) {
  Add-Failure -Check 'forbidden-tracked-paths' -Message 'Forbidden tracked paths are present in the repository.' -Details $forbiddenTracked
} else {
  Add-Pass -Check 'forbidden-tracked-paths' -Message 'No forbidden tracked paths were found.'
}

Write-Step 'Scanning public tracked files for policy regressions'
$policyFindings = @()
$scannedFiles = 0
foreach ($file in $trackedFiles) {
  if (-not (Test-ScannableTextFile -Path $file)) {
    continue
  }

  $fullPath = Join-Path $repoRoot $file
  if (-not (Test-Path -LiteralPath $fullPath)) {
    continue
  }

  $content = Get-FileContentSafe -Path $fullPath
  if ($null -eq $content) {
    continue
  }

  $scannedFiles++

  if ($content -match $privatePathRegex) {
    $policyFindings += "private-path: $file"
  }

  if ($content -match $placeholderRegex) {
    $policyFindings += "placeholder-text: $file"
  }

  if ($content.Contains($encodingMarkerChar) -or $content.Contains('ï»¿')) {
    $policyFindings += "encoding-marker: $file"
  }
}

$policyFindings = @($policyFindings | Sort-Object -Unique)
if ($policyFindings.Count -gt 0) {
  Add-Failure -Check 'public-tracked-file-scans' -Message 'Public tracked files contain policy regressions.' -Details $policyFindings
} else {
  Add-Pass -Check 'public-tracked-file-scans' -Message "Scanned $scannedFiles text files with no policy regressions detected."
}

Write-Step 'Validating active inventory contents'
$activeInventory = @()
if (Test-Path -LiteralPath $activeInventoryPath) {
  $activeInventory = Get-Content -LiteralPath $activeInventoryPath | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

if ($activeInventory.Count -lt 1) {
  Add-Failure -Check 'active-inventory' -Message 'Active HTML inventory was not generated or is empty.'
} else {
  $missingActiveFiles = @()
  foreach ($relativePath in $activeInventory) {
    if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $relativePath))) {
      $missingActiveFiles += $relativePath
    }
  }

  if ($missingActiveFiles.Count -gt 0) {
    Add-Failure -Check 'active-inventory' -Message 'Active inventory references files that are missing from disk.' -Details $missingActiveFiles
  } else {
    Add-Pass -Check 'active-inventory' -Message "Active inventory generated successfully with $($activeInventory.Count) entries."
  }
}

$failureCount = @($results | Where-Object { $_.status -eq 'fail' }).Count
$summaryReport = [pscustomobject]@{
  scannedTextFiles = [int]$scannedFiles
  activeInventoryCount = [int](@($activeInventory).Count)
  failureCount = [int]$failureCount
}

$report = New-Object PSObject
$report | Add-Member -NotePropertyName generatedAt -NotePropertyValue (Get-Date).ToUniversalTime().ToString('o')
$report | Add-Member -NotePropertyName repositoryRoot -NotePropertyValue $repoRoot
$report | Add-Member -NotePropertyName summary -NotePropertyValue $summaryReport

$phase2SummaryPath = Join-Path $phase2Dir 'validation-summary.md'
$phase3JsonPath = Join-Path $phase3Dir 'policy-validation-report.json'
$phase3MarkdownPath = Join-Path $phase3Dir 'policy-validation-report.md'

$phase2Markdown = @"
# Phase 2 Validation Summary

- Repository root: $repoRoot
- Generated at: $((Get-Date).ToUniversalTime().ToString('o'))
- Active inventory entries: $(@($activeInventory).Count)
- Scanned text files: $scannedFiles
- Result: $(if ($failureCount -gt 0) { 'FAIL' } else { 'PASS' })
"@

$phase3Markdown = New-Object System.Text.StringBuilder
[void]$phase3Markdown.AppendLine('# Governance Policy Validation Report')
[void]$phase3Markdown.AppendLine('')
[void]$phase3Markdown.AppendLine("- Generated at: $($report.generatedAt)")
[void]$phase3Markdown.AppendLine("- Repository root: $repoRoot")
[void]$phase3Markdown.AppendLine("- Active inventory entries: $(@($activeInventory).Count)")
[void]$phase3Markdown.AppendLine("- Scanned text files: $scannedFiles")
[void]$phase3Markdown.AppendLine("- Failure count: $failureCount")
[void]$phase3Markdown.AppendLine('')
[void]$phase3Markdown.AppendLine('## Checks')
foreach ($check in $results) {
  [void]$phase3Markdown.AppendLine("- [$($check.status.ToUpperInvariant())] $($check.name): $($check.message)")
  foreach ($detail in @($check.details)) {
    [void]$phase3Markdown.AppendLine("  - $detail")
  }
}

$report | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $phase3JsonPath -Encoding UTF8
$phase2Markdown | Set-Content -LiteralPath $phase2SummaryPath -Encoding UTF8
$phase3Markdown.ToString() | Set-Content -LiteralPath $phase3MarkdownPath -Encoding UTF8

if ($failureCount -gt 0) {
  Write-Host "`nRepository governance validation failed with $failureCount issue(s)."
  exit 1
}

Write-Host "`nRepository governance validation passed."