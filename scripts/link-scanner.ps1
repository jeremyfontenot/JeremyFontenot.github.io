param(
    [switch]$IncludeContentExport,
    [switch]$Debug
)

# Strict URL regex per spec
$urlRegex = [regex]'https?:\/\/[a-zA-Z0-9\-._~%]+(\.[a-zA-Z0-9\-._~%]+)+(\/[\w\-._~%+?=&:#@]*)?'

# Blacklist substrings (metadata / PKI / c2pa noise)
# Blacklist substrings (metadata / PKI / c2pa noise)
$ignorePatterns = @(
    'cv.iptc.org',
    'c2pa-ocsp.pki.goog',
    'pki.goog',
    'pushfp.svc.ms',
    'analytics.ahrefs.com'
)

# Legacy export patterns (classify as legacy_export)
$legacyPatterns = @(
    'sharepoint.com',
    'microsoft.com/pkiops',
    '/_layouts/',
    'getpreview.ashx'
)

# File extensions to scan
$scanExt = @('*.html','*.htm','*.js','*.ts','*.css','*.md')

# Internal site hosts (classify as internal_site)
$internalHosts = @('jeremyfontenot.github.io','localhost')

$root = (Get-Location).ProviderPath

# Directories to scan (root-level + common site folders)
$scanDirs = @(
    $root,
    (Join-Path $root 'docs'),
    (Join-Path $root 'assets'),
    (Join-Path $root 'scripts'),
    (Join-Path $root 'css'),
    (Join-Path $root 'js')
)
if ($IncludeContentExport) { $scanDirs += (Join-Path $root '_content') }

Write-Output "Link scanner starting (IncludeContentExport=$IncludeContentExport)"

# Collect files (directory-aware)
$items = @()
foreach ($dir in $scanDirs) {
    if (-not (Test-Path -LiteralPath $dir)) { continue }
    foreach ($ext in $scanExt) {
        $found = Get-ChildItem -Path $dir -Recurse -File -Include $ext -ErrorAction SilentlyContinue
        if (-not $IncludeContentExport) {
            $found = $found | Where-Object { $_.FullName -notmatch '\\_content\\' }
        }
        $items += $found
    }
}

$items = $items | Sort-Object -Unique

Write-Output "Scanning $($items.Count) files..."

$results = @()

foreach ($f in $items) {
    try {
        $text = Get-Content -Raw -ErrorAction Stop -LiteralPath $f.FullName
    } catch {
        if ($Debug) { Write-Warning "Skipping $($f.FullName): $($_.Exception.Message)" }
        continue
    }

    if ([string]::IsNullOrWhiteSpace($text)) {
        if ($Debug) { Write-Warning "Empty content: $($f.FullName)" }
        continue
    }
    $matches = $urlRegex.Matches($text)
    foreach ($m in $matches) {
        $pattern = '[\)\.,>"''\s]+$'
        $url = [regex]::Replace($m.Value, $pattern,'')
        # Remove control/non-printable characters that can appear in binary/metadata blobs
        $url = [regex]::Replace($url, '[\x00-\x1F\x7F]+','')
        # Trim leftover punctuation/brackets (two passes: remove common punctuation, then stray single-quotes)
        $trimPattern1 = '[\)\]\(\,>"]+$'
        $url = [regex]::Replace($url, $trimPattern1,'')
        $url = [regex]::Replace($url, "'+$",'')
        $sourceIsContent = ($f.FullName -match '\\_content\\')
        # Skip/classify if contains blacklisted substrings
        $isIgnored = $false
        foreach ($pat in $ignorePatterns) {
            if ($url -like "*${pat}*") { $isIgnored = $true; break }
        }

        $isLegacyUrl = $false
        foreach ($lp in $legacyPatterns) {
            if ($url -like "*${lp}*") { $isLegacyUrl = $true; break }
        }

        $entry = [PSCustomObject]@{
            url = $url
            type = 'pending'
            sourceFile = $f.FullName
            status = 'pending'
            httpStatus = $null
        }

        if ($isIgnored) {
            $entry.type = 'ignored_metadata'
            $entry.status = 'ignored'
        } else {
            # Validate URI structure
            try {
                $u = [uri]$url
                $urlHost = $u.Host.ToLower()
                if ($internalHosts -contains $urlHost -or $urlHost -like '*.github.io') {
                    $entry.type = 'internal_site'
                    $entry.status = 'ignored'
                } elseif ($isLegacyUrl) {
                    $entry.type = 'legacy_export'
                    $entry.status = 'legacy'
                } elseif ($sourceIsContent) {
                    # low-trust source: mark as legacy_export if not already classified
                    $entry.type = 'legacy_export'
                    $entry.status = 'legacy'
                } else {
                    $entry.type = 'external_public'
                    $entry.status = 'pending'
                }
            } catch {
                $entry.type = 'invalid_malformed'
                $entry.status = 'invalid'
            }
        }

        $results += $entry
    }
}

# Deduplicate by URL+sourceFile
$results = $results | Sort-Object url,sourceFile -Unique

# Validation: only external_public
# Use HttpClient with auto-redirects, 10s timeout, retry once
$handler = New-Object System.Net.Http.HttpClientHandler
$handler.AllowAutoRedirect = $true
$client = New-Object System.Net.Http.HttpClient($handler)
$client.Timeout = [TimeSpan]::FromSeconds(10)

foreach ($r in $results | Where-Object { $_.type -eq 'external_public' }) {
    $attempt = 0
    $maxAttempts = 2
    $validated = $false
    while ($attempt -lt $maxAttempts -and -not $validated) {
        $attempt++
        try {
            $req = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Head, $r.url)
            $resp = $client.SendAsync($req).GetAwaiter().GetResult()
            $r.httpStatus = [int]$resp.StatusCode
            if ($r.httpStatus -ge 200 -and $r.httpStatus -lt 400) { $r.status = 'valid' } else { $r.status = 'broken' }
            $validated = $true
        } catch {
            # fallback to GET
            try {
                $req2 = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Get, $r.url)
                $resp2 = $client.SendAsync($req2).GetAwaiter().GetResult()
                $r.httpStatus = [int]$resp2.StatusCode
                if ($r.httpStatus -ge 200 -and $r.httpStatus -lt 400) { $r.status = 'valid' } else { $r.status = 'broken' }
                $validated = $true
            } catch {
                if ($attempt -ge $maxAttempts) {
                    $r.status = 'error'
                    $r.httpStatus = "ERROR: $($_.Exception.Message)"
                } else {
                    Start-Sleep -Milliseconds 250
                }
            }
        }
    }
}

# Generate report
$outJson = Join-Path $root 'link-scan-report.json'
$results | ConvertTo-Json -Depth 6 | Out-File -FilePath $outJson -Encoding utf8

# Summary counts
$total = $results.Count
$externalCount = ($results | Where-Object { $_.type -eq 'external_public' }).Count
$brokenExternal = ($results | Where-Object { $_.type -eq 'external_public' -and ($_.status -eq 'broken' -or $_.status -eq 'error') }).Count
$legacyCount = ($results | Where-Object { $_.type -eq 'legacy_export' }).Count
$ignoredMetadata = ($results | Where-Object { $_.type -eq 'ignored_metadata' }).Count

$md = @()
$md += "# Link Scan Summary"
$md += "Scanned: $(Get-Date -Format o)"
$md += ""
$md += "- total URLs discovered: $total"
$md += "- external_public links: $externalCount"
$md += "- broken/unreachable external links: $brokenExternal"
$md += "- legacy_export links: $legacyCount"
$md += "- ignored_metadata links: $ignoredMetadata"
$md += ""
$md += "Report: link-scan-report.json"

$mdPath = Join-Path $root 'LINK_SCAN_SUMMARY.md'
$md | Out-File -FilePath $mdPath -Encoding utf8

Write-Output "Scan complete. Results: $outJson and $mdPath"

if ($Debug) { Write-Output "Detailed results written. Debug mode ON." }
