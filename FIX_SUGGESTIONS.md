# Fix Suggestions

Concise, actionable steps to remediate the issues found.

1. Replace or remove placeholder attributes
   - Fix empty `src` values and change `href="#"` anchors to valid URLs or remove them.

2. Archive or remove `_content/` site-export artifacts
   - Move large `_content/` export folder into an `archive/` folder or remove from build to avoid serving internal SharePoint links.

3. Validate external links automatically
   - Add a CI job using `broken-link-checker` or a PowerShell script that curls external URLs and fails on 4xx/5xx.
   - Example GH Action: `.github/workflows/link-check.yml` that runs `npx broken-link-checker` against the built site.

4. Review third-party scripts and privacy
   - Audit analytics.ahrefs.com inclusion; consider deferring, loading conditionally, or replacing with privacy-friendly analytics.

5. Accessibility & perf
   - Ensure images have meaningful `alt` text.
   - Run Lighthouse and address top performance/accessibility issues.
   - Optimize SVG thumbnails with `svgo`.

6. Verification
   - After fixes, run `pwsh scripts/validate-evidence-links.ps1`, run link-check CI, and re-generate `evidence/index.json`.
