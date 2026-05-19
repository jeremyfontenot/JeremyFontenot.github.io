<#
.SYNOPSIS
    Execution Layer Hardening - PowerShell Module
    
.DESCRIPTION
    Safe subprocess invocation with strict safety guardrails:
    - File-based execution only (no inline scripts)
    - Subprocess isolation
    - Output contract validation
    - Explicit error classification (SYSTEM vs SEO)
    - Full observability logging

.NOTES
    Part of the production-grade execution layer hardening architecture.
    All scripts must use Invoke-SafeScript for deterministic, safe execution.
#>

$ConfigPath = Join-Path (Split-Path -Parent $PSScriptRoot) "observability/config/execution.config.json"
$ContractsPath = Join-Path (Split-Path -Parent $PSScriptRoot) "observability/config/output_contracts.json"

# Load configuration
function Get-ExecutionConfig {
    if (-not (Test-Path $ConfigPath)) {
        Write-Warning "Execution config not found: $ConfigPath"
        return @{ execution_layer = @{ enabled = $true; strict_mode = $true } }
    }
    Get-Content $ConfigPath -Raw | ConvertFrom-Json
}

function Get-OutputContracts {
    if (-not (Test-Path $ContractsPath)) {
        Write-Warning "Output contracts not found: $ContractsPath"
        return @{ contracts = @{} }
    }
    Get-Content $ContractsPath -Raw | ConvertFrom-Json
}

<#
.SYNOPSIS
    Invoke a script safely in an isolated subprocess.

.DESCRIPTION
    This is the ONLY permitted way to invoke scripts in the execution layer.
    - Validates script exists (no inline execution)
    - Runs in subprocess (strict isolation)
    - Captures exit code and output
    - Validates output contract
    - Logs execution for observability
    - Classifies failures (SYSTEM vs SEO)

.PARAMETER ScriptPath
    Path to the script file (must exist)

.PARAMETER Arguments
    Hashtable of CLI arguments to pass

.PARAMETER TimeoutSeconds
    Timeout in seconds (default 300)

.PARAMETER ExpectedOutputFiles
    Array of expected output file names

.PARAMETER ValidateSchema
    Whether to validate output JSON schema
#>
function Invoke-SafeScript {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ScriptPath,

        [Parameter(Mandatory = $false)]
        [hashtable]$Arguments = @{},

        [Parameter(Mandatory = $false)]
        [int]$TimeoutSeconds = 300,

        [Parameter(Mandatory = $false)]
        [string[]]$ExpectedOutputFiles = @(),

        [Parameter(Mandatory = $false)]
        [switch]$ValidateSchema,

        [Parameter(Mandatory = $false)]
        [string]$ExecContext = "powershell"
    )

    # 1. VALIDATION PHASE - Script existence
    $scriptFullPath = $ScriptPath
    if (-not [System.IO.Path]::IsPathRooted($ScriptPath)) {
        $cwdRelativePath = Join-Path (Get-Location) $ScriptPath
        if (Test-Path $cwdRelativePath) {
            $scriptFullPath = $cwdRelativePath
        } else {
            $scriptFullPath = Join-Path $PSScriptRoot $ScriptPath
        }
    }

    if (-not (Test-Path $scriptFullPath)) {
        $dateStr = Get-Date -Format 'yyyyMMdd'
        $errorObj = @{
            error_id      = "exec-$dateStr-001"
            timestamp     = ((Get-Date).ToUniversalTime().ToString('o'))
            incident_type = "SYSTEM"
            severity      = "high"
            error_class   = "ExecutionFailure"
            error_code    = "SCRIPT_NOT_FOUND"
            script_name   = (Split-Path -Leaf $ScriptPath)
            script_path   = $scriptFullPath
            exec_context  = $ExecContext
        }
        Write-ExecutionError -ErrorObject $errorObj
        return $false
    }

    # 2. INVOCATION PHASE - Subprocess execution
    $startTime = Get-Date
    $process = $null

    try {
        # Build argument list (never embed in script!)
        $argList = @()
        foreach ($key in $Arguments.Keys) {
            $argList += "--$key"
            $argList += $Arguments[$key]
        }

        # Execute in isolated subprocess
        $pythonPath = "python"
        if (Get-Command python -ErrorAction SilentlyContinue) {
            $pythonPath = (Get-Command python).Source
        }

        $processParams = @{
            FilePath               = $pythonPath
            ArgumentList           = @($scriptFullPath) + $argList
            RedirectStandardOutput = (Join-Path $env:TEMP "exec_stdout_$(Get-Random).log")
            RedirectStandardError  = (Join-Path $env:TEMP "exec_stderr_$(Get-Random).log")
        }

        # For PowerShell scripts, use different invocation
        if ($ScriptPath -like "*.ps1") {
            $processParams['FilePath'] = "pwsh"
            $processParams['ArgumentList'] = @("-NoProfile", "-File", $scriptFullPath) + $argList
        }

        $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
        $startInfo.FileName = $processParams['FilePath']
        $quotedArgs = @()
        foreach ($arg in $processParams['ArgumentList']) {
            $escapedArg = ([string]$arg).Replace('"', '\"')
            $quotedArgs += '"' + $escapedArg + '"'
        }
        $startInfo.Arguments = ($quotedArgs -join ' ')
        $startInfo.UseShellExecute = $false
        $startInfo.CreateNoWindow = $true
        $startInfo.RedirectStandardOutput = $true
        $startInfo.RedirectStandardError = $true

        $process = [System.Diagnostics.Process]::Start($startInfo)
        $processId = $process.Id

        # Wait with timeout
        $exitedWithinTimeout = $process.WaitForExit($TimeoutSeconds * 1000)

        if (-not $exitedWithinTimeout) {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            $timeoutDateStr = Get-Date -Format 'yyyyMMdd'
            $errorObj = @{
                error_id     = "exec-$timeoutDateStr-002"
                timestamp    = ((Get-Date).ToUniversalTime().ToString('o'))
                incident_type = "SYSTEM"
                severity     = "high"
                error_class  = "ExecutionFailure"
                error_code   = "TIMEOUT"
                script_name  = (Split-Path -Leaf $ScriptPath)
                timeout_sec  = $TimeoutSeconds
                duration_ms  = ([Math]::Floor(((Get-Date) - $startTime).TotalMilliseconds))
                exec_context = $ExecContext
            }
            Write-ExecutionError -ErrorObject $errorObj
            return $false
        }

        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        Set-Content -LiteralPath $processParams['RedirectStandardOutput'] -Value $stdout -Encoding UTF8
        Set-Content -LiteralPath $processParams['RedirectStandardError'] -Value $stderr -Encoding UTF8
        [void]$process.WaitForExit()
        $process.Refresh()
        $exitCode = $process.ExitCode
        $duration = [Math]::Floor(((Get-Date) - $startTime).TotalMilliseconds)

        # 3. EXIT CODE CHECK
        if ($exitCode -ne 0) {
            if ($null -eq $stderr) {
                $stderr = ""
            }
            $exitDateStr = Get-Date -Format 'yyyyMMdd'
            $errorObj = @{
                error_id     = "exec-$exitDateStr-003"
                timestamp    = ((Get-Date).ToUniversalTime().ToString('o'))
                incident_type = "SYSTEM"
                severity     = "high"
                error_class  = "ExecutionFailure"
                error_code   = "NON_ZERO_EXIT"
                script_name  = (Split-Path -Leaf $ScriptPath)
                exit_code    = $exitCode
                stderr_prev  = $stderr.Substring(0, [Math]::Min(500, $stderr.Length))
                duration_ms  = $duration
                exec_context = $ExecContext
            }
            Write-ExecutionError -ErrorObject $errorObj
            return $false
        }

        # 4. OUTPUT FILE VALIDATION
        $missingFiles = @()
        foreach ($outputFile in $ExpectedOutputFiles) {
            if (-not (Test-Path $outputFile)) {
                $missingFiles += $outputFile
            }
        }

        if ($missingFiles.Count -gt 0) {
            $missingDateStr = Get-Date -Format 'yyyyMMdd'
            $errorObj = @{
                error_id       = "exec-$missingDateStr-004"
                timestamp      = ((Get-Date).ToUniversalTime().ToString('o'))
                incident_type  = "SYSTEM"
                severity       = "high"
                error_class    = "ExecutionFailure"
                error_code     = "MISSING_OUTPUT"
                script_name    = (Split-Path -Leaf $ScriptPath)
                expected_files = $ExpectedOutputFiles
                missing_files  = $missingFiles
                duration_ms    = $duration
                exec_context   = $ExecContext
            }
            Write-ExecutionError -ErrorObject $errorObj
            return $false
        }

        # 5. SCHEMA VALIDATION
        if ($ValidateSchema) {
            foreach ($outputFile in $ExpectedOutputFiles) {
                if (Test-Path $outputFile) {
                    try {
                        $content = Get-Content $outputFile -Raw | ConvertFrom-Json
                        if (-not $content.timestamp) {
                            throw "Missing 'timestamp' field"
                        }
                    }
                    catch {
                        $errorDateStr = Get-Date -Format 'yyyyMMdd'
                        $errorObj = @{
                            error_id      = "exec-$errorDateStr-005"
                            timestamp     = ((Get-Date).ToUniversalTime().ToString('o'))
                            incident_type = "SYSTEM"
                            severity      = "high"
                            error_class   = "ExecutionFailure"
                            error_code    = "INVALID_SCHEMA"
                            script_name   = (Split-Path -Leaf $ScriptPath)
                            output_file   = $outputFile
                            val_error     = $_.Exception.Message
                            duration_ms   = $duration
                            exec_context  = $ExecContext
                        }
                        Write-ExecutionError -ErrorObject $errorObj
                        return $false
                    }
                }
            }
        }

        # 6. LOG SUCCESS
        Write-ExecutionSuccess -ScriptName (Split-Path -Leaf $ScriptPath) -DurationMs $duration -ExecCtx $ExecContext

        return $true
    }
    finally {
        if ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }
}

<#
.SYNOPSIS
    Write execution success to observability layer.
#>
function Write-ExecutionSuccess {
    param(
        [string]$ScriptName,
        [int]$DurationMs,
        [string]$ExecCtx
    )

    $now = Get-Date
    $dateStr = "{0:yyyyMMdd}" -f $now
    $logEntry = @{
        execution_log_id = "exec-log-$dateStr-$(Get-Random)"
        timestamp        = $now.ToUniversalTime().ToString('o')
        status           = "success"
        script_name      = $ScriptName
        duration_ms      = $DurationMs
        exec_context     = $ExecCtx
    } | ConvertTo-Json

    $logDir = Join-Path $PSScriptRoot "..\observability\reports"
    $logFile = Join-Path $logDir "execution_log.jsonl"

    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }

    Add-Content -Path $logFile -Value $logEntry -Encoding UTF8
    Write-Host "[SUCCESS] $ScriptName executed in $($DurationMs)ms" -ForegroundColor Green
}

<#
.SYNOPSIS
    Write execution failure to observability layer and create SYSTEM incident.
#>
function Write-ExecutionError {
    param(
        [hashtable]$ErrorObject
    )

    # Write to execution log
    $logEntry = $ErrorObject | ConvertTo-Json
    $logDir = Join-Path $PSScriptRoot "..\observability\reports"
    $logFile = Join-Path $logDir "execution_log.jsonl"

    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }

    Add-Content -Path $logFile -Value $logEntry -Encoding UTF8

    # Create SYSTEM incident
    $now = Get-Date
    $dateFolder = "{0:yyyy-MM-dd}" -f $now
    $incidentDir = Join-Path $PSScriptRoot "..\observability\incidents\system\$dateFolder"
    if (-not (Test-Path $incidentDir)) {
        New-Item -ItemType Directory -Path $incidentDir -Force | Out-Null
    }

    $timeStamp = "{0:HH-mm-ss}" -f $now
    $incidentId = $ErrorObject.error_id
    if (-not $incidentId) {
        $dateStr = "{0:yyyyMMdd}" -f $now
        $incidentId = "exec-$dateStr-000"
    }
    $incidentFile = Join-Path $incidentDir "$($timeStamp)_$($incidentId).json"

    $incident = @{
        incident_id        = $incidentId
        timestamp          = $ErrorObject.timestamp
        incident_type      = "SYSTEM"
        classification     = "execution_failure"
        severity           = "high"
        error_details      = $ErrorObject
        status             = "open"
        requires_seo_fix   = $false
        requires_system_fix = $true
    } | ConvertTo-Json -Depth 10

    Set-Content -Path $incidentFile -Value $incident -Encoding UTF8

    Write-Host "[FAILURE] $($ErrorObject.error_code) - $($ErrorObject.script_name)" -ForegroundColor Red
    Write-Host "  Incident: $incidentFile" -ForegroundColor Red
}

<#
.SYNOPSIS
    Validate an execution result against output contract.
#>
function Test-OutputContract {
    param(
        [string]$ScriptName,
        [string[]]$ExpectedFiles
    )

    $contracts = Get-OutputContracts
    $contract = $contracts.contracts.$ScriptName

    if (-not $contract) {
        Write-Host "Warning: No output contract defined for $ScriptName" -ForegroundColor Yellow
        return $true
    }

    foreach ($expectedFile in $contract.output_files) {
        if (-not (Test-Path $expectedFile.name)) {
            Write-Host "Error: Expected output file not found: $($expectedFile.name)" -ForegroundColor Red
            return $false
        }
    }

    return $true
}

