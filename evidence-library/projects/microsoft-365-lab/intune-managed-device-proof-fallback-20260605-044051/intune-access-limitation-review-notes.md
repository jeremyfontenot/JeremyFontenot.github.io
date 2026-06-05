# Intune Managed Device Export Limitation Notes

## Evidence Type

Microsoft Graph PowerShell attempted export of Intune managed device inventory.

## Capture Result

The export attempted to query Intune managed devices using Microsoft Graph delegated access.

The request returned an authorization failure from the Microsoft Intune device management endpoint.

## What This Evidence Validates

This evidence validates:

- Microsoft Graph PowerShell access was available.
- The tenant was reachable through Microsoft Graph.
- The Intune managed device endpoint was contacted.
- The export attempt was performed in a controlled, read-only manner.
- Intune managed device inventory could not be exported from the current tenant state due to authorization, licensing, or service access limitations.

## What This Evidence Does Not Validate

This evidence does not validate:

- Active Intune device management
- Managed device enrollment
- Device compliance policy deployment
- Successful Intune inventory access

## Supporting Files

- intune-managed-device-proof-fallback-transcript-20260605-044051.txt
- intune-managed-device-proof-summary.json
- intune-managed-devices.json
- intune-managed-devices-sanitized.csv

## Portfolio Claim Supported

This artifact should only be used as evidence of attempted Intune inventory validation and awareness of Microsoft Graph / Intune access boundaries.

It should not be presented as proof of successful Intune managed device administration.
