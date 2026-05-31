import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = (file, content) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${content.trim()}\n`, "utf8");
};

const asset = (p) => `./${p}`;
const caseAsset = (p) => `../${p}`;

const navItems = [
  ["index.html", "Home"],
  ["projects.html", "Projects"],
  ["proof.html", "Proof"],
  ["dashboard.html", "Dashboard"],
  ["resume.html", "Resume"],
  ["contact.html", "Contact"]
];

const certifications = [
  ["CompTIA A+", "Endpoint Support", "comptia-a+", "Hardware, operating system, troubleshooting, ticket hygiene, and customer-facing support fundamentals."],
  ["CompTIA Server+", "Server Infrastructure", "comptia-server+", "Server hardware, storage, virtualization, availability, and infrastructure maintenance concepts."],
  ["CompTIA ITF+", "IT Foundations", "comptia-itf+", "Core terminology, systems concepts, security basics, and practical IT communication."],
  ["Azure Fundamentals", "Microsoft Cloud", "microsoft-azure-fundamentals", "Cloud models, identity-aware administration, governance basics, and Azure service categories."],
  ["Cisco", "Networking", "cisco", "Routing, switching, subnetting, layered troubleshooting, and operational network documentation."],
  ["Linux Essentials", "Linux Administration", "linux-essentials", "Shell navigation, package awareness, permissions, services, logs, and cross-platform troubleshooting."],
  ["Google IT Support", "Support Operations", "google-it-support", "Structured troubleshooting, operating systems, networking basics, security fundamentals, and support habits."],
  ["MTA Networking", "Network Fundamentals", "mta-networking", "TCP/IP, DNS, DHCP, subnetting, wireless concepts, and support-ready connectivity checks."],
  ["MTA Security", "Security Fundamentals", "mta-security", "Least privilege, authentication concepts, policy awareness, network boundaries, and secure support work."],
  ["MTA Windows Server", "Windows Server", "mta-windows-server", "Windows Server roles, directory concepts, network services, and administration fundamentals."]
];

const proofItems = [
  ["Microsoft 365 Lab Architecture Overview", "Architecture", "SVG", "evidence-library/architecture-diagrams/microsoft-365-lab-architecture-overview-2026.svg", "Visualizes Microsoft 365 identity, endpoint, administration, and policy boundaries for reviewer orientation."],
  ["Conditional Access Baseline Configuration", "Microsoft 365", "YAML", "evidence-library/projects/microsoft-365-lab/microsoft-365-lab-conditional-access-baseline-configuration-2026.yaml", "Tenant-safe policy intent, target scope, controls, exceptions, and validation considerations."],
  ["PowerShell Provisioning Script", "Automation", "PS1", "evidence-library/scripts/powershell-automation-provisioning-script-v1.ps1", "Parameterized provisioning logic with dry-run review, idempotent checks, and logging expectations."],
  ["Provisioning Change Record", "Automation", "MD", "evidence-library/projects/powershell-automation/provisioning-change-log-2026.md", "Change scope, review rationale, validation method, rollback notes, and handoff context."],
  ["Operational Handoff Checklist", "Operations", "TXT", "evidence-library/projects/powershell-automation/operational-handoff-2026.txt", "Run prerequisites, log capture, rollback expectations, and support continuity notes."],
  ["Troubleshooting RCA Incident Summary", "Service Desk", "MD", "evidence-library/projects/troubleshooting-rca/incident-summary.md", "Sanitized incident summary covering impact, triage, corrective action, validation, and lessons learned."],
  ["Troubleshooting RCA Report", "RCA", "MD", "evidence-library/projects/troubleshooting-rca/rca-report.md", "Formal root-cause record with scope, repeatability checks, remediation sequence, and prevention controls."],
  ["Validation Checklist", "RCA", "MD", "evidence-library/projects/troubleshooting-rca/validation-checklist.md", "Post-change validation checklist for delivery verification, observation, and closure."],
  ["pfSense Network Segmentation Diagram", "Networking", "SVG", "evidence-library/architecture-diagrams/pfsense-network-segmentation-diagram-2026.svg", "Documents VLAN, firewall-zone, NAT, DMZ, and management-boundary logic."],
  ["VLAN Architecture Walkthrough", "Networking", "MD", "evidence-library/projects/infrastructure-networking/vlan-architecture-walkthrough-2026.md", "VLAN purpose, trunk and access behavior, pfSense routing boundaries, and troubleshooting sequence."],
  ["DNS/DHCP Operational Runbook", "Networking", "MD", "evidence-library/skills/dns-dhcp/dns-dhcp-operational-runbook-2026.md", "DNS and DHCP health checks, lease review, reservation validation, service restart sequence, and escalation notes."],
  ["Network Validation Checklist", "Validation", "MD", "evidence-library/validation-reports/network-validation-checklist-2026.md", "Gateway, VLAN, DNS, DHCP, firewall, VPN, evidence capture, and rollback checkpoints."],
  ["Backup Restore Validation Workflow", "Recovery", "MD", "evidence-library/projects/backup-disaster-recovery/backup-restore-validation-workflow-2026.md", "Non-destructive recovery validation methodology with integrity checks and documentation expectations."],
  ["Monitoring Alerting Overview", "Operations", "MD", "evidence-library/projects/monitoring-logging/monitoring-alerting-overview-2026.md", "Monitoring scope, alert categories, log review practice, escalation triggers, and follow-up logic."],
  ["Resume Evidence File", "Resume", "PDF", "evidence-library/experience/jeremy-fontenot-resume-2026.pdf", "Preserved resume PDF for role alignment review."],
  ["Evidence Search Index", "Index", "JSON", "evidence-library/evidence-search-index.json", "Static index supporting evidence library navigation and proof discovery."],
  ["Evidence Relationship Map", "Index", "JSON", "evidence-library/evidence-relationships.json", "Claim-to-artifact relationships across projects, skills, and review categories."]
];

const projects = [
  {
    title: "Microsoft 365 Lab Baseline",
    category: "Microsoft 365",
    type: "Identity / Endpoint",
    summary: "I document Microsoft 365 identity, endpoint policy, Conditional Access intent, rollback awareness, and validation planning with tenant-safe proof artifacts.",
    img: "evidence-library/architecture-diagrams/m365-lab-baseline-preview.svg",
    links: [
      ["Case study", "case-studies/microsoft-365-lab-baseline.html"],
      ["Conditional Access baseline", "evidence-library/projects/microsoft-365-lab/microsoft-365-lab-conditional-access-baseline-configuration-2026.yaml"],
      ["Architecture overview", "evidence-library/architecture-diagrams/microsoft-365-lab-architecture-overview-2026.svg"]
    ]
  },
  {
    title: "pfSense Network Segmentation",
    category: "Networking",
    type: "VLAN / Firewall",
    summary: "I document segmentation goals, VLAN boundaries, firewall policy intent, DNS/DHCP placement, VPN review, and validation checkpoints.",
    img: "evidence-library/architecture-diagrams/pfsense-network-segmentation-preview.svg",
    links: [
      ["Case study", "case-studies/pfsense-network-segmentation.html"],
      ["Segmentation write-up", "evidence-library/projects/infrastructure-networking/pfsense-network-segmentation-diagram-2026.md"],
      ["VLAN walkthrough", "evidence-library/projects/infrastructure-networking/vlan-architecture-walkthrough-2026.md"]
    ]
  },
  {
    title: "Proxmox Home Lab",
    category: "Infrastructure",
    type: "Virtualization",
    summary: "I preserve the home lab topology and use it to explain virtualization, lab boundaries, Windows and Linux workloads, and infrastructure review paths.",
    img: "evidence-library/architecture-diagrams/home-lab-network-topology-diagram-2026.svg",
    links: [
      ["Case study", "case-studies/proxmox-home-lab.html"],
      ["Preserved PDF", "evidence-library/projects/home-lab/lab-portfolio-preserved.pdf"],
      ["Topology diagram", "evidence-library/architecture-diagrams/home-lab-network-topology-diagram-2026.svg"]
    ]
  },
  {
    title: "Active Directory Planning",
    category: "Identity",
    type: "AD / GPO",
    summary: "I show OU planning, GPO scope review, identity change records, rollback preparation, and validation criteria without overstating production scale.",
    img: "evidence-library/architecture-diagrams/identity-access-ad-migration-diagram-2026.svg",
    links: [
      ["Case study", "case-studies/active-directory-infrastructure.html"],
      ["Change notes", "evidence-library/projects/identity-access/identity-access-change-record-notes-2026.md"],
      ["Migration diagram", "evidence-library/architecture-diagrams/identity-access-ad-migration-diagram-2026.svg"]
    ]
  },
  {
    title: "PowerShell Automation",
    category: "Automation",
    type: "PS1 / Handoff",
    summary: "I pair a provisioning script with dry-run review, logging expectations, validation notes, rollback context, and operational handoff documentation.",
    img: "assets/evidence/powershell-provisioning.svg",
    links: [
      ["Case study", "case-studies/powershell-automation.html"],
      ["Provisioning script", "evidence-library/scripts/powershell-automation-provisioning-script-v1.ps1"],
      ["Operational handoff", "evidence-library/projects/powershell-automation/operational-handoff-2026.txt"]
    ]
  },
  {
    title: "Service Desk RCA Workflow",
    category: "Troubleshooting",
    type: "RCA / Validation",
    summary: "I preserve a sanitized troubleshooting path from symptom report through investigation, remediation planning, validation, and post-incident review.",
    img: "evidence-library/architecture-diagrams/mail-flow-troubleshooting-preview.svg",
    links: [
      ["Incident summary", "evidence-library/projects/troubleshooting-rca/incident-summary.md"],
      ["RCA report", "evidence-library/projects/troubleshooting-rca/rca-report.md"],
      ["Validation checklist", "evidence-library/projects/troubleshooting-rca/validation-checklist.md"]
    ]
  }
];

const caseStudies = [
  ["microsoft-365-lab-baseline.html", "Microsoft 365 Lab Baseline", "Microsoft 365", "Identity, endpoint policy, Conditional Access intent, automation context, rollback awareness, and validation planning.", "evidence-library/architecture-diagrams/microsoft-365-lab-architecture-overview-2026.svg", ["Microsoft 365 administration concepts", "Entra ID and Conditional Access planning", "Intune and endpoint policy review", "PowerShell-supported administrative workflow"], [["Architecture overview", "evidence-library/projects/microsoft-365-lab/microsoft-365-lab-architecture-overview-2026.md"], ["Conditional Access baseline", "evidence-library/projects/microsoft-365-lab/microsoft-365-lab-conditional-access-baseline-configuration-2026.yaml"], ["Architecture diagram", "evidence-library/architecture-diagrams/microsoft-365-lab-architecture-overview-2026.svg"]]],
  ["pfsense-network-segmentation.html", "pfSense Network Segmentation", "Networking", "VLAN boundaries, firewall policy intent, DNS/DHCP placement, VPN review, and validation methodology.", "evidence-library/architecture-diagrams/pfsense-network-segmentation-diagram-2026.svg", ["pfSense firewall boundary planning", "VLAN segmentation documentation", "DNS/DHCP and VPN review", "Network validation methodology"], [["Segmentation write-up", "evidence-library/projects/infrastructure-networking/pfsense-network-segmentation-diagram-2026.md"], ["VLAN walkthrough", "evidence-library/projects/infrastructure-networking/vlan-architecture-walkthrough-2026.md"], ["Validation checklist", "evidence-library/validation-reports/network-validation-checklist-2026.md"]]],
  ["proxmox-home-lab.html", "Proxmox Home Lab", "Infrastructure", "Virtualization context, lab topology, infrastructure boundaries, and preserved portfolio evidence.", "evidence-library/architecture-diagrams/home-lab-network-topology-diagram-2026.svg", ["Virtualization planning", "Windows and Linux lab workload mapping", "Network topology documentation", "Preserved evidence routing"], [["Home lab PDF", "evidence-library/projects/home-lab/lab-portfolio-preserved.pdf"], ["Topology diagram", "evidence-library/architecture-diagrams/home-lab-network-topology-diagram-2026.svg"], ["Projects page", "projects.html"]]],
  ["active-directory-infrastructure.html", "Active Directory Planning", "Identity", "OU planning, GPO scope review, migration awareness, rollback preparation, and validation criteria.", "evidence-library/architecture-diagrams/identity-access-ad-migration-diagram-2026.svg", ["Active Directory fundamentals", "OU and GPO planning", "Change records and rollback notes", "Identity validation criteria"], [["Change record notes", "evidence-library/projects/identity-access/identity-access-change-record-notes-2026.md"], ["Identity diagram", "evidence-library/architecture-diagrams/identity-access-ad-migration-diagram-2026.svg"], ["Provisioning script", "evidence-library/scripts/powershell-automation-provisioning-script-v1.ps1"]]],
  ["powershell-automation.html", "PowerShell Automation", "Automation", "Provisioning logic, dry-run review, logging, rollback context, and operational handoff notes.", "assets/evidence/powershell-provisioning.svg", ["Approved-verb PowerShell structure", "Parameter validation and dry-run behavior", "Logging expectations", "Operational handoff documentation"], [["Provisioning script", "evidence-library/scripts/powershell-automation-provisioning-script-v1.ps1"], ["Change log", "evidence-library/projects/powershell-automation/provisioning-change-log-2026.md"], ["Handoff notes", "evidence-library/projects/powershell-automation/operational-handoff-2026.txt"]]]
];

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function meta({ title, desc, url, type = "website", prefix = "." }) {
  return `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow">
  <meta name="color-scheme" content="dark">
  <link rel="canonical" href="https://jeremyfontenot.online/${url}">
  <meta property="og:site_name" content="Jeremy Fontenot">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="https://jeremyfontenot.online/${url}">
  <meta property="og:image" content="https://jeremyfontenot.online/assets/og/og-portfolio.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="https://jeremyfontenot.online/assets/og/og-portfolio.png">
  <link rel="icon" href="${prefix}/assets/logos/favicon_64x64.png">
  <link rel="manifest" href="${prefix}/assets/site.webmanifest">
  <link rel="apple-touch-icon" href="${prefix}/assets/logos/favicon_128x128.png">
  <link rel="stylesheet" href="${prefix}/assets/css/site.css?v=20260531-clean-rebuild">
  <script src="${prefix}/assets/js/site.js?v=20260531-clean-rebuild" defer></script>`;
}

function header(active, prefix = ".") {
  const links = navItems.map(([href, label]) => `<a href="${prefix}/${href}"${label === active ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <nav class="nav-shell" aria-label="Primary navigation">
      <a class="brand" href="${prefix}/index.html">
        <img src="${prefix}/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="44" height="44" decoding="async">
        <span>Jeremy Fontenot</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-menu">Menu</button>
      <div class="nav-links" id="primary-menu">${links}</div>
    </nav>
  </header>`;
}

function footer(prefix = ".") {
  return `<footer class="site-footer" aria-label="Site footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="${prefix}/assets/logos/header_logo_88x88.png" alt="Jeremy Fontenot logo" width="52" height="52" decoding="async">
        <p><strong>Jeremy Fontenot</strong></p>
        <p>Evidence-backed portfolio for enterprise service desk, IT support, and systems administration growth.</p>
      </div>
      <nav class="footer-links" aria-label="Footer navigation">
        <h2>Navigate</h2>
        <a href="${prefix}/index.html">Home</a>
        <a href="${prefix}/projects.html">Projects</a>
        <a href="${prefix}/proof.html">Proof</a>
        <a href="${prefix}/dashboard.html">Dashboard</a>
        <a href="${prefix}/resume.html">Resume</a>
        <a href="${prefix}/contact.html">Contact</a>
      </nav>
      <nav class="footer-links" aria-label="Evidence links">
        <h2>Evidence</h2>
        <a href="${prefix}/evidence-library/index.html">Evidence library</a>
        <a href="${prefix}/assets/resume/jeremy-fontenot-resume.pdf">Resume PDF</a>
        <a href="${prefix}/sitemap.xml">Sitemap</a>
      </nav>
    </div>
    <p class="footer-meta">Service Desk / Microsoft 365 / Active Directory / PowerShell / Networking / Documentation</p>
  </footer>`;
}

function page({ active, title, desc, url, body, prefix = ".", type = "website" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
${meta({ title, desc, url, prefix, type })}
</head>
<body>
  ${header(active, prefix)}
  <main id="main">
${body}
  </main>
  ${footer(prefix)}
</body>
</html>`;
}

const badge = (text) => `<span class="badge">${esc(text)}</span>`;
const hrefFor = (href, prefix = ".") => /^https?:\/\//.test(href) ? href : `${prefix}/${href}`;
const linkList = (links, prefix = ".") => `<ul class="link-list">${links.map(([label, href]) => {
  const isExternal = /^https?:\/\//.test(href);
  return `<li><a href="${hrefFor(href, prefix)}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ""}><span>${esc(label)}</span></a></li>`;
}).join("")}</ul>`;

out("assets/js/site.js", `
(() => {
  if (window.location.hostname.startsWith("www.")) {
    window.location.replace(window.location.href.replace("//www.", "//"));
    return;
  }

  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-links");
  if (toggle && menu) {
    const setOpen = (open) => {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
    menu.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Node)) return;
      if (!menu.classList.contains("is-open")) return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;
      setOpen(false);
    });
  }

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealNodes = [...document.querySelectorAll("[data-reveal]")];
  if (!prefersReduced && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }
})();
`);

out("assets/css/site.css", `
:root {
  color-scheme: dark;
  --bg: #050814;
  --panel: rgba(13, 23, 44, 0.76);
  --panel-strong: rgba(18, 32, 58, 0.92);
  --line: rgba(148, 163, 184, 0.22);
  --text: #f7fbff;
  --muted: #b7c4d8;
  --soft: #d7e1ef;
  --cyan: #34d5ff;
  --magenta: #f05cff;
  --green: #7dd3a8;
  --shadow: 0 18px 50px rgba(0, 0, 0, 0.34);
  --radius: 8px;
  --content: min(1120px, calc(100vw - 32px));
}
* { box-sizing: border-box; }
html { min-width: 0; scroll-behavior: smooth; }
body {
  min-width: 0;
  margin: 0;
  overflow-x: clip;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(52, 213, 255, 0.16), transparent 34rem),
    radial-gradient(circle at top right, rgba(240, 92, 255, 0.13), transparent 32rem),
    linear-gradient(180deg, #060a18 0%, #080e1d 46%, #050814 100%);
  color: var(--text);
  line-height: 1.6;
}
body.nav-open { overflow: hidden; }
img, svg, video, canvas { display: block; max-width: 100%; height: auto; }
a { color: inherit; text-decoration-color: rgba(52, 213, 255, 0.55); text-underline-offset: 0.18em; }
a:hover { color: #ffffff; text-decoration-color: var(--magenta); }
:focus-visible { outline: 3px solid var(--cyan); outline-offset: 4px; }
.skip-link {
  position: absolute;
  left: 1rem;
  top: 1rem;
  z-index: 20;
  transform: translateY(-180%);
  background: #ffffff;
  color: #08111f;
  padding: 0.7rem 1rem;
  border-radius: var(--radius);
}
.skip-link:focus { transform: translateY(0); }
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--line);
  background: rgba(5, 8, 20, 0.86);
  backdrop-filter: blur(18px);
}
.nav-shell {
  width: var(--content);
  min-width: 0;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0;
}
.brand {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  text-decoration: none;
}
.brand img { width: 44px; height: 44px; border-radius: 8px; }
.brand span { overflow-wrap: anywhere; }
.nav-toggle {
  display: none;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255,255,255,0.06);
  color: var(--text);
  padding: 0.65rem 0.85rem;
  font: inherit;
}
.nav-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.28rem;
  min-width: 0;
}
.nav-links a {
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--muted);
  padding: 0.58rem 0.78rem;
  text-decoration: none;
  white-space: nowrap;
}
.nav-links a:hover, .nav-links a[aria-current="page"] {
  border-color: rgba(52, 213, 255, 0.35);
  background: rgba(52, 213, 255, 0.09);
  color: var(--text);
}
main { min-width: 0; }
.hero, .page-hero, .section {
  width: var(--content);
  min-width: 0;
  margin: 0 auto;
  padding: clamp(3rem, 7vw, 6rem) 0;
}
.hero-grid, .page-grid, .split-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
  gap: clamp(1.25rem, 4vw, 3rem);
  align-items: center;
  min-width: 0;
}
.stack { display: grid; gap: 1rem; min-width: 0; }
.eyebrow {
  margin: 0 0 0.75rem;
  color: var(--cyan);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.78rem;
}
h1, h2, h3, p { overflow-wrap: anywhere; }
h1 {
  margin: 0;
  max-width: 14ch;
  font-size: clamp(2.6rem, 8vw, 5.8rem);
  line-height: 0.98;
}
h2 {
  margin: 0;
  font-size: clamp(1.7rem, 4vw, 3rem);
  line-height: 1.08;
}
h3 { margin: 0; font-size: 1.15rem; line-height: 1.22; }
p { margin: 0; color: var(--muted); }
.lead {
  max-width: 68ch;
  color: var(--soft);
  font-size: clamp(1.05rem, 2vw, 1.22rem);
}
.section-head {
  display: grid;
  gap: 0.8rem;
  max-width: 820px;
  margin-bottom: 1.4rem;
}
.actions, .chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  min-width: 0;
  margin-top: 1.35rem;
}
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  padding: 0.72rem 1rem;
  text-decoration: none;
  font-weight: 750;
  text-align: center;
}
.button.primary {
  border-color: rgba(52, 213, 255, 0.55);
  background: linear-gradient(135deg, rgba(52, 213, 255, 0.25), rgba(240, 92, 255, 0.18));
}
.badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  border: 1px solid rgba(52, 213, 255, 0.3);
  border-radius: 999px;
  background: rgba(52, 213, 255, 0.08);
  color: #dff8ff;
  padding: 0.28rem 0.62rem;
  font-size: 0.78rem;
  font-weight: 800;
  overflow-wrap: anywhere;
}
.panel, .card, .project-card, .proof-card, .cert-card, .case-card {
  min-width: 0;
  height: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: linear-gradient(180deg, var(--panel), rgba(10, 18, 36, 0.72));
  box-shadow: var(--shadow);
}
.panel { padding: clamp(1.1rem, 3vw, 1.65rem); }
.card, .project-card, .proof-card, .cert-card, .case-card {
  display: grid;
  align-content: start;
  gap: 0.8rem;
  padding: 1.1rem;
}
.card-grid, .project-grid, .proof-grid, .cert-grid, .case-grid, .metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  align-items: stretch;
  gap: 1rem;
  min-width: 0;
}
.project-grid.wide { grid-template-columns: repeat(auto-fit, minmax(min(100%, 330px), 1fr)); }
.metric-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr)); }
.stat {
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255,255,255,0.055);
  padding: 1rem;
}
.stat strong { display: block; font-size: 2rem; color: var(--text); line-height: 1; }
.stat span { display: block; margin-top: 0.35rem; color: var(--muted); }
.media-box {
  width: 100%;
  aspect-ratio: 16 / 10;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255,255,255,0.045);
}
.media-box img { width: 100%; height: 100%; object-fit: contain; padding: 0.75rem; }
.profile-media {
  aspect-ratio: 1 / 1;
  max-width: 390px;
  margin-inline: auto;
  overflow: hidden;
  border-radius: var(--radius);
  border: 1px solid rgba(52,213,255,0.28);
  background: rgba(255,255,255,0.04);
}
.profile-media img { width: 100%; height: 100%; object-fit: cover; }
.link-list {
  display: grid;
  gap: 0.45rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}
.link-list a {
  display: flex;
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255,255,255,0.04);
  padding: 0.62rem 0.75rem;
  text-decoration: none;
}
.link-list span { min-width: 0; overflow-wrap: anywhere; }
.proof-card dl {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.25rem 0.65rem;
  margin: 0;
}
.proof-card dt { color: var(--muted); }
.proof-card dd { margin: 0; color: var(--text); min-width: 0; overflow-wrap: anywhere; }
.cert-card img { width: 88px; height: 88px; object-fit: contain; }
.cert-card .cert-media {
  width: 104px;
  height: 104px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255,255,255,0.045);
}
.timeline {
  display: grid;
  gap: 0.8rem;
}
.timeline-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: start;
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255,255,255,0.045);
  padding: 1rem;
}
.step {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(52,213,255,0.26), rgba(240,92,255,0.22));
  color: var(--text);
  font-weight: 900;
}
.site-footer {
  width: var(--content);
  min-width: 0;
  margin: 0 auto;
  padding: 3rem 0 2rem;
  border-top: 1px solid var(--line);
}
.footer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) repeat(2, minmax(180px, 0.55fr));
  gap: 1rem;
  align-items: start;
}
.footer-brand, .footer-links {
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(255,255,255,0.04);
  padding: 1rem;
}
.footer-brand img { width: 52px; height: 52px; border-radius: var(--radius); }
.footer-links { display: grid; gap: 0.45rem; }
.footer-links h2 { font-size: 1rem; }
.footer-links a { min-width: 0; overflow-wrap: anywhere; }
.footer-meta { margin-top: 1rem; font-size: 0.92rem; }
[data-reveal] { opacity: 0; transform: translateY(10px); transition: opacity 360ms ease, transform 360ms ease; }
[data-reveal].is-visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; animation: none !important; }
}
@media (max-width: 820px) {
  :root { --content: min(100vw - 24px, 1120px); }
  .nav-shell { align-items: center; }
  .nav-toggle { display: inline-flex; }
  .nav-links {
    position: fixed;
    left: 12px;
    right: 12px;
    top: 72px;
    display: none;
    flex-direction: column;
    align-items: stretch;
    max-height: calc(100vh - 88px);
    overflow-y: auto;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: rgba(7, 12, 26, 0.97);
    padding: 0.7rem;
    box-shadow: var(--shadow);
  }
  .nav-links.is-open { display: flex; }
  .nav-links a { border-color: var(--line); border-radius: var(--radius); white-space: normal; }
  .hero-grid, .page-grid, .split-grid { grid-template-columns: 1fr; }
  h1 { max-width: 100%; }
  .footer-grid { grid-template-columns: 1fr; }
}
@media (max-width: 430px) {
  :root { --content: calc(100vw - 20px); }
  .hero, .page-hero, .section { padding: 2.6rem 0; }
  .actions { flex-direction: column; }
  .button { width: 100%; }
  .timeline-item { grid-template-columns: 1fr; }
}
`);

const homeBody = `
    <section class="hero" aria-labelledby="home-title">
      <div class="hero-grid">
        <div class="stack" data-reveal>
          <p class="eyebrow">Enterprise Service Desk / IT Support / Systems Growth</p>
          <h1 id="home-title">Jeremy Fontenot</h1>
          <p class="lead">I build and document practical support workflows across Windows, Microsoft 365, Active Directory fundamentals, endpoint support, networking, PowerShell, and infrastructure validation.</p>
          <div class="actions">
            <a class="button primary" href="./projects.html">Review Projects</a>
            <a class="button" href="./proof.html">Open Proof Library</a>
            <a class="button" href="./assets/resume/jeremy-fontenot-resume.pdf">Download Resume</a>
          </div>
          <div class="chip-row" role="group" aria-label="Technical focus">${["Service Desk", "Microsoft 365", "Active Directory", "Intune", "PowerShell", "Networking", "Documentation"].map(badge).join("")}</div>
        </div>
        <div class="panel" data-reveal>
          <div class="profile-media"><img src="./assets/profile-pictures/here_is_my_picture.webp" alt="Jeremy Fontenot professional profile photo" width="900" height="900" decoding="async"></div>
        </div>
      </div>
    </section>
    <section class="section" aria-labelledby="standard-title">
      <div class="section-head"><p class="eyebrow">Portfolio Standard</p><h2 id="standard-title">Evidence first, recruiter readable, technically precise.</h2><p>I keep the public story concise and route technical reviewers to preserved diagrams, scripts, runbooks, validation records, resume files, and certification badge assets. Claims stay tied to artifacts and do not imply live infrastructure where the evidence is lab or methodology based.</p></div>
      <div class="metric-grid">
        <div class="stat"><strong>5</strong><span>case-study paths</span></div>
        <div class="stat"><strong>17</strong><span>featured proof links</span></div>
        <div class="stat"><strong>10</strong><span>credential badge assets surfaced</span></div>
        <div class="stat"><strong>0</strong><span>fabricated enterprise metrics</span></div>
      </div>
    </section>
    <section class="section" aria-labelledby="focus-title">
      <div class="section-head"><p class="eyebrow">Technical Focus</p><h2 id="focus-title">Operational skills mapped to review paths.</h2></div>
      <div class="card-grid">
        ${[
          ["Service Desk and Endpoint Support", "I frame intake, triage, user impact, Windows support, endpoint checks, escalation context, validation, and closure notes."],
          ["Microsoft 365 and Identity", "I document Microsoft 365 support exposure, Entra ID concepts, Active Directory fundamentals, Conditional Access intent, and endpoint policy planning."],
          ["Infrastructure and Networking", "I preserve DNS, DHCP, VLAN, firewall, VPN, and topology evidence with validation checklists and operational runbooks."],
          ["PowerShell and Documentation", "I connect reusable scripts to change records, dry-run review, logging expectations, rollback notes, and support handoff."]
        ].map(([t, s]) => `<article class="card" data-reveal>${badge(t.split(" ")[0])}<h3>${t}</h3><p>${s}</p></article>`).join("")}
      </div>
    </section>
    <section class="section" aria-labelledby="featured-title">
      <div class="section-head"><p class="eyebrow">Featured Work</p><h2 id="featured-title">Source-linked projects without duplicate claims.</h2><p>Projects stay short here and route to case studies or proof files for deeper review.</p></div>
      <div class="project-grid wide">${projects.slice(0,3).map((p) => projectCard(p)).join("")}</div>
    </section>
    ${certSection()}
`;

function projectCard(p, prefix = ".") {
  return `<article class="project-card" data-reveal>
    ${badge(p.category)}<div class="media-box"><img src="${prefix}/${p.img}" alt="${esc(p.title)} visual evidence" width="1200" height="760" loading="lazy" decoding="async"></div>
    <h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p>${linkList(p.links, prefix)}
  </article>`;
}

function certSection(prefix = ".") {
  return `<section class="section" aria-labelledby="cert-title">
    <div class="section-head"><p class="eyebrow">Certification Context</p><h2 id="cert-title">Credential badge assets aligned to the documented skill areas.</h2><p>I surface existing badge assets as context only and avoid expanding claims beyond the available records.</p></div>
    <div class="cert-grid">${certifications.map(([name, area, slug, summary]) => `<article class="cert-card" data-reveal><div class="cert-media"><picture><source srcset="${prefix}/assets/certifications/badges/${slug}.avif" type="image/avif"><source srcset="${prefix}/assets/certifications/badges/${slug}.webp" type="image/webp"><img src="${prefix}/assets/certifications/badges/${slug}.png" alt="${esc(name)} certification badge" width="160" height="160" loading="lazy" decoding="async"></picture></div>${badge(area)}<h3>${esc(name)}</h3><p>${esc(summary)}</p><a href="${prefix}/assets/certifications/badges/${slug}.png">Open badge asset</a></article>`).join("")}</div>
  </section>`;
}

out("index.html", page({
  active: "Home",
  title: "Jeremy Fontenot | Enterprise Service Desk and IT Support Portfolio",
  desc: "First-person, evidence-backed portfolio for enterprise service desk, Microsoft 365, endpoint support, PowerShell, networking, and systems administration growth.",
  url: "",
  body: homeBody
}));

out("projects.html", page({
  active: "Projects",
  title: "Projects | Jeremy Fontenot",
  desc: "Evidence-backed projects for service desk troubleshooting, Microsoft 365, PowerShell automation, networking, Active Directory planning, and infrastructure validation.",
  url: "projects.html",
  body: `
    <section class="page-hero" aria-labelledby="projects-title"><div class="page-grid"><div class="stack" data-reveal><p class="eyebrow">Selected Work</p><h1 id="projects-title">Projects that stay tied to proof.</h1><p class="lead">I keep each project concise for recruiter scanning and link directly to case studies, diagrams, scripts, runbooks, and validation records for technical review.</p><div class="actions"><a class="button primary" href="./proof.html">Browse Proof</a><a class="button" href="./resume.html">Resume Snapshot</a></div></div><div class="panel" data-reveal><h2>Review Model</h2><p>Objective, environment, implementation approach, validation process, lessons learned, skills demonstrated, and related evidence.</p></div></div></section>
    <section class="section" aria-labelledby="library-title"><div class="section-head"><p class="eyebrow">Project Library</p><h2 id="library-title">Summary cards with direct source paths.</h2></div><div class="project-grid wide">${projects.map((p) => projectCard(p)).join("")}</div></section>
    <section class="section" aria-labelledby="case-title"><div class="section-head"><p class="eyebrow">Case Studies</p><h2 id="case-title">Deeper recruiter review paths.</h2></div><div class="case-grid">${caseStudies.map(([file, title, area, summary]) => `<article class="case-card" data-reveal>${badge(area)}<h3>${esc(title)}</h3><p>${esc(summary)}</p><a class="button" href="./case-studies/${file}">Open Case Study</a></article>`).join("")}</div></section>`
}));

out("proof.html", page({
  active: "Proof",
  title: "Proof Library | Jeremy Fontenot",
  desc: "Curated proof library of preserved diagrams, scripts, runbooks, validation records, resume files, and technical notes.",
  url: "proof.html",
  body: `
    <section class="page-hero" aria-labelledby="proof-title"><div class="page-grid"><div class="stack" data-reveal><p class="eyebrow">Proof Library</p><h1 id="proof-title">Preserved files that support the portfolio.</h1><p class="lead">Every proof card links to an existing repository file. I separate authoritative proof, methodology documentation, and preserved context so reviewers can inspect the source directly.</p><div class="actions"><a class="button primary" href="./evidence-library/index.html">Evidence Index</a><a class="button" href="./assets/resume/jeremy-fontenot-resume.pdf">Download Resume</a></div></div><div class="panel" data-reveal><h2>Validation Chain</h2><p>Incident record, RCA report, remediation plan, checklist, and post-incident review remain grouped for service desk review.</p></div></div></section>
    <section class="section" aria-labelledby="proof-metrics"><div class="section-head"><p class="eyebrow">Inventory</p><h2 id="proof-metrics">Reviewer-ready source links.</h2></div><div class="metric-grid"><div class="stat"><strong>${proofItems.length}</strong><span>featured proof cards</span></div><div class="stat"><strong>5</strong><span>case-study paths</span></div><div class="stat"><strong>2</strong><span>resume PDF locations</span></div><div class="stat"><strong>10</strong><span>badge groups</span></div></div></section>
    <section class="section" aria-labelledby="proof-list"><div class="section-head"><p class="eyebrow">Artifacts</p><h2 id="proof-list">Open the source documents.</h2></div><div class="proof-grid">${proofItems.map(([title, cat, fileType, href, summary]) => `<article class="proof-card" data-reveal>${badge(cat)}<h3>${esc(title)}</h3><p>${esc(summary)}</p><dl><dt>Type</dt><dd>${esc(fileType)}</dd><dt>Path</dt><dd>${esc(href)}</dd></dl><a class="button" href="./${href}">Review Evidence</a></article>`).join("")}</div></section>`
}));

out("resume.html", page({
  active: "Resume",
  title: "Resume | Jeremy Fontenot",
  desc: "Recruiter-ready resume page for enterprise service desk, IT support, Microsoft 365, endpoint support, and systems administration growth roles.",
  url: "resume.html",
  body: `
    <section class="page-hero" aria-labelledby="resume-title"><div class="page-grid"><div class="stack" data-reveal><p class="eyebrow">Resume Snapshot</p><h1 id="resume-title">Service desk experience with systems administration growth.</h1><p class="lead">I present production support experience alongside evidence-backed infrastructure, Microsoft 365, PowerShell, networking, and documentation work.</p><div class="actions"><a class="button primary" href="./assets/resume/jeremy-fontenot-resume.pdf">Download PDF Resume</a><a class="button" href="./evidence-library/experience/jeremy-fontenot-resume-2026.pdf">Open Evidence Copy</a></div></div><div class="panel" data-reveal><h2>Role Alignment</h2><p>Service Desk Technician, Desktop Support, IT Support Specialist, Junior Systems Administrator, and infrastructure operations growth path.</p></div></div></section>
    <section class="section" aria-labelledby="skills-title"><div class="section-head"><p class="eyebrow">Technical Coverage</p><h2 id="skills-title">Skills organized for recruiter and technical screening.</h2></div><div class="card-grid">${[
      ["Service Desk and ITSM", "Incident management, escalation management, ServiceNow, Ivanti, SLA awareness, and knowledge documentation."],
      ["Microsoft 365 and Identity", "Microsoft 365, Entra ID concepts, Active Directory, MFA, Conditional Access, and account provisioning workflows."],
      ["Infrastructure and Networking", "DNS, DHCP, VLANs, Windows Server, virtualization, backup, recovery, and validation methodology."],
      ["Automation and Operations", "PowerShell, Git, runbooks, change records, validation notes, and support handoff documentation."]
    ].map(([t,s]) => `<article class="card" data-reveal>${badge(t.split(" ")[0])}<h3>${t}</h3><p>${s}</p></article>`).join("")}</div></section>
    <section class="section" aria-labelledby="evidence-title"><div class="section-head"><p class="eyebrow">Evidence Map</p><h2 id="evidence-title">Resume claims routed to proof.</h2></div><div class="project-grid">${projects.slice(0,4).map((p) => projectCard(p)).join("")}</div></section>`
}));

out("dashboard.html", page({
  active: "Dashboard",
  title: "Repository Health Dashboard | Jeremy Fontenot",
  desc: "Repository governance dashboard for validation coverage, evidence integrity, Lighthouse reports, and portfolio deployment readiness.",
  url: "dashboard.html",
  body: `
    <section class="page-hero" aria-labelledby="dashboard-title"><div class="page-grid"><div class="stack" data-reveal><p class="eyebrow">Repository Governance</p><h1 id="dashboard-title">Validation and evidence integrity at a glance.</h1><p class="lead">I use this page to summarize the quality controls behind the portfolio: HTML validation, accessibility checks, link checks, image checks, Lighthouse reports, evidence hashes, and deployment verification.</p></div><div class="panel" data-reveal><h2>Governance Status</h2><p>Public pages are validated locally before commit, pushed to main, and verified on GitHub Pages after deployment.</p></div></div></section>
    <section class="section" aria-labelledby="metrics-title"><div class="section-head"><p class="eyebrow">Controls</p><h2 id="metrics-title">Validation domains.</h2></div><div class="card-grid">${["HTML and metadata", "Links and proof paths", "Images and SVG containment", "Accessibility", "Lighthouse", "GitHub Pages deployment"].map((t) => `<article class="card" data-reveal>${badge("Control")}<h3>${t}</h3><p>Tracked as part of the release readiness workflow for the static portfolio.</p></article>`).join("")}</div></section>
    <section class="section" aria-labelledby="governance-links"><div class="section-head"><p class="eyebrow">Repository Files</p><h2 id="governance-links">Open validation references.</h2></div><div class="proof-grid">${[
      ["Repository Health Summary", "artifacts/dashboard/repository-health.md"],
      ["Evidence Hash Inventory", "evidence-library/integrity/evidence-hashes.json"],
      ["Evidence Search Index", "evidence-library/evidence-search-index.json"],
      ["Evidence Relationship Map", "evidence-library/evidence-relationships.json"]
    ].map(([t,h]) => `<article class="proof-card" data-reveal><h3>${t}</h3><p>Repository-local governance file.</p><a class="button" href="./${h}">Open File</a></article>`).join("")}</div></section>`
}));

out("contact.html", page({
  active: "Contact",
  title: "Contact | Jeremy Fontenot",
  desc: "Contact Jeremy Fontenot for enterprise service desk, IT support, Microsoft 365, endpoint support, and systems administration growth opportunities.",
  url: "contact.html",
  body: `
    <section class="page-hero" aria-labelledby="contact-title"><div class="page-grid"><div class="stack" data-reveal><p class="eyebrow">Contact</p><h1 id="contact-title">Ready for service desk and IT support review.</h1><p class="lead">The fastest review path is my resume, project summaries, and proof library. Each route is built for recruiter scanning and technical verification.</p><div class="actions"><a class="button primary" href="./assets/resume/jeremy-fontenot-resume.pdf">Download Resume</a><a class="button" href="./projects.html">View Projects</a><a class="button" href="./proof.html">Proof Library</a></div></div><div class="panel" data-reveal><h2>Professional Channels</h2>${linkList([["LinkedIn", "https://www.linkedin.com/in/jeremy-fontenot-b1537a264/"], ["GitHub", "https://github.com/JeremyFontenot"], ["Resume PDF", "assets/resume/jeremy-fontenot-resume.pdf"]])}</div></div></section>
    <section class="section" aria-labelledby="fit-title"><div class="section-head"><p class="eyebrow">Role Fit</p><h2 id="fit-title">Clear alignment for hiring review.</h2></div><div class="card-grid">${[
      ["Service Desk and Desktop Support", "Issue intake, Windows support, endpoint checks, DNS/DHCP review, escalation context, validation, and closure notes."],
      ["Microsoft 365 and Systems Growth", "Microsoft 365, identity access workflows, Active Directory fundamentals, Intune concepts, Windows Server, VPN, and networking fundamentals."],
      ["Documentation-First Operations", "Controlled troubleshooting, evidence capture, validation, rollback awareness, runbooks, and practical automation handoff."]
    ].map(([t,s]) => `<article class="card" data-reveal>${badge("Fit")}<h3>${t}</h3><p>${s}</p></article>`).join("")}</div></section>`
}));

for (const [file, title, area, summary, image, skills, evidence] of caseStudies) {
  out(`case-studies/${file}`, page({
    active: "Projects",
    title: `${title} Case Study | Jeremy Fontenot`,
    desc: `First-person case study for ${title}, covering objective, environment, architecture, implementation, validation, lessons learned, skills, and related proof.`,
    url: `case-studies/${file}`,
    prefix: "..",
    type: "article",
    body: `
    <section class="page-hero" aria-labelledby="case-title"><div class="page-grid"><div class="stack" data-reveal><p class="eyebrow">Case Study / ${esc(area)}</p><h1 id="case-title">${esc(title)}</h1><p class="lead">${esc(summary)}</p><div class="actions"><a class="button primary" href="../projects.html">Back to Projects</a><a class="button" href="../proof.html">Open Proof Library</a></div></div><div class="panel" data-reveal><div class="media-box"><img src="../${image}" alt="${esc(title)} evidence diagram" width="1200" height="760" loading="eager" decoding="async"></div></div></div></section>
    <section class="section" aria-labelledby="case-sections"><div class="section-head"><p class="eyebrow">Case Study Structure</p><h2 id="case-sections">Business objective through validation.</h2></div><div class="case-grid">${[
      ["Executive Summary", `I use this case study to make ${title} reviewable without implying unsupported production ownership.`],
      ["Business Objective", "Create a clear hiring-review path from practical support work to systems administration concepts and preserved evidence."],
      ["Technical Environment", `The environment is framed around ${area.toLowerCase()} concepts, sanitized files, lab-safe documentation, and repository-local proof.`],
      ["Architecture Overview", "The diagram and written records show boundaries, roles, dependencies, and review context before implementation claims."],
      ["Implementation Approach", "I document intent, scope, prerequisites, validation method, rollback context, and handoff notes before describing completion."],
      ["Validation Process", "I verify links, sanitize proof, check diagrams against written records, and keep unsupported activity framed as methodology or planning."],
      ["Lessons Learned", "The strongest portfolio evidence is concise, source-linked, and explicit about what has been validated."],
      ["Skills Demonstrated", skills.join("; ")]
    ].map(([h,p]) => `<article class="case-card" data-reveal>${badge(h)}<h3>${h}</h3><p>${esc(p)}</p></article>`).join("")}</div></section>
    <section class="section" aria-labelledby="evidence-title"><div class="section-head"><p class="eyebrow">Related Evidence</p><h2 id="evidence-title">Open the source artifacts.</h2></div><div class="proof-grid">${evidence.map(([label, href]) => `<article class="proof-card" data-reveal><h3>${esc(label)}</h3><p>Repository-local evidence for this case study.</p><a class="button" href="../${href}">Open Evidence</a></article>`).join("")}</div></section>`
  }));
}

out("evidence-library/index.html", page({
  active: "Proof",
  title: "Evidence Library | Jeremy Fontenot",
  desc: "Static evidence library index for preserved portfolio proof documents, diagrams, scripts, validation records, and resume files.",
  url: "evidence-library/index.html",
  prefix: "..",
  body: `
    <section class="page-hero" aria-labelledby="library-title"><div class="page-grid"><div class="stack" data-reveal><p class="eyebrow">Evidence Library</p><h1 id="library-title">Repository-local proof index.</h1><p class="lead">This compatibility page routes reviewers to the same preserved proof documents used by the rebuilt proof page.</p><div class="actions"><a class="button primary" href="../proof.html">Proof Page</a><a class="button" href="../evidence-library/evidence-search-index.json">Search Index JSON</a></div></div><div class="panel" data-reveal><h2>Use Case</h2><p>Direct access for reviewers who start from the evidence library path instead of the main proof page.</p></div></div></section>
    <section class="section" aria-labelledby="library-items"><div class="section-head"><p class="eyebrow">Featured Files</p><h2 id="library-items">Validated links.</h2></div><div class="proof-grid">${proofItems.map(([title, cat, fileType, href, summary]) => `<article class="proof-card" data-reveal>${badge(cat)}<h3>${esc(title)}</h3><p>${esc(summary)}</p><a class="button" href="../${href}">Open Evidence</a></article>`).join("")}</div></section>`
}));

out("evidence/public/index.html", page({
  active: "Proof",
  title: "Public Evidence Compatibility Index | Jeremy Fontenot",
  desc: "Compatibility index for public evidence files preserved for recruiter and technical review.",
  url: "evidence/public/index.html",
  prefix: "../..",
  body: `
    <section class="page-hero" aria-labelledby="public-title"><div class="page-grid"><div class="stack" data-reveal><p class="eyebrow">Public Evidence</p><h1 id="public-title">Compatibility route for preserved public proof files.</h1><p class="lead">This page keeps existing public evidence paths discoverable while the main proof library provides the current reviewer path.</p><div class="actions"><a class="button primary" href="../../proof.html">Open Proof Library</a><a class="button" href="../../evidence-library/index.html">Evidence Library</a></div></div><div class="panel" data-reveal><h2>Preserved Paths</h2><p>Legacy public evidence files remain available for link stability and source review.</p></div></div></section>
    <section class="section" aria-labelledby="public-links"><div class="section-head"><p class="eyebrow">Public Files</p><h2 id="public-links">Open preserved evidence.</h2></div><div class="proof-grid">${[
      ["Automation commit note", "evidence/public/automation-commit-abc123.md"],
      ["Incident log", "evidence/public/incident-2025-02-10-logs.txt"],
      ["Intune sample", "evidence/public/intune-profile-sample.json"],
      ["M365 baseline report", "evidence/public/m365-baseline-report-2024-10-05.md"],
      ["RCA note", "evidence/public/rca-2025-02-10.md"],
      ["GPO template", "evidence/public/gpo-template-StandardDesktop.xml"]
    ].map(([label, href]) => `<article class="proof-card" data-reveal><h3>${label}</h3><p>Public evidence compatibility file.</p><a class="button" href="../../${href}">Open File</a></article>`).join("")}</div></section>`
}));

out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${["", "projects.html", "proof.html", "dashboard.html", "resume.html", "contact.html", "evidence-library/index.html", "evidence/public/index.html", ...caseStudies.map(([file]) => `case-studies/${file}`)].map((url) => `  <url><loc>https://jeremyfontenot.online/${url}</loc></url>`).join("\n")}
</urlset>`);

console.log("Clean site rebuild generated.");
