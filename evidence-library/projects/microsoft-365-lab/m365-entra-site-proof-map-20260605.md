# Microsoft 365 / Entra Site Proof Map

Date: 2026-06-05

Last reviewed: 2026-06-15

## Purpose

This control document maps public portfolio claims to repository-local Microsoft 365 / Entra proof files. It exists to prevent unsupported public wording from appearing on the portfolio.

Public Microsoft 365 / Entra claims must remain:

- Repository-local.
- Evidence-backed.
- Limited to the proof files listed here.
- Clear about lab scope and documented limitations.

## Scope Boundaries

### Supported Scope

- Personal Microsoft 365 / Entra cloud administration lab.
- Read-only Microsoft Graph PowerShell evidence capture.
- Tenant inventory review.
- Identity and access review.
- Conditional Access review.
- Security group targeting.
- App governance review.
- License review.
- Sign-in and audit review.
- Admin center evidence.
- Exchange admin center evidence.
- Sanitized exports.
- SHA-256 proof records.

### Unsupported Scope

- Production tenant administration.
- Client tenant administration.
- Enterprise impact metrics.
- Managed Intune fleet.
- Full endpoint management.
- Active home lab infrastructure.
- Proxmox, pfSense, VLAN, or AD DS home lab proof inside this Microsoft 365 / Entra proof scope.
- Current SharePoint availability.

## Reviewer Notes

- Public claims must be backed by repository-local proof files, not memory, intent, screenshots stored elsewhere, or undocumented prior work.
- Proof files listed here are the claim boundary for the Microsoft 365 / Entra public surface.
- Do not upgrade lab evidence into production, client, enterprise, SOC, uptime, or business-impact language.
- Do not use Microsoft 365 / Entra proof to support Proxmox, pfSense, VLAN, or AD DS home lab claims unless a separate on-prem home lab evidence file supports that claim.
- SHA-256 records support integrity review for recorded files; they are not a tamper-proof guarantee beyond the captured hashes.
- Intune evidence is limited to the documented validation attempt and limitation notes. It does not support managed Intune fleet administration.
- Conditional Access wording must describe exported policy review and exported policy state. It must not imply client production enforcement or broad enterprise enforcement metrics.
- If a referenced proof file is missing during future review, keep the reference visible and mark it as missing instead of deleting it.

## Supported Claims

### Microsoft Graph PowerShell Evidence Capture

- Public claim: Microsoft Graph PowerShell evidence capture.
- Proof file: `m365-entra-live-proof-summary-20260605.md`
- Proof type: Summary with capture method.
- Supported wording: Performed read-only Microsoft Graph PowerShell evidence capture from a personal Microsoft 365 / Entra tenant.
- Page using claim: `index.html`, `projects.html`, `resume.html`

### Tenant Identity and Organization Inventory

- Public claim: Tenant identity and organization inventory.
- Proof file: `evidence/entra-exports-20260605-073748/tenant-organization-domains-skus.json`
- Proof type: JSON export.
- Supported wording: Reviewed tenant ID, tenant account, organization display name, verified domains, and subscribed SKU records.
- Page using claim: `index.html`, `projects.html`, `proof.html`, `resume.html`

### Verified Domains

- Public claim: Verified domains.
- Proof file: `evidence/entra-exports-20260605-073748/tenant-organization-domains-skus.json`
- Proof type: JSON export.
- Supported wording: Verified two domains including `jeremyfontenot.online`.
- Page using claim: `index.html`, `dashboard.html`, `projects.html`

### Users and Groups

- Public claim: Users and groups.
- Proof files:
  - `evidence/entra-exports-20260605-073748/entra-users-license-state.csv`
  - `evidence/entra-exports-20260605-073748/entra-groups.csv`
- Proof type: Sanitized CSV exports.
- Supported wording: Reviewed seven user license-state rows and eight group rows.
- Page using claim: `projects.html`, `proof.html`, `resume.html`

### Directory Role Review

- Public claim: Directory role review.
- Proof files:
  - `evidence/entra-exports-20260605-073748/entra-directory-roles.csv`
  - `evidence/entra-exports-20260605-073748/entra-directory-role-assignments.csv`
- Proof type: CSV exports.
- Supported wording: Reviewed directory roles and role assignment records for privileged-access awareness.
- Page using claim: `projects.html`, `proof.html`, `resume.html`

### Application Governance / Service Principals

- Public claim: Application governance / service principals.
- Proof files:
  - `evidence/entra-exports-20260605-073748/entra-service-principals.csv`
  - `entra-application-proof-20260605-063206/enterprise-applications-summary.csv`
- Proof type: CSV exports.
- Supported wording: Reviewed enterprise applications and service principals for governance awareness.
- Page using claim: `projects.html`, `proof.html`, `dashboard.html`

### App Registrations

- Public claim: App registrations.
- Proof files:
  - `evidence/entra-exports-20260605-073748/entra-applications.csv`
  - `entra-application-proof-20260605-063206/app-registrations-summary.csv`
- Proof type: CSV exports.
- Supported wording: Reviewed eight app registration records.
- Page using claim: `projects.html`, `dashboard.html`

### OAuth Grants

- Public claim: OAuth grants.
- Proof file: `entra-application-proof-20260605-063206/oauth2-permission-grants-summary.csv`
- Proof type: CSV export.
- Supported wording: Reviewed 16 OAuth permission grant records.
- Page using claim: `projects.html`, `dashboard.html`

### License and Service Plan Review

- Public claim: License and service plan review.
- Proof files:
  - `evidence/entra-exports-20260605-073748/tenant-organization-domains-skus.json`
  - `entra-license-proof-20260605-063412/subscribed-sku-service-plans.csv`
- Proof type: JSON and CSV exports.
- Supported wording: Reviewed three subscribed SKUs, 68 service plans, and one licensed user record.
- Page using claim: `projects.html`, `dashboard.html`, `resume.html`

### Conditional Access Review

- Public claim: Conditional Access review.
- Proof files:
  - `evidence/entra-exports-20260605-073748/entra-conditional-access-policies-summary.csv`
  - `evidence/entra-exports-20260605-073748/entra-conditional-access-policies.json`
- Proof type: CSV and JSON exports.
- Supported wording: Reviewed exported Conditional Access policy records, including enabled policy rows.
- Page using claim: `index.html`, `projects.html`, `proof.html`, `resume.html`

### Security Group Targeting

- Public claim: Security group targeting.
- Proof files:
  - `evidence/entra-exports-20260605-073748/entra-sg-block-legacy-auth-group.csv`
  - `evidence/entra-exports-20260605-073748/entra-sg-block-legacy-auth-members.csv`
- Proof type: CSV exports.
- Supported wording: Reviewed SG-Block-Legacy-Auth group targeting and membership evidence.
- Page using claim: `index.html`, `projects.html`, `proof.html`, `resume.html`

### Authentication and Security Policy Review

- Public claim: Authentication and security policy review.
- Proof files:
  - `evidence/entra-exports-20260605-073748/entra-authentication-methods-policy.json`
  - `evidence/entra-exports-20260605-073748/entra-authorization-policy-security-defaults.json`
- Proof type: JSON exports.
- Supported wording: Reviewed authentication-method policy and authorization/security-defaults state.
- Page using claim: `projects.html`, `proof.html`, `resume.html`

### Audit and Sign-In Log Review

- Public claim: Audit and sign-in log review.
- Proof files:
  - `evidence/entra-exports-20260605-073748/entra-signins-last-30-days.csv`
  - `evidence/entra-exports-20260605-073748/entra-directory-audit-last-30-days.csv`
- Proof type: CSV exports.
- Supported wording: Reviewed sign-in and directory audit visibility from exported records.
- Page using claim: `projects.html`, `proof.html`, `dashboard.html`, `resume.html`

### Device Inventory Review

- Public claim: Device inventory review.
- Proof files:
  - `evidence/entra-exports-20260605-073748/entra-devices.csv`
  - `entra-device-proof-20260605-043942/entra-device-proof-summary.json`
- Proof type: CSV and JSON exports.
- Supported wording: Reviewed Entra device inventory.
- Page using claim: `projects.html`, `proof.html`, `resume.html`

### Intune Validation Limitation

- Public claim: Intune validation limitation.
- Proof files:
  - `intune-managed-device-proof-fallback-20260605-044051/README.md`
  - `intune-managed-device-proof-fallback-20260605-044051/intune-managed-device-proof-summary.json`
- Proof type: Limitation note and JSON summary.
- Supported wording: Documented Intune managed-device validation attempt with access/licensing or API-scope limitation.
- Page using claim: `proof.html`, `resume.html`

### Microsoft 365 Admin Center Evidence

- Public claim: Microsoft 365 admin center evidence.
- Proof files:
  - `evidence/entra-exports-20260605-073748/m365-admin-center-homepage-20260605.png`
  - `evidence/entra-exports-20260605-073748/m365-admin-center-domains-jeremyfontenot-online-20260605.png`
  - `evidence/entra-exports-20260605-073748/m365-admin-center-licenses-20260605.png`
- Proof type: Screenshots.
- Supported wording: Reviewed Microsoft 365 admin center access, domain visibility, license visibility, users, and groups.
- Page using claim: `index.html`, `proof.html`, `resume.html`, `contact.html`

### Exchange Admin Center Evidence

- Public claim: Exchange admin center evidence.
- Proof files:
  - `evidence/entra-exports-20260605-073748/exchange-admin-center-microsoft-365-groups-20260605.png`
  - `evidence/entra-exports-20260605-073748/exchange-admin-center-microsoft-365-groups-export-20260605.csv`
  - `evidence/entra-exports-20260605-073748/exchange-online-powershell-connection-attempt.md`
- Proof type: Screenshot, CSV export, documentation note.
- Supported wording: Reviewed Exchange admin center Microsoft 365 groups evidence and connection-attempt documentation.
- Page using claim: `projects.html`, `proof.html`, `resume.html`

### SHA-256 Proof Integrity

- Public claim: SHA-256 proof integrity.
- Proof files:
  - `m365-entra-proof-hashes-20260605.csv`
  - `evidence/entra-exports-20260605-073748/microsoft-365-lab-evidence-manifest-20260605.csv`
- Proof type: Hash CSV and manifest.
- Supported wording: Maintained SHA-256 indexed proof records for evidence integrity review.
- Page using claim: `index.html`, `proof.html`, `dashboard.html`, `resume.html`

### Proof Inventory Count

- Public claim: Proof inventory count.
- Proof files:
  - `m365-entra-proof-inventory-20260605.csv`
  - `m365-entra-proof-hashes-20260605.csv`
- Proof type: Inventory and hash CSVs.
- Supported wording: Dashboard counts represent captured evidence inventory and hash records only.
- Page using claim: `dashboard.html`, `proof.html`

## Unsupported Claims

### Microsoft Graph PowerShell Evidence Capture

- Unsupported wording to avoid: Production tenant administration; client tenant administration.

### Tenant Identity and Organization Inventory

- Unsupported wording to avoid: Enterprise tenant ownership; paid subscription claim beyond exported SKU records.

### Verified Domains

- Unsupported wording to avoid: Current SharePoint availability; production domain administration.

### Users and Groups

- Unsupported wording to avoid: Managed workforce; enterprise user population.

### Directory Role Review

- Unsupported wording to avoid: Production privileged-access program ownership.

### Application Governance / Service Principals

- Unsupported wording to avoid: Client app governance; production app portfolio ownership.

### App Registrations

- Unsupported wording to avoid: Built or operated all app registrations in production.

### OAuth Grants

- Unsupported wording to avoid: Enterprise consent program ownership.

### License and Service Plan Review

- Unsupported wording to avoid: Current paid subscription status beyond exported records.

### Conditional Access Review

- Unsupported wording to avoid: Client production enforcement; broad enterprise enforcement metrics.

### Security Group Targeting

- Unsupported wording to avoid: Organization-wide endpoint fleet management.

### Authentication and Security Policy Review

- Unsupported wording to avoid: Security program ownership in production.

### Audit and Sign-In Log Review

- Unsupported wording to avoid: SOC ownership; enterprise detection metrics.

### Device Inventory Review

- Unsupported wording to avoid: Managed Intune fleet; full endpoint management.

### Intune Validation Limitation

- Unsupported wording to avoid: Active Intune administration; managed Intune fleet.

### Microsoft 365 Admin Center Evidence

- Unsupported wording to avoid: Current SharePoint hosting; production administration.

### Exchange Admin Center Evidence

- Unsupported wording to avoid: Exchange production administration; mail-flow ownership metrics.

### SHA-256 Proof Integrity

- Unsupported wording to avoid: Tamper-proof guarantee beyond recorded hashes.

### Proof Inventory Count

- Unsupported wording to avoid: Employment metrics; client impact metrics; production uptime metrics.

## Safe Portfolio Language

Use wording such as:

- Reviewed exported Microsoft 365 / Entra records.
- Documented tenant inventory, identity records, groups, roles, applications, licenses, devices, sign-ins, and audit logs.
- Captured read-only evidence from a personal Microsoft 365 / Entra lab tenant.
- Validated exported records against repository-local proof files.
- Mapped public claims to repository-local proof.
- Maintained SHA-256 indexed proof records for evidence integrity review.
- Documented Intune managed-device validation limitations.
- Reviewed exported Conditional Access policy records and related security policy state.
- Evidence-backed portfolio documentation.

## Language to Avoid

Avoid wording that implies:

- Managed enterprise environment.
- Owned production tenant.
- Implemented across organization.
- Reduced risk by X%.
- Improved uptime.
- SOC monitoring or SOC ownership.
- Managed Intune fleet.
- Production deployment.
- Client environment.
- Production tenant administration.
- Enterprise tenant ownership.
- Full endpoint management.
- Current SharePoint availability.
- Tamper-proof guarantee beyond recorded hashes.
- Enterprise impact metrics.
