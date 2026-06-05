# Exchange Online PowerShell Connection Attempt

## Purpose
Document the Exchange Online PowerShell connection attempt during Microsoft 365 lab evidence collection.

## Tenant
- Account: jeremyfontenot@jeremyfontenot.online
- Evidence folder: C:\Users\jeremy\Documents\projects\jeremyfontenot\evidence-library\projects\microsoft-365-lab\evidence\entra-exports-20260605-073748
- Date captured: 2026-06-05 07:54:41

## Result
Exchange Online PowerShell connection failed with a local MSAL / RuntimeBroker / WAM-related token acquisition error.

## Error Summary
Connect-ExchangeOnline failed with:
System.NullReferenceException: Object reference not set to an instance of an object.
RuntimeBroker / MSAL interactive token acquisition failed.

## Validation Note
Exchange admin center remains accessible through the browser, so Exchange evidence should continue through portal screenshots, exported reports, and available admin-center configuration pages.

## Evidence Value
This record documents:
- Attempted Exchange Online PowerShell validation
- Local authentication failure condition
- Fallback validation path through Exchange admin center
