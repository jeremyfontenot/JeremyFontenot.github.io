---
title: Provisioning Change Log — 2026
type: notes
tags: [provisioning, change-log, powershell]
---

 
This change log records reviewed changes to the provisioning automation used in lab and test contexts. Entries include scope, author, validation approach, evidence required, and rollback guidance.

## 2026-04-12 — Draft v1.0

- Author: Jeremy Fontenot
- Objective: Build a repeatable user provisioning workflow that can be reviewed before execution.
- Technical areas: PowerShell, Windows administration, Active Directory-style OU planning, group assignment, logging, dry-run review, and rollback preparation.
- Changes: Added parameterization for OU placement, group assignment, and license SKU mapping. Introduced idempotent checks for existing accounts.
- Validation approach: Run in dry-run mode first, review proposed changes, create sanitized lab test accounts only when authorized, verify expected group membership, and capture logs without secrets.
- Rollback: Remove lab-created test accounts only after confirming scope, then restore previous group membership from the exported CSV if a change was applied.

## 2026-05-02 — Patch v1.1

- Author: Jeremy Fontenot
- Objective: Harden script logging and error handling before broader reuse.
- Technical areas: PowerShell error handling, structured logs, exit codes, safe-mode execution, and change review.
- Changes: Added structured log output, exit codes, and safe-mode dry-run flag for review before changes.
- Validation approach: Run dry-run against a lab OU, inspect structured logs, verify that no unexpected write actions occur in safe mode, and record reviewer notes before any controlled execution.
- Rollback: No stateful database changes are assumed. If lab accounts or groups are changed during controlled execution, reverse only the recorded objects and preserve the rollback log.

## Notes

- Execute only from an authorized lab administration context.
- Store sanitized logs with the run date and remove private identifiers before public portfolio use.
- Do not represent a dry-run, planned run, or script artifact as a completed live onboarding workflow.
