# Phase 5: Dependency & Reference Impact Report

**Generated:** 2026-05-13 13:42:02

## Proposed Actions

### 1. Duplicate Consolidation (Non-Destructive)

**Total duplicates to archive:** 228 files

**First 20 consolidations:**
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
- internal/validation-docs/sharepoint-pages/archive/scripts/docs/brandguide-archive/html/SocialMediaKit.html → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-scripts-docs-brandguide-archive-html-SocialMediaKit.html
- internal/validation-docs/sharepoint-pages/archive/scripts/docs/m365-documentation-archive/aspx/Home.aspx → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-scripts-docs-m365-documentation-archive-aspx-Home.aspx
- internal/validation-docs/sharepoint-pages/archive/scripts/docs/m365-documentation-archive/aspx/Scripts-Used_BACKUP_20260227-210344.aspx → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-scripts-docs-m365-documentation-archive-aspx-Scripts-Used_BACKUP_20260227-210344.aspx
- internal/validation-docs/sharepoint-pages/archive/scripts/docs/m365-documentation-archive/aspx/Scripts-Used_BACKUP_20260227-210614.aspx → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-scripts-docs-m365-documentation-archive-aspx-Scripts-Used_BACKUP_20260227-210614.aspx
- internal/validation-docs/sharepoint-pages/archive/scripts/docs/m365-documentation-archive/html/Automation.html → archive/duplicates/internal-validation-docs-sharepoint-pages-archive-scripts-docs-m365-documentation-archive-html-Automation.html

... and 208 more files

**Safety:** Non-destructive (duplicates are never directly referenced)
**Reversibility:** Full git rollback available

### 2. Historical Phase Reports (Recommended)

Move completed phases to archive:
- internal/reports/phase1/ → archive/phase-reports/phase1/
- internal/reports/phase2/ → archive/phase-reports/phase2/
- internal/reports/phase3/ → archive/phase-reports/phase3/
- internal/reports/phase4/ → internal/reports/current/ (keep active)

**Reference Updates Required:**
- .github/workflows/repository-remediation.yml — Update paths

### 3. Scripts Reorganization (Optional - Deferred)

Organize scripts by function:
- scripts/remediation/ (Phase 4 execution)
- scripts/validation/ (Policy checks)
- scripts/core/ (Utilities)

**Reference Updates Required:**
- .github/workflows/repository-remediation.yml — Update paths

**Recommendation:** Defer to Phase 5b for focused testing

## Reference Safety

**Files with potential cross-references:**
35 markdown files
100 resource files (HTML/CSS/JS)

**Move impact:** 
- Duplicate archives: ZERO (duplicates not referenced)
- Phase report moves: LOW (only CI/docs reference them)
- Script moves: MEDIUM (requires CI update)

## Validation Checkpoints

Post-move validation:
1. Run broken link scan
2. Verify GitHub Pages builds
3. Regenerate remediation queue
4. Confirm policy compliance

## Rollback Strategy

All moves are reversible via git:
\\\ash
git status              # see changes
git diff --cached       # review
git reset               # rollback if needed
\\\

---

**STATUS:** Dependency analysis complete. Reference updates documented.
