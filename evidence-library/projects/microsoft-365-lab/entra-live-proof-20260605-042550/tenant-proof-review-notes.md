# Microsoft Entra Tenant Proof Review Notes

## Evidence Type

Live Microsoft Graph PowerShell export from Microsoft Entra ID.

## Tenant Identity

- Tenant account used for capture: jeremyfontenot@jeremyfontenot.online
- Organization display name: jeremy fontenot
- Tenant ID: 53598f56-182f-4762-bd05-4586973fb766
- Capture date: 2026-06-05
- Capture method: Microsoft Graph PowerShell delegated read-only session

## What This Evidence Validates

This evidence validates that the Microsoft 365 / Entra lab tenant existed and was accessible through Microsoft Graph PowerShell at the time of capture.

The export provides reviewer-verifiable proof of:

- Microsoft Entra tenant access
- Custom domain association with jeremyfontenot.online
- Tenant organization metadata
- Verified domain records
- User object inventory
- Group object inventory
- Directory role inventory
- Enterprise application / service principal inventory
- Subscribed SKU records
- PowerShell transcript evidence of the export session

## Files Included

- tenant-organization.json
- tenant-domains.csv
- entra-users-sanitized.csv
- entra-groups.csv
- entra-directory-roles.csv
- enterprise-apps-sanitized.csv
- m365-subscribed-skus.csv
- entra-proof-summary.json
- entra-proof-transcript-20260605-042550.txt
- README.md

## Sanitization Notes

The user export intentionally reduces user principal names to domain-only values. This preserves proof of tenant domain structure without exposing unnecessary account-level details.

## Portfolio Claim Supported

This evidence supports the claim that the Microsoft 365 tenant named around Jeremy Fontenot and the custom domain jeremyfontenot.online were used as a personal Microsoft cloud administration lab.

It does not claim enterprise production ownership, client tenant administration, or active paid subscription status beyond what is shown in the exported SKU and tenant records.
