# Provisioning script (example)
param(
  [string]$DisplayName,
  [string]$SamAccountName,
  [string]$Password
)
New-ADUser -Name $DisplayName -SamAccountName $SamAccountName -AccountPassword (ConvertTo-SecureString $Password -AsPlainText -Force) -Enabled $true -Path "OU=Users,OU=Corp,DC=lab,DC=local"
Write-Output "User $DisplayName created."