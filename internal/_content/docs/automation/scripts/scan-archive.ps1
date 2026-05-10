param(
    [string]$ConfigPath = "automation\config\engine-settings.json"
)

$settings = Get-Content $ConfigPath | ConvertFrom-Json
$archiveRoot = $settings.archiveRoot
$scanTypes   = $settings.scanFileTypes
$ignore      = $settings.ignoreFolders

$items = Get-ChildItem -Path $archiveRoot -Recurse -File |
    Where-Object {
        $scanTypes -contains $_.Extension -and
        ($ignore -notcontains $_.DirectoryName.Split([IO.Path]::DirectorySeparatorChar)[-1])
    } |
    Select-Object FullName, Name, Extension, Length, LastWriteTime

$output = @{
    scannedAt   = (Get-Date).ToString("s")
    archiveRoot = $archiveRoot
    totalFiles  = $items.Count
    files       = $items
}

$output | ConvertTo-Json -Depth 5 | Set-Content "automation/reports/archive-inventory.json"

Write-Output "Archive scan complete."
