# VLAN Architecture Diagram Evidence README

## Architecture Overview

`vlan-architecture-diagram.svg` and `vlan-architecture-diagram-dark.svg` are primary visual evidence artifacts for the VLAN Architecture Walkthrough project. The diagram ties the switching layer, pfSense VLAN routing, Proxmox bridge mapping, Windows Server services, DHCP ownership, firewall segmentation, VPN reachability, and validation coverage into one reviewable architecture view.

## Security Model

The architecture follows a least-privilege segmentation model:

- Management traffic is isolated to management interfaces.
- Clients are limited to required Active Directory and DNS paths.
- IoT traffic is treated as untrusted and limited to internet-oriented access.
- Guest traffic is isolated from internal services.
- Firewall enforcement occurs at pfSense routing boundaries.

## VLAN Strategy

- VLAN 10: Management interfaces and administrative access.
- VLAN 20: Server infrastructure, Windows Server, AD, DNS, and DHCP.
- VLAN 30: Client systems with limited AD/DNS access.
- VLAN 40: IoT network with pfSense-managed DHCP and isolation from trusted LANs.
- VLAN 50: Guest network with pfSense-managed DHCP and internet-only access.

## DHCP Architecture

Trusted VLANs use Windows Server DHCP through relay:

- VLAN 20: Windows Server DHCP ownership.
- VLAN 30: Windows Server DHCP ownership.

Untrusted VLANs use pfSense DHCP locally:

- VLAN 40: pfSense DHCP ownership.
- VLAN 50: pfSense DHCP ownership.

## Firewall Design

The diagram documents firewall policy intent:

- Management to management only.
- Clients to AD/DNS only.
- IoT to internet only.
- Guest to internet only.
- Blocked east-west traffic across trust boundaries.

## Validation Methodology

The diagram includes validation coverage for:

- Gateway reachability.
- DHCP validation.
- DNS resolution.
- Firewall segmentation.
- Internet connectivity.
- VPN reachability.
- Routing validation.

## Evidence Chain Mapping

This diagram summarizes and cross-references the evidence package:

- Switch Port Map: `../network/network-validation-lab-notes.md`
- pfSense VLAN Interface Export: `../network/network-validation-lab-notes.md`
- Proxmox Bridge Mapping: `../proxmox/proxmox-host-evidence.md`
- DHCP Scope Mapping: `../network/dhcp-dns-evidence.md`
- Firewall Rule Review: `../network/firewall-rules-evidence.md`
- Validation Checklist Results: `../validation-reports/network-validation-checklist-2026.md`
- VPN Validation: `../vpn/vpn-configuration-evidence.md`

## Review Use

The artifact is intended for recruiter review, hiring manager review, systems administrator interviews, network administrator interviews, infrastructure engineer interviews, and portfolio evidence validation. It functions as both a technical architecture diagram and a visual evidence summary for the VLAN Architecture Walkthrough project.
