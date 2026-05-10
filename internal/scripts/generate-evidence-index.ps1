# Generate evidence/index.json from YAML metadata files in evidence/experience
$yamlDir = "evidence/experience"
$outFile = "evidence/index.json"
$items = @()
Get-ChildItem -Path $yamlDir -Filter "*.yaml" -File | ForEach-Object {
    $text = Get-Content -Raw -Path $_.FullName
    $get = { param($pattern) [regex]::Match($text, $pattern, [System.Text.RegularExpressions.RegexOptions]::Multiline).Groups[1].Value.Trim() }
    $id = & $get '^id:\s*(.+)$'
    $title = & $get '^title:\s*(.+)$'
    $excerpt = & $get '^excerpt:\s*"?(.+?)"?$'
    if(-not $excerpt) { $excerpt = & $get '^excerpt:\s*(.+)$' }
    $file = & $get '^file:\s*(.+)$'
    $status = & $get '^status:\s*(.+)$'
    # artifacts block
    $artifacts = @()
    $m = [regex]::Match($text, '(?ms)^artifacts:\s*(?:-\s*.+\r?\n?)+')
    if($m.Success){
        $block = $m.Value
        foreach($line in $block -split "\r?\n"){
            if($line -match '^\s*-\s*(.+)$'){ $artifacts += $Matches[1].Trim() }
        }
    }
    $obj = [PSCustomObject]@{
        id = $id
        title = $title
        excerpt = $excerpt
        file = $file
        status = $status
        artifacts = $artifacts
    }
    $items += $obj
}
# write JSON
$items | ConvertTo-Json -Depth 5 | Out-File -FilePath $outFile -Encoding UTF8
Write-Host "Generated $outFile with $($items.Count) items" 
