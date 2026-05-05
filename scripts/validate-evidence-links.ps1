<#
Simple validator: finds hrefs to evidence/public in docs/evidence.html and verifies files exist.
Usage: pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\validate-evidence-links.ps1
#>
$doc = 'docs/evidence.html'
if(-not (Test-Path $doc)){
  Write-Host "File not found: $doc"; exit 2
}
$content = Get-Content -Raw -Path $doc
$pattern = 'href=["'']([^"'']*evidence/public/[^"'']*)["'']'
$regex = New-Object System.Text.RegularExpressions.Regex($pattern)
$matches = $regex.Matches($content)
if($matches.Count -eq 0){ Write-Host 'No evidence/public links found.'; exit 0 }
$missing = @()
foreach($m in $matches){
  $ref = $m.Groups[1].Value
  if($ref.StartsWith('/')){ $path = $ref.TrimStart('/') } else { $path = $ref }
  if(-not (Test-Path $path)){
    $missing += $ref
  }
}
if($missing.Count -eq 0){
  Write-Host 'All evidence links resolve.'
  exit 0
} else {
  Write-Host ("Missing files referenced in ${doc}`n")
  $missing | ForEach-Object { Write-Host " - $_" }
  exit 1
}
