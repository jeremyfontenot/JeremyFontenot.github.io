# Microsoft Entra Directory Role Assignment Proof Export

## Purpose

This folder contains read-only Microsoft Graph PowerShell exports for Microsoft Entra directory roles and role membership review.

## What This Evidence Validates

This export can validate:

- Entra directory role inventory
- Directory role assignment review
- Sanitized role membership visibility
- Least-privilege and privileged-access review awareness
- PowerShell transcript evidence of the read-only export session

## Files Created

- directory-roles.csv
- directory-role-members-sanitized.csv
- directory-role-members-sanitized.json
- role-assignment-export-errors.csv
- entra-role-assignment-proof-summary.json
- entra-role-assignment-proof-transcript-20260605-063046.txt

## Sanitization Notes

User principal names are reduced to domain-only values when available. This preserves proof of role review without exposing unnecessary account-level details.

## Scope Note

This export is read-only. It supports portfolio proof of Microsoft Entra privileged role review and identity administration awareness.
