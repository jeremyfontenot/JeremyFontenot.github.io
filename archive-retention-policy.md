---
title: Archive Retention Policy
description: Preservation policy for legacy exports, evidence, and historical archives.
owner: jeremyfontenot
classification: policy
lifecycle: active
archiveStatus: live
---

# Archive Retention Policy

## Purpose

This policy defines how legacy exports, archived documentation, and evidence artifacts are retained in a way that preserves auditability and deployment safety.

## Policy statements

- Archive zones are immutable by default.
- Do not delete archived SharePoint exports, validation artifacts, or redacted evidence unless a verified retention decision says they are redundant.
- Prefer preserving the original artifact and documenting the reason for retention.
- If a historical file is superseded, keep the older copy until references and compliance needs are reviewed.

## Archive zones

- `/_content/` holds historical source exports and legacy page trees.
- `/archive/` is the target zone for any future approved archival relocation.
- `internal/` may hold inventory files that describe archived content, but it is not itself an archive of public documentation.

## Retention guidance

- Preserve evidence artifacts referenced by published documentation.
- Preserve SharePoint exports and source snapshots that demonstrate history or provenance.
- Preserve validation outputs if they explain why a file or path was normalized.
- Do not replace historical file names unless a migration plan keeps backward compatibility.

## Exception process

Any archive move or retirement should be reviewed against these questions:

1. Does the file support published documentation or auditability?
2. Is there a canonical replacement path already in the repo?
3. Will changing the file break a published reference or archived provenance trail?
4. Is the proposed action a move, not a delete?

If any answer is uncertain, preserve the file and document the uncertainty.
