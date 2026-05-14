<#
Non-destructive internal link repair workflow.
Reads ahrefs_verify_pass4.json, repairs only high-confidence internal link issues,
writes link_repair_report.json and unresolved_links.json, and re-runs verification.
#>
param(
    [switch]$SkipVerification
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
$verificationReportPath = Join-Path $repoRoot 'ahrefs_verify_pass4.json'
$repairReportPath = Join-Path $repoRoot 'link_repair_report.json'
$unresolvedReportPath = Join-Path $repoRoot 'unresolved_links.json'
$verifyScriptPath = Join-Path $scriptDir 'verify_pass4.ps1'

function Get-RepoRelativePath {
    param([string]$FullPath)

    $relative = $FullPath.Substring($repoRoot.Path.Length).TrimStart('\','/') -replace '\\','/'
    return $relative
}

function Read-JsonFile {
    param([string]$Path)

    return Get-Content -Raw -Encoding UTF8 $Path | ConvertFrom-Json
}

function Write-BackupIfNeeded {
    param([string]$FilePath)

    $backupPath = "$FilePath.bak"
    if (-not (Test-Path $backupPath)) {
        Copy-Item -Path $FilePath -Destination $backupPath
    }
}

function Get-ReportBrokenLinks {
    param($Report)

    if ($null -eq $Report) { return @() }
    if ($Report.report -and $Report.report.report -and $Report.report.report.broken_links) {
        return @($Report.report.report.broken_links)
    }
    if ($Report.report -and $Report.report.broken_links) {
        return @($Report.report.broken_links)
    }
    if ($Report.broken_links) {
        return @($Report.broken_links)
    }
    return @()
}

function Get-CanonicalHrefForTarget {
    param([string]$TargetRel)

    $targetFull = Join-Path $repoRoot $TargetRel
    if (-not (Test-Path $targetFull)) {
        return $null
    }

    if ($TargetRel -notmatch '\.html?$') {
        return '/' + ($TargetRel -replace '\\','/')
    }

    $content = Get-Content -Raw -Encoding UTF8 $targetFull
    $canonicalMatch = [regex]::Match($content, '<link[^>]*rel=["'']canonical["''][^>]*href=["'']([^"'']+)["'']', 'IgnoreCase')
    if ($canonicalMatch.Success) {
        return $canonicalMatch.Groups[1].Value.Trim()
    }

    if ($TargetRel -match '(^|/)index\.html$') {
        $dir = Split-Path -Parent $TargetRel
        if ([string]::IsNullOrWhiteSpace($dir)) {
            return '/'
        }
        return '/' + ($dir -replace '\\','/') + '/'
    }

    return '/' + ($TargetRel -replace '\\','/')
}

function Get-AnchorCandidates {
    param(
        [string]$TargetRel,
        [string]$Fragment
    )

    $targetFull = Join-Path $repoRoot $TargetRel
    if (-not (Test-Path $targetFull)) {
        return @()
    }

    $content = Get-Content -Raw -Encoding UTF8 $targetFull
    $anchors = New-Object System.Collections.Generic.HashSet[string]

    foreach ($match in [regex]::Matches($content, '(?:id|name)=["'']([^"'']+)["'']', 'IgnoreCase')) {
        [void]$anchors.Add($match.Groups[1].Value)
    }

    foreach ($match in [regex]::Matches($content, '<h([1-6])[^>]*>(.*?)</h\1>', 'IgnoreCase,Singleline')) {
        $heading = [regex]::Replace($match.Groups[2].Value, '<[^>]+>', ' ')
        $heading = [System.Net.WebUtility]::HtmlDecode($heading)
        $slug = ($heading.Trim().ToLowerInvariant() -replace '[^a-z0-9\s_-]', '' -replace '[\s_]+', '-').Trim('-')
        if ($slug) {
            [void]$anchors.Add($slug)
        }
    }

    $normalized = $Fragment.TrimStart('#')
    $variants = New-Object System.Collections.Generic.List[string]
    $variants.Add($normalized)
    $variants.Add($normalized.ToLowerInvariant())
    $variants.Add(($normalized -replace '_', '-'))
    $variants.Add(($normalized -replace '-', '_'))
    $variants.Add(($normalized.ToLowerInvariant() -replace '_', '-'))
    $variants.Add(($normalized.ToLowerInvariant() -replace '-', '_'))

    $matches = @()
    foreach ($variant in ($variants | Select-Object -Unique)) {
        if ($anchors.Contains($variant)) {
            $matches += $variant
        }
    }

    return @($matches | Select-Object -Unique)
}

function Resolve-LinkTarget {
    param(
        [string]$SourceRel,
        [string]$Href
    )

    if ([string]::IsNullOrWhiteSpace($Href)) {
        return $null
    }

    if ($Href -match '^(mailto:|tel:|javascript:|data:|\{\{|\$\{)' -or $Href -eq '#' -or $Href.StartsWith('#') -or $Href -match '^\s*$' -or $Href -match '\?') {
        return $null
    }

    $fragment = $null
    $path = $Href
    if ($Href.Contains('#')) {
        $parts = $Href.Split('#', 2)
        $path = $parts[0]
        $fragment = $parts[1]
    }

    $path = $path.Trim()
    if ([string]::IsNullOrWhiteSpace($path)) {
        return [ordered]@{ kind = 'anchor-only'; fragment = $fragment }
    }

    $sourceDir = Split-Path -Parent $SourceRel
    if ([string]::IsNullOrWhiteSpace($sourceDir)) {
        $sourceDir = '.'
    }
    $basePath = if ($path.StartsWith('/')) {
        $path.TrimStart('/')
    } else {
        $joined = Join-Path $sourceDir $path
        [System.IO.Path]::GetFullPath($joined).Substring($repoRoot.Path.Length).TrimStart('\','/') -replace '\\','/'
    }

    $candidatePaths = New-Object System.Collections.Generic.List[string]
    $candidatePaths.Add($basePath)

    if ($basePath -notmatch '\.[A-Za-z0-9]+$') {
        $candidatePaths.Add($basePath + '.html')
        $candidatePaths.Add(($basePath.TrimEnd('/') + '/index.html'))
    }

    if ($basePath -match '(^|/)index\.html$') {
        $candidatePaths.Add(($basePath -replace '/index\.html$', '/'))
    }

    $candidatePaths = @($candidatePaths | Select-Object -Unique)
    $existing = @()
    foreach ($candidate in $candidatePaths) {
        $candidateNormalized = $candidate.TrimStart('/')
        $candidateFull = Join-Path $repoRoot $candidateNormalized
        if (Test-Path $candidateFull) {
            $existing += $candidateNormalized
        }
    }

    $existing = @($existing | Select-Object -Unique)

    return [ordered]@{
        kind = 'internal'
        path = $path
        fragment = $fragment
        candidates = $candidatePaths
        existing = $existing
    }
}

function Format-RelativeReplacement {
    param(
        [string]$SourceRel,
        [string]$ReplacementUrl
    )

    if ($ReplacementUrl.StartsWith('/')) {
        return $ReplacementUrl
    }

    $sourceDir = Split-Path -Parent $SourceRel
    if ([string]::IsNullOrWhiteSpace($sourceDir)) {
        $sourceDir = '.'
    }
    $replacement = [System.IO.Path]::GetRelativePath($sourceDir, $ReplacementUrl) -replace '\\','/'
    if ($replacement -notmatch '^(\.\.|\.|/)') {
        $replacement = './' + $replacement
    }
    return $replacement
}

function Replace-HrefValue {
    param(
        [string]$Html,
        [string]$OldHref,
        [string]$NewHref
    )

    $pattern = '(href=["''])' + [regex]::Escape($OldHref) + '(["''])'
    return [regex]::Replace($Html, $pattern, {
        param($match)
        return $match.Groups[1].Value + $NewHref + $match.Groups[2].Value
    }, 1)
}

if (-not (Test-Path $verificationReportPath)) {
    throw "Missing verification report: $verificationReportPath"
}

$verificationReport = Read-JsonFile -Path $verificationReportPath
$brokenLinks = Get-ReportBrokenLinks -Report $verificationReport

$siteFiles = Get-ChildItem -Path $repoRoot -Recurse -File | Where-Object {
    -not ($_.FullName -like '*.bak') -and
    $_.FullName -notmatch '[\\/](internal|memories|\.git|scripts)[\\/]' -and
    $_.Name -notin @('link_repair_report.json', 'unresolved_links.json')
}

$modifiedFiles = New-Object System.Collections.Generic.HashSet[string]
$repairedLinks = New-Object System.Collections.Generic.List[object]
$unresolvedLinks = New-Object System.Collections.Generic.List[object]
$skippedExactMatches = New-Object System.Collections.Generic.List[object]
$skippedAmbiguous = 0

foreach ($item in $brokenLinks) {
    $sourceRel = $item.file
    $href = $item.href
    if ([string]::IsNullOrWhiteSpace($sourceRel) -or [string]::IsNullOrWhiteSpace($href)) {
        continue
    }

    $sourceFull = Join-Path $repoRoot $sourceRel
    if (-not (Test-Path $sourceFull)) {
        $unresolvedLinks.Add([ordered]@{
            source_file = $sourceRel
            original_url = $href
            issue_type = 'source_missing'
            repair_type = 'none'
            replacement_url = $null
            confidence = 'low'
            reason = 'source file no longer exists'
        })
        continue
    }

    $html = Get-Content -Raw -Encoding UTF8 $sourceFull
    if ($html -notmatch [regex]::Escape($href)) {
        $unresolvedLinks.Add([ordered]@{
            source_file = $sourceRel
            original_url = $href
            issue_type = 'stale_report'
            repair_type = 'none'
            replacement_url = $null
            confidence = 'low'
            reason = 'href no longer appears in the current source file'
        })
        continue
    }

    $resolved = Resolve-LinkTarget -SourceRel $sourceRel -Href $href
    if ($null -eq $resolved) {
        continue
    }

    if ($resolved.kind -eq 'anchor-only') {
        $unresolvedLinks.Add([ordered]@{
            source_file = $sourceRel
            original_url = $href
            issue_type = 'anchor_only'
            repair_type = 'none'
            replacement_url = $null
            confidence = 'low'
            reason = 'anchor-only link is intentionally ignored'
        })
        continue
    }

    $candidateExisting = @($resolved.existing)
    $fragment = $resolved.fragment
    $path = $resolved.path

    if ($candidateExisting.Count -eq 1 -and [string]::IsNullOrWhiteSpace($fragment)) {
        $targetRel = $candidateExisting[0]
        $canonicalHref = Get-CanonicalHrefForTarget -TargetRel $targetRel
        if ([string]::IsNullOrWhiteSpace($canonicalHref)) {
            $canonicalHref = '/' + $targetRel
        }

        if ($canonicalHref -eq $href) {
            $skippedExactMatches.Add([ordered]@{
                source_file = $sourceRel
                original_url = $href
                issue_type = 'exact_target_exists'
                repair_type = 'none'
                replacement_url = $canonicalHref
                confidence = 'high'
                reason = 'target already exists and matches canonical style'
            })
            continue
        }

        $newHtml = Replace-HrefValue -Html $html -OldHref $href -NewHref $canonicalHref
        if ($newHtml -ne $html) {
            Write-BackupIfNeeded -FilePath $sourceFull
            Set-Content -Path $sourceFull -Value $newHtml -Encoding UTF8
            $modifiedFiles.Add($sourceRel) | Out-Null
            $repairedLinks.Add([ordered]@{
                source_file = $sourceRel
                original_url = $href
                issue_type = 'missing_target'
                repair_type = 'single_match_rewrite'
                replacement_url = $canonicalHref
                confidence = 'high'
            })
        } else {
            $unresolvedLinks.Add([ordered]@{
                source_file = $sourceRel
                original_url = $href
                issue_type = 'missing_target'
                repair_type = 'single_match_rewrite'
                replacement_url = $canonicalHref
                confidence = 'medium'
                reason = 'resolved target existed, but no exact href occurrence was rewritten'
            })
        }
        continue
    }

    if ($candidateExisting.Count -eq 1 -and -not [string]::IsNullOrWhiteSpace($fragment)) {
        $targetRel = $candidateExisting[0]
        $anchorCandidates = @(Get-AnchorCandidates -TargetRel $targetRel -Fragment $fragment)
        if ($anchorCandidates.Count -eq 1) {
            $normalizedFragment = $anchorCandidates[0]
            $replacementPath = Get-CanonicalHrefForTarget -TargetRel $targetRel
            if ([string]::IsNullOrWhiteSpace($replacementPath)) {
                $replacementPath = '/' + $targetRel
            }
            $replacementHref = $replacementPath.TrimEnd('/') + '#' + $normalizedFragment
            $newHtml = Replace-HrefValue -Html $html -OldHref $href -NewHref $replacementHref
            if ($newHtml -ne $html) {
                Write-BackupIfNeeded -FilePath $sourceFull
                Set-Content -Path $sourceFull -Value $newHtml -Encoding UTF8
                $modifiedFiles.Add($sourceRel) | Out-Null
                $repairedLinks.Add([ordered]@{
                    source_file = $sourceRel
                    original_url = $href
                    issue_type = 'anchor_mismatch'
                    repair_type = 'verified_anchor_normalization'
                    replacement_url = $replacementHref
                    confidence = 'medium'
                })
            } else {
                $unresolvedLinks.Add([ordered]@{
                    source_file = $sourceRel
                    original_url = $href
                    issue_type = 'anchor_mismatch'
                    repair_type = 'verified_anchor_normalization'
                    replacement_url = $replacementHref
                    confidence = 'medium'
                    reason = 'anchor candidate resolved, but no exact href occurrence was rewritten'
                })
            }
        } elseif ($anchorCandidates.Count -eq 0) {
            $replacementPath = Get-CanonicalHrefForTarget -TargetRel $targetRel
            if ([string]::IsNullOrWhiteSpace($replacementPath)) {
                $replacementPath = '/' + $targetRel
            }
            $newHtml = Replace-HrefValue -Html $html -OldHref $href -NewHref $replacementPath
            if ($newHtml -ne $html) {
                Write-BackupIfNeeded -FilePath $sourceFull
                Set-Content -Path $sourceFull -Value $newHtml -Encoding UTF8
                $modifiedFiles.Add($sourceRel) | Out-Null
                $repairedLinks.Add([ordered]@{
                    source_file = $sourceRel
                    original_url = $href
                    issue_type = 'missing_anchor'
                    repair_type = 'anchor_removed_after_no_match'
                    replacement_url = $replacementPath
                    confidence = 'medium'
                })
            } else {
                $unresolvedLinks.Add([ordered]@{
                    source_file = $sourceRel
                    original_url = $href
                    issue_type = 'missing_anchor'
                    repair_type = 'anchor_removed_after_no_match'
                    replacement_url = $replacementPath
                    confidence = 'medium'
                    reason = 'anchor removal was permitted, but no href occurrence was rewritten'
                })
            }
        } else {
            $skippedAmbiguous++
            $unresolvedLinks.Add([ordered]@{
                source_file = $sourceRel
                original_url = $href
                issue_type = 'ambiguous_anchor'
                repair_type = 'none'
                replacement_url = $null
                confidence = 'low'
                reason = 'multiple anchor candidates found; not modified'
                candidates = $anchorCandidates
            })
        }
        continue
    }

    if ($candidateExisting.Count -gt 1) {
        $skippedAmbiguous++
        $unresolvedLinks.Add([ordered]@{
            source_file = $sourceRel
            original_url = $href
            issue_type = 'ambiguous_route'
            repair_type = 'none'
            replacement_url = $null
            confidence = 'low'
            reason = 'multiple target candidates exist; not modified'
            candidates = $candidateExisting
        })
        continue
    }

    $unresolvedLinks.Add([ordered]@{
        source_file = $sourceRel
        original_url = $href
        issue_type = 'missing_target'
        repair_type = 'none'
        replacement_url = $null
        confidence = 'low'
        reason = 'no high-confidence target candidate found'
        candidates = @($resolved.candidates)
    })
}

$preRepairCount = Get-ReportBrokenLinks -Report $verificationReport | Measure-Object | Select-Object -ExpandProperty Count

$postRepairDelta = $null
$postRepairCount = $preRepairCount
if (-not $SkipVerification) {
    if (-not (Test-Path $verifyScriptPath)) {
        throw "Missing verification script: $verifyScriptPath"
    }

    & pwsh $verifyScriptPath
    if ($LASTEXITCODE -ne 0) {
        throw "Verification rerun failed with exit code $LASTEXITCODE"
    }

    $updatedVerification = Read-JsonFile -Path $verificationReportPath
    $postRepairCount = (Get-ReportBrokenLinks -Report $updatedVerification | Measure-Object | Select-Object -ExpandProperty Count)
    $postRepairDelta = $postRepairCount - $preRepairCount
}

$repairSummary = [ordered]@{
    repaired_links = $repairedLinks.Count
    unresolved_links = $unresolvedLinks.Count
    skipped_ambiguous_links = $skippedAmbiguous
    skipped_exact_matches = $skippedExactMatches.Count
    verification_pre_repair_broken_links = $preRepairCount
    verification_post_repair_broken_links = $postRepairCount
    verification_delta_after_repairs = $postRepairDelta
    modified_files = @($modifiedFiles | ForEach-Object { $_ })
}

$repairReport = [ordered]@{
    generated_at = (Get-Date).ToString('o')
    source_report = 'ahrefs_verify_pass4.json'
    summary = $repairSummary
    repaired_links = @($repairedLinks.ToArray())
    skipped_exact_matches = @($skippedExactMatches.ToArray())
}

$repairReport | ConvertTo-Json -Depth 12 | Set-Content -Path $repairReportPath -Encoding UTF8
$(@($unresolvedLinks.ToArray())) | ConvertTo-Json -Depth 12 | Set-Content -Path $unresolvedReportPath -Encoding UTF8

Write-Host "Repaired links count: $($repairedLinks.Count)"
Write-Host "Unresolved links count: $($unresolvedLinks.Count)"
Write-Host "Skipped ambiguous links: $skippedAmbiguous"
Write-Host "Verification delta after repairs: $postRepairDelta"
Write-Host "Wrote link_repair_report.json"
Write-Host "Wrote unresolved_links.json"