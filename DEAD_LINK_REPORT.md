# Dead Link / External Links Report

Summary: extracted external URLs found in repository; these should be validated for reachability and public availability.

Top domains and example URLs (needs verification):

- https://analytics.ahrefs.com/analytics.js (index.html)
- https://github.com/JeremyFontenot (index.html)
- https://jeremyfontenot.github.io and related docs pages (README.md)
- https://jeremyfontenot.sharepoint.com/* (many `_content/` manifest entries and curated content)
- https://centralus0-0.pushfp.svc.ms/fluid (Push service in `_content/`)

Action: validate these with an HTTP checker. Example command (Node):
`npx broken-link-checker --recursive http://localhost:8000` or run a script to `curl -I` each URL.

Notes: SharePoint links are likely private and will return 403/404 for public users — consider replacing or labeling as "Archived / internal".
