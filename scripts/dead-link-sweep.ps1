# Dead link sweep script - non-destructive
$report = "DEAD_LINK_REPORT_DETAILED.md"
"# Dead Link Report — Detailed Sweep" | Out-File -FilePath $report -Encoding utf8
"Scanned: $(Get-Date -Format o)" | Out-File -FilePath $report -Append -Encoding utf8

$pattern = 'https?://\S+'
$matches = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Select-String -Pattern $pattern -AllMatches -ErrorAction SilentlyContinue | ForEach-Object { $_.Matches } | ForEach-Object { $_.Value }
$urls = $matches | Sort-Object -Unique
"Found $($urls.Count) unique URLs." | Out-File -FilePath $report -Append -Encoding utf8
"" | Out-File -FilePath $report -Append -Encoding utf8

function Resolve-Status {
    param([string]$u)
    try {
        $resp = Invoke-WebRequest -Uri $u -Method Head -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
        return $resp.StatusCode
    } catch {
        $err = $_.Exception
        if ($err -and $err.Response -and $err.Response.StatusCode) {
            return $err.Response.StatusCode.Value__
        } else {
            try {
                $r2 = Invoke-WebRequest -Uri $u -Method Get -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
                return $r2.StatusCode
            } catch {
                return "ERROR: $($err.Message)"
            }
        }
    }
}

$broken = @()
foreach ($u in $urls) {
    $status = Resolve-Status -u $u
    "$u - $status" | Out-File -FilePath $report -Append -Encoding utf8
    if ($status -is [int] -and ($status -ge 400)) { $broken += "$u - $status" }
    if ($status -is [string] -and $status.StartsWith('ERROR')) { $broken += "$u - $status" }
}

"" | Out-File -FilePath $report -Append -Encoding utf8
"Broken or unreachable URLs: $($broken.Count)" | Out-File -FilePath $report -Append -Encoding utf8
if ($broken.Count -gt 0) { $broken | Out-File -FilePath $report -Append -Encoding utf8 }

"Sweep complete: $report" | Write-Output
