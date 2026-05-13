# Phase 5: Migration Risk Report

**Generated:** 2026-05-13 13:39:55
**Total Files Analyzed:** 872

## Classification Summary

| Classification | Count |
|---|---|
| Protected Zones | 69 |
| Duplicates | 415 |
| Orphans (Total) | 0 |
| Orphans (Suppressed) | 0 |
| Orphans (Actionable) | 0 |
| Generated Artifacts | 0 |

## Protected Zones (DO NOT MODIFY)

The following 69 files are in immutable/protected zones and will NOT be touched.

**First 20 protected files:**
- _content/docs/archive-filelist.csv
- _content/docs/archive/brandguide/manifest.json
- _content/docs/archive/home-lab/index.html
- _content/docs/archive/home-lab/validation-report.json
- _content/docs/archive/M365%20PCL/index.html
- _content/docs/archive/scripts/docs/script-documentation/summary.json
- _content/docs/archive/scripts/docs/script-documentation/validation-results.json
- _content/docs/curated/brandguide/BrandGuideHome.html
- _content/docs/curated/endpoint-management/Endpoint-Management.html
- _content/docs/curated/home-lab/Lab-Overview.html
- _content/docs/curated/identity/Identity.html
- _content/docs/curated/portfolio/Portfolio-Summary.html
- _content/docs/curated/script-documentation/Automation.html
- _content/docs/curated/security/Security.html
- _content/docs/curated/web/index.html
- _content/docs/index.html
- archive/duplicates/assets-logos-primary_logo_light_3000x3000.png
- archive/duplicates/assets-resume-Jeremy-Fontenot-Resume.pdf
- archive/duplicates/assets-website-images-full-neon-tech-hero-banner.png
- archive/duplicates/docs-assets-resume-Jeremy-Fontenot-Resume.pdf

... and 49 more files

## Consolidation Candidates

The following 228 duplicate files will be archived:

**First 15 consolidations:**
- assets/logos/primary_logo_transparent_3000x3000.png → archive/duplicates/assets-logos-primary_logo_transparent_3000x3000.png
- internal/_content/docs/archive/scripts/docs/script-documentation/validation-results.csv → archive/duplicates/internal-_content-docs-archive-scripts-docs-script-documentation-validation-results.csv
- internal/validation-docs/sharepoint-pages/archive/brandguide/html/Brand-Guidelines.html → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-brandguide-html-Brand-Guidelines.html
- internal/validation-docs/sharepoint-pages/archive/brandguide/html/BrandGuideHome.html → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-brandguide-html-BrandGuideHome.html
- internal/validation-docs/sharepoint-pages/archive/M365 PCL/aspx/Scripts-Used_BACKUP_20260227-210344.aspx → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-M365 PCL-aspx-Scripts-Used_BACKUP_20260227-210344.aspx
- internal/validation-docs/sharepoint-pages/archive/M365 PCL/aspx/Scripts-Used_BACKUP_20260227-210614.aspx → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-M365 PCL-aspx-Scripts-Used_BACKUP_20260227-210614.aspx
- internal/validation-docs/sharepoint-pages/archive/M365 PCL/html/Scripts-Used_BACKUP_20260227-210344.html → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-M365 PCL-html-Scripts-Used_BACKUP_20260227-210344.html
- internal/validation-docs/sharepoint-pages/archive/M365 PCL/html/Scripts-Used_BACKUP_20260227-210614.html → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-M365 PCL-html-Scripts-Used_BACKUP_20260227-210614.html
- internal/validation-docs/sharepoint-pages/archive/scripts/docs/brandguide-archive/aspx/Brand-Guidelines.aspx → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-scripts-docs-brandguide-archive-aspx-Brand-Guidelines.aspx
- internal/validation-docs/sharepoint-pages/archive/scripts/docs/brandguide-archive/aspx/BrandGuideHome.aspx → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-scripts-docs-brandguide-archive-aspx-BrandGuideHome.aspx
- internal/validation-docs/sharepoint-pages/archive/scripts/docs/brandguide-archive/html/Brand-Guidelines.html → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-scripts-docs-brandguide-archive-html-Brand-Guidelines.html
- internal/validation-docs/sharepoint-pages/archive/scripts/docs/brandguide-archive/html/BrandGuideHome.html → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-scripts-docs-brandguide-archive-html-BrandGuideHome.html
- internal/validation-docs/sharepoint-pages/archive/scripts/docs/brandguide-archive/html/Documentation.html → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-scripts-docs-brandguide-archive-html-Documentation.html
- internal/validation-docs/sharepoint-pages/archive/scripts/docs/brandguide-archive/html/Home.html → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-scripts-docs-brandguide-archive-html-Home.html
- internal/validation-docs/sharepoint-pages/archive/scripts/docs/brandguide-archive/html/Logos.html → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-scripts-docs-brandguide-archive-html-Logos.html

... and 213 more files

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|-----------|
| Protected zone violations | LOW | Policy enforcement verified |
| Broken references | MEDIUM | Reference rewrite pass required |
| GitHub Pages impact | LOW | Root entry points verified |
| Partial execution | LOW | Transactional model |

## GitHub Pages Verification

✓ Root entry points present: index.html, contact.html, documentation.html, projects.html, skills.html
✓ Asset paths stable: /assets, /css, /js  
✓ No breaking changes to public URLs expected

## Next Steps

1. Review file-mapping-index.json for complete file classification
2. Review dependency-impact-report.md for reference updates needed
3. Approve migration plan before physical execution
4. Execute moves in phases (duplicates first)
5. Run post-move validation

---

**STATUS:** Dry run analysis complete. No file changes made.
**ACTION REQUIRED:** Approve before proceeding to physical execution.
