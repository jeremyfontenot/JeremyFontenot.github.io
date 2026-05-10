param(
	[string]$RootPath = (Split-Path -Parent $PSScriptRoot),
	[string]$OutputPath = (Join-Path $PSScriptRoot 'report.md')
)

$fileCount = (Get-ChildItem -Path $RootPath -File -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
$folderCount = (Get-ChildItem -Path $RootPath -Directory -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count

$report = @"
# Automation Report

Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Root Path: $RootPath
Files: $fileCount
Folders: $folderCount
"@

Set-Content -Path $OutputPath -Value $report -Encoding UTF8
Write-Output "Report written to $OutputPath"
