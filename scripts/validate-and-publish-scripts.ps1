Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$workspace = "C:\Users\jeremyfontenot\copilot_site"
Set-Location -LiteralPath $workspace

$roots = @(
    [pscustomobject]@{ Name = "m365-cloud-lab-scripts"; Path = "C:\Users\jeremyfontenot\OneDrive - jeremy fontenot\Documents\M365 Cloud Lab Scripts" },
    [pscustomobject]@{ Name = "windows-powershell"; Path = "C:\Users\jeremyfontenot\OneDrive - jeremy fontenot\Documents\WindowsPowerShell" },
    [pscustomobject]@{ Name = "powershell"; Path = "C:\Users\jeremyfontenot\OneDrive - jeremy fontenot\Documents\PowerShell" },
    [pscustomobject]@{ Name = "m365-automation"; Path = "C:\M365-Automation" },
    [pscustomobject]@{ Name = "m365-scripts"; Path = "C:\M365-Scripts" },
    [pscustomobject]@{ Name = "scripts"; Path = "C:\Scripts" },
    [pscustomobject]@{ Name = "scriptpack"; Path = "C:\Users\jeremyfontenot\ScriptPack" }
)

$outRoot = "docs\script-documentation"
$libRoot = Join-Path $outRoot "library"
New-Item -ItemType Directory -Force -Path $outRoot, $libRoot | Out-Null

$results = @()

foreach ($root in $roots) {
    if (-not (Test-Path -LiteralPath $root.Path)) {
        continue
    }

    $destBase = Join-Path $libRoot $root.Name
    New-Item -ItemType Directory -Force -Path $destBase | Out-Null

    $files = Get-ChildItem -LiteralPath $root.Path -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Extension -in ".ps1", ".psm1", ".psd1" }

    foreach ($file in $files) {
        $tokens = $null
        $parseErrors = $null
        $parserException = $null
        try {
            [void][System.Management.Automation.Language.Parser]::ParseFile($file.FullName, [ref]$tokens, [ref]$parseErrors)
        }
        catch {
            $parserException = $_.Exception.Message
            $parseErrors = @()
        }

        $relativePath = [System.IO.Path]::GetRelativePath($root.Path, $file.FullName)
        $targetPath = Join-Path $destBase $relativePath
        $targetDir = Split-Path -Parent $targetPath

        if (-not (Test-Path -LiteralPath $targetDir)) {
            New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
        }

        $copiedToWebsite = $true
        $copyException = $null
        try {
            Copy-Item -LiteralPath $file.FullName -Destination $targetPath -Force
        }
        catch {
            $copiedToWebsite = $false
            $copyException = $_.Exception.Message
        }

        $workspacePrefix = (Get-Location).Path + "\"
        $webPath = ($targetPath -replace [regex]::Escape($workspacePrefix), "") -replace "\\", "/"
        $errorText = ($parseErrors | ForEach-Object { "{0}:{1} {2}" -f $_.Extent.StartLineNumber, $_.Extent.StartColumnNumber, $_.Message }) -join " | "
        if (-not [string]::IsNullOrWhiteSpace($parserException)) {
            $errorText = if ([string]::IsNullOrWhiteSpace($errorText)) { "Parse exception: $parserException" } else { "$errorText | Parse exception: $parserException" }
        }
        if (-not [string]::IsNullOrWhiteSpace($copyException)) {
            $errorText = if ([string]::IsNullOrWhiteSpace($errorText)) { "Copy exception: $copyException" } else { "$errorText | Copy exception: $copyException" }
        }

        $results += [pscustomobject]@{
            Source = $root.Name
            OriginalPath = $file.FullName
            RelativePath = $relativePath
            Extension = $file.Extension
            SizeKB = [math]::Round($file.Length / 1KB, 2)
            LastWriteTime = $file.LastWriteTime
            SyntaxValid = ([string]::IsNullOrWhiteSpace($parserException) -and $parseErrors.Count -eq 0)
            ErrorCount = $parseErrors.Count
            Errors = $errorText
            WebsitePath = $webPath
            CopiedToWebsite = $copiedToWebsite
        }
    }
}

$resultsPathJson = Join-Path $outRoot "validation-results.json"
$resultsPathCsv = Join-Path $outRoot "validation-results.csv"
$summaryPath = Join-Path $outRoot "summary.json"

$results | ConvertTo-Json -Depth 5 | Set-Content -Path $resultsPathJson -Encoding UTF8
$results | Export-Csv -Path $resultsPathCsv -NoTypeInformation -Encoding UTF8

$grouped = @($results) | Group-Object -Property Source
$summary = $grouped | ForEach-Object {
    $total = @($_.Group).Count
    $invalid = @($_.Group | Where-Object { -not $_.SyntaxValid }).Count
    [pscustomobject]@{
        Source = $_.Name
        TotalScripts = $total
        ValidScripts = ($total - $invalid)
        InvalidScripts = $invalid
    }
}

$summary | ConvertTo-Json -Depth 4 | Set-Content -Path $summaryPath -Encoding UTF8

$totalCount = @($results).Count
$invalidCount = @($results | Where-Object { -not $_.SyntaxValid }).Count
$notCopiedCount = @($results | Where-Object { -not $_.CopiedToWebsite }).Count

$html = @()
$html += "<!DOCTYPE html>"
$html += "<html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Script Validation Documentation</title>"
$html += "<style>body{font-family:Segoe UI,Tahoma,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:24px}main{max-width:1200px;margin:0 auto}table{width:100%;border-collapse:collapse;background:#fff;margin-top:16px}th,td{border:1px solid #e2e8f0;padding:8px;text-align:left;font-size:14px}th{background:#e2e8f0}.ok{color:#047857;font-weight:600}.bad{color:#b91c1c;font-weight:600}.card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:12px}a{color:#0369a1;text-decoration:none}a:hover{text-decoration:underline}</style></head><body><main>"
$html += "<h1>Script Validation Documentation</h1><div class='card'><p>Total scripts: <strong>$totalCount</strong></p><p>Syntax valid: <strong>$($totalCount - $invalidCount)</strong></p><p>Syntax issues: <strong>$invalidCount</strong></p><p>Not copied (offline/unavailable): <strong>$notCopiedCount</strong></p><p>Artifacts: <a href='./validation-results.json'>validation-results.json</a> | <a href='./validation-results.csv'>validation-results.csv</a></p></div>"

$html += "<div class='card'><h2>Summary by Source</h2><table><thead><tr><th>Source</th><th>Total</th><th>Valid</th><th>Invalid</th></tr></thead><tbody>"
foreach ($s in $summary) {
    $html += "<tr><td>$($s.Source)</td><td>$($s.TotalScripts)</td><td class='ok'>$($s.ValidScripts)</td><td class='bad'>$($s.InvalidScripts)</td></tr>"
}
$html += "</tbody></table></div>"

$html += "<div class='card'><h2>Invalid Scripts</h2><table><thead><tr><th>Source</th><th>Relative Path</th><th>Errors</th><th>Website Copy</th></tr></thead><tbody>"
$invalidRows = @($results | Where-Object { -not $_.SyntaxValid })
if (@($invalidRows).Count -eq 0) {
    $html += "<tr><td colspan='4' class='ok'>No parser syntax errors found.</td></tr>"
}
else {
    foreach ($row in $invalidRows) {
        $rel = "./" + $row.WebsitePath.Substring($outRoot.Length + 1)
        $safeErrors = [System.Net.WebUtility]::HtmlEncode($row.Errors)
        $safeRelPath = [System.Net.WebUtility]::HtmlEncode($row.RelativePath)
        $html += "<tr><td>$($row.Source)</td><td>$safeRelPath</td><td>$safeErrors</td><td><a href='$rel'>$safeRelPath</a></td></tr>"
    }
}
$html += "</tbody></table></div>"

$html += "<div class='card'><h2>Library Paths</h2><ul>"
foreach ($root in $roots) {
    if (Test-Path -LiteralPath $root.Path) {
        $html += "<li><a href='./library/$($root.Name)/'>library/$($root.Name)/</a></li>"
    }
}
$html += "</ul></div>"
$html += "</main></body></html>"

Set-Content -Path (Join-Path $outRoot "index.html") -Value ($html -join "`r`n") -Encoding UTF8

Write-Output "TOTAL_VALIDATED=$totalCount"
Write-Output "TOTAL_INVALID=$invalidCount"
Write-Output "TOTAL_NOT_COPIED=$notCopiedCount"