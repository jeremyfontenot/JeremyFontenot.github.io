---
title: Security Policy
description: Security reporting and handling guidance for the portfolio repository.
owner: jeremyfontenot
classification: policy
lifecycle: active
archiveStatus: live
---

# Security Policy

## Reporting concerns

Report suspected exposed secrets, broken redactions, unsafe artifacts, or public link issues to `contact@jeremyfontenot.online`.

## Scope

Security issues in this repository usually involve one of the following:

- unintended public exposure of credentials or tokens
- broken redaction in evidence or archived exports
- unsafe links to external systems or generated artifacts
- deployment drift that changes public site behavior

## Handling guidance

- Do not delete evidence files to hide a problem.
- Preserve the original artifact and mark the issue for archival review.
- If a file must be replaced, keep the original path stable until references are updated.
- Use the report-first workflow before making broad path changes.

## Response expectations

The repository is static and GitHub Pages-based, so issues are usually handled by updating HTML, markdown, or generated artifacts rather than by changing server configuration.
