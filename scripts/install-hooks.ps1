#!/usr/bin/env pwsh
try {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  $source = Join-Path $scriptDir 'hooks\pre-push'
  $repoRoot = (Resolve-Path (Join-Path $scriptDir '..')).Path
  $dest = Join-Path $repoRoot '.git\hooks\pre-push'
  if (-not (Test-Path $source)) {
    Write-Error "Source hook not found: $source"
    exit 1
  }
  Copy-Item -Path $source -Destination $dest -Force
  if (Test-Path $dest) {
    Write-Output "Hook copied to $dest"
    exit 0
  } else {
    Write-Error "Failed to copy hook to $dest"
    exit 1
  }
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
