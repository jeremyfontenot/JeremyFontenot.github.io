# Automation Commit abc123

Commit: abc123 (example)

Summary: Added `Generate-BaselineReport.ps1` which collects Intune compliance metrics, MFA status, and exports a summary CSV used in the baseline report.

Files changed:
- scripts/Generate-BaselineReport.ps1 (new)
- reports/baseline-2024-10-05.csv (generated)

Snippet:

```powershell
# Collect Intune compliance and export CSV
Get-IntuneDeviceCompliancePolicy | Export-Csv -Path reports\baseline-$(Get-Date -Format yyyy-MM-dd).csv -NoTypeInformation
```

Notes: This commit was part of the Oct 2024 rollout and used by the operations team to track progress.

