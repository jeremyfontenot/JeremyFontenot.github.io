# Microsoft Entra Activity Proof Export

## Purpose

This folder contains read-only Microsoft Graph PowerShell exports for Microsoft Entra audit and sign-in activity.

## What This Evidence Validates

This export can validate:

- Recent Microsoft Entra directory audit activity
- Recent tenant sign-in activity, if available in the tenant retention window
- Graph PowerShell delegated access
- Tenant activity-log visibility
- Troubleshooting awareness for audit/sign-in log retrieval

## Files Created

- directory-audits-recent.json
- directory-audits-recent.csv
- sign-ins-recent.json
- sign-ins-recent.csv
- activity-export-errors.csv
- entra-activity-proof-summary.json
- entra-activity-proof-transcript-20260605-043730.txt

## Scope Note

This export is read-only. It should be used to support Microsoft Entra monitoring, audit review, and identity operations awareness. Empty sign-in or audit exports should be represented as retention/access limitations, not as proof of missing tenant activity.
