Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$source = 'C:\Users\jeremy\Dev\Portfolio-Dev'
$tempRoot = Join-Path $env:TEMP 'portfolio-publish'
$remoteUrl = 'https://github.com/JeremyFontenot/JeremyFontenot.github.io.git'
$deployBranch = 'main'
$allowedItems = @(
  'assets',
  'cdn-cgi',
  'css',
  'docs',
  'js',
  'public',
  'index.html',
  'contact.html',
  'documentation.html',
  'CNAME',
  '.nojekyll'
)

function Write-Step {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Message
  )

  Write-Host $Message
}

function Reset-Directory {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if (Test-Path -LiteralPath $Path) {
    Remove-Item -LiteralPath $Path -Recurse -Force
  }

  New-Item -ItemType Directory -Path $Path -Force | Out-Null
}

function Copy-AllowedItem {
  param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath,

    [Parameter(Mandatory = $true)]
    [string]$DestinationRoot
  )

  if (-not (Test-Path -LiteralPath $SourcePath)) {
    return
  }

  $item = Get-Item -LiteralPath $SourcePath -Force
  if ($item.PSIsContainer) {
    Copy-Item -LiteralPath $SourcePath -Destination $DestinationRoot -Recurse -Force
  } else {
    Copy-Item -LiteralPath $SourcePath -Destination $DestinationRoot -Force
  }
}

$originalLocation = Get-Location
$deployed = $false

try {
  if (-not (Test-Path -LiteralPath $source)) {
    throw "Source directory not found: $source"
  }

  Write-Step 'Creating temp workspace...'
  Reset-Directory -Path $tempRoot

  try {
    Set-Location -LiteralPath $source

    Write-Step 'Copying allowed files...'
    foreach ($itemName in $allowedItems) {
      $candidatePath = Join-Path $source $itemName
      Copy-AllowedItem -SourcePath $candidatePath -DestinationRoot $tempRoot
    }

    Set-Location -LiteralPath $tempRoot

    Write-Step 'Initializing git repo...'
    git init | Out-Null
    git branch -M $deployBranch | Out-Null
    git remote add origin $remoteUrl | Out-Null
    git config user.name 'portfolio-deploy-bot' | Out-Null
    git config user.email 'portfolio-deploy-bot@example.com' | Out-Null

    git add -A | Out-Null

    $hasChanges = [string](git status --porcelain)
    if ([string]::IsNullOrWhiteSpace($hasChanges)) {
      throw 'No deployable files were copied to the temporary workspace.'
    }

    Write-Step 'Committing changes...'
    $timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    git commit -m "Deploy site $timestamp" | Out-Null

    Write-Step 'Pushing to GitHub Pages...'
    git push --force origin $deployBranch

    $deployed = $true
  }
  finally {
    Set-Location -LiteralPath $source
  }
}
finally {
  Write-Step 'Cleaning up...'
  if (Test-Path -LiteralPath $tempRoot) {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force
  }

  Set-Location -LiteralPath $originalLocation.Path
  Set-Location -LiteralPath $source
}

if ($deployed) {
  Write-Host 'Deployment completed successfully.'
}