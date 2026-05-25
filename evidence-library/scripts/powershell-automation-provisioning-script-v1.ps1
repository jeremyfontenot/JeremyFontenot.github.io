#requires -Version 5.1
<#
.SYNOPSIS
Creates a reviewed Active Directory user provisioning plan and optionally applies it in an authorized lab OU.

.DESCRIPTION
This portfolio artifact demonstrates a conservative provisioning workflow:
parameter validation, dry-run review by default, idempotent account checks,
structured logging, group membership planning, and controlled execution.

It is intended for lab or test environments only. It does not represent a live
enterprise onboarding system.

.EXAMPLE
.\powershell-automation-provisioning-script-v1.ps1 `
  -DisplayName "Alex Rivera" `
  -SamAccountName "arivera" `
  -UserPrincipalName "arivera@lab.local" `
  -TargetOu "OU=Users,OU=Corp,DC=lab,DC=local" `
  -Groups "Helpdesk-Trainees","VPN-Users" `
  -Department "IT Support" `
  -TicketId "LAB-1024"

Builds a provisioning plan and writes a dry-run log without changing Active Directory.

.EXAMPLE
.\powershell-automation-provisioning-script-v1.ps1 `
  -DisplayName "Alex Rivera" `
  -SamAccountName "arivera" `
  -UserPrincipalName "arivera@lab.local" `
  -TargetOu "OU=Users,OU=Corp,DC=lab,DC=local" `
  -Groups "Helpdesk-Trainees","VPN-Users" `
  -Department "IT Support" `
  -TicketId "LAB-1024" `
  -InitialPassword (Read-Host "Temporary password" -AsSecureString) `
  -Apply

Applies the reviewed plan in an authorized lab context.
#>

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$DisplayName,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-zA-Z][a-zA-Z0-9._-]{2,19}$')]
    [string]$SamAccountName,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[^@\s]+@[^@\s]+\.[^@\s]+$')]
    [string]$UserPrincipalName,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^OU=.+,DC=.+')]
    [string]$TargetOu,

    [string[]]$Groups = @(),

    [ValidateNotNullOrEmpty()]
    [string]$Department = 'IT Support',

    [ValidateNotNullOrEmpty()]
    [string]$TicketId = 'LAB-REVIEW',

    [securestring]$InitialPassword,

    [string]$LogPath = '.\provisioning-run-log.jsonl',

    [switch]$Apply
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-ProvisioningLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet('Info', 'Warning', 'Error')]
        [string]$Level,

        [Parameter(Mandatory = $true)]
        [string]$Message,

        [hashtable]$Data = @{}
    )

    $entry = [ordered]@{
        timestamp = (Get-Date).ToUniversalTime().ToString('o')
        level     = $Level
        ticketId  = $TicketId
        message   = $Message
        data      = $Data
    }

    $logDirectory = Split-Path -Path $LogPath -Parent
    if ($logDirectory -and -not (Test-Path -LiteralPath $logDirectory)) {
        New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
    }

    $entry | ConvertTo-Json -Depth 6 -Compress | Add-Content -Path $LogPath -Encoding UTF8
}

function Test-ActiveDirectoryModule {
    [CmdletBinding()]
    param()

    if (-not (Get-Module -ListAvailable -Name ActiveDirectory)) {
        throw 'The ActiveDirectory module is required only when -Apply is used.'
    }

    Import-Module ActiveDirectory -ErrorAction Stop
}

function New-ProvisioningPlan {
    [CmdletBinding()]
    param()

    [ordered]@{
        displayName       = $DisplayName
        samAccountName    = $SamAccountName
        userPrincipalName = $UserPrincipalName
        targetOu          = $TargetOu
        department        = $Department
        groups            = $Groups
        applyMode         = [bool]$Apply
        reviewRequired    = -not $Apply
    }
}

$plan = New-ProvisioningPlan
Write-ProvisioningLog -Level Info -Message 'Provisioning plan generated.' -Data $plan

if (-not $Apply) {
    Write-Output 'Dry-run mode: no Active Directory changes were made.'
    Write-Output ($plan | ConvertTo-Json -Depth 4)
    Write-ProvisioningLog -Level Info -Message 'Dry-run completed without write actions.'
    return
}

if (-not $InitialPassword) {
    throw 'InitialPassword is required when -Apply is used.'
}

Test-ActiveDirectoryModule

$existingUser = Get-ADUser -Filter "SamAccountName -eq '$SamAccountName'" -ErrorAction Stop
if ($existingUser) {
    Write-ProvisioningLog -Level Warning -Message 'Account already exists; create action skipped.' -Data @{ distinguishedName = $existingUser.DistinguishedName }
    Write-Output "Account '$SamAccountName' already exists. No user create action was taken."
    return
}

if ($PSCmdlet.ShouldProcess($SamAccountName, 'Create lab Active Directory user and assign reviewed groups')) {
    New-ADUser `
        -Name $DisplayName `
        -DisplayName $DisplayName `
        -SamAccountName $SamAccountName `
        -UserPrincipalName $UserPrincipalName `
        -Department $Department `
        -AccountPassword $InitialPassword `
        -Enabled $true `
        -Path $TargetOu `
        -ChangePasswordAtLogon $true `
        -ErrorAction Stop

    foreach ($group in $Groups) {
        Add-ADGroupMember -Identity $group -Members $SamAccountName -ErrorAction Stop
    }

    Write-ProvisioningLog -Level Info -Message 'Provisioning changes applied.' -Data $plan
    Write-Output "Provisioning completed for '$SamAccountName'. Review the structured log at '$LogPath'."
}
