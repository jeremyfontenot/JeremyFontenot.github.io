# Site Audit Report (frontend / accessibility / perf)

Summary: concise findings from a repo scan and quick review of HTML/CSS/JS.

Findings:

- Empty image `src` attributes (e.g., index.html `cert-modal-img`) — can cause console errors and broken requests.
- Many anchor placeholders `href="#"` across `_content/` exports — bad for accessibility and SEO.
- Legacy `_content/` export files include SharePoint references and internal URLs not suitable for public site.
- External analytics script (ahrefs) is included; review GDPR/privacy implications and load impact.
- Evidence UI and scripts included and validated; evidence links resolved via `scripts/validate-evidence-links.ps1`.

Accessibility notes:
- Ensure `alt` attributes are meaningful (avoid empty unless decorative) and anchor text is descriptive.

Performance notes:
- Inline SVG thumbnails are fine, but ensure they are optimized and not overly large.
