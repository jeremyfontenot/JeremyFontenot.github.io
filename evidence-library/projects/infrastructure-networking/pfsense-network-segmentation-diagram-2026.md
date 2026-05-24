# pfSense Network Segmentation Diagram 2026

Status: Sanitized lab architecture documentation
Scope: Home lab network segmentation planning and operational reference
Evidence type: Architecture documentation and firewall policy intent

## Purpose

This document explains the pfSense-based network segmentation model intended for the home lab environment. It is designed as portfolio-quality operational documentation, not as a claim that every rule or VLAN has already been validated on live systems.

The diagram supports future evidence-library migration by describing how WAN, LAN, VLANs, VPN access, and lab service zones should be separated and reviewed.

## Objective

Document the firewall segmentation model, management boundaries, VPN access path, and validation evidence required before any broader lab migration.

## Technical Areas Demonstrated

- pfSense firewall and routing concepts.
- VLAN zone design and default-deny policy intent.
- VPN access boundaries.
- DNS/DHCP service placement.
- Proxmox and lab workload separation.
- Firewall rule review, logging, rollback planning, and validation methodology.

## Known Lab Context

- Base environment uses the `192.168.0.0/24` network.
- Compute platform includes a Dell R710 server running lab workloads.
- Switching includes a D-Link switch with uplink connectivity between firewall, switch, and hypervisor hosts.
- Lab services include Proxmox, Active Directory, DNS, DHCP, Windows/Linux administration, Microsoft 365 concepts, VPN access, and PowerShell automation.
- pfSense is the firewall and routing control point for segmentation policy.

## Segmentation Goals

- Separate internet-facing WAN from trusted and lab networks.
- Keep firewall and infrastructure management access isolated from regular workstation traffic.
- Place server and lab workloads in zones that can be monitored and controlled.
- Support VPN access through a dedicated security boundary.
- Keep policy review simple enough for service desk and junior administrator troubleshooting.

## Security Rationale

Segmentation reduces the blast radius of workstation compromise, misconfigured lab services, and test workloads. It also makes troubleshooting more predictable because DNS, DHCP, gateway, and firewall decisions can be reviewed per zone.

This model intentionally avoids inventing a complete IP inventory. Future live migration should map this design to the actual pfSense interface, VLAN, DHCP, and firewall rule exports after manual review.

## Zone Summary

| Zone | Intent | Typical Systems | Policy Intent |
|---|---|---|---|
| WAN | Internet edge | ISP modem or upstream router | Inbound denied by default except approved VPN or explicitly reviewed services |
| Management | Administration plane | pfSense UI, Proxmox host access, switch management | Restricted to administrator workstation or VPN admin group |
| Workstation | User endpoint traffic | Windows client systems, admin workstation | Allow DNS, DHCP, internet, and approved admin tools |
| Server | Core lab services | Active Directory, DNS, DHCP, file or management services | Allow only required management and service traffic |
| Lab/Test | Isolated experiments | Temporary VMs, Linux/Windows testing systems | Deny lateral access by default; allow only required services |
| VPN | Remote administration boundary | WireGuard or OpenVPN clients | Restricted routes to approved internal services |

## Firewall Policy Intent

- Default-deny inter-VLAN traffic unless a service requirement is documented.
- Allow DNS and DHCP only to approved lab infrastructure.
- Allow management protocols only from trusted administration sources.
- Keep lab/test workloads from initiating unrestricted traffic to management systems.
- Log denied traffic during troubleshooting windows, then tune logging to avoid noise.
- Review VPN routes and firewall aliases before expanding remote access.

## Evidence Still Needed Before Live Migration

- pfSense interface assignment export or screenshots.
- VLAN configuration export from pfSense or switch.
- DHCP scope configuration export or documented reservations.
- DNS forwarder/resolver configuration notes.
- Firewall rule review showing allow/deny policy for each zone.
- Validation checklist results showing gateway, DNS, DHCP, and VPN reachability.

## Related Artifact

See `pfsense-network-segmentation-diagram-2026.svg` for the visual architecture reference.
