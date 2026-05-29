# Portfolio Content Audit - 2026-05-29

Scope: `index.html`, `projects.html`, `proof.html`, `resume.html`, `dashboard.html`, and `contact.html`.

## Executive Findings

- The site already has a strong evidence-first foundation: recruiter pages link to proof artifacts, public pages avoid retired `/docs/` URLs, and the proof hub is the correct canonical review surface.
- The largest recruiter drop-off risk was depth: `projects.html` summarized work well, but top projects did not have standalone case-study pages for hiring managers who need objective, environment, approach, validation, and evidence in one place.
- The two Search Console "Crawled - currently not indexed" evidence artifacts had weak contextual paths from active public pages. They were public, but not prominent enough as supporting evidence.
- Structured data was present on the homepage, but subpages needed BreadcrumbList coverage and new case studies needed TechArticle schema.
- Accessibility was generally strong: skip links, semantic landmarks, focus styling, and mobile navigation were present. One HTML issue existed in `dashboard.html`: duplicate `role` attributes on the repository health panel.

## Page-Level Findings

### index.html

- Strengths: clear identity, strong evidence-first positioning, fast routes to projects, proof, dashboard, resume, and contact.
- Weak section: Featured work linked directly to artifacts but did not provide a deeper recruiter case-study path.
- SEO opportunity: keep homepage as the brand and routing page, then link to case-study URLs for long-tail queries around Microsoft 365, pfSense, Proxmox, Active Directory, and PowerShell.
- Action taken: added contextual case-study links from the featured work area.

### projects.html

- Strengths: project summaries are concise and proof-linked; filter controls are clear and keyboard-friendly.
- Weak section: project summaries were intentionally concise, but no mid-depth route existed between summary cards and raw evidence artifacts.
- Thin descriptions: Microsoft 365, pfSense/networking, Proxmox home lab, Active Directory, and PowerShell were strong enough for case-study expansion.
- Action taken: added a case-study path section without duplicating project cards, linked case studies from relevant existing projects, and added BreadcrumbList schema.

### proof.html

- Strengths: proof library already acts as the evidence hub with category navigation and direct artifact links.
- Missing internal links: pfSense markdown documentation and the public automation commit artifact needed stronger discovery paths.
- Action taken: added direct links to the pfSense write-up, pfSense diagram, pfSense case study, and automation commit artifact.

### resume.html

- Strengths: recruiter-readable role alignment and evidence map.
- SEO opportunity: add BreadcrumbList schema and keep resume claims tied to proof artifacts.
- Action taken: added BreadcrumbList schema.

### dashboard.html

- Strengths: useful repository governance narrative, validation metrics, and integrity framing.
- Accessibility/HTML issue: one element had duplicate `role` attributes.
- Action taken: corrected the repository health panel to use a single `role="status"` and added BreadcrumbList schema.

### contact.html

- Strengths: clear contact paths and role-fit summary.
- SEO opportunity: add BreadcrumbList schema.
- Action taken: added BreadcrumbList schema.

## Recommendations

- Keep `projects.html` as the summary page and the case-study pages as the deeper recruiter review path.
- Do not add the raw `.md` artifacts to the sitemap unless they are intended to rank as primary content; keep them public as supporting evidence and improve discovery through contextual links.
- Continue using evidence-safe wording: planned, preserved, methodology, lab, and sanitized where proof does not show live implementation.
- Re-run link, HTML, accessibility, and Lighthouse validation after each future evidence-library change.
