# Evidence Redaction Report

Generated: 2026-05-04

Summary
- Redacted artifacts: 23 files created under `evidence/public/`.
- Index regenerated: `evidence/index.json` (9 items).
- Redaction approach: automated regex-based sanitizer produced safe public copies by removing or replacing sensitive identifiers with `[REDACTED]` and commenting out direct connection lines.

Redaction categories
- Verifier identities / reviewer names: replaced with `[redacted]`.
- Internal SR/ticket references: redacted or replaced with generic text.
- Account UPNs / email addresses: removed or replaced with `[REDACTED]`.
- Credentials / connection strings: commented out and annotated as `[REDACTED]`.

Notable files (examples)
- `rca-2025-02-10.yaml` — verifier and SR text redacted.
- `remediation-disable-transportrule.ps1` — connection UPN commented and marked `[REDACTED]`.
- `intune-profile-sample.yaml` & `intune-validate-2024-10-05.log` — verifier redacted; reproduce steps left generic.

Recommendations
- Review `evidence/public/` for any domain-specific tokens you want preserved or further redacted.
- If you want a less conservative publish (expose verifier initials or ticket IDs), indicate which items to allow and I can re-run a selective redaction.

Per-file notes (automated selections)
```
See evidence/public/ for a full list of redacted artifacts. Files include: 
ad-migration-plan-2023-06-21.yaml, ad-migration-plan.md, automation-commit-abc123.*, automation-run-2024-10-05.log,
gpo-template-StandardDesktop.*, incident-2025-02-10-logs.*, intune-profile-sample.*, m365-baseline-report-2024-10-05.*,
prepost-audit-summary.*, rca-2025-02-10.*, remediation-disable-transportrule.*
```

Contact
- If you'd like me to publish these to the public site branch or create a selective allow-list, tell me which items to include.
