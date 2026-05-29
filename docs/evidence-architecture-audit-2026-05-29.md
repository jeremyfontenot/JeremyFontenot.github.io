# Evidence Architecture Audit - 2026-05-29

Scope: public Markdown files outside `node_modules`.

Classification definitions:

- Indexable content: public documentation suitable for discovery or human review.
- Supporting evidence: proof files that support a project, skill, or case study.
- Generated artifact: generated or compatibility material that should stay public but should not be treated as primary portfolio copy.
- Validation artifact: checklist, health report, audit report, or validation methodology.
- Log file: incident or operational log material.

## Classification

| File | Classification | Notes |
|---|---|---|
| `README.md` | Indexable content | Repository overview. |
| `CONTRIBUTING.md` | Indexable content | Contribution and maintenance guidance. |
| `.github/README.md` | Supporting evidence | Workflow/context documentation. |
| `assets/README.md` | Supporting evidence | Asset inventory guidance. |
| `scripts/README.md` | Supporting evidence | Script inventory guidance. |
| `docs/README.md` | Indexable content | Documentation folder overview. |
| `docs/portfolio-content-audit-2026-05-29.md` | Validation artifact | Content, UX, accessibility, and SEO findings report. |
| `docs/evidence-architecture-audit-2026-05-29.md` | Validation artifact | Evidence classification and architecture report. |
| `artifacts/README.md` | Validation artifact | Artifact folder guidance. |
| `artifacts/dashboard/repository-health.md` | Validation artifact | Repository health output. |
| `docs/projects/ad-migration/artifacts/change-record.md` | Supporting evidence | Historical AD change record source. |
| `docs/projects/rca-and-provisioning/artifacts/dns-authentication-playbook.md` | Supporting evidence | Historical troubleshooting playbook source. |
| `docs/projects/rca-and-provisioning/artifacts/rca-2417.md` | Supporting evidence | Historical RCA source. |
| `evidence/experience/automation-commit-abc123.md` | Generated artifact | Duplicate public automation commit note retained for compatibility. |
| `evidence/public/ad-migration-plan.md` | Supporting evidence | Public identity migration planning artifact. |
| `evidence/public/automation-commit-abc123.md` | Generated artifact | Search Console-reported artifact; now linked from proof and PowerShell case study. |
| `evidence/public/m365-baseline-report-2024-10-05.md` | Supporting evidence | Public Microsoft 365 baseline evidence. |
| `evidence/public/rca-2025-02-10.md` | Supporting evidence | Public RCA evidence. |
| `evidence-library/README.md` | Indexable content | Canonical evidence-library standard. |
| `evidence-library/archive/README.md` | Supporting evidence | Archive guidance. |
| `evidence-library/projects/README.md` | Indexable content | Project evidence standard. |
| `evidence-library/projects/backup-disaster-recovery/backup-restore-validation-workflow-2026.md` | Validation artifact | Recovery validation methodology. |
| `evidence-library/projects/identity-access/identity-access-change-record-notes-2026.md` | Supporting evidence | Active Directory case-study evidence. |
| `evidence-library/projects/infrastructure-networking/pfsense-network-segmentation-diagram-2026.md` | Supporting evidence | Search Console-reported artifact; now linked from proof, projects, and pfSense case study. |
| `evidence-library/projects/infrastructure-networking/vlan-architecture-walkthrough-2026.md` | Supporting evidence | Network and Proxmox-adjacent walkthrough. |
| `evidence-library/projects/microsoft-365-lab/microsoft-365-lab-architecture-overview-2026.md` | Supporting evidence | Microsoft 365 case-study evidence. |
| `evidence-library/projects/monitoring-logging/monitoring-alerting-overview-2026.md` | Supporting evidence | Monitoring operations evidence. |
| `evidence-library/projects/powershell-automation/provisioning-change-log-2026.md` | Supporting evidence | PowerShell case-study evidence. |
| `evidence-library/projects/troubleshooting-rca/dns-authentication-playbook-2026.md` | Supporting evidence | Troubleshooting playbook. |
| `evidence-library/projects/troubleshooting-rca/incident-summary.md` | Supporting evidence | RCA project evidence. |
| `evidence-library/projects/troubleshooting-rca/post-incident-review.md` | Supporting evidence | RCA closure evidence. |
| `evidence-library/projects/troubleshooting-rca/rca-report.md` | Supporting evidence | RCA report. |
| `evidence-library/projects/troubleshooting-rca/remediation-plan.md` | Supporting evidence | RCA remediation evidence. |
| `evidence-library/projects/troubleshooting-rca/troubleshooting-notes.md` | Supporting evidence | Troubleshooting notes. |
| `evidence-library/projects/troubleshooting-rca/validation-checklist.md` | Validation artifact | RCA validation checklist. |
| `evidence-library/skills/README.md` | Indexable content | Skills evidence overview. |
| `evidence-library/skills/dns-dhcp/dns-dhcp-operational-runbook-2026.md` | Supporting evidence | DNS/DHCP runbook. |
| `evidence-library/skills/service-desk-support/service-desk-network-troubleshooting-workflow-2026.md` | Supporting evidence | Service desk workflow runbook. |
| `evidence-library/validation-reports/network-validation-checklist-2026.md` | Validation artifact | Network validation methodology. |

## Architecture Decisions

- Keep evidence artifacts public for inspection.
- Use public HTML pages as discovery and context surfaces instead of turning every evidence artifact into a duplicate SEO landing page.
- Treat generated or duplicate public artifacts as supporting evidence, not primary project pages.
- Keep case studies focused on interpretation and evidence routing; do not duplicate project listings from `projects.html`.

## Changes Made

- Added direct public links to `pfsense-network-segmentation-diagram-2026.md` from `proof.html`, `projects.html`, and the pfSense case study.
- Added direct public links to `automation-commit-abc123.md` from `proof.html` and the PowerShell case study.
- Added evidence navigation cards where they improve context without inflating claims.
