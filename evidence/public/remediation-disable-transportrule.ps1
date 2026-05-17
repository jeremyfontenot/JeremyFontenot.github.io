param(
  [switch]$WhatIf
)

Write-Host 'Sample remediation script: disable transport rule'
if ($WhatIf) {
  Write-Host 'No changes made because -WhatIf was supplied.'
}
