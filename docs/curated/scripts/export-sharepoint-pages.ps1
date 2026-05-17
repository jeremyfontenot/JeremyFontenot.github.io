param(
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $false)]
    [string]$OutputRoot = ".\\docs\\m365-documentation-archive",

    [Parameter(Mandatory = $false)]
    [switch]$SkipRenderedHtml
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Install-RequiredModule {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    if (-not (Get-Module -ListAvailable -Name $Name)) {
        Install-Module -Name $Name -Scope CurrentUser -Force -AllowClobber
    }
}

function Save-TextFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    $dir = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.Encoding]::UTF8)
}

function New-ArchivedPageHtml {
        param(
                [Parameter(Mandatory = $true)]
                [string]$Title,

                [Parameter(Mandatory = $true)]
                [string]$SourceUrl,

                [Parameter(Mandatory = $false)]
                [string]$CanvasContent,

                [Parameter(Mandatory = $false)]
                [string]$Description
        )

        $safeTitle = [System.Net.WebUtility]::HtmlEncode($Title)
        $safeSourceUrl = [System.Net.WebUtility]::HtmlEncode($SourceUrl)
        $safeDescription = [System.Net.WebUtility]::HtmlEncode($Description)
        $bodyContent = if ([string]::IsNullOrWhiteSpace($CanvasContent)) {
                "<p><em>No CanvasContent1 was present for this page item.</em></p>"
        }
        else {
                $CanvasContent
        }

        @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$safeTitle</title>
    <style>
        body { font-family: Segoe UI, Arial, sans-serif; margin: 0; padding: 2rem; background: #f8fafc; color: #0f172a; }
        main { max-width: 960px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 2rem; }
        h1 { margin-top: 0; }
        .meta { margin-bottom: 1.25rem; color: #475569; font-size: 0.95rem; }
        .meta a { color: #0369a1; text-decoration: none; }
        .meta a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <main>
        <h1>$safeTitle</h1>
        <div class="meta">Original page: <a href="$safeSourceUrl">$safeSourceUrl</a></div>
        <div class="meta">$safeDescription</div>
        <hr>
        $bodyContent
    </main>
</body>
</html>
"@
}

Install-RequiredModule -Name "PnP.PowerShell"

$resolvedOutputRoot = (Resolve-Path -Path (New-Item -ItemType Directory -Force -Path $OutputRoot).FullName).Path
$aspxDir = Join-Path $resolvedOutputRoot "aspx"
$htmlDir = Join-Path $resolvedOutputRoot "html"
$manifestPath = Join-Path $resolvedOutputRoot "manifest.json"

New-Item -ItemType Directory -Force -Path $aspxDir | Out-Null
New-Item -ItemType Directory -Force -Path $htmlDir | Out-Null

Write-Host "Connecting to SharePoint site: $SiteUrl"
Connect-PnPOnline -Url $SiteUrl -Interactive

Write-Host "Reading Site Pages library..."
$items = Get-PnPListItem -List "Site Pages" -PageSize 200

if (-not $items -or $items.Count -eq 0) {
    throw "No items found in 'Site Pages'."
}

$pageRecords = @()

foreach ($item in $items) {
    $fileRef = [string]$item.FieldValues.FileRef
    $fileLeafRef = [string]$item.FieldValues.FileLeafRef

    if ([string]::IsNullOrWhiteSpace($fileRef) -or [string]::IsNullOrWhiteSpace($fileLeafRef)) {
        continue
    }

    if (-not $fileLeafRef.EndsWith(".aspx", [System.StringComparison]::OrdinalIgnoreCase)) {
        continue
    }

    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileLeafRef)
    $title = [string]$item.FieldValues.Title
    if ([string]::IsNullOrWhiteSpace($title)) {
        $title = $baseName
    }

    $safeBaseName = ($baseName -replace "[^a-zA-Z0-9-_]", "-").Trim("-")
    if ([string]::IsNullOrWhiteSpace($safeBaseName)) {
        $safeBaseName = "page-$($item.Id)"
    }

    $aspxPath = Join-Path $aspxDir "$safeBaseName.aspx"
    $htmlPath = Join-Path $htmlDir "$safeBaseName.html"

    Write-Host "Downloading ASPX: $fileLeafRef"
    Get-PnPFile -Url $fileRef -Path $aspxDir -FileName "$safeBaseName.aspx" -AsFile -Force

    $absolutePageUrl = if ($fileRef.StartsWith("http", [System.StringComparison]::OrdinalIgnoreCase)) {
        $fileRef
    }
    else {
        $siteUri = [System.Uri]$SiteUrl
        "{0}://{1}{2}" -f $siteUri.Scheme, $siteUri.Host, $fileRef
    }

    $pageRecords += [PSCustomObject]@{
        Id = $item.Id
        Title = $title
        FileLeafRef = $fileLeafRef
        FileRef = $fileRef
        PageUrl = $absolutePageUrl
        AspxPath = $aspxPath
        HtmlPath = $htmlPath
        CanvasContent = [string]$item.FieldValues.CanvasContent1
        Description = [string]$item.FieldValues.Description
    }
}

if (-not $pageRecords -or $pageRecords.Count -eq 0) {
    throw "No .aspx pages discovered in Site Pages."
}

$pageRecords | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
Write-Host "Saved manifest: $manifestPath"

if ($SkipRenderedHtml) {
    Write-Host "Skipped rendered HTML export because -SkipRenderedHtml was specified."
    Write-Host "Done."
    exit 0
}

Write-Host "Generating HTML files from Site Pages canvas content..."

foreach ($record in $pageRecords) {
    $html = New-ArchivedPageHtml -Title $record.Title -SourceUrl $record.PageUrl -CanvasContent $record.CanvasContent -Description $record.Description
    Save-TextFile -Path $record.HtmlPath -Content $html
}

Write-Host "Done. Archive output: $resolvedOutputRoot"