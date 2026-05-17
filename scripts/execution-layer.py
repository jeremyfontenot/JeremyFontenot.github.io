#!/usr/bin/env python3
"""
Execution Layer Hardening - Python Module

Safe subprocess invocation with strict safety guardrails:
- File-based execution only (no inline scripts)
- Subprocess isolation
- Output contract validation
- Explicit error classification (SYSTEM vs SEO)
- Full observability logging

Part of the production-grade execution layer hardening architecture.
"""

import subprocess
import json
import sys
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple


class ExecutionLayerConfig:
    """Load and manage execution layer configuration."""
    
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = Path(__file__).parent.parent / "observability" / "config" / "execution.config.json"
        
        self.config_path = Path(config_path)
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Load execution configuration."""
        if not self.config_path.exists():
            return {"execution_layer": {"enabled": True, "strict_mode": True}}
        
        with open(self.config_path) as f:
            return json.load(f)
    
    def get(self, key: str, default=None):
        """Get configuration value."""
        parts = key.split(".")
        value = self.config
        for part in parts:
            if isinstance(value, dict):
                value = value.get(part)
            else:
                return default
        return value if value is not None else default


class OutputContracts:
    """Load and manage output contracts for scripts."""
    
    def __init__(self, contracts_path: str = None):
        if contracts_path is None:
            contracts_path = Path(__file__).parent.parent / "observability" / "config" / "output_contracts.json"
        
        self.contracts_path = Path(contracts_path)
        self.contracts = self._load_contracts()
    
    def _load_contracts(self) -> Dict:
        """Load output contracts."""
        if not self.contracts_path.exists():
            return {"contracts": {}, "schemas": {}}
        
        with open(self.contracts_path) as f:
            return json.load(f)
    
    def get_contract(self, script_name: str) -> Optional[Dict]:
        """Get contract for a specific script."""
        return self.contracts.get("contracts", {}).get(script_name)


def invoke_subprocess_safely(
    script_name: str,
    args: Dict = None,
    timeout_seconds: int = 300,
    expected_output_files: List[str] = None,
    validate_schema: bool = True,
    execution_context: str = "python"
) -> Tuple[bool, Optional[Dict]]:
    """
    Invoke a script in a safe, isolated subprocess.
    
    This is the ONLY permitted way to invoke external scripts.
    
    Args:
        script_name: Name of script file (must exist)
        args: Dict of CLI arguments to pass
        timeout_seconds: Timeout in seconds
        expected_output_files: List of expected output files
        validate_schema: Whether to validate output JSON schema
        execution_context: Context identifier for logging
    
    Returns:
        Tuple of (success: bool, error_object: Optional[Dict])
    """
    
    config = ExecutionLayerConfig()
    contracts = OutputContracts()
    
    if args is None:
        args = {}
    if expected_output_files is None:
        expected_output_files = []
    
    # 1. VALIDATION PHASE - Script existence
    script_path = Path("scripts") / script_name
    if not script_path.exists():
        error = {
            "error_id": f"exec-{datetime.now().strftime('%Y%m%d')}-001",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "incident_type": "SYSTEM",
            "severity": "high",
            "error_class": "ExecutionFailure",
            "error_code": "SCRIPT_NOT_FOUND",
            "script_name": script_name,
            "script_path": str(script_path),
            "execution_context": execution_context
        }
        log_execution_error(error)
        return False, error
    
    # 2. BUILD COMMAND (never embed in script!)
    command = [sys.executable, str(script_path)]
    for key, value in args.items():
        command.append(f"--{key}")
        command.append(str(value))
    
    # 3. EXECUTE IN SUBPROCESS
    start_time = datetime.now()
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            check=False  # Don't raise on non-zero exit
        )
    except subprocess.TimeoutExpired:
        error = {
            "error_id": f"exec-{datetime.now().strftime('%Y%m%d')}-002",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "incident_type": "SYSTEM",
            "severity": "high",
            "error_class": "ExecutionFailure",
            "error_code": "TIMEOUT",
            "script_name": script_name,
            "timeout_seconds": timeout_seconds,
            "execution_context": execution_context
        }
        log_execution_error(error)
        return False, error
    except Exception as e:
        error = {
            "error_id": f"exec-{datetime.now().strftime('%Y%m%d')}-003",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "incident_type": "SYSTEM",
            "severity": "high",
            "error_class": "ExecutionFailure",
            "error_code": "EXECUTION_ERROR",
            "script_name": script_name,
            "exception": str(e),
            "execution_context": execution_context
        }
        log_execution_error(error)
        return False, error
    
    duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
    
    # 4. CHECK EXIT CODE
    if result.returncode != 0:
        error = {
            "error_id": f"exec-{datetime.now().strftime('%Y%m%d')}-004",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "incident_type": "SYSTEM",
            "severity": "high",
            "error_class": "ExecutionFailure",
            "error_code": "NON_ZERO_EXIT",
            "script_name": script_name,
            "exit_code": result.returncode,
            "stderr_preview": result.stderr[:500] if result.stderr else "",
            "duration_ms": duration_ms,
            "execution_context": execution_context
        }
        log_execution_error(error)
        return False, error
    
    # 5. VALIDATE OUTPUT FILES
    missing_files = []
    for output_file in expected_output_files:
        if not Path(output_file).exists():
            missing_files.append(output_file)
    
    if missing_files:
        error = {
            "error_id": f"exec-{datetime.now().strftime('%Y%m%d')}-005",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "incident_type": "SYSTEM",
            "severity": "high",
            "error_class": "ExecutionFailure",
            "error_code": "MISSING_OUTPUT",
            "script_name": script_name,
            "expected_files": expected_output_files,
            "missing_files": missing_files,
            "duration_ms": duration_ms,
            "execution_context": execution_context
        }
        log_execution_error(error)
        return False, error
    
    # 6. SCHEMA VALIDATION
    if validate_schema:
        for output_file in expected_output_files:
            output_path = Path(output_file)
            if output_path.exists():
                try:
                    with open(output_path) as f:
                        data = json.load(f)
                    
                    # Basic validation: check required fields
                    if "timestamp" not in data:
                        raise ValueError("Missing 'timestamp' field")
                except json.JSONDecodeError as e:
                    error = {
                        "error_id": f"exec-{datetime.now().strftime('%Y%m%d')}-006",
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "incident_type": "SYSTEM",
                        "severity": "high",
                        "error_class": "ExecutionFailure",
                        "error_code": "INVALID_JSON",
                        "script_name": script_name,
                        "output_file": output_file,
                        "json_error": str(e),
                        "duration_ms": duration_ms,
                        "execution_context": execution_context
                    }
                    log_execution_error(error)
                    return False, error
                except Exception as e:
                    error = {
                        "error_id": f"exec-{datetime.now().strftime('%Y%m%d')}-007",
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "incident_type": "SYSTEM",
                        "severity": "high",
                        "error_class": "ExecutionFailure",
                        "error_code": "SCHEMA_VALIDATION_ERROR",
                        "script_name": script_name,
                        "output_file": output_file,
                        "validation_error": str(e),
                        "duration_ms": duration_ms,
                        "execution_context": execution_context
                    }
                    log_execution_error(error)
                    return False, error
    
    # 7. LOG SUCCESS
    log_execution_success(script_name, duration_ms, execution_context)
    return True, None


def log_execution_success(script_name: str, duration_ms: int, execution_context: str):
    """Log successful script execution."""
    log_entry = {
        "execution_log_id": f"exec-log-{datetime.now().strftime('%Y%m%d')}-{int(datetime.now().timestamp()) % 1000}",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": "success",
        "script_name": script_name,
        "duration_ms": duration_ms,
        "execution_context": execution_context
    }
    
    log_dir = Path("observability/reports")
    log_dir.mkdir(parents=True, exist_ok=True)
    
    log_file = log_dir / "execution_log.jsonl"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry) + "\n")
    
    print(f"✓ Execution success: {script_name} ({duration_ms}ms)")


def log_execution_error(error_object: Dict):
    """Log script execution failure and create SYSTEM incident."""
    # Write to execution log
    log_dir = Path("observability/reports")
    log_dir.mkdir(parents=True, exist_ok=True)
    
    log_file = log_dir / "execution_log.jsonl"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(error_object) + "\n")
    
    # Create SYSTEM incident
    incident_dir = Path(f"observability/incidents/system/{datetime.now().strftime('%Y-%m-%d')}")
    incident_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime('%H-%M-%S')
    incident_id = error_object.get("error_id", f"exec-{datetime.now().strftime('%Y%m%d')}-000")
    incident_file = incident_dir / f"{timestamp}_{incident_id}.json"
    
    incident = {
        "incident_id": incident_id,
        "timestamp": error_object.get("timestamp"),
        "incident_type": "SYSTEM",
        "classification": "execution_failure",
        "severity": "high",
        "error_details": error_object,
        "status": "open",
        "requires_seo_fix": False,
        "requires_system_fix": True
    }
    
    with open(incident_file, "w", encoding="utf-8") as f:
        json.dump(incident, f, indent=2)
    
    print(f"✗ Execution failed: {error_object.get('error_code')} - {error_object.get('script_name')}", file=sys.stderr)
    print(f"  Incident: {incident_file}", file=sys.stderr)


if __name__ == "__main__":
    print("Execution layer module - use invoke_subprocess_safely() to run scripts")
