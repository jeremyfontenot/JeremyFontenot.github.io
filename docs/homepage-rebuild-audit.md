# Homepage Rebuild Audit

## Scope

Rebuilt the homepage-first landing experience for `index.html`.

Modified files:

- `index.html`
- `assets/css/site.css`
- `assets/js/site.js`
- `docs/homepage-rebuild-audit.md`

The temporary legacy public pages were not edited during this task:

- `projects.html`
- `proof.html`
- `dashboard.html`
- `resume.html`
- `contact.html`

## Issues Discovered

- The prior homepage communicated proof handling and repository discipline before clearly explaining role fit.
- The hero did not immediately present the full recruiter-facing identity: experienced Service Desk Professional, Enterprise IT Support Professional, and MSP Support Professional.
- Required sections were missing or underdeveloped: certifications, home lab, concise professional experience, and a stronger final recruiter call to action.
- Technical focus was present, but it needed stronger mapping to Microsoft 365, Entra ID, Active Directory, ITSM tools, endpoint support, networking, infrastructure, and automation.

## Fixes Applied

- Rebuilt the hero around immediate hiring value and technology coverage.
- Added `At A Glance` cards for current focus, industries, enterprise platforms, infrastructure, automation, and career path.
- Added `Technical Expertise` cards for identity, endpoint management, ITSM, networking, infrastructure, and automation.
- Added visually distinctive featured skill cards.
- Added a certifications section using existing badge assets.
- Added a home lab section covering Dell R710, Proxmox, Active Directory, DNS, DHCP, pfSense, WireGuard, OpenVPN, and PowerShell.
- Added a concise professional experience section using first-person professional positioning.
- Added a stronger recruiter and hiring-manager call to action.
- Added Open Graph, Twitter card metadata, and structured data.
- Added lightweight reveal behavior with reduced-motion support.

## Browser Sizes Tested

- Desktop: 1920px
- Desktop: 1440px
- Tablet: 768px
- Mobile: 390px

## Screenshots Reviewed

Screenshots were generated locally under:

`artifacts/screenshots/homepage-rebuild/`

The screenshot set included the homepage at 1920px, 1440px, 768px, and 390px.

## Accessibility Findings

- Semantic landmarks are present: header, nav, main, sections, footer.
- Skip link is preserved.
- Heading hierarchy starts with a single homepage H1.
- Badge images include descriptive alt text.
- Focus-visible styling remains available.
- Motion respects `prefers-reduced-motion`.
- Repository accessibility validation passed.

## SEO Findings

- Homepage title and meta description were rewritten for IT Support, Service Desk, Microsoft 365, Systems Administration, and Infrastructure Operations positioning.
- Open Graph metadata is present.
- Twitter card metadata is present.
- Person structured data is present.
- Content avoids keyword stuffing and keeps claims tied to realistic support and progression language.
- Lighthouse homepage scores: Performance 90, Accessibility 100, Best Practices 100, SEO 100. Lighthouse wrote the report successfully but returned the known Windows temporary-directory cleanup `EPERM` after report generation.

## Validation Results

- HTML validation: passed.
- Homepage local link and image validation: passed.
- JavaScript syntax check: passed.
- Internal link validation: passed.
- Sitemap validation: passed.
- SEO metadata validation: passed.
- Accessibility basics validation: passed.
- Public content validation: passed.
- JSON validation: passed.
- Git whitespace validation: passed.
- Browser viewport validation: passed at 1920px, 1440px, 768px, and 390px.

## Remaining Recommendations

- Continue replacing legacy pages one page at a time after the homepage direction is accepted.
- Keep certification names aligned to the exact badge assets and resume.
- Avoid returning to governance-first messaging on the homepage.
