# Intune Managed Device Proof Fallback Export

## Purpose

This folder contains a corrected read-only Microsoft Graph PowerShell export for Intune managed device inventory.

## What This Evidence Validates

This export can validate:

- Intune managed device inventory, if available
- Device compliance state
- Device management agent
- Enrollment date
- Last sync date
- Azure AD / Entra device linkage
- Sanitized user principal domain association
- Intune access or licensing limitations if the export fails

## Scope Note

This export is read-only. Empty or failed Intune results should be represented as licensing, access, or tenant-state limitations, not as successful Intune management proof.
