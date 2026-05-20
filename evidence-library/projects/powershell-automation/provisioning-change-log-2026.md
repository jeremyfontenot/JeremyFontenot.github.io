---
title: Provisioning Change Log — 2026
type: notes
tags: [provisioning, change-log, powershell]
---

# Provisioning change log

This change log records approved changes to the provisioning automation used in the lab and test environments. Entries include scope, author, validation steps, and rollback guidance.

## 2026-04-12 — Draft v1.0
- Author: Jeremy Fontenot
- Scope: Initial provisioning automation for user onboarding and group assignment using PowerShell script `powershell-automation-provisioning-script-v1.ps1`.
- Changes: Added parameterization for OU placement, group assignment, and license SKU mapping. Introduced idempotent checks for existing accounts.
- Validation: Created three test accounts, verified group membership and license assignment, validated conditional access policy exemptions applied correctly.
- Rollback: Remove created test accounts using the included `-RemoveTestUsers` parameter and restore previous group membership from exported CSV.

## 2026-05-02 — Patch v1.1
- Author: Jeremy Fontenot
- Scope: Harden script logging and error handling.
- Changes: Added structured log output, exit codes, and safe-mode dry-run flag for review before changes.
- Validation: Ran dry-run against staging OU, reviewed structured logs, executed live run for two sample accounts, confirmed expected changes.
- Rollback: No stateful database changes; account reversions performed via `Remove-UserFromGroups` helper script as needed.

## Notes
- All runs must be executed from a secured admin host with the delegated service account. Store logs under evidence-library/scripts/logs/ with the run date.
