param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('dev', 'uat', 'staging', 'production')]
    [string]$Environment,

    [Parameter(Mandatory = $false)]
    [string]$SourceRoot = "C:\\Users\\jeremyfontenot\\jeremyfontenot-site-source",

    [Parameter(Mandatory = $false)]
    [string]$TargetRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-DefaultTargetRoot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$EnvName
    )

    switch ($EnvName) {
        'dev' { return 'C:\\Users\\jeremyfontenot\\jeremyfontenot-site-source' }
        'uat' { return 'C:\Users\jeremyfontenot\site-environments\uat' }
        'staging' { return 'C:\Users\jeremyfontenot\site-environments\staging' }
        'production' { return 'C:\Users\jeremyfontenot\GitHub\JeremyFontenot.github.io' }
        default { throw "Unsupported environment: $EnvName" }
    }
}

function Set-SiteEnvironment {
    param(
        [Parameter(Mandatory = $true)]
        [string]$IndexPath,

        [Parameter(Mandatory = $true)]
        [string]$EnvName
    )

    if (-not (Test-Path -LiteralPath $IndexPath)) {
        throw "index.html not found at $IndexPath"
    }

    $content = Get-Content -LiteralPath $IndexPath -Raw
    if ($content -notmatch "const SITE_ENV\s*=\s*'[^']+';") {
        throw "Could not locate SITE_ENV constant in $IndexPath"
    }

    $updated = [regex]::Replace($content, "const SITE_ENV\s*=\s*'[^']+';", "const SITE_ENV = '$EnvName';")

    [System.IO.File]::WriteAllText($IndexPath, $updated, [System.Text.Encoding]::UTF8)
}

if (-not (Test-Path -LiteralPath $SourceRoot)) {
    throw "SourceRoot does not exist: $SourceRoot"
}

if ([string]::IsNullOrWhiteSpace($TargetRoot)) {
    $TargetRoot = Get-DefaultTargetRoot -EnvName $Environment
}

if ($Environment -eq 'dev' -and ($SourceRoot.TrimEnd('\\') -ieq $TargetRoot.TrimEnd('\\'))) {
    Set-SiteEnvironment -IndexPath (Join-Path $SourceRoot 'index.html') -EnvName 'dev'
    Write-Host "Updated in place: SITE_ENV=dev at $SourceRoot"
    exit 0
}

New-Item -ItemType Directory -Path $TargetRoot -Force | Out-Null

$roboArgs = @(
    $SourceRoot,
    $TargetRoot,
    '/MIR',
    '/XD', '.git',
    '/R:2',
    '/W:1',
    '/NFL',
    '/NDL',
    '/NP'
)

Write-Host "Promoting '$Environment' from '$SourceRoot' to '$TargetRoot'..."
& robocopy @roboArgs | Out-Null
$robocopyCode = $LASTEXITCODE

if ($robocopyCode -ge 8) {
    throw "Robocopy failed with exit code $robocopyCode"
}

$targetIndex = Join-Path $TargetRoot 'index.html'
Set-SiteEnvironment -IndexPath $targetIndex -EnvName $Environment

Write-Host "Promotion complete."
Write-Host "Environment: $Environment"
Write-Host "Target: $TargetRoot"
