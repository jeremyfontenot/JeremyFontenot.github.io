# Microsoft 365 License and Service Plan Proof Export

## Purpose

This folder contains read-only Microsoft Graph PowerShell exports for Microsoft 365 subscribed SKUs, service plans, and sanitized user license assignment review.

## What This Evidence Validates

This export can validate:

- Microsoft 365 subscribed SKU inventory
- SKU capability state
- Consumed and available license units
- Service plan inventory
- Sanitized user license assignment review
- PowerShell transcript evidence of the read-only export session

## Files Created

- subscribed-skus.json
- subscribed-skus-summary.csv
- subscribed-sku-service-plans.csv
- user-license-assignments-sanitized.csv
- user-license-assignments-sanitized.json
- license-export-errors.csv
- entra-license-proof-summary.json
- entra-license-proof-transcript-20260605-063412.txt

## Sanitization Notes

User principal names are reduced to domain-only values. This preserves proof of license review without exposing unnecessary account-level details.

## Scope Note

This export is read-only. It supports portfolio proof of Microsoft 365 license review and tenant administration awareness.
