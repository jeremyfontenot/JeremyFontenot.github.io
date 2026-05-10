param(
    [string]$SettingsPath = "automation/config/engine-settings.json",
    [string]$KeywordMapPath = "automation/config/keyword-map.json",
    [switch]$Preview
)

function Write-EngineLog {
    param([string]$Message)
    if (-not $global:Settings.enableLogging) { return }
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[" + $timestamp + "] " + $Message | Add-Content $global:Settings.logFile
}

$global:Settings = Get-Content $SettingsPath | ConvertFrom-Json
$keywordMap      = Get-Content $KeywordMapPath | ConvertFrom-Json

$archiveRoot = $Settings.archiveRoot
$curatedRoot = $Settings.curatedRoot
$scanTypes   = $Settings.scanFileTypes
$ignore      = $Settings.ignoreFolders
$maxSize     = $Settings.maxFileSizeMB * 1MB

# --- PREVIEW MODE ---
if ($Preview) {
    Write-Output "=== PREVIEW MODE ==="
    Write-Output "No files will be moved or copied."
    Write-Output ""

    Get-ChildItem $archiveRoot -Recurse -File | ForEach-Object {
        $file = $_
        $matched = $null

        foreach ($prop in $keywordMap.PSObject.Properties) {
            if ($file.Name -like "*$($prop.Name)*" -or $file.Extension -eq $prop.Name) {
                $matched = $prop
                break
            }
        }

        if ($matched) {
            [PSCustomObject]@{
                File        = $file.Name
                Keyword     = $matched.Name
                Destination = $matched.Value
            }
        }
    }

    return
}

# --- NORMAL CURATION MODE ---
Write-EngineLog "--- Auto-curation run started ---"

$allFiles = Get-ChildItem -Path $archiveRoot -Recurse -File | Where-Object {
    $scanTypes -contains $_.Extension -and
    ($ignore -notcontains $_.DirectoryName.Split([IO.Path]::DirectorySeparatorChar)[-1]) -and
    $_.Length -le $maxSize
}

foreach ($file in $allFiles) {
    $matchedDest = $null

    foreach ($prop in $keywordMap.PSObject.Properties) {
        if ($file.Name -like "*$($prop.Name)*" -or $file.Extension -eq $prop.Name) {
            $matchedDest = $prop.Value
            break
        }
    }

    if (-not $matchedDest) { continue }

    $destPath = Join-Path -Path $curatedRoot -ChildPath ($matchedDest -replace "^curated/","")
    if (-not (Test-Path $destPath)) {
        New-Item -ItemType Directory -Path $destPath -Force | Out-Null
    }

    $targetFile = Join-Path -Path $destPath -ChildPath $file.Name

    if ((Test-Path $targetFile) -and -not $Settings.overwriteExistingFiles) {
        Write-EngineLog ("SKIP (exists): " + $targetFile)
        continue
    }

    if ($Settings.copyInsteadOfMove) {
        Copy-Item -Path $file.FullName -Destination $targetFile -Force
        $actionType = "COPY"
    } else {
        Move-Item -Path $file.FullName -Destination $targetFile -Force
        $actionType = "MOVE"
    }

    Write-EngineLog ($actionType + ": " + $file.FullName + " -> " + $targetFile)

    $readmePath = Join-Path -Path $destPath -ChildPath "README.md"
    if (-not (Test-Path $readmePath)) {
        "# Curation Notes" | Set-Content $readmePath
    }
    ("- " + $file.Name + " (from " + $file.DirectoryName + ")") | Add-Content $readmePath
}

Write-EngineLog "--- Auto-curation run finished ---"
