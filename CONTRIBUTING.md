---
title: Contributing
description: Repository contribution guidance for the portfolio site.
owner: jeremyfontenot
classification: policy
lifecycle: active
archiveStatus: live
---

# Contributing

## Purpose

This repository is a public portfolio site with archived documentation and evidence. Contributions must preserve deployment safety, evidence integrity, and link stability.

## Working rules

- Treat `docs/` as the canonical documentation source.
- Treat `public/` as deployment-safe generated content.
- Treat `/_content/` and `/archive/` as immutable historical zones unless a path is explicitly verified safe.
- Do not delete evidence, exports, or archive files as part of routine cleanup.
- Prefer archival or quarantine over deletion when a file is uncertain.
- Use lowercase, hyphenated names for new public files and folders.

## Change process

1. Generate or refresh the Phase 2 reports in `internal/reports/phase2/`.
2. Make the smallest safe change needed for the target issue.
3. Verify links, filenames, and markdown formatting before opening a pull request.
4. Keep the public site working on GitHub Pages after the change.

## Review expectations

- Preserve backward compatibility for existing links whenever possible.
- Update the documentation hub when content is added, moved, or renamed.
- Keep public assets in `assets/` unless the site already references a different canonical path.
- Keep generated reports and audits in `internal/`.

## Pull request checklist

- [ ] Reports refreshed or the change was documentation-only.
- [ ] No destructive file removals.
- [ ] Existing public paths still resolve.
- [ ] New filenames follow the naming convention.
- [ ] Markdown links were checked for obvious breakage.
