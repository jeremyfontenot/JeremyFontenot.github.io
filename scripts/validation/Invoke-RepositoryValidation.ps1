param(
  [string]$RootPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$ReportPath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'internal\reports\phase2')
)

$ErrorActionPreference = 'Stop'

function Get-RepositoryFiles {
  param([string]$BasePath)
  Get-ChildItem -LiteralPath $BasePath -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\.git\\' -and $_.FullName -notmatch '\\internal\\reports\\phase2\\'
  }
}

& (Join-Path $PSScriptRoot 'generate-phase2-reports.ps1') -RootPath $RootPath -OutputPath $ReportPath | Out-Null

$broken = Import-Csv -LiteralPath (Join-Path $ReportPath 'broken-references.csv')
$orphans = Import-Csv -LiteralPath (Join-Path $ReportPath 'orphan-asset-report.csv')
$duplicates = Import-Csv -LiteralPath (Join-Path $ReportPath 'duplicate-inventory.csv')

$activeBroken = $broken | Where-Object { $_.Source -match '^(docs/|index\.html$|contact\.html$|documentation\.html$|projects\.html$|skills\.html$|README\.md$|CONTRIBUTING\.md$|SECURITY\.md$|docs-governance\.md$|archive-retention-policy\.md$)' }
$activeDuplicates = $duplicates | Where-Object { $_.Path -match '^(docs/|assets/|evidence/|css/|js/|index\.html$|contact\.html$|documentation\.html$|projects\.html$|skills\.html$)' }
$activeOrphans = $orphans | Where-Object { $_.Path -match '^(docs/|assets/|evidence/|css/|js/|index\.html$|contact\.html$|documentation\.html$|projects\.html$|skills\.html)' }

$markdownFiles = Get-RepositoryFiles -BasePath $RootPath | Where-Object { @('.md', '.markdown') -contains $_.Extension.ToLowerInvariant() -and $_.FullName -notmatch '\\internal\\reports\\phase2\\' }
$markdownIssues = New-Object System.Collections.Generic.List[string]
foreach ($file in $markdownFiles) {
  $lines = Get-Content -LiteralPath $file.FullName
  $fenceCount = 0
  for ($index = 0; $index -lt $lines.Count; $index++) {
    $line = $lines[$index]
    if ($line -match '\s+$') { $markdownIssues.Add(($file.FullName + ': trailing whitespace on line ' + ($index + 1))) }
    if ($line -match '\t') { $markdownIssues.Add(($file.FullName + ': tab character on line ' + ($index + 1))) }
    if ($line.TrimStart().StartsWith('```')) { $fenceCount++ }
  }
  if (($fenceCount % 2) -ne 0) {
    $markdownIssues.Add(($file.FullName + ': unbalanced fenced code blocks'))
  }
}

$filenameIssues = New-Object System.Collections.Generic.List[string]
foreach ($file in Get-RepositoryFiles -BasePath $RootPath) {
  $rel = [System.IO.Path]::GetRelativePath($RootPath, $file.FullName) -replace '\\', '/'
  if ($rel -match '^(internal/reports/phase2/)') { continue }
  if ($rel -match '^(?:_content/|archive/|public/|internal/validation-docs/)') { continue }
  if ($file.Name -cmatch '[A-Z]' -or $file.Name -match '[ _]') {
    $filenameIssues.Add($rel)
  }
}

$summary = @(
  '# Repository Validation Summary',
  '',
  ('- Broken references in active docs: ' + $activeBroken.Count),
  ('- Duplicate files in active zones: ' + $activeDuplicates.Count),
  ('- Orphan candidates in active zones: ' + $activeOrphans.Count),
  ('- Markdown issues: ' + $markdownIssues.Count),
  ('- Filename compliance issues: ' + $filenameIssues.Count)
)
$summary | Set-Content -Encoding UTF8 -Path (Join-Path $ReportPath 'validation-summary.md')

if ($activeBroken.Count -gt 0) {
  Write-Warning 'Broken references were detected in active documentation. Review internal/reports/phase2/broken-references.csv.'
}
if ($markdownIssues.Count -gt 0) {
  Write-Warning 'Markdown lint issues were detected. Review internal/reports/phase2/validation-summary.md and the generated reports.'
}
if ($filenameIssues.Count -gt 0) {
  Write-Warning 'Filename compliance issues were detected in active zones. Review the naming remediation scripts before renaming any files.'
}

Write-Host ('Validation completed. Reports are available at ' + $ReportPath)
