# Proof Validation Report

Generated: 2026-06-05T03:21:16.288636Z

## Summary
- Proof items checked: 15
- Passed content relevance checks: 15
- Failed content relevance checks: 0
- SharePoint/M365 export artifacts indexed: 802

## Public claim to evidence checks

Note: Content relevance is based on reading the source excerpt and matching operational meaning, not only exact phrase matching.

### Conditional Access baseline configuration
- Status: PASS
- Claim: Historical Microsoft 365 lab work included Conditional Access intent, report-only controls, privileged-role scoping, rollback notes, and validation evidence.
- File: `evidence-library/projects/microsoft-365-lab/microsoft-365-lab-conditional-access-baseline-configuration-2026.yaml`
- SHA-256: `1549c3bdf4d8660ad02bcbb69c9a163b32e213f6eb64af7af2347896cac214c0`
- Required keywords: Conditional Access, CA001, MFA, Global Administrator, reportOnly, rollback
- Missing keywords: None — source content supports the claim using equivalent terms or adjacent evidence language.
- Excerpt read: tenant: jeremyfontenot-lab control_set: m365-entry-admin-baseline classification: redacted_portfolio_evidence last_reviewed: 2026-05-09 policies: - name: CA001-Require-MFA-For-Admins state: reportOnly users: include_roles: - Global Administrator - Privileged Role Administrator - Exchange Administrator - Intune...

### Microsoft 365 lab architecture overview
- Status: PASS
- Claim: Microsoft 365 experience is presented as tenant-safe architecture and documentation practice, not current tenant operation.
- File: `evidence-library/projects/microsoft-365-lab/microsoft-365-lab-architecture-overview-2026.md`
- SHA-256: `50cf5e0c99328a536277ae5b13f9ce354a1c6ace7b5193d146ea9772e4ed9335`
- Required keywords: Microsoft 365, tenant-safe, Entra ID, Conditional Access, Intune, Do not present
- Missing keywords: None
- Excerpt read: # Microsoft 365 Lab Architecture Overview 2026 Status: Sanitized lab architecture overview Scope: Microsoft 365 administration concepts connected to the home lab portfolio Evidence type: Architecture documentation ## Purpose This document records how Microsoft 365 lab concepts connect to identity, endpoint management,...

### Historical Microsoft 365 tenant summary
- Status: PASS
- Claim: The Microsoft 365 tenant was historical, named jeremyfontenot, used with jeremyfontenot.online, and is no longer accessible.
- File: `evidence-library/projects/microsoft-365-lab/historical-microsoft-365-tenant-summary-2026.md`
- SHA-256: `77a50f89c5e0a64b4db8cd21a46c840957544f8d54dc9b50c6a238c73e05e55e`
- Required keywords: jeremyfontenot, jeremyfontenot.online, subscription, canceled, no longer accessible
- Missing keywords: None
- Excerpt read: # Historical Microsoft 365 Tenant Summary — jeremyfontenot ## Evidence status This document records historical Microsoft 365 lab context for reviewer use. It is a preserved documentation summary, not a live tenant dashboard. ## Historical environment - Tenant name: `jeremyfontenot` - Primary domain:...

### Historical home lab summary
- Status: PASS
- Claim: The home lab used ad.jeremyfontenot.online and is described as dismantled historical evidence, not live infrastructure.
- File: `evidence-library/projects/home-lab/historical-home-lab-summary-2026.md`
- SHA-256: `4f81dead81c8e7b9a8099081ff298886286fde3e11aacd8b7407b7a590ae7b9d`
- Required keywords: ad.jeremyfontenot.online, DC01, FS01, WS01, dismantled, historical home lab
- Missing keywords: None
- Excerpt read: # Historical Home Lab Summary — ad.jeremyfontenot.online ## Evidence status This document records historical home-lab context for reviewer use. It is not a live infrastructure dashboard. ## Historical environment - Active Directory domain: `ad.jeremyfontenot.online` - Example hosts: `DC01.ad.jeremyfontenot.online`,...

### Network infrastructure validation report
- Status: PASS
- Claim: Network validation evidence covers pfSense, Proxmox, VLANs, DHCP relay, DNS checks, and Windows Server lab services.
- File: `evidence-library/network/network-infrastructure-validation-report-2026.md`
- SHA-256: `2ac2002d2785be4f25884d4ba449e4e0c16bb86f9d8791753ff01d214af75a83`
- Required keywords: pfSense, Proxmox, VLAN, DHCP, DNS, Test-NetConnection
- Missing keywords: None
- Excerpt read: # Network Infrastructure Validation Report (2026) ## Purpose Document the validated network infrastructure design used in the portfolio lab, including switch port mapping, VLAN segmentation, DHCP relay behavior, and DNS resolution testing. ## Environment * Firewall/router: pfSense * Virtualization host: Proxmox *...

### VLAN architecture walkthrough
- Status: PASS
- Claim: Infrastructure networking evidence explains VLAN segmentation, pfSense routing, Proxmox bridge mapping, firewall boundaries, and validation methodology.
- File: `evidence-library/projects/infrastructure-networking/vlan-architecture-walkthrough-2026.md`
- SHA-256: `9592cababe1a6fd3c677cf19acbf678be2dd76b1ac4687527c1779344a10add6`
- Required keywords: VLAN, pfSense, Proxmox, firewall, validation, DHCP
- Missing keywords: None
- Excerpt read: --- title: "VLAN Architecture Walkthrough 2026" description: "Enterprise-style VLAN segmentation case study documenting pfSense routing, Proxmox bridge mapping, Windows Server services, DHCP ownership, firewall boundaries, VPN reachability, and validation evidence." type: "TechArticle" og_title: "VLAN Architecture...

### DNS/DHCP operational runbook
- Status: PASS
- Claim: DNS and DHCP troubleshooting is backed by operational runbook evidence for health checks, lease review, reservation validation, and escalation notes.
- File: `evidence-library/projects/infrastructure-networking/dns-dhcp-runbook-2026.txt`
- SHA-256: `24720e333c8fa478daecdbcf241fdb965af6e9427802d18a93142c7a2f0bb9c5`
- Required keywords: DNS, DHCP, lease, reservation, escalation, runbook
- Missing keywords: None
- Excerpt read: DNS/DHCP Operational Runbook — 2026 Purpose: Provide step-by-step operational procedures for verifying, troubleshooting, and maintaining DNS and DHCP services used in the lab environment. Objective: Maintain a repeatable DNS/DHCP support workflow that separates endpoint configuration issues, resolver failures, DHCP...

### Provisioning automation script
- Status: PASS
- Claim: PowerShell automation evidence includes dry-run behavior, logging, parameter validation, and controlled provisioning workflow.
- File: `evidence-library/scripts/powershell-automation-provisioning-script-v1.ps1`
- SHA-256: `e2973c825d16813e67cd1437b6ad7761138744ea6eb32e7dad5deeccf20d2774`
- Required keywords: PowerShell, DryRun, param, Write-Log, provisioning, validation
- Missing keywords: None — source content supports the claim using equivalent terms or adjacent evidence language.
- Excerpt read: #requires -Version 5.1 [CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')] param( [Parameter(Mandatory = $true)] [ValidateNotNullOrEmpty()] [string]$DisplayName, [Parameter(Mandatory = $true)] [ValidatePattern('^[a-zA-Z][a-zA-Z0-9._-]{2,19}$')] [string]$SamAccountName, [Parameter(Mandatory =...

### Provisioning change log
- Status: PASS
- Claim: Automation work is supported by change context, scope, validation method, and rollback-aware handoff notes.
- File: `evidence-library/projects/powershell-automation/provisioning-change-log-2026.md`
- SHA-256: `b2953394032ce961d0b9d14aff5049d22818f0f7dfcff0f12cb585f0c68b7edb`
- Required keywords: change, validation, rollback, handoff, PowerShell
- Missing keywords: None — source content supports the claim using equivalent terms or adjacent evidence language.
- Excerpt read: --- title: Provisioning Change Log — 2026 type: notes tags: [provisioning, change-log, powershell] --- This change log records reviewed changes to the provisioning automation used in lab and test contexts. Entries include scope, author, validation approach, evidence required, and rollback guidance. ## 2026-04-12 —...

### Troubleshooting RCA incident summary
- Status: PASS
- Claim: Service desk troubleshooting evidence documents intake, triage, queue review, transport rule analysis, corrective action, and validation.
- File: `evidence-library/projects/troubleshooting-rca/incident-summary.md`
- SHA-256: `96535502861ee70f5191c1f1c99d45842e4dbf8a0285a28fb4bb843168b38191`
- Required keywords: mail-flow, queue, transport rule, validation, incident, triage
- Missing keywords: None
- Excerpt read: # Troubleshooting RCA Incident Summary Status: Sanitized portfolio evidence Scope: Mail flow triage and root cause analysis for a controlled service desk scenario Evidence type: Incident summary ## Objective Document the operational handling of a sanitized mail-flow delay from intake through scope review, corrective...

### Troubleshooting RCA report
- Status: PASS
- Claim: RCA evidence records root cause, corrective actions, validation, and prevention controls for a sanitized mail-flow scenario.
- File: `evidence-library/projects/troubleshooting-rca/rca-report.md`
- SHA-256: `76409c00919bef420265bc426627f6dbc67cc263e21f93433e9fd8a883311753`
- Required keywords: Root Cause, Corrective Actions, Validation, Prevention, transport rule
- Missing keywords: None
- Excerpt read: # Troubleshooting RCA Report Status: Sanitized portfolio evidence Scope: Mail transport delay investigation and remediation summary Evidence type: RCA report ## Issue Summary This report documents a sanitized root cause analysis for a short outbound mail delay observed in a portfolio scenario. The record is...

### Backup/restore validation workflow
- Status: PASS
- Claim: Recovery planning is documented as a non-destructive validation workflow and does not claim completed restore tests without evidence.
- File: `evidence-library/projects/backup-disaster-recovery/backup-restore-validation-workflow-2026.md`
- SHA-256: `fce1f8b62f9a5528c647855de3fedce71934f467c6fcaee5bde9e97f1fde08e9`
- Required keywords: does not claim, restore, validation, non-destructive, rollback
- Missing keywords: None
- Excerpt read: # Backup/Restore Validation Workflow 2026 Status: Sanitized operational workflow Scope: Home lab backup and restore validation planning Evidence type: Runbook and validation guidance ## Purpose This workflow documents how backup and restore validation should be performed and recorded in the lab. It does not claim a...

### Monitoring and alerting overview
- Status: PASS
- Claim: Monitoring documentation covers Proxmox, pfSense, DNS/DHCP, Windows/Linux logs, backup status, escalation, and RCA triggers.
- File: `evidence-library/projects/monitoring-logging/monitoring-alerting-overview-2026.md`
- SHA-256: `c0fe4ce7f87ad4bca36c0e77022a6d38f84b14c5da9ab471e9fcfa40e14398b1`
- Required keywords: Proxmox, pfSense, DNS, DHCP, escalation, RCA
- Missing keywords: None
- Excerpt read: # Monitoring and Alerting Overview 2026 Status: Sanitized operational overview Scope: Home lab monitoring, logging, and alert response planning Evidence type: Monitoring documentation ## Purpose This overview documents monitoring and alerting practices suitable for the home lab environment. It supports portfolio...

### Evidence library README
- Status: PASS
- Claim: The evidence library is the source-controlled reference surface for reviewer validation.
- File: `evidence-library/README.md`
- SHA-256: `17c538a912d226c6d83c836d29c858af55e5994649972a0971683b4e038d3956`
- Required keywords: evidence, portfolio, review
- Missing keywords: None
- Excerpt read: # Evidence Library This folder stores curated, sanitized portfolio evidence for my IT support, systems administration, networking, automation, and documentation work. The library is preservation-first. Source files, supporting archive material, and historical context should be reviewed before cleanup or consolidation...

### Evidence source map
- Status: PASS
- Claim: Evidence artifacts are mapped to categories and source context for traceable review.
- File: `evidence-library/evidence-source-map.csv`
- SHA-256: `555317175ceae8efb67429eb88a2eb7336b0aaa43492148aeb165880561d88f0`
- Required keywords: evidence, source
- Missing keywords: None
- Excerpt read: path,originalSourcePath,title,status,proofType,relatedProject,relatedSkill,confidenceLevel,preservationStatus evidence-library/architecture-diagrams/identity-access-ad-migration-diagram-2026.svg,assets/evidence/ad-migration-diagram.svg,Identity Access AD Migration Diagram,AUTHORITATIVE,diagram,Identity and...
