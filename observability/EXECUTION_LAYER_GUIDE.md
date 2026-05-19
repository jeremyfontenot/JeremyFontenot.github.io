# Execution Layer Hardening Architecture

**well-structured Orchestration Safety for SEO Verification Systems**

---

## Quick Start

### Using the Safe Execution Layer

**PowerShell:**
```powershell
# Import the execution layer
. scripts/execution-layer.ps1

# Invoke a script safely (ONLY ALLOWED METHOD)
$success = Invoke-SafeScript `
    -ScriptPath "scripts/verify_pass4.py" `
    -Arguments @{ "output-file" = "report.json" } `
    -TimeoutSeconds 300 `
    -ExpectedOutputFiles @("report.json")

if (-not $success) {
    exit 1  # Explicit failure - SYSTEM incident created
}
```

**Python:**
```python
from scripts.execution_layer import invoke_subprocess_safely

success, error = invoke_subprocess_safely(
    script_name="ahrefs_verification.py",
    args={"output-file": "report.json"},
    timeout_seconds=300,
    expected_output_files=["report.json"],
    validate_schema=True
)

if not success:
    sys.exit(1)  # Explicit failure - SYSTEM incident created
```

---

## System Architecture

### Before: Unsafe (String-Based Orchestration)

```
PowerShell Script
    ↓
Embed entire Python file in string
    ↓
Pass to: python -c "entire_script_here"
    ↓
Quote escaping breaks
    ↓
SyntaxError: '(' was never closed
    ↓
SYSTEM FAILURE (unclassified)
```

**Problems:**
- Quote escaping conflicts
- String replacement breaks Python syntax
- No clear execution boundary
- Difficult to debug
- No failure classification

### After: Safe (File-Based Execution)

```
Orchestration Layer
    ↓
Invoke-SafeScript helper
    ↓
Validation Phase (script exists, contract defined)
    ↓
Subprocess Execution (file-based, isolated)
    ↓
Exit Code Check (0 = success, non-zero = SYSTEM incident)
    ↓
Output File Validation (expected files exist)
    ↓
Schema Validation (JSON structure correct)
    ↓
Success/Failure Classification
    ↓
Incident Creation (if needed)
    ↓
Observability Recording (append-only log)
```

**Guarantees:**
- No string manipulation of scripts
- Clear subprocess boundary
- Explicit exit code checking
- Output validation
- Deterministic behavior
- Proper incident classification

---

## Mandatory Execution Rules

### Rule #1: File-Based Execution Only

✅ **ALLOWED:**
```powershell
& python scripts/verify.py
```

❌ **FORBIDDEN:**
```powershell
& python -c "import os; ..."
```

### Rule #2: No Inline Script Execution

✅ **ALLOWED:**
```powershell
$success = Invoke-SafeScript -ScriptPath "scripts/analysis.py"
```

❌ **FORBIDDEN:**
```powershell
$scriptText = Get-Content script.py -Raw
$scriptText = $scriptText.Replace('x', 'y')
& python -c $scriptText
```

### Rule #3: Arguments via CLI Flags Only

✅ **ALLOWED:**
```powershell
Invoke-SafeScript `
    -ScriptPath "scripts/run.py" `
    -Arguments @{ "output-file" = "report.json" }
```

❌ **FORBIDDEN:**
```powershell
"python scripts/run.py | $output_file_from_string"
```

### Rule #4: Subprocess Isolation Required

✅ **ALLOWED:**
```python
subprocess.run([script_path, "--arg", value], check=False)
```

❌ **FORBIDDEN:**
```python
exec(script_text)  # In-process execution
```

### Rule #5: Exit Codes Drive Control Flow

✅ **ALLOWED:**
```powershell
if (-not $success) {
    Write-ExecutionError
    exit 1
}
```

❌ **FORBIDDEN:**
```powershell
# Try to recover or ignore non-zero exits
```

---

## Output Contract System

Every script declares what files it produces:

**File: `/observability/config/output_contracts.json`**

```json
{
  "scripts/ahrefs_verification.py": {
    "output_files": [
      {
        "name": "ahrefs_verify_pass4.json",
        "schema": "verification_report_v1",
        "required": true,
        "encoding": "utf-8"
      }
    ],
    "exit_codes": {
      "0": "Success - verification completed",
      "1": "System error - verification failed"
    }
  }
}
```

### Execution Contract Validation

**When a script runs:**
1. ✓ Script file exists
2. ✓ Exit code is 0
3. ✓ Expected output files exist
4. ✓ Output files are valid JSON
5. ✓ JSON contains required fields (timestamp, etc)

**If any check fails:**
- Create SYSTEM incident immediately
- Write to `/observability/incidents/system/YYYY-MM-DD/`
- Append to `execution_log.jsonl`
- Fail CI explicitly

---

## Failure Classification Model

### Decision Tree

```
Did the script execute?
├─ NO (timeout, not found, permission denied)
│  └─ CREATE SYSTEM INCIDENT
│     └─ incident_type: "SYSTEM"
│     └─ error_code: TIMEOUT | SCRIPT_NOT_FOUND | PERMISSION_ERROR
│     └─ Escalation: FAIL CI immediately
│
└─ YES (process completed)
   ├─ Exit code != 0?
   │  └─ CREATE SYSTEM INCIDENT
   │     └─ incident_type: "SYSTEM"
   │     └─ error_code: NON_ZERO_EXIT
   │     └─ Escalation: FAIL CI immediately
   │
   └─ Exit code == 0?
      ├─ Output file missing?
      │  └─ CREATE SYSTEM INCIDENT
      │     └─ incident_type: "SYSTEM"
      │     └─ error_code: MISSING_OUTPUT
      │     └─ Escalation: FAIL CI immediately
      │
      └─ Output file exists?
         ├─ Invalid JSON?
         │  └─ CREATE SYSTEM INCIDENT
         │     └─ incident_type: "SYSTEM"
         │     └─ error_code: INVALID_SCHEMA
         │     └─ Escalation: FAIL CI immediately
         │
         └─ Valid JSON?
            ├─ Analyze SEO metrics
            │  ├─ Broken links > 0?
            │  │  └─ CREATE SEO INCIDENT
            │  │     └─ incident_type: "SEO"
            │  │     └─ Escalation: Create GitHub issue
            │  │
            │  └─ No regressions?
            │     └─ LOG SUCCESS
            │     └─ Continue pipeline
```

### Incident Types

**SYSTEM Incidents:**
- Execution layer failures
- Infrastructure problems
- Runtime errors
- Configuration issues
- **Location:** `/observability/incidents/system/`
- **Escalation:** FAIL CI
- **Action:** Fix orchestration/infrastructure

**SEO Incidents:**
- Domain-level regressions
- Broken links
- Thin content
- Sitemap mismatches
- **Location:** `/observability/incidents/seo/`
- **Escalation:** Create GitHub issue
- **Action:** Fix SEO content

---

## Execution Error Schema

**File: `/observability/incidents/system/2026-05-16/14-35-00_exec-20260516-001.json`**

```json
{
  "incident_id": "exec-20260516-001",
  "timestamp": "2026-05-16T14:35:00Z",
  "incident_type": "SYSTEM",
  "severity": "high",
  "error_details": {
    "script_name": "scripts/verify_pass4.py",
    "exit_code": 1,
    "error_code": "NON_ZERO_EXIT",
    "stderr_preview": "ERROR: timeout connecting to API"
  },
  "execution_context": {
    "workflow_run": "https://github.com/.../actions/runs/12345",
    "triggered_by": "schedule",
    "platform": "ubuntu-latest"
  },
  "remediation_steps": [
    "Check network connectivity",
    "Review script logs in stderr",
    "Increase timeout if needed"
  ]
}
```

---

## Directory Structure

```
/observability/
├── config/
│   ├── execution.config.json           ← Execution layer config
│   ├── output_contracts.json           ← Script output contracts
│   └── incident.config.json
├── incidents/
│   ├── system/                         ← SYSTEM incidents only
│   │   ├── 2026-05-16/
│   │   │   ├── 14-35-00_exec-20260516-001.json
│   │   │   ├── 14-35-00_exec-20260516-001_stderr.log
│   │   │   └── ...
│   │   └── ...
│   └── seo/                            ← SEO incidents only
│       └── ...
└── reports/
    ├── execution_log.jsonl             ← Append-only execution trace
    ├── execution_metrics.json          ← Health metrics
    └── ...
```

---

## Success Criteria

### Reliability
- ✅ Success rate > 99% (2 failures per 200 invocations acceptable)
- ✅ All failures classified as SYSTEM or SEO
- ✅ No ambiguous or unclassified incidents

### Determinism
- ✅ Identical inputs → Identical outputs
- ✅ No non-deterministic behavior
- ✅ Reproducible execution traces

### Safety
- ✅ Zero inline script execution
- ✅ All scripts invoked via file paths
- ✅ All data exchange via validated JSON files
- ✅ Subprocess isolation always enforced

### Observability
- ✅ All invocations logged to `execution_log.jsonl`
- ✅ All failures create incident objects
- ✅ Metrics available for monitoring
- ✅ Complete audit trail

### Failure Isolation
- ✅ SYSTEM failures never trigger SEO remediation
- ✅ SEO failures never trigger infrastructure alerts
- ✅ Clear routing based on incident type

---

## Testing the Execution Layer

### Test 1: Safe Invocation

```powershell
# This should succeed
$success = Invoke-SafeScript `
    -ScriptPath "scripts/ahrefs_verification.py" `
    -ExpectedOutputFiles @("ahrefs_verification_report.json")

Assert-True $success
```

### Test 2: Non-Existent Script

```powershell
# This should create SYSTEM incident
$success = Invoke-SafeScript `
    -ScriptPath "scripts/nonexistent.py"

Assert-False $success
Assert-PathExists "observability/incidents/system/$(Get-Date -Format 'yyyy-MM-dd')"
```

### Test 3: Timeout Handling

```powershell
# This should timeout and create SYSTEM incident
$success = Invoke-SafeScript `
    -ScriptPath "scripts/long-running.py" `
    -TimeoutSeconds 1

Assert-False $success
```

### Test 4: Output Validation

```powershell
# Missing output file = SYSTEM incident
$success = Invoke-SafeScript `
    -ScriptPath "scripts/broken.py" `
    -ExpectedOutputFiles @("required_output.json")

Assert-False $success
```

---

## Migration Path

**For existing scripts:**

1. Add output contract to `output_contracts.json`
2. Ensure script writes JSON output files
3. Ensure script exits with code 0 on success
4. Replace inline invocation with `Invoke-SafeScript`
5. Test with execution layer

**Example:**

**Before:**
```powershell
$text = Get-Content script.py -Raw
& python -c $text
```

**After:**
```powershell
. scripts/execution-layer.ps1
Invoke-SafeScript -ScriptPath "scripts/script.py"
```

---

## Key Takeaways

| Aspect | Before | After |
|--------|--------|-------|
| **Execution Model** | String-based | File-based |
| **Boundaries** | Unclear | Explicit |
| **Error Classification** | Unclassified | SYSTEM/SEO |
| **Failure Handling** | Ad-hoc | Structured |
| **Observability** | None | Complete audit trail |
| **Quote Escaping Issues** | Common | Eliminated |
| **Subprocess Isolation** | None | Always enforced |
| **Incident Tracking** | Manual | Automatic |

---

This architecture ensures your SEO verification system remains **reliable, deterministic, and safe** regardless of orchestration complexity.
