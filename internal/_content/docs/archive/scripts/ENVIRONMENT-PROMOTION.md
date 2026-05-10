# Environment Promotion

Use `scripts/promote-site.ps1` to promote the current site into a local environment folder (or production repo) and automatically set `SITE_ENV`.

## Environments

- dev -> `C:\\Users\\jeremyfontenot\\jeremyfontenot-site-source`
- uat -> `C:\Users\jeremyfontenot\site-environments\uat`
- staging -> `C:\Users\jeremyfontenot\site-environments\staging`
- production -> `C:\Users\jeremyfontenot\GitHub\JeremyFontenot.github.io`

## Examples

```powershell
# Promote source to local UAT folder
pwsh -File .\scripts\promote-site.ps1 -Environment uat

# Promote source to local staging folder
pwsh -File .\scripts\promote-site.ps1 -Environment staging

# Promote source to GitHub Pages production repo (local only until you push)
pwsh -File .\scripts\promote-site.ps1 -Environment production

# Override target path explicitly
pwsh -File .\scripts\promote-site.ps1 -Environment staging -TargetRoot C:\temp\my-staging-site
```

## Notes

- Promotion uses `robocopy /MIR` and excludes `.git` from mirroring.
- `index.html` in the target is updated to set `const SITE_ENV = '<environment>'`.
- For production, this updates files in your local production repo only. It does not push.
