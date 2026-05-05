<#
Package public evidence into releases/evidence-public-YYYYMMDD.zip
Usage: pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\package-evidence.ps1
#>
$now = Get-Date -Format yyyyMMdd
$zip = Join-Path -Path 'releases' -ChildPath ("evidence-public-$now.zip")
if(-not (Test-Path 'releases')){ New-Item -ItemType Directory -Path 'releases' | Out-Null }
if(Test-Path $zip){ Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path -Path (Get-Location) -ChildPath 'evidence/public/*') -DestinationPath $zip
Write-Host 'Created' $zip

# Commit and push the package and UI changes
git add releases/* docs/evidence.html css/styles.css scripts/validate-evidence-links.ps1
git commit -m "Add Evidence landing UI, validator, and packaged public evidence" -q
git push origin main -q
Write-Host 'Committed and pushed.'
