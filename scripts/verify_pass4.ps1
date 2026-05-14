<#
Pass 4 verification wrapper.
Re-runs the existing ahrefs verification scanner, writes ahrefs_verify_pass4.json,
and compares the new broken-link count against ahrefs_verification_report.json.
Read-only with respect to site content; safe for CI.
#>
param(
    [switch]$CheckExternal
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
$previousReportPath = Join-Path $repoRoot 'ahrefs_verification_report.json'
$currentReportPath = Join-Path $repoRoot 'ahrefs_verify_pass4.json'
$scannerPath = Join-Path $scriptDir 'ahrefs_verification.py'

function Get-IntValue {
    param(
        $Value,
        [int]$Fallback = 0
    )

    if ($null -eq $Value) { return $Fallback }
    try { return [int]$Value } catch { return $Fallback }
}

function Get-PreviousBrokenCount {
    param([string]$Path)

    if (-not (Test-Path $Path)) { return $null }

    try {
        $previous = Get-Content -Raw -Encoding UTF8 $Path | ConvertFrom-Json
        if ($previous.summary -and $previous.summary.broken_links -ne $null) {
            return Get-IntValue $previous.summary.broken_links
        }
        if ($previous.report -and $previous.report.broken_links) {
            return @($previous.report.broken_links).Count
        }
    } catch {
        return $null
    }

    return $null
}

function Get-CurrentSummaryCount {
    param(
        $Report,
        [string[]]$PrimaryKeys,
        [string[]]$FallbackKeys = @()
    )

    foreach ($key in $PrimaryKeys) {
        if ($Report.summary -and $Report.summary.PSObject.Properties.Name -contains $key) {
            return Get-IntValue $Report.summary.$key
        }
    }

    foreach ($key in $FallbackKeys) {
        if ($Report.$key) {
            return @($Report.$key).Count
        }
    }

    return 0
}

function Invoke-ExistingScanner {
    param(
        [string]$PythonCommand = 'python'
    )

    if (-not (Test-Path $scannerPath)) {
        throw "Scanner not found: $scannerPath"
    }

    $scannerText = Get-Content -Raw -Encoding UTF8 $scannerPath
    $scannerText = $scannerText.Replace("out = 'ahrefs_verification_report.json'", "out = 'ahrefs_verify_pass4.json'")

    & $PythonCommand -c $scannerText
    if ($LASTEXITCODE -ne 0) {
        throw "Existing verification scanner failed with exit code $LASTEXITCODE"
    }
}

function Get-ExternalFailureCount {
    param([string]$RootPath)

    $htmlFiles = Get-ChildItem -Path $RootPath -Recurse -Include *.html -File | Where-Object {
        -not ($_.FullName -like '*.bak') -and -not ($_.FullName -like '*sitemap.xml') -and -not ($_.FullName -like '*indexnow_payload.json')
    }

    $hrefRegex = [regex]'href=["'']([^"'']+)["'']'
    $failures = 0

    foreach ($file in $htmlFiles) {
        $content = Get-Content -Raw -Encoding UTF8 $file.FullName
        foreach ($match in $hrefRegex.Matches($content)) {
            $href = $match.Groups[1].Value
            if ($href -notmatch '^(http|https)://') {
                continue
            }

            try {
                Invoke-WebRequest -Uri $href -Method Head -TimeoutSec 10 -ErrorAction Stop | Out-Null
            } catch {
                $failures++
            }
        }
    }

    return $failures
}

$previousBrokenLinks = Get-PreviousBrokenCount -Path $previousReportPath
if ($null -eq $previousBrokenLinks) {
    $previousBrokenLinks = 91
}

Push-Location $repoRoot
try {
    $pythonCommand = if (Get-Command python -ErrorAction SilentlyContinue) { 'python' } elseif (Get-Command py -ErrorAction SilentlyContinue) { 'py' } else { throw 'Python runtime not found. Install python or py to run verification.' }

    Write-Host "Scanning site directory: $repoRoot"
    Write-Host 'Phase: running authoritative verification scanner'
    Invoke-ExistingScanner -PythonCommand $pythonCommand

    if (-not (Test-Path $currentReportPath)) {
        throw "Expected report was not created: $currentReportPath"
    }

    $current = Get-Content -Raw -Encoding UTF8 $currentReportPath | ConvertFrom-Json
    $sourceReport = $null
    if ($current.report -and $current.report.report) {
        $sourceReport = $current.report.report
    }

    $summary = [ordered]@{
        total_broken_internal_links = Get-CurrentSummaryCount -Report $current -PrimaryKeys @('broken_links') -FallbackKeys @('broken_internal_links')
        total_external_failed_links = if ($CheckExternal) { Get-ExternalFailureCount -RootPath $repoRoot } else { 0 }
        total_orphan_pages = Get-CurrentSummaryCount -Report $current -PrimaryKeys @('orphan_pages')
        sitemap_missing_urls = if ($sourceReport -and $sourceReport.sitemap_mismatches) { @($sourceReport.sitemap_mismatches.missing_from_sitemap).Count } else { 0 }
        indexnow_missing_urls = if ($sourceReport -and $sourceReport.indexnow_mismatches) { @($sourceReport.indexnow_mismatches.missing_from_indexnow).Count } else { 0 }
        thin_content_pages = Get-CurrentSummaryCount -Report $current -PrimaryKeys @('thin_content_pages')
        weak_meta_descriptions = Get-CurrentSummaryCount -Report $current -PrimaryKeys @('weak_meta_descriptions')
    }

    $currentBrokenLinks = [int]$summary.total_broken_internal_links
    $delta = $currentBrokenLinks - $previousBrokenLinks
    $comparisonStatus = if ($delta -gt 0) { 'increased' } elseif ($delta -lt 0) { 'decreased' } else { 'no change' }

    $validation = [ordered]@{
        sitemap = if ($summary.sitemap_missing_urls -eq 0) { 'passed' } else { 'needs attention' }
        indexnow = if ($summary.indexnow_missing_urls -le 1) { 'passed' } else { 'needs attention' }
        orphans = if ($summary.total_orphan_pages -gt 0) { 'review' } else { 'passed' }
        broken_links = $comparisonStatus
    }

    $comparison = [ordered]@{
        previous_broken_internal_links = $previousBrokenLinks
        current_broken_internal_links = $currentBrokenLinks
        delta_broken_internal_links = $delta
        change = $comparisonStatus
    }

    $out = [ordered]@{
        generated_at = (Get-Date).ToString('o')
        source_report = 'ahrefs_verification_report.json'
        summary = $summary
        comparison = $comparison
        validation = $validation
        report = $current
    }

    $out | ConvertTo-Json -Depth 12 | Set-Content -Path $currentReportPath -Encoding UTF8

    Write-Host "Sitemap validation status: $($validation.sitemap) ($($summary.sitemap_missing_urls) missing)"
    Write-Host "IndexNow validation status: $($validation.indexnow) ($($summary.indexnow_missing_urls) missing)"
    Write-Host "Orphan page count: $([int]$summary.total_orphan_pages)"
    Write-Host "Broken link delta vs previous run: $comparisonStatus (baseline $previousBrokenLinks, current $currentBrokenLinks, delta $delta)"
    Write-Host "Wrote ahrefs_verify_pass4.json"
    Write-Host 'Done.'
}
finally {
    Pop-Location
}