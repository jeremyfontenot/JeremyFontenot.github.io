# Portfolio-Dev

DevOps and systems administration portfolio site with public documentation, redacted evidence, and archived source exports preserved for auditability.

## Structure

- `index.html`, `contact.html`, `documentation.html`, `projects.html`, `skills.html` - public landing pages
- `docs/` - published documentation and case studies for GitHub Pages
- `assets/` - public-safe images, logos, badges, and downloads
- `evidence/` - redacted evidence assets and thumbnails used by the public site
- `_content/` - archived source documentation and legacy exports
- `internal/` - generated reports, validation outputs, and cleanup notes
- `.github/` - CI workflows and repository automation

## Deployment notes

- `/.nojekyll` keeps GitHub Pages from rewriting the published tree.
- `CNAME` binds the custom domain.
- `docs/source-browser.html` and the archive placeholders exist to preserve internal navigation without publishing the legacy source tree.

## Maintenance guidance

- Keep public-facing content in `docs/`, `assets/`, `evidence/`, `css/`, and `js/`.
- Keep audit outputs and scan artifacts in `internal/` or archive them before publishing.
- Prefer hyphenated names for new files and folders.
- Preserve redacted evidence and archived exports unless a link audit proves they are redundant.

## Phase 2 normalization

- Inventory reports live under `internal/reports/phase2/`.
- Governance policy lives in [docs-governance.md](docs-governance.md) and [archive-retention-policy.md](archive-retention-policy.md).
- Validation and remediation helpers live in `scripts/` and are designed to run in report-first mode.
