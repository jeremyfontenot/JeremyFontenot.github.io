# Network Validation Checklist 2026

Status: Sanitized validation methodology
Scope: Home lab network, VLAN, DNS, DHCP, firewall, and VPN validation
Evidence type: Planned validation checklist

## Purpose

This checklist defines a repeatable validation method for the home lab network. It is designed to produce real evidence after checks are performed. Until results are recorded, this document is a planned validation methodology and should not be represented as completed validation.

## Objective

Provide a controlled network verification workflow for gateway reachability, VLAN boundaries, DNS, DHCP, firewall behavior, VPN access, and service availability.

## Technical Areas Demonstrated

- pfSense firewall and gateway validation.
- VLAN access/trunk review.
- DNS and DHCP client verification.
- VPN route and resolver testing.
- Windows and Linux endpoint troubleshooting.
- Change rollback checkpoints.
- Evidence capture and reviewer documentation.

## Evidence Collection Rules

- Record date, reviewer, system, source VLAN, destination, command, result, and notes.
- Capture screenshots only from actual lab systems.
- Save command output only when it was actually run.
- Mark failed checks honestly and document remediation steps.
- Preserve rollback checkpoints before firewall, VLAN, DHCP, or DNS changes.

## Validation Sequence

1. Record the source endpoint, segment, expected gateway, and expected DNS/DHCP behavior.
2. Verify local adapter state before changing network settings.
3. Validate gateway reachability before testing external services.
4. Validate DNS and DHCP independently so name resolution issues are not confused with routing issues.
5. Validate firewall rules with one allowed path and one restricted path.
6. Record failures as useful evidence with remediation notes.

## Gateway Validation

- Confirm endpoint receives or is assigned the expected IP configuration.
- Confirm default gateway matches the intended segment.
- Ping the default gateway from the endpoint.
- Confirm gateway response is from the expected interface.
- Record any packet loss or routing inconsistency.

## VLAN Validation

- Confirm switch port mode matches expected access or trunk behavior.
- Confirm pfSense VLAN interface exists where required.
- Confirm Proxmox bridge or VM VLAN tag behavior where required.
- Confirm endpoint cannot reach restricted zones unless allowed.
- Confirm allowed inter-zone traffic matches documented purpose.

## DNS Resolution Validation

- Confirm endpoint DNS server assignment.
- Resolve internal hostnames.
- Resolve external hostnames.
- Resolve Active Directory service records if domain services are in scope.
- Confirm VPN clients receive or can use the intended DNS resolver.

## DHCP Lease Validation

- Confirm lease assignment from expected scope.
- Confirm DHCP options for gateway, DNS, and domain search suffix.
- Confirm reservation behavior for reserved hosts.
- Confirm scope utilization is healthy.
- Confirm release/renew behavior after changes.

## Firewall Rule Validation

- Confirm default-deny assumptions for inter-zone traffic.
- Confirm required allow rules are documented.
- Confirm management access is restricted to approved sources.
- Confirm DNS, DHCP, and VPN paths are intentionally allowed.
- Review blocked traffic logs during troubleshooting windows.

## VPN Reachability Checks

- Confirm VPN authentication path.
- Confirm assigned VPN address or route.
- Confirm allowed internal services are reachable.
- Confirm restricted zones remain blocked.
- Confirm DNS behavior over VPN.

## Latency and Connectivity Checks

- Ping gateway, DNS server, and selected internal service.
- Test service-specific ports only when approved.
- Record latency or packet loss trends.
- Distinguish local endpoint issues from segment-wide issues.

## Service Availability Checks

- Confirm DNS service status.
- Confirm DHCP service status.
- Confirm AD-related service reachability when in scope.
- Confirm monitoring or validation service availability when applicable.

## Rollback Checkpoints

- Export or record current pfSense rules before changes.
- Record switch port mode before VLAN changes.
- Record DHCP scope/options before DHCP changes.
- Record DNS forwarders and key records before DNS changes.
- Confirm console access before firewall or management network changes.

## Completion Criteria

Validation is complete only when each row has an actual result, evidence reference, and reviewer note. Failed checks may still be useful evidence when they include accurate troubleshooting and remediation context.
