# AD Consolidation & GPO Standardization — Migration Plan

Scope

Consolidate three AD forests into a single consolidated forest and apply a standardized GPO baseline for desktop security.

Timeline

- Discovery & design: Mar 2023
- Pilot: Apr 2023
- Migration & GPO rollout: May–Jun 2023

Deliverables

- Migration runbook
- OU design document
- GPO templates and test plan
- Audit report (pre/post)

Approach

1. Inventory existing domains, OUs, and GPOs.
2. Design target OU structure and GPO baseline with least-privilege intent.
3. Create GPO templates and apply to test OUs.
4. Automate reporting via AD PowerShell scripts.

Artifacts

- `gpo-template-StandardDesktop.xml` — baseline GPO export
- `prepost-audit-summary.csv` — audit metrics before/after


