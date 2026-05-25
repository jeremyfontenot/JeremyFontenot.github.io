Write-Host "Validating internal links..."

$HtmlFiles = Get-ChildItem -Path . -Recurse -Filter "*.html" -File | Where-Object {
  $_.DirectoryName -notmatch "node_modules"
}

$Failures = @()

foreach ($File in $HtmlFiles) {

  $Matches = Select-String -Path $File.FullName -Pattern '(?:href|src)="([^"]+)"' -AllMatches

  foreach ($Match in $Matches.Matches) {

    $RelativePath = ($Match.Groups[1].Value -split "\?")[0]

    if (
      $RelativePath.StartsWith("http") -or
      $RelativePath.StartsWith("#") -or
      $RelativePath.StartsWith("mailto:") -or
      $RelativePath.StartsWith("tel:")
    ) {
      continue
    }

    $ResolvedPath = Join-Path $File.DirectoryName $RelativePath

    if (-not (Test-Path $ResolvedPath)) {
      $Failures += $ResolvedPath
      Write-Host "Missing: $ResolvedPath" -ForegroundColor Red
    }
  }
}

if ($Failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Link validation failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Link validation passed." -ForegroundColor Green
