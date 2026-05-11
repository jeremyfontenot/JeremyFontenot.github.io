# M365 Personal Cloud Lab

A fully automated Microsoft 365 Business Premium environment built using PowerShell‑only
administration across Microsoft Graph, Exchange Online, Teams, Intune, and SharePoint.

---

## Lab Architecture Overview

**Tenant:** jeremyfontenot.online  
**Documentation Site:** https://jeremyfontenot.sharepoint.com/sites/M365-Documentation  

- **Users:** user1@jeremyfontenot.online, user2@jeremyfontenot.online  
- **Security Group:** Lab‑Security‑Users  
- **M365 Group / Team:** Lab‑M365‑Group (General, IT‑Operations)  
- **Shared Mailbox:** labshared@jeremyfontenot.online  
- **Conditional Access:** Require MFA for All Users  
- **Intune:** Win10 Compliance Baseline + Update Ring  
- **SharePoint:** Communication site for documentation  

---

## Security Posture Summary

- MFA enforced for all users via a single Conditional Access policy  
- Non‑default directory roles removed  
- Shared mailbox auditing enabled  
- Intune compliance requires password + idle lock  
- Automated Windows Update Ring  
- SharePoint documentation site isolated  

---

## Admin Skills Demonstrated

- Microsoft Graph SDK (users, groups, CA, Intune, SharePoint file upload)  
- Exchange Online PowerShell (shared mailbox, permissions, auditing)  
- Teams provisioning via Graph  
- Intune policy creation and assignment  
- SharePoint Online site creation and automation  
- Conditional Access configuration  
- Tenant hygiene and idempotent scripting  

---

## Resume‑Ready Summary

Built a complete Microsoft 365 Business Premium lab using PowerShell only:
automated identity, access, Exchange, Teams, Intune, and SharePoint; enforced MFA;
created shared mailbox and Teams structure; deployed baseline device policies; and
produced structured documentation artifacts.

---

## PowerShell Modules Used

- Microsoft.Graph  
- ExchangeOnlineManagement  
- MicrosoftTeams  
- Microsoft.Online.SharePoint.PowerShell  
