# Scripts Directory

This folder contains operational, validation, audit, deployment, and testing scripts for the portfolio repository.

## Folder Layout

| Folder | Purpose |
|---|---|
| automation | Operational automation scripts and reusable PowerShell or CLI tasks |
| audits | Repository, content, accessibility, SEO, and evidence inventory audits |
| deployment | Deployment helpers and release support scripts |
| lighthouse | Browser, screenshot, Lighthouse, and visual validation scripts |
| utilities | Shared helper scripts that support other tooling |
| validation | Repository policy checks, link checks, syntax checks, and pre-commit validation |

## Rules

- Keep public website code in assets, not scripts.
- Keep evidence documents in evidence or evidence-library, not scripts.
- Move one script at a time.
- Check references before moving files.
- Validate after every move.
- Commit small, focused changes.
- Do not move files referenced by public pages, metadata, or evidence indexes unless references are updated in the same commit.

## Recommended Validation

Before committing script changes, run:

```powershell
git status
git diff --check
```

For JavaScript files, run:

```powershell
node --check .\path\to\script.js
```

For PowerShell files, run:

```powershell
Get-Command .\path\to\script.ps1
```

## Naming Standard

Use descriptive lowercase names with hyphens when creating new scripts.

Examples:

```text
validate-public-links.ps1
generate-evidence-index.ps1
capture-proof-screenshots.js
run-lighthouse-audit.js
```
