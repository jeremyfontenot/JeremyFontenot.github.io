#!/usr/bin/env pwsh
# Test script for execution layer

. scripts/execution-layer.ps1

Write-Host "Testing basic function call..."

# Test 1: Simple call with minimal parameters
try {
    $result = Invoke-SafeScript -ScriptPath "scripts/execution-layer.py"
    Write-Host "Test 1 passed: $result" -ForegroundColor Green
} catch {
    Write-Host "Test 1 failed: $_" -ForegroundColor Red
    Write-Host $_.Exception
    Write-Host $_.Exception.StackTrace
}
