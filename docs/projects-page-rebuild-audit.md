# Projects Page Rebuild Audit

## Scope

Rebuilt `projects.html` as a new enterprise projects page.

Modified files:

- `projects.html`
- `assets/css/site.css`
- `assets/js/site.js`
- `docs/projects-page-rebuild-audit.md`

Protected pages were not edited:

- `index.html`
- `proof.html`
- `dashboard.html`
- `resume.html`
- `contact.html`

## Issues Found

- The previous projects page used a simple grid that did not communicate enough infrastructure depth.
- Project entries were readable, but they did not consistently expose overview, technologies used, skills validated, career relevance, and evidence links.
- There was no category filtering for recruiter or hiring-manager review paths.
- The page did not show a clear progression from service desk work into systems administration and infrastructure operations.
- Visual hierarchy was weaker than the premium homepage direction.

## New Sections Added

- Hero section focused on systems administration, infrastructure operations, networking, automation, and enterprise support concepts.
- Project category filters for Infrastructure, Microsoft 365, Active Directory, Networking, Automation, and Service Desk.
- Featured project cards for verified work only:
  - Proxmox Home Lab
  - Active Directory Infrastructure
  - Microsoft 365 Administration Lab
  - pfSense Network Segmentation
  - PowerShell Automation
- Skills Validated section covering Active Directory, Microsoft 365, Entra ID, DNS, DHCP, VLANs, PowerShell, Proxmox, pfSense, and Virtualization.
- Infrastructure Journey timeline:
  - Service Desk
  - Infrastructure Validation
  - Systems Administration
  - Infrastructure Operations
- Recruiter and hiring-manager call to action.

## Screenshots Reviewed

Screenshots were generated locally under:

`artifacts/screenshots/projects-rebuild/`

The screenshot set included the Projects page at 1920px, 1440px, 768px, and 390px.

## Browser Sizes Tested

- 1920px desktop
- 1440px desktop
- 768px tablet
- 390px mobile

## Validation Notes

- Filter buttons were tested for all categories.
- Project cards stayed within their containers at all tested breakpoints.
- SVG previews scaled within their cards without overflow.
- Evidence links resolved to existing local files or pages.
- Motion remains tied to the existing reduced-motion-aware reveal behavior.
- HTML validation passed.
- JavaScript syntax validation passed.
- Accessibility, internal link, SEO, sitemap, public content, JSON, and whitespace validation passed.
- Lighthouse Projects page scores: Performance 87, Accessibility 100, Best Practices 100, SEO 100. Lighthouse wrote the report successfully but returned the known Windows temporary-directory cleanup `EPERM` after report generation.

## Remaining Recommendations

- Replace each individual project detail page one at a time after this Projects page direction is approved.
- Keep project cards limited to verified work and avoid adding generic or inflated project entries.
- Consider adding more project-specific proof links only when the related evidence file is already preserved in the repository.
