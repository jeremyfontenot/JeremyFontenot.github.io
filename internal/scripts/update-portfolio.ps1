# ================================
#  Entry-Level SysAdmin Portfolio
#  Repository Update Script (Safe Mode)
#  Prompts before overwriting files
# ================================

$root = "C:\Users\jeremy\Dev\Portfolio-Dev"

function Write-FileSafe {
    param(
        [string]$Path,
        [string]$Content
    )

    if (Test-Path $Path) {
        Write-Host "`nFile exists: $Path" -ForegroundColor Yellow
        $choice = Read-Host "Overwrite this file? (Y/N)"
        if ($choice -ne "Y") {
            Write-Host "Skipped: $Path" -ForegroundColor Cyan
            return
        }
    }

    Set-Content -Path $Path -Value $Content -Encoding UTF8
    Write-Host "Updated: $Path" -ForegroundColor Green
}

# -------------------------------
# Ensure required directories exist
# -------------------------------

$dirs = @(
    "$root\docs",
    "$root\docs\skills",
    "$root\docs\projects",
    "$root\docs\contact"
)

foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d | Out-Null
        Write-Host "Created directory: $d" -ForegroundColor Green
    }
}

# -------------------------------
# INDEX.HTML (Homepage)
# -------------------------------

$indexHtml = @"
PASTE THE NEW INDEX.HTML CONTENT HERE
"@

Write-FileSafe -Path "$root\index.html" -Content $indexHtml

# -------------------------------
# SKILLS PAGE
# -------------------------------

$skillsHtml = @"
PASTE THE NEW SKILLS PAGE CONTENT HERE
"@

Write-FileSafe -Path "$root\docs\skills\index.html" -Content $skillsHtml

# -------------------------------
# PROJECTS PAGE
# -------------------------------

$projectsHtml = @"
PASTE THE NEW PROJECTS INDEX PAGE CONTENT HERE
"@

Write-FileSafe -Path "$root\docs\projects\index.html" -Content $projectsHtml

# -------------------------------
# CONTACT PAGE
# -------------------------------

$contactHtml = @"
PASTE THE NEW CONTACT PAGE CONTENT HERE
"@

Write-FileSafe -Path "$root\docs\contact\index.html" -Content $contactHtml

# -------------------------------
# DOCUMENTATION HUB
# -------------------------------

$docsHubHtml = @"
PASTE THE NEW DOCUMENTATION HUB CONTENT HERE
"@

Write-FileSafe -Path "$root\docs\index.html" -Content $docsHubHtml

# -------------------------------
# MAIN.JS
# -------------------------------

$mainJs = @"
PASTE THE NEW MAIN.JS CONTENT HERE
"@

Write-FileSafe -Path "$root\js\main.js" -Content $mainJs

Write-Host "`nAll updates complete." -ForegroundColor Green
