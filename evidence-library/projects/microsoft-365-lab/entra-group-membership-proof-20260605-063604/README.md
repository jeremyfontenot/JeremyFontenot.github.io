# Microsoft Entra Group Membership Proof Export

## Purpose

This folder contains read-only Microsoft Graph PowerShell exports for Microsoft Entra group inventory and sanitized group membership review.

## What This Evidence Validates

This export can validate:

- Entra group inventory
- Security-enabled group review
- Microsoft 365 group review
- Group membership review
- Sanitized user membership visibility
- PowerShell transcript evidence of the read-only export session

## Files Created

- groups-summary.csv
- groups-summary.json
- group-members-sanitized.csv
- group-members-sanitized.json
- group-membership-export-errors.csv
- entra-group-membership-proof-summary.json
- entra-group-membership-proof-transcript-20260605-063604.txt

## Sanitization Notes

User principal names are reduced to domain-only values. This preserves proof of group membership review without exposing unnecessary account-level details.

## Scope Note

This export is read-only. It supports portfolio proof of Microsoft Entra group administration and access review awareness.
