# Jeremy Fontenot | Cloud-First IT Professional

A modern, responsive portfolio website showcasing cloud infrastructure expertise, Microsoft 365 administration, and IT automation skills. Built with HTML5, CSS3, and vanilla JavaScript with an integrated documentation hub and full-text search system.

**Live Site:** [https://jeremyfontenot.github.io](https://jeremyfontenot.github.io)

---

## ✨ Features

### Landing Page
- **Hero Section** – Neon-tech gradient banner with parallax effect
- **Skills Grid** – 6 core competency areas: Microsoft 365, Entra ID, Intune, PowerShell, Azure, Security
- **Projects Showcase** – 6 completed projects with descriptions and technologies
- **Experience Timeline** – 5 professional roles from Service Desk to Cloud Engineer
- **Certification Gallery** – 12 professional certifications with badge display
- **Documentation Hub** – Quick access to comprehensive documentation

### Responsive Navigation
- **Fixed Navbar** – Persistent header with brand logo and navigation links
- **Mobile Hamburger Toggle** – Optimized menu for screens ≤768px
- **Smooth Anchor Scrolling** – Fixed navbar awareness prevents link target overlap
- **Sticky Navigation** – Always accessible on any device

### Documentation System
- **Hierarchical Navigation** – Browse by category: Skills, Projects, Architecture, Experience, Certifications, Scripts
- **Full-Text Search** – Index of 16+ documented topics with real-time filtering
- **Category Filters** – Search by Skills, Projects, Architecture, Scripts, Experience, Certifications
- **Source Browser** – Bridge to archived documentation in `_content/docs`
- **Back Navigation** – Easy traversal from subsection → section → hub → home

### Archive Integration
- **Curated Documentation** – Web-ready exports of technical documentation
- **Source Files** – Original M365 PCL, Home Lab, and automation archives
- **Linked References** – All archive paths validated and accessible

---

## 📁 Project Structure

```
Portfolio-Dev/
├── index.html                    # Landing page (hero, skills, projects, etc.)
├── css/
│   └── styles.css               # Central stylesheet with brand tokens & responsive design
├── js/
│   └── main.js                  # Scroll animations, parallax, navbar toggle
├── docs/                        # Live documentation pages
│   ├── index.html               # Documentation hub
│   ├── search.html              # Full-text search browser
│   ├── source-browser.html      # Archive documentation gateway
│   ├── skills/                  # Skill documentation (6 categories)
│   ├── projects/                # Project documentation (6 projects)
│   ├── architecture/            # Architecture documentation (2 projects)
│   ├── experience/              # Career experience details (5 roles)
│   ├── certifications/          # Certification information (12 certs)
│   ├── scripts/                 # Automation & script documentation
│   └── brand-guide/             # Brand guidelines & assets
├── assets/                      # Media assets
│   ├── certifications/badges/   # 12+ certification badge images (AVIF, PNG, WebP)
│   ├── profile-pictures/        # Profile images (multiple formats)
│   └── website-images/          # Hero banners and UI assets
├── _content/                    # Archived documentation & source files
│   └── docs/
│       ├── curated/             # Web-ready documentation exports
│       └── archive/             # Source archives (M365 PCL, Home Lab, etc.)
└── README.md                    # This file

```

---

## 🎨 Design System

### Brand Colors
- **Primary Cyan:** `#00eaff` – Neon accent throughout
- **Secondary Purple:** `#a78bfa` – Gradient complements
- **Dark Background:** `#0a0e27` – High-contrast, easy on eyes
- **Glass-morphism:** Semi-transparent panels with backdrop blur

### Responsive Breakpoint
- **Desktop:** ≥769px – Full layout with visible navbar, multi-column grids
- **Mobile:** ≤768px – Hamburger toggle, single-column layout, optimized touch targets

### Typography & Spacing
- **Font Stack:** System fonts with fallbacks for fast loading
- **Grid Layout:** CSS Grid with `auto-fit` and `minmax()` for responsive columns
- **Gap Spacing:** Consistent 1.5rem throughout for visual rhythm

---

## 🚀 How to Use

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/jeremyfontenot/JeremyFontenot.github.io.git
   cd JeremyFontenot.github.io
   ```

2. Serve locally (requires Python 3.x, Node.js, or any local server):
   ```bash
   # Python 3.x
   python -m http.server 8000

   # Or Node.js (http-server)
   npx http-server
   ```

3. Open in browser: `http://localhost:8000`

### Navigation Guide
- **Home** – Landing page with all featured content
- **Navbar Links** – Quick access to Skills, Projects, Experience, Certifications, Documentation
- **Back Buttons** – All documentation pages have hierarchical back links
- **Documentation Search** – Use text search + category filters to find specific topics
- **Source Browser** – Access archived documentation and original M365/Home Lab exports

---

## 🛠️ Technologies

- **HTML5** – Semantic markup with accessibility attributes (aria-expanded, aria-label)
- **CSS3** – Custom properties, grid layouts, glass-morphism effects, responsive media queries
- **JavaScript (ES6+)** – Vanilla JS, no external dependencies
  - IntersectionObserver for scroll reveal animations
  - Event listeners for navbar toggle and smooth scrolling
  - Full-text search with real-time filtering
  - Parallax effect on hero section

---

## 📊 Documentation Index

**Live Docs (docs/):**
- Microsoft 365 Cloud Administration
- Entra ID (Azure Active Directory) Management
- Intune Endpoint Management
- PowerShell Automation
- Azure Cloud Infrastructure
- Security & Compliance

**Archived Sources (_content/docs/):**
- M365 Project Completion Log (curated)
- Home Lab Enterprise Architecture (curated)
- Script Documentation & Automation (curated)
- Brand Guidelines & Assets (curated)
- Original change logs and validation reports (archive)

All paths are validated and accessible from the source browser.

---

## ✅ Validation & Quality

- ✅ **Zero Syntax Errors** – All HTML/CSS/JS validated
- ✅ **Responsive Design** – Mobile-first, tested on ≤768px viewports
- ✅ **Accessibility** – Semantic HTML, ARIA labels, keyboard navigation
- ✅ **Performance** – No external CDNs, optimized images (AVIF/WebP format)
- ✅ **Link Integrity** – All internal and archive links verified and functional
- ✅ **Git History** – Full rebuild documented in initial commit

---

## 📝 Recent Changes

**Initial Rebuild (May 2, 2026)**
- Rewrote landing page with hero, skills grid (6 cards), projects (6), experience timeline (5), certifications (12)
- Added responsive navbar with fixed positioning and hamburger toggle
- Created hierarchical documentation hub with 7 section indices and 15+ subsection pages
- Built full-text search browser with 16 indexed topics and 6 category filters
- Added source browser linking to archived documentation in _content/
- Fixed 20+ broken links in archive pages with corrected relative paths
- Removed 68+ injected citation tokens from core files
- Validated all HTML/CSS/JS – zero errors

---

## 🔗 Links

- **GitHub Repository:** [jeremyfontenot/JeremyFontenot.github.io](https://github.com/jeremyfontenot/JeremyFontenot.github.io)
- **Live Site:** [https://jeremyfontenot.github.io](https://jeremyfontenot.github.io)
- **Documentation Hub:** [https://jeremyfontenot.github.io/docs/](https://jeremyfontenot.github.io/docs/)
- **Search Browser:** [https://jeremyfontenot.github.io/docs/search.html](https://jeremyfontenot.github.io/docs/search.html)
- **Archive Browser:** [https://jeremyfontenot.github.io/docs/source-browser.html](https://jeremyfontenot.github.io/docs/source-browser.html)

---

## 📄 License

This portfolio is personal work showcasing IT expertise. Feel free to use it as inspiration for your own portfolio, but please do not copy content or designs without attribution.

---

**Last Updated:** May 2, 2026  
**Status:** ✅ Production Ready