# VLAN Architecture Walkthrough 2026

Status: Draft lab architecture documentation  
Scope: Home lab VLAN segmentation and operational planning  
Evidence type: Network architecture walkthrough

## Purpose

This walkthrough documents a practical VLAN segmentation strategy for the home lab. It is intended to strengthen DNS, DHCP, networking, and pfSense evidence by showing how segmentation should be designed, documented, validated, and operated.

This is not a completed deployment claim and does not invent a complete VLAN or IP address inventory.

## VLAN Purpose

VLANs separate traffic by operational role. In a lab that includes pfSense, Proxmox, Active Directory, DNS, DHCP, VPN services, and workstation administration, VLANs provide a controlled way to separate:

- Infrastructure management traffic
- User or workstation traffic
- Server and directory services
- Test or isolated lab workloads
- VPN ingress traffic

The main benefit is not complexity. The benefit is predictable boundaries for troubleshooting, firewall rule design, and future evidence collection.

## Segmentation Strategy

A preservation-safe segmentation model should start with a small number of clear zones:

| Segment | Purpose | Review Focus |
| --- | --- | --- |
| Management | Firewall, switch, hypervisor, and administrator access | Access control, MFA/VPN restrictions, logging |
| Workstation | Admin workstation and general endpoint testing | DNS, DHCP, internet access, support workflow validation |
| Server | AD DS, DNS, DHCP, internal services | Service reachability, authentication, name resolution |
| Lab/Test | Temporary VMs and experiments | Isolation, reset procedures, limited access |
| VPN | Remote administration paths | Route control, authentication, firewall rules |

## Switch Uplink Concepts

The D-Link switch should be documented with a clear distinction between trunk and access behavior:

- Trunk uplink to pfSense for routed VLAN interfaces.
- Trunk or tagged uplink to Proxmox when guest VLAN separation is required.
- Access ports for untagged endpoint or management devices.
- Port labeling for physical traceability during troubleshooting.

Future evidence should include switch configuration exports or screenshots only when collected from the actual lab.

## Hypervisor Network Separation

For Proxmox on the Dell R710, network separation should be documented through bridge names, NIC mapping, and intended VLAN handling.

Recommended documentation fields:

- Physical NIC identifier.
- Bridge name.
- VLAN awareness setting.
- Connected switch port.
- Intended workload zone.
- Management access path.
- Rollback notes if a bridge or VLAN change blocks access.

## Management Isolation

Management access should be treated as a privileged path. The management plane should avoid unrestricted access from lab/test workloads.

Recommended controls:

- Restrict pfSense, switch, and Proxmox interfaces to trusted sources.
- Use VPN access only for documented administrative paths.
- Avoid placing temporary test workloads in the management segment.
- Document break-glass local access for firewall or switch misconfiguration.

## Lab Isolation

Lab/test segments should support experimentation without weakening the rest of the environment.

Recommended practices:

- Deny lab-to-management traffic by default.
- Allow lab-to-DNS only where required.
- Allow internet egress only when needed for patching or testing.
- Log denied traffic temporarily during troubleshooting.
- Document exceptions with purpose, owner, and rollback criteria.

## Troubleshooting Considerations

When VLAN issues occur, troubleshoot from the physical layer upward:

1. Confirm cable, link light, and switch port.
2. Confirm port mode: access or trunk.
3. Confirm VLAN tag expectations on pfSense and Proxmox.
4. Confirm gateway reachability.
5. Confirm DHCP lease behavior.
6. Confirm DNS resolution.
7. Confirm firewall rule path.
8. Confirm service-specific traffic.

## Operational Benefits

- Easier fault isolation for DNS, DHCP, VPN, and firewall issues.
- Clearer evidence packages for portfolio review.
- Better alignment with enterprise segmentation concepts.
- Safer experimentation in lab/test zones.
- Better rollback planning for network changes.

## Future Scaling Considerations

Before adding more VLANs, document why the segment needs a separate policy boundary. Avoid creating VLANs that do not have different access requirements, monitoring needs, or risk profiles.

Future expansion candidates:

- Dedicated monitoring segment.
- Dedicated backup or storage segment.
- Dedicated Microsoft 365 hybrid administration segment.
- Dedicated guest or untrusted device segment.

## Evidence Still Needed

- Switch port map.
- pfSense VLAN interface export.
- Proxmox bridge mapping.
- DHCP scope mapping.
- Firewall rule review.
- Validation checklist results for gateway, DNS, DHCP, and VPN reachability.
