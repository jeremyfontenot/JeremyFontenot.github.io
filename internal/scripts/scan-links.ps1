# Scan all linked files on the site
$links = @()
$files = Get-ChildItem -Recurse -Include "*.html" -Path "."

foreach ($file in $files) {
  $content = Get-Content -Path $file.FullName -Raw
  
  # Extract href attributes
  $matches = [regex]::Matches($content, 'href=["\047]([^"\047]+)["\047]')
  foreach ($match in $matches) {
    $href = $match.Groups[1].Value
    if ($href) {
      $links += @{
        href = $href
        file = $file.FullName -replace '.*Portfolio-Dev\\', ''
      }
    }
  }
}

# Group and sort
$links | Sort-Object -Property href -Unique | ConvertTo-Json -Depth 1 | Out-File links-report.json
$links | Sort-Object -Property href -Unique | Select-Object href | Export-Csv -Path links-report.csv -NoTypeInformation -Encoding UTF8

Write-Host "Total unique links found: $($links | Select-Object -Property href -Unique | Measure-Object).Count"
