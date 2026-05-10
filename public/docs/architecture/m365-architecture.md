# M365 Personal Cloud Lab Architecture

Enterprise-scale M365 lab built on Microsoft 365 Business Premium (tenant: jeremyfontenot.online),
demonstrating complete identity, access, Exchange, Teams, Intune, and SharePoint automation using
PowerShell and Microsoft Graph exclusively.

---

## Core Architecture

- **Identity:** Entra ID  
- **Security:** Conditional Access (MFA enforcement)  
- **Messaging:** Exchange Online  
- **Collaboration:** Teams  
- **Device Management:** Intune  
- **Content:** SharePoint Online documentation site  
- **Automation:** Microsoft Graph SDK + PowerShell 7  

---

## Architecture Diagram

[Microsoft 365 Tenant: jeremyfontenot.online]
|
[Entra ID]
|--- Users / Groups / Roles
|--- Conditional Access (MFA)
|
[Exchange Online]
|--- Shared Mailbox
|
[Teams]
|--- Team + Channels
|
[Intune]
|--- Compliance Baseline
|--- Update Ring
|
[SharePoint Online]
|--- Documentation Site

---

## Evidence Excerpts

> “Enterprise-scale M365 lab built on Microsoft 365 Business Premium (tenant: jeremyfontenot.online)…”  
> “Configured Conditional Access (MFA enforcement), Intune compliance policies…”  
> “Documentation preserved in the M365 archive…”  
