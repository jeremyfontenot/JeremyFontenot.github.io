# Exchange Admin Center Mail-Enabled Security Group Check

## Purpose
Document whether SG-Block-Legacy-Auth appeared in Exchange admin center under mail-enabled security groups.

## Date captured
2026-06-05 08:06:18

## Result
The Exchange admin center Mail-enabled security tab was blank or did not list SG-Block-Legacy-Auth.

## Interpretation
SG-Block-Legacy-Auth appears to be an Entra ID security group, not a mail-enabled Exchange security group.

## Evidence Value
This confirms that Exchange admin center group evidence and Entra ID group evidence represent different group scopes:
- Exchange admin center: Microsoft 365 groups and mail-enabled security/distribution groups
- Entra admin center / Microsoft Graph: directory security groups, Microsoft 365 groups, role/security targeting groups

## Related Evidence
- entra-groups.csv
- entra-group-membership.csv
- exchange-admin-center-microsoft-365-groups-20260605.png
- exchange-admin-center-microsoft-365-groups-export-20260605.csv
