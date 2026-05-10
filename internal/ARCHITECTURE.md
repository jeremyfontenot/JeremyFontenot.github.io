# Production Architecture Refactor

## Repository Structure

### `/public` - GitHub Pages Deployment
**This folder ONLY contains files deployed to jeremyfontenot.online**

```
/public
  index.html                    # Homepage
  contact.html                  # Contact page
  projects.html                 # Projects listing
  skills.html                   # Skills listing
  documentation.html            # Documentation page
  robots.txt                    # Search engine directives
  sitemap.xml                   # Sitemap for SEO
  CNAME                         # GitHub Pages custom domain
  /css
    styles.css                  # Global styles
  /js
    main.js                     # Site functionality
  /assets
    /logos                      # Logo files
    /profile-pictures           # Profile images
    /og                         # Open Graph images
    /website-images             # Marketing images
    Jeremy-Fontenot-Resume.pdf  # Public resume
  /docs
    index.html                  # Documentation hub
    search.html                 # Documentation search
    evidence.html               # Evidence viewer
    /projects
      index.html                # All projects
      ad-migration.html         # Project: AD Migration
      m365-lab.html             # Project: M365 Lab
      intune-baseline.html      # Project: Intune Baseline
      /ad-migration
        /artifacts              # Only PUBLIC artifacts
      /intune-baseline
        /artifacts              # Only PUBLIC artifacts
      /m365-lab
        /artifacts              # Only PUBLIC artifacts
    /skills
      index.html                # All skills
      /[skill-categories]       # Individual skill pages
    /certifications
      index.html                # Certification list
      certifications.html       # Cert details
    /contact
      index.html                # Contact form
    /experience
      index.html                # Work experience
      experience.html           # Experience details
    /architecture
      index.html                # Architecture docs
      home-lab-architecture.html
      m365-architecture.html
    /server-guides
      index.html
    /identity-security
      index.html
    /powershell
      index.html
    /homelab
      index.html
    /troubleshooting
      index.html
    /brand-guide
      branding.html
      branding.md
    /audit
      index.html
      accessibility-report.md
      audit-report.md
      etc.
  /evidence
    index.json                  # Evidence catalog (READ-ONLY reference)
    /public
      *.yaml                    # PUBLIC evidence artifacts only
      *.md
      *.log                     # Sanitized logs only
      *.json                    # Public JSON artifacts
```

### `/internal` - NOT Deployed
**All internal tooling, scripts, reports, workflows, and private documentation**

```
/internal
  /scripts
    dead-link-sweep.ps1
    generate-evidence-index.ps1
    link-scanner.ps1
    package-evidence.ps1
    redact-evidence.ps1
    validate-evidence-links.ps1
    link-scanner.ps1
  /admin
    update-evidence-status.ps1
  /audit
    *.md                        # Audit reports
  /reports
    *.md                        # Generated reports
    *.html                      # Report outputs
  /evidence
    index.json                  # Build-time reference
    /experience                 # PRIVATE evidence (NOT deployed)
      *.yaml
      *.md
      *.log
      *.json
  /validation-docs
    INDEX.md
    /projects
    /sharepoint-pages
    /skills
  /.github
    /workflows
      link-check.yml
      link-scan-pr-comment.yml
      validate-evidence-links.yml
  /_content
    All archive and automation content
  /docs-source (optional)
    Original markdown/template sources
  *.ps1                         # All root-level scripts
  *.csv                         # Report CSVs
  *.log                         # Generated logs
  scan-links.ps1
  exposed-files.txt
  links-report.*
```

### `/src` (Optional)
**Template sources or build intermediates (if using a site generator)**

---

## Deployment Strategy

### GitHub Pages Configuration
1. **Repository Settings → Pages**
   - Source: Deploy from branch
   - Branch: `main`
   - Directory: `/public`
   - Custom domain: `jeremyfontenot.online` (via CNAME)

2. **Build Workflow** (`/.github/workflows/deploy.yml`)
   - Triggered on: Push to `main`, PR to `main`
   - Steps:
     - Validate `/public` structure
     - Run link checks on `/public` only
     - Deploy `/public` to GitHub Pages
   - Only `/public` is published

### Local Development
```bash
# Work on site files in /public
# Update scripts/documentation in /internal
# Test locally with Live Server on /public

# Before committing:
npm run validate      # Check for broken links in /public
npm run build         # Generate any needed artifacts
```

---

## File Movements Summary

| Source | Destination | Status |
|--------|-------------|--------|
| `/docs` → `/public/docs` | Public documentation hub | ✅ Keep |
| `/assets` → `/public/assets` | Public assets only | ✅ Keep |
| `/css` → `/public/css` | Styles | ✅ Keep |
| `/js` → `/public/js` | Scripts | ✅ Keep |
| `*.html` (root) → `/public` | Public HTML pages | ✅ Move |
| `/scripts` → `/internal/scripts` | Admin tools | 🔴 Move |
| `/admin` → `/internal/admin` | Admin scripts | 🔴 Move |
| `/audit` → `/internal/audit` | Audit docs | 🔴 Move |
| `/reports` → `/internal/reports` | Generated reports | 🔴 Move |
| `/evidence/experience` → `/internal/evidence/experience` | Private evidence | 🔴 Move |
| `/.github` → `/internal/.github` | CI/CD workflows | 🔴 Move |
| `/validation-docs` → `/internal/validation-docs` | Validation notes | 🔴 Move |
| `/_content` → `/internal/_content` | Archive/automation | 🔴 Move |

---

## Security & Deployment Checklist

- [ ] No `.ps1` files in `/public`
- [ ] No `/admin` directory in `/public`
- [ ] No `/scripts` directory in `/public`
- [ ] No `/_content` in `/public`
- [ ] No private evidence in `/public/evidence/experience`
- [ ] `.github/workflows` moved to `/internal`
- [ ] All `.log`, `.csv`, `.json` reports in `/internal`
- [ ] GitHub Pages source set to `/public`
- [ ] CNAME file in `/public`
- [ ] robots.txt in `/public` allows search indexing
- [ ] sitemap.xml in `/public` points to all public pages
- [ ] `.gitignore` prevents `/internal` build artifacts from being committed

---

## Benefits

1. **Security**: Sensitive scripts, logs, and automation never reach production
2. **Clarity**: Clear separation between public and internal
3. **Deployment**: Only `/public` deployed via GitHub Pages
4. **Maintainability**: Easy to locate internal vs. public files
5. **Scalability**: Can add build process without affecting live site
6. **Compliance**: No exposure of CI/CD configurations or private documentation

---

## Rollback Plan

All files are preserved in `/internal` with original structure intact. If needed:
- Restore files from `/internal` to their original locations
- Git history preserved for complete recovery
