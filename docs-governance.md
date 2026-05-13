---
title: Documentation Governance
description: Canonical repository contract and policy guidance for published documentation.
owner: jeremyfontenot
classification: policy
lifecycle: active
archiveStatus: live
---

# Documentation Governance

## Canonical repository contract

This repository uses a conservative contract so public documentation can evolve without disturbing archived exports or deployment paths.

### Source directories

- `docs/` is the canonical documentation source for published portfolio content.
- `assets/` contains public-safe media, logos, certificates, and downloads.
- `evidence/` contains redacted evidence assets and supporting thumbnails.
- `scripts/` contains PowerShell automation, report generation, and remediation tooling.
- `.github/` contains repository automation and CI workflows.

### Generated directories

- `public/` contains deployment-safe generated content.
- `internal/` contains audit outputs, inventories, reports, and validation artifacts.
- `internal/reports/phase2/` is the current normalization and cleanup report set.

### Archive zones

- `/_content/` is an immutable historical source tree for legacy documentation exports.
- `/archive/` is the preferred future home for any explicitly approved archival material.
- Archive content is preserved, not deleted, unless a verified cleanup path is approved.

### Deployment boundaries

- GitHub Pages entry points must remain stable.
- Root HTML pages and `docs/` pages should continue resolving after any change.
- Public-safe assets should remain addressable by their current URLs until references are migrated.
- No workflow should mutate archive zones automatically.

### Naming conventions

- Use lowercase letters for new filenames and folders.
- Prefer hyphen-separated names for public content.
- Avoid new spaces, underscores, and mixed casing in public paths.

## Content taxonomy

- **Published docs**: end-user and recruiter-facing pages under `docs/`.
- **Public assets**: images, PDFs, and diagrams under `assets/` and `evidence/`.
- **Generated outputs**: reports, validation data, and inventories under `internal/`.
- **Historical exports**: legacy SharePoint and source exports under `/_content/` or `/archive/`.

## CI validation expectations

CI should run in report-first mode and preserve artifacts for review.

Expected checks:

- duplicate inventory via SHA256 hashing
- orphan asset detection for HTML, markdown, images, PDFs, and scripts
- reference graph generation with inbound and outbound counts
- broken relative path detection for canonical documentation
- filename compliance reporting
- markdown linting for public docs and repo governance files

## Review standard

If a change touches links or file names, update the report set and confirm the public site still renders correctly before merging.
