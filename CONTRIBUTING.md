# Contributing

## Workflow

- Keep changes small and focused.
- Check git status before starting work.
- Use branches and pull requests when branch protection requires it.
- Do not move public files unless references are updated.
- Validate before committing.

## Validation

Run before commit:

git status
git diff --check

For JavaScript:
node --check .\path\to\file.js

For PowerShell:
pwsh -NoProfile -File .\scripts\validation\validate-powershell.ps1

## Commit Standard

Use clear commit messages.
