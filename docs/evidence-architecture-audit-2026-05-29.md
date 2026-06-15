# Evidence Architecture Audit - 2026-05-29

## Scope

Public Markdown files outside `node_modules`.

## Classification Definitions

- Indexable content: public documentation suitable for discovery or human review.
- Supporting evidence: proof files that support a project, skill, or case study.
- Generated artifact: generated or compatibility material that should stay public but should not be treated as primary portfolio copy.
- Validation artifact: checklist, health report, audit report, or validation methodology.
- Log file: incident or operational log material.

## Reviewer Notes

- Keep evidence artifacts public for inspection unless they expose sensitive data.
- Treat this file as a classification audit, not a claim-expansion source.
- Do not use generated artifacts or duplicate compatibility files as primary portfolio copy.
- Keep public claims tied to repository-local proof files and visible limitations.

## Classification

### Indexable Content

#### `README.md`

- Classification: Indexable content.
- Notes: Repository overview.

#### `CONTRIBUTING.md`

- Classification: Indexable content.
- Notes: Contribution and maintenance guidance.

#### `docs/README.md`

- Classification: Indexable content.
- Notes: Documentation folder overview.

#### `evidence-library/README.md`

- Classification: Indexable content.
- Notes: Canonical evidence-library standard.

#### `evidence-library/projects/README.md`

- Classification: Indexable content.
- Notes: Project evidence standard.

#### `evidence-library/skills/README.md`

- Classification: Indexable content.
- Notes: Skills evidence overview.

### Supporting Evidence

#### `.github/README.md`

- Classification: Supporting evidence.
- Notes: Workflow/context documentation.

#### `assets/README.md`

- Classification: Supporting evidence.
- Notes: Asset inventory guidance.

#### `scripts/README.md`

- Classification: Supporting evidence.
- Notes: Script inventory guidance.

#### `docs/projects/ad-migration/artifacts/change-record.md`

- Classification: Supporting evidence.
- Notes: Historical AD change record source.

#### `docs/projects/rca-and-provisioning/artifacts/dns-authentication-playbook.md`

- Classification: Supporting evidence.
- Notes: Historical troubleshooting playbook source.

#### `docs/projects/rca-and-provisioning/artifacts/rca-2417.md`

- Classification: Supporting evidence.
- Notes: Historical RCA source.

#### `evidence/public/ad-migration-plan.md`

- Classification: Supporting evidence.
- Notes: Public identity migration planning artifact.

#### `evidence/public/m365-baseline-report-2024-10-05.md`

- Classification: Supporting evidence.
- Notes: Public Microsoft 365 baseline evidence.

#### `evidence/public/rca-2025-02-10.md`

- Classification: Supporting evidence.
- Notes: Public RCA evidence.

#### `evidence-library/archive/README.md`

- Classification: Supporting evidence.
- Notes: Archive guidance.

#### `evidence-library/projects/identity-access/identity-access-change-record-notes-2026.md`

- Classification: Supporting evidence.
- Notes: Active Directory case-study evidence.

#### `evidence-library/projects/infrastructure-networking/pfsense-network-segmentation-diagram-2026.md`

- Classification: Supporting evidence.
- Notes: Search Console-reported artifact; now linked from proof, projects, and pfSense case study.

#### `evidence-library/projects/infrastructure-networking/vlan-architecture-walkthrough-2026.md`

- Classification: Supporting evidence.
- Notes: Network and Proxmox-adjacent walkthrough.

#### `evidence-library/projects/microsoft-365-lab/microsoft-365-lab-architecture-overview-2026.md`

- Classification: Supporting evidence.
- Notes: Microsoft 365 case-study evidence.

#### `evidence-library/projects/monitoring-logging/monitoring-alerting-overview-2026.md`

- Classification: Supporting evidence.
- Notes: Monitoring operations evidence.

#### `evidence-library/projects/powershell-automation/provisioning-change-log-2026.md`

- Classification: Supporting evidence.
- Notes: PowerShell case-study evidence.

#### `evidence-library/projects/troubleshooting-rca/dns-authentication-playbook-2026.md`

- Classification: Supporting evidence.
- Notes: Troubleshooting playbook.

#### `evidence-library/projects/troubleshooting-rca/incident-summary.md`

- Classification: Supporting evidence.
- Notes: RCA project evidence.

#### `evidence-library/projects/troubleshooting-rca/post-incident-review.md`

- Classification: Supporting evidence.
- Notes: RCA closure evidence.

#### `evidence-library/projects/troubleshooting-rca/rca-report.md`

- Classification: Supporting evidence.
- Notes: RCA report.

#### `evidence-library/projects/troubleshooting-rca/remediation-plan.md`

- Classification: Supporting evidence.
- Notes: RCA remediation evidence.

#### `evidence-library/projects/troubleshooting-rca/troubleshooting-notes.md`

- Classification: Supporting evidence.
- Notes: Troubleshooting notes.

#### `evidence-library/skills/dns-dhcp/dns-dhcp-operational-runbook-2026.md`

- Classification: Supporting evidence.
- Notes: DNS/DHCP runbook.

#### `evidence-library/skills/service-desk-support/service-desk-network-troubleshooting-workflow-2026.md`

- Classification: Supporting evidence.
- Notes: Service desk workflow runbook.

### Generated Artifacts

#### `evidence/experience/automation-commit-abc123.md`

- Classification: Generated artifact.
- Notes: Duplicate public automation commit note retained for compatibility.

#### `evidence/public/automation-commit-abc123.md`

- Classification: Generated artifact.
- Notes: Search Console-reported artifact; now linked from proof and PowerShell case study.

### Validation Artifacts

#### `docs/portfolio-content-audit-2026-05-29.md`

- Classification: Validation artifact.
- Notes: Content, UX, accessibility, and SEO findings report.

#### `docs/evidence-architecture-audit-2026-05-29.md`

- Classification: Validation artifact.
- Notes: Evidence classification and architecture report.

#### `artifacts/README.md`

- Classification: Validation artifact.
- Notes: Artifact folder guidance.

#### `artifacts/dashboard/repository-health.md`

- Classification: Validation artifact.
- Notes: Repository health output.

#### `evidence-library/projects/backup-disaster-recovery/backup-restore-validation-workflow-2026.md`

- Classification: Validation artifact.
- Notes: Recovery validation methodology.

#### `evidence-library/projects/troubleshooting-rca/validation-checklist.md`

- Classification: Validation artifact.
- Notes: RCA validation checklist.

#### `evidence-library/validation-reports/network-validation-checklist-2026.md`

- Classification: Validation artifact.
- Notes: Network validation methodology.

## Architecture Decisions

- Keep evidence artifacts public for inspection.
- Use public HTML pages as discovery and context surfaces instead of turning every evidence artifact into a duplicate SEO landing page.
- Treat generated or duplicate public artifacts as supporting evidence, not primary project pages.
- Keep case studies focused on interpretation and evidence routing; do not duplicate project listings from `projects.html`.

## Changes Made

- Added direct public links to `pfsense-network-segmentation-diagram-2026.md` from `proof.html`, `projects.html`, and the pfSense case study.
- Added direct public links to `automation-commit-abc123.md` from `proof.html` and the PowerShell case study.
- Added evidence navigation cards where they improve context without inflating claims.
