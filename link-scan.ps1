<#
    link-scan.ps1
    ----------------
    Scans the repository for broken internal links in HTML/MD files.
    - Auto-fixes ONLY unambiguous local matches
    - Creates .bak backups for modified files
    - Never rewrites public URLs (/assets, /css, /js, /docs)
    - Outputs a JSON report to internal/reports/link-scan-report.json
#>

Write-Host "Starting link scan..." -ForegroundColor Cyan

$repo = (Get-Location).Path
$report = New-Object System.Collections.Generic.List[object]

# File types to scan
$htmlFiles = Get-ChildItem -Recurse -File -Include *.html, *.htm, *.md, *.markdown -ErrorAction SilentlyContinue

foreach ($f in $htmlFiles) {

    $text = Get-Content -Raw -LiteralPath $f.FullName -ErrorAction SilentlyContinue
    if (-not $text) { continue }

    $orig = $text
    $changed = $false

    # Find href/src links
    $matches = [regex]::Matches($text, '(?:href|src)\s*=\s*"([^"]+)"')

    foreach ($m in $matches) {

        $url = $m.Groups[1].Value

        # Skip absolute URLs, mailto, tel, anchors, protocol-relative
        if ($url -match '^(https?:|mailto:|tel:|//|#)') { continue }

        # Skip public URL roots
        if ($url -match '^/(assets|css|js|docs)/') { continue }

        # Normalize URL (strip query/hash)
        $urlNoQS = $url -replace '\?.*$', '' -replace '#.*$', ''

        # Resolve target path
        if ($urlNoQS.StartsWith('/')) {
            $target = Join-Path $repo ($urlNoQS.TrimStart('/') -replace '/', '\')
        }
        else {
            $target = Join-Path $f.DirectoryName ($urlNoQS -replace '/', '\')
        }

        # If file exists, skip
        if (Test-Path -LiteralPath $target) { continue }

        # Try to find a unique match by filename
        $leaf = Split-Path -Leaf $urlNoQS
        $candidates = Get-ChildItem -Recurse -File -Filter $leaf -ErrorAction SilentlyContinue |
                      Where-Object { $_.FullName -notmatch '\\\.git\\' }

        if ($candidates.Count -eq 1) {
            # Auto-fix
            $found = $candidates[0].FullName
            $rel = $found.Substring($repo.Length).TrimStart('\') -replace '\\', '/'
            $newUrl = '/' + $rel

            $text = $text.Replace($url, $newUrl)
            $changed = $true

            $report.Add([pscustomobject]@{
                File        = $f.FullName
                OriginalUrl = $url
                NewUrl      = $newUrl
                FoundPath   = $found
                Status      = 'AUTO-FIXED'
            })
        }
        elseif ($candidates.Count -gt 1) {
            # Ambiguous
            $report.Add([pscustomobject]@{
                File        = $f.FullName
                OriginalUrl = $url
                NewUrl      = ''
                FoundPath   = ($candidates | ForEach-Object FullName) -join '; '
                Status      = 'MULTIPLE_MATCHES'
            })
        }
        else {
            # No match
            $report.Add([pscustomobject]@{
                File        = $f.FullName
                OriginalUrl = $url
                NewUrl      = ''
                FoundPath   = 'NONE'
                Status      = 'NO_MATCH'
            })
        }
    }

    # Write updated file if changed
    if ($changed) {
        Copy-Item -LiteralPath $f.FullName -Destination ($f.FullName + '.bak') -Force
        Set-Content -LiteralPath $f.FullName -Value $text -Force
    }
}

# Summary output
Write-Host "`nSummary:" -ForegroundColor Yellow
$report | Group-Object Status | ForEach-Object {
    Write-Host ("STATUS: {0}  Count: {1}" -f $_.Name, $_.Count)
}

Write-Host "`nDetailed AUTO-FIXES:" -ForegroundColor Green
$report | Where-Object { $_.Status -eq 'AUTO-FIXED' } |
    ForEach-Object {
        Write-Host ("AUTO-FIXED: {0}  {1} -> {2}" -f $_.File, $_.OriginalUrl, $_.NewUrl)
    }

Write-Host "`nItems Requiring Review:" -ForegroundColor Red
$report | Where-Object { $_.Status -ne 'AUTO-FIXED' } |
    ForEach-Object {
        Write-Host ("REVIEW: {0}  {1} => {2}" -f $_.File, $_.OriginalUrl, $_.Status)
    }

# Save JSON report
$reportPath = Join-Path $repo 'internal/reports/link-scan-report.json'
$report | ConvertTo-Json -Depth 6 | Out-File -FilePath $reportPath -Width 200

Write-Host "`nReport saved to: $reportPath" -ForegroundColor Cyan
Write-Host "Link scan complete." -ForegroundColor Cyan
