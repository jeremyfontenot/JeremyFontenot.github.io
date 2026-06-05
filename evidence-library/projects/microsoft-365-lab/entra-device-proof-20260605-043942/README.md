# Microsoft Entra Device and Intune Proof Export

## Purpose

This folder contains read-only Microsoft Graph PowerShell exports for Microsoft Entra device inventory and Intune managed device inventory.

## What This Evidence Validates

This export can validate:

- Entra registered device inventory
- Device operating system metadata
- Device trust type metadata
- Approximate last sign-in metadata where available
- Intune managed device inventory where licensing and access allow it
- Intune access or licensing limitations if the managed device export fails
- PowerShell transcript evidence of the read-only export session

## Files Created

- entra-directory-devices.json
- entra-directory-devices.csv
- intune-managed-devices.json
- intune-managed-devices.csv
- device-export-errors.csv
- entra-device-proof-summary.json
- entra-device-proof-transcript-20260605-043942.txt

## Scope Note

This export is read-only. It supports portfolio proof of endpoint inventory review and Microsoft cloud device administration awareness. Empty or failed Intune managed-device exports should be represented as license/access limitations, not as successful Intune management evidence.
