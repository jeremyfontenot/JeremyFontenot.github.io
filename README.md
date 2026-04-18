# Jeremy Fontenot Site Source

This repository contains the source for my personal website and its published GitHub Pages mirror.

## Live Site

- https://jeremyfontenot.online

## What This Site Includes

- A personal portfolio homepage
- Project and lab documentation links
- Brand assets and certification imagery
- Static HTML, CSS, and supporting scripts

## Local Workflow

Build minified frontend assets before publishing:

```powershell
pwsh -File .\scripts\build-minified-assets.ps1
```

The site is promoted from this source folder into the GitHub Pages repository with:

```powershell
pwsh -File .\scripts\promote-site.ps1 -Environment production
```

That copies the current site into the production repo and updates the environment flag for the live site.

## Notes

- Image paths use the published repository casing.
- The production repo is mirrored from this source before publishing.
- Large generated documentation files are excluded from the live publish path.
