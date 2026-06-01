---
title: "VLAN Architecture Walkthrough 2026"
description: "Enterprise-style VLAN segmentation case study documenting pfSense routing, Proxmox bridge mapping, Windows Server services, DHCP ownership, firewall boundaries, VPN reachability, and validation evidence."
type: "TechArticle"
og_title: "VLAN Architecture Walkthrough 2026"
og_description: "A recruiter-ready infrastructure case study showing VLAN design, network segmentation, DHCP/DNS architecture, firewall policy, virtualization networking, and validation evidence."
og_image: "../../architecture-diagrams/vlan-architecture-diagram-dark.png"
---

# VLAN Architecture Walkthrough 2026

Status: Sanitized lab architecture documentation<br>
Scope: Home lab VLAN segmentation, infrastructure planning, firewall policy, and validation methodology<br>
Primary artifact: [VLAN Architecture Evidence Diagram](../../architecture-diagrams/vlan-architecture-diagram.svg)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "VLAN Architecture Walkthrough 2026",
  "description": "Enterprise-style VLAN segmentation case study documenting pfSense routing, Proxmox bridge mapping, Windows Server services, DHCP ownership, firewall boundaries, VPN reachability, and validation evidence.",
  "author": {
    "@type": "Person",
    "name": "Jeremy Fontenot"
  },
  "about": [
    "VLAN design",
    "pfSense firewall administration",
    "Proxmox networking",
    "DHCP architecture",
    "DNS architecture",
    "Active Directory",
    "network segmentation"
  ],
  "image": "../../architecture-diagrams/vlan-architecture-diagram-dark.png"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Evidence Library",
      "item": "../../index.html"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Infrastructure Networking",
      "item": "./vlan-architecture-walkthrough-2026.md"
    }
  ]
}
</script>

<style>
  .case-shell {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 260px;
    gap: 1.5rem;
    align-items: start;
  }

  .toc {
    position: sticky;
    top: 1rem;
    border: 1px solid #c8d6e5;
    border-radius: 12px;
    padding: 1rem;
    background: #f8fbff;
  }

  .toc a {
    display: block;
    margin: .45rem 0;
    font-size: .95rem;
  }

  .hero-diagram,
  .diagram-pair {
    margin: 1rem 0;
  }

  .hero-diagram img,
  .diagram-pair img {
    width: 100%;
    max-width: 100%;
    height: auto;
    border: 1px solid #c8d6e5;
    border-radius: 14px;
  }

  .diagram-pair {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin: 1rem 0 1.5rem;
  }

  .case-card {
    border: 1px solid #c8d6e5;
    border-radius: 12px;
    padding: 1rem;
    background: #f8fbff;
  }

  .case-card h3,
  .case-card h4 {
    margin-top: 0;
  }

  .evidence-nav {
    border: 1px solid #8fbce6;
    border-radius: 12px;
    padding: 1rem;
    background: #eef7ff;
    margin: 1rem 0 1.5rem;
  }

  .status-pass {
    font-weight: 700;
    color: #0f766e;
  }

  @media (max-width: 900px) {
    .case-shell,
    .diagram-pair,
    .card-grid {
      grid-template-columns: 1fr;
    }

    .toc {
      position: static;
    }
  }
</style>

<div class="case-shell">
<main>

## Executive Summary

I built this VLAN Architecture Walkthrough to document how a small infrastructure environment can be segmented, routed, secured, and validated using enterprise-style practices. The project connects pfSense firewall administration, Proxmox virtualization networking, Windows Server services, DHCP/DNS planning, VPN access control, switch port mapping, and validation evidence into one reviewable package.

The business problem is straightforward: flat networks are harder to troubleshoot, harder to secure, and harder to explain during operational review. This case study demonstrates how I break infrastructure into clear trust zones, document the supporting paths, and validate expected behavior without overstating the lab as a production deployment.

The technical objectives were to:

- Define VLAN boundaries for management, server, client, IoT, and guest traffic.
- Map switch ports and trunk/access behavior for traceable physical support.
- Show pfSense as the routing and firewall enforcement point.
- Show Proxmox bridge relationships for virtualized workloads.
- Preserve Windows Server, Active Directory, DNS, and DHCP as core infrastructure services.
- Document DHCP ownership and relay behavior between trusted and untrusted VLANs.
- Preserve validation evidence for gateway, DHCP, DNS, routing, firewall, VPN, and internet reachability checks.

The operational value is recruiter-readable: this project shows that I can plan an infrastructure change, document the architecture, define security boundaries, validate the result, and organize the evidence so another technician, administrator, or hiring manager can review it.

<div class="hero-diagram">
  <a href="../../architecture-diagrams/vlan-architecture-diagram.svg">
    <img src="../../architecture-diagrams/vlan-architecture-diagram.svg" alt="VLAN Architecture Walkthrough evidence diagram showing switch ports, pfSense VLAN interfaces, Proxmox bridge mapping, DHCP ownership, firewall boundaries, validation coverage, and documentation references.">
  </a>
</div>

<div class="evidence-nav" aria-label="Evidence navigation panel">

**Evidence navigation**

- [Open light SVG diagram](../../architecture-diagrams/vlan-architecture-diagram.svg)
- [Open light PNG diagram](../../architecture-diagrams/vlan-architecture-diagram.png)
- [Open dark SVG diagram](../../architecture-diagrams/vlan-architecture-diagram-dark.svg)
- [Open dark PNG diagram](../../architecture-diagrams/vlan-architecture-diagram-dark.png)
- [Open diagram README](../../architecture-diagrams/vlan-architecture-diagram-README.md)
- [Open validation checklist](../../validation-reports/network-validation-checklist-2026.md)

</div>

## Environment Overview

| Component | Role in the architecture | Operational purpose |
| --- | --- | --- |
| Dell R710 | Physical virtualization host | Provides the lab compute platform for virtualized infrastructure workloads. |
| Proxmox | Hypervisor and bridge layer | Separates management and workload traffic through documented bridge mappings. |
| pfSense | Firewall, router, VPN edge, DHCP for untrusted VLANs | Enforces routed boundaries and policy control between VLANs. |
| Windows Server | Core infrastructure services | Hosts Active Directory, DNS, DHCP, authentication, and domain services. |
| Active Directory | Identity and authentication | Provides centralized identity concepts for trusted infrastructure services. |
| DNS | Name resolution | Supports internal resolution and troubleshooting workflows. |
| DHCP | Address assignment | Provides scope ownership for trusted VLANs and documents relay expectations. |
| VPN | Administrative access path | Supports controlled remote reachability for management workflows. |
| Managed switch | Physical VLAN and port boundary | Distinguishes trunk and access behavior for physical traceability. |
| Wireless AP | Tagged wireless network edge | Supports guest and IoT SSID segmentation through trunked VLANs. |

## Architecture Overview

The architecture uses pfSense as the routed enforcement point, a managed switch as the trunk/access boundary, Proxmox as the virtualization bridge layer, and Windows Server as the trusted core service node. VLANs define policy boundaries rather than just IP ranges. Each VLAN has a business and operational purpose, and each supporting artifact explains a different layer of the design.

<div class="diagram-pair">
  <figure>
    <a href="../../architecture-diagrams/vlan-architecture-diagram.svg">
      <img src="../../architecture-diagrams/vlan-architecture-diagram.svg" alt="Light VLAN architecture evidence diagram.">
    </a>
    <figcaption>Light version for printed documentation and neutral review surfaces.</figcaption>
  </figure>
  <figure>
    <a href="../../architecture-diagrams/vlan-architecture-diagram-dark.svg">
      <img src="../../architecture-diagrams/vlan-architecture-diagram-dark.svg" alt="Dark VLAN architecture evidence diagram.">
    </a>
    <figcaption>Dark version aligned to the portfolio visual system.</figcaption>
  </figure>
</div>

### Design Rationale

- pfSense is positioned as the gateway and firewall policy enforcement point so routing decisions and segmentation rules are centralized.
- Windows Server owns trusted DHCP responsibilities for VLAN 20 and VLAN 30 through relay relationships because those zones depend on core infrastructure services.
- pfSense owns DHCP for untrusted VLAN 40 and VLAN 50 because IoT and guest networks should not depend on domain services.
- The managed switch documents physical traceability so troubleshooting can start with cable, port, and mode verification before moving into routing or firewall logic.
- Proxmox bridge mappings separate management, trusted workloads, untrusted workloads, and isolated internal testing.

### Tradeoffs

- More VLANs improve policy clarity but increase documentation and troubleshooting requirements.
- DHCP relay keeps trusted scope management centralized but requires clear gateway and relay validation.
- Guest and IoT isolation reduces lateral movement risk but must be tested carefully so internet access remains available where expected.
- Management isolation protects administrative surfaces but requires a documented recovery path if routing or firewall changes block access.

### Scalability Considerations

The model is intentionally expandable. Future VLANs should only be added when they introduce a real policy boundary, monitoring requirement, or operational risk difference. Candidate additions include monitoring, backups, storage, centralized logging, and Microsoft 365 hybrid administration workflows.

## VLAN Segmentation Strategy

| VLAN | Segment | Gateway | DHCP ownership | Access model |
| --- | --- | --- | --- | --- |
| VLAN 10 | Management | 10.10.10.1 | Static or controlled management assignment | Management-only access for switch, firewall, hypervisor, and administrative interfaces. |
| VLAN 20 | Servers | 10.20.20.1 | Windows Server DHCP through relay | Trusted infrastructure services including Active Directory, DNS, DHCP, and domain services. |
| VLAN 30 | Clients | 10.30.30.1 | Windows Server DHCP through relay | Client/workstation access to approved AD and DNS services only. |
| VLAN 40 | IoT | 10.40.40.1 | pfSense DHCP | Untrusted device access with internet-only routing and blocked trusted-LAN paths. |
| VLAN 50 | Guest | 10.50.50.1 | pfSense DHCP | Guest internet access with no LAN access. |

<div class="card-grid">
  <section class="case-card">
    <h3>Architecture Callout</h3>
    <p>pfSense acts as the control plane for inter-VLAN routing, firewall enforcement, DHCP relay handling, VPN reachability, and outbound access policy.</p>
  </section>
  <section class="case-card">
    <h3>Security Callout</h3>
    <p>Trusted services are separated from untrusted IoT and guest networks. Allowed paths are explicit, and blocked paths enforce trust boundaries.</p>
  </section>
  <section class="case-card">
    <h3>Operations Callout</h3>
    <p>The switch port map, bridge map, DHCP notes, firewall evidence, and validation checklist create a repeatable troubleshooting path.</p>
  </section>
</div>

## Technical Components

### pfSense

pfSense provides the WAN interface, LAN parent interface, VLAN gateways, firewall rule enforcement, VPN reachability, and DHCP services for untrusted networks. In this design, pfSense is the segmentation boundary rather than just an internet gateway.

Key documented interfaces:

- WAN: `igb0`
- LAN parent: `igb1`
- VLAN 10 Management
- VLAN 20 Servers
- VLAN 30 Clients
- VLAN 40 IoT
- VLAN 50 Guest

### Proxmox

Proxmox represents the virtualization layer and demonstrates how VLAN-aware bridge planning supports workload separation. The bridge names in the diagram document intended operational boundaries:

- `vmbr0`: management bridge
- `vmbr1`: server and client bridge
- `vmbr2`: IoT and guest bridge
- `vmbr999`: internal isolated bridge

### Windows Server, Active Directory, DNS, and DHCP

Windows Server is documented as the core infrastructure services node. It supports Active Directory, DNS, DHCP, authentication, and domain services for trusted infrastructure and client segments. The case study keeps this role clear so reviewers can understand how identity, resolution, and address assignment support the segmented network.

### VPN

VPN reachability is treated as an administrative path, not a blanket bypass. The validation notes preserve VPN reachability as a review item so access can be tested without weakening segmentation.

### Managed Switch and Wireless AP

The managed switch provides the physical boundary for access and trunk behavior:

- Port 1 -> pfSense Trunk
- Port 2 -> Proxmox Management
- Port 3 -> Proxmox VM Trunk
- Port 4 -> Windows Server
- Port 8 -> Wireless AP Trunk

The Wireless AP is documented as a trunked endpoint for IoT and guest SSIDs mapped to VLAN 40 and VLAN 50.

## Evidence Package

Each evidence item supports one part of the architecture. Together, they form the evidence chain behind the diagram.

| Artifact | Purpose | What it demonstrates | Why it matters | Skills validated |
| --- | --- | --- | --- | --- |
| [Switch Port Map](../../network/network-validation-lab-notes.md) | Documents physical switch relationships and port mode intent. | pfSense trunk, Proxmox management, Proxmox VM trunk, Windows Server access, Wireless AP trunk. | Physical traceability improves troubleshooting and reduces guesswork during changes. | Network documentation, Layer 1/Layer 2 troubleshooting, port mapping. |
| [pfSense VLAN Interface Export](../../network/network-validation-lab-notes.md) | Captures the VLAN interface model and gateway role. | WAN, LAN parent, VLAN gateways, firewall enforcement point, routing boundaries. | Interface evidence supports segmentation review and firewall policy validation. | pfSense administration, routing, VLAN design. |
| [Proxmox Bridge Mapping](../../proxmox/proxmox-host-evidence.md) | Documents virtualization network boundaries. | Bridge-to-VLAN relationships and management/workload separation. | Virtual networking must align with switch and firewall expectations. | Proxmox administration, virtualization networking, infrastructure planning. |
| [DHCP Scope Mapping](../../network/dhcp-dns-evidence.md) | Defines ownership for trusted and untrusted address assignment. | Windows Server DHCP for VLAN 20/30 and pfSense DHCP for VLAN 40/50. | Clear DHCP ownership prevents conflicting scopes and speeds lease troubleshooting. | DHCP administration, DNS/DHCP operations, service ownership. |
| [Firewall Rule Review](../../network/firewall-rules-evidence.md) | Preserves firewall policy intent and segmentation behavior. | Allowed paths, blocked paths, guest isolation, IoT isolation, and administrative separation. | Firewall policy is the enforcement layer behind VLAN design. | Firewall management, security fundamentals, rule review. |
| [Validation Checklist Results](../../validation-reports/network-validation-checklist-2026.md) | Provides repeatable testing methodology. | Gateway, DHCP, DNS, firewall, VPN, routing, and internet connectivity checks. | Validation evidence turns architecture into reviewable operational proof. | Troubleshooting, validation planning, technical documentation. |

## Security Architecture

This design uses segmentation as a practical zero-trust control. VLANs do not automatically create security; the security comes from defined trust boundaries, explicit allowed paths, blocked lateral movement, and validation that confirms the intended policy.

<div class="card-grid">
  <section class="case-card">
    <h3>Administrative Separation</h3>
    <p>Management access is restricted to documented administrative paths. Management interfaces are not treated as general client resources.</p>
  </section>
  <section class="case-card">
    <h3>Guest and IoT Isolation</h3>
    <p>Guest and IoT networks are untrusted. Their expected behavior is internet access without trusted LAN reachability.</p>
  </section>
  <section class="case-card">
    <h3>Firewall Segmentation</h3>
    <p>Firewall policy defines allowed and blocked routes. The traffic matrix keeps the intent readable during review.</p>
  </section>
</div>

### Traffic Matrix

| Source | Allowed destination | Blocked or restricted paths |
| --- | --- | --- |
| Management | Management resources only | General workstation, IoT, and guest access unless explicitly approved. |
| Clients | AD/DNS services | Management interfaces and untrusted VLAN lateral movement. |
| IoT | Internet only | Trusted LAN, management, and server resources. |
| Guest | Internet only | Trusted LAN, management, server, and IoT resources. |

## Validation Methodology

Validation is documented as a repeatable process. The goal is to confirm the architecture from physical connectivity through service behavior and firewall enforcement.

| Validation area | Method | Expected result | Observed result | Outcome |
| --- | --- | --- | --- | --- |
| Gateway reachability | Test each VLAN gateway from an appropriate host or test point. | Each VLAN reaches its assigned gateway. | Documented in the validation checklist package. | <span class="status-pass">Pass-ready methodology</span> |
| DHCP validation | Confirm lease behavior from the correct DHCP owner or relay path. | VLAN 20/30 receive trusted DHCP through relay; VLAN 40/50 use pfSense DHCP. | Documented in DHCP/DNS and validation evidence. | <span class="status-pass">Pass-ready methodology</span> |
| DNS validation | Test internal and external resolution paths from trusted segments. | Trusted clients resolve internal names and internet DNS as expected. | Documented in DHCP/DNS evidence. | <span class="status-pass">Pass-ready methodology</span> |
| Firewall validation | Test allowed and blocked paths from each security zone. | Approved traffic succeeds; restricted lateral movement fails. | Documented in firewall rule evidence. | <span class="status-pass">Pass-ready methodology</span> |
| Routing validation | Confirm expected VLAN-to-gateway and VLAN-to-internet routing behavior. | Routed paths match the traffic matrix. | Documented in validation checklist package. | <span class="status-pass">Pass-ready methodology</span> |
| VPN validation | Confirm administrative reachability without bypassing segmentation policy. | VPN access reaches approved administrative targets only. | Documented as a validation checklist item. | <span class="status-pass">Pass-ready methodology</span> |
| Internet connectivity | Test outbound access from approved networks. | Clients, IoT, and guest networks reach the internet according to policy. | Documented in validation checklist package. | <span class="status-pass">Pass-ready methodology</span> |

## Troubleshooting Methodology

I troubleshoot VLAN and segmentation issues from the physical layer upward:

1. Confirm cable, link light, and switch port.
2. Confirm switch port mode: access or trunk.
3. Confirm VLAN tag expectations on pfSense, the managed switch, Proxmox, and the Wireless AP.
4. Confirm gateway reachability.
5. Confirm DHCP lease assignment and scope ownership.
6. Confirm DNS resolution.
7. Confirm firewall rule path and rule order.
8. Confirm service-specific traffic such as AD/DNS authentication dependencies.
9. Confirm VPN route behavior only after local routing and firewall logic are understood.

This process keeps troubleshooting disciplined. It avoids jumping directly to firewall rules when the root cause may be a port mode, VLAN tag, bridge mapping, gateway, or DHCP relay issue.

## Skills Demonstrated

<div class="card-grid">
  <section class="case-card"><h3>Network Administration</h3><p>VLAN planning, trunk/access documentation, routing boundaries, and physical port mapping.</p></section>
  <section class="case-card"><h3>Infrastructure Design</h3><p>Service placement, trust zones, management boundaries, and operational dependency mapping.</p></section>
  <section class="case-card"><h3>Active Directory</h3><p>Core identity service placement, trusted segment dependencies, authentication context, and domain-service documentation.</p></section>
  <section class="case-card"><h3>DHCP Administration</h3><p>Scope ownership, relay design, pfSense DHCP boundaries, and lease troubleshooting methodology.</p></section>
  <section class="case-card"><h3>DNS Administration</h3><p>Internal resolution planning, trusted DNS dependency mapping, and validation workflows.</p></section>
  <section class="case-card"><h3>Firewall Management</h3><p>Allowed/blocked path documentation, guest isolation, IoT isolation, and administrative separation.</p></section>
  <section class="case-card"><h3>Virtualization</h3><p>Proxmox bridge planning, VLAN-aware workload separation, and isolated internal bridge documentation.</p></section>
  <section class="case-card"><h3>Security Fundamentals</h3><p>Least privilege, zero-trust segmentation concepts, trust boundaries, and route validation.</p></section>
  <section class="case-card"><h3>Technical Documentation</h3><p>Evidence chain mapping, review-ready diagrams, validation records, and recruiter-readable summaries.</p></section>
</div>

## Lessons Learned

- VLAN design is most useful when each segment has a clear access policy, not just a different subnet.
- Firewall policy and DHCP ownership must be documented together because both affect what users experience during support calls.
- Proxmox bridge naming should be predictable and mapped to the physical switch plan so VM connectivity issues can be isolated quickly.
- Guest and IoT isolation must be validated from the client perspective, not assumed from the diagram.
- Evidence is stronger when the diagram, checklist, and supporting notes all point to the same architecture.

## Future Roadmap

Potential future extensions should be added only when they create a real operational boundary:

- Monitoring VLAN for observability tooling.
- Backup VLAN for protected backup traffic.
- Storage VLAN for dedicated storage access.
- Microsoft 365 hybrid administration segment.
- Multi-node Proxmox cluster planning.
- Centralized logging for firewall, DHCP, DNS, VPN, and authentication events.

## Recruiter Takeaways

This project demonstrates that I can work across infrastructure layers: physical switching, VLAN design, firewall policy, virtualization networking, Windows Server services, DNS, DHCP, VPN, and validation documentation. It also shows that I organize proof in a way hiring managers can inspect instead of relying on broad claims.

Related internal links:

- [Evidence Library](../../index.html)
- [Network Validation Lab Notes](../../network/network-validation-lab-notes.md)
- [Firewall Rule Evidence](../../network/firewall-rules-evidence.md)
- [DHCP and DNS Evidence](../../network/dhcp-dns-evidence.md)
- [Network Validation Checklist](../../validation-reports/network-validation-checklist-2026.md)

</main>

<aside class="toc" aria-label="Table of contents">

**On this page**

- [Executive Summary](#executive-summary)
- [Environment Overview](#environment-overview)
- [Architecture Overview](#architecture-overview)
- [VLAN Segmentation Strategy](#vlan-segmentation-strategy)
- [Technical Components](#technical-components)
- [Evidence Package](#evidence-package)
- [Security Architecture](#security-architecture)
- [Validation Methodology](#validation-methodology)
- [Troubleshooting Methodology](#troubleshooting-methodology)
- [Skills Demonstrated](#skills-demonstrated)
- [Lessons Learned](#lessons-learned)
- [Future Roadmap](#future-roadmap)

</aside>
</div>
