# DNS/DHCP Operational Runbook 2026

Status: Sanitized operational runbook
Scope: Home lab DNS and DHCP administration practices
Evidence type: Runbook and validation guidance

## Purpose

This runbook documents DNS and DHCP operating practices for the home lab. It is intended to strengthen the DNS / DHCP evidence area with practical procedures, troubleshooting logic, audit considerations, and validation steps.

This document does not claim that every validation item has already been performed. Completed checks should be recorded separately with date, system, command output, and reviewer notes.

## Objective

Maintain a repeatable DNS/DHCP administration workflow that supports endpoint troubleshooting, Active Directory name resolution, DHCP lease validation, rollback planning, and evidence capture.

## Technical Areas Demonstrated

- Windows DNS and DHCP administration concepts.
- Linux DNS/DHCP service review where applicable.
- Active Directory service record awareness.
- DHCP scope, reservation, lease, gateway, and DNS option validation.
- Troubleshooting documentation and escalation criteria.

## DNS Role Overview

DNS provides name resolution for lab systems and services. In an Active Directory environment, DNS is also critical for domain controller discovery, authentication, Group Policy processing, and service location records.

Key DNS responsibilities:

- Resolve internal hostnames and service records.
- Forward external queries to approved upstream resolvers.
- Support Active Directory-integrated zones when domain services are present.
- Maintain predictable records for infrastructure, servers, and administrative tools.
- Provide troubleshooting data through query logs, event logs, and record review.

## DHCP Role Overview

DHCP assigns network configuration to clients and lab systems that do not require static addressing.

Key DHCP responsibilities:

- Provide IP address, subnet mask, gateway, DNS server, and domain search settings.
- Reserve stable addresses for systems that need predictable access but do not require static configuration.
- Avoid conflicts with statically assigned infrastructure addresses.
- Provide lease history useful for troubleshooting endpoint connectivity.

## Active Directory Integration Concepts

When Active Directory is part of the lab, DNS should be reviewed with AD requirements in mind:

- Domain controllers require correct SRV records.
- Domain-joined endpoints must use internal DNS for domain discovery.
- DNS misconfiguration can appear as authentication, Group Policy, or login problems.
- DNS zone health should be reviewed before blaming endpoint or account issues.

DHCP should hand out the internal DNS server to domain-joined clients unless the lab design intentionally separates that behavior.

## Reservation Strategy

Use reservations for systems that need consistent addressing but benefit from centralized DHCP management.

Good reservation candidates:

- Lab servers with service dependencies.
- Admin workstations.
- Printers or network appliances.
- Test systems referenced by runbooks or validation scripts.

Avoid relying on memory. Every reservation should include:

- Hostname.
- MAC address.
- Assigned IP address.
- Purpose.
- Owner or system role.
- Date reviewed.

## DNS Troubleshooting Workflow

1. Confirm the client has the expected DNS server.
2. Confirm the client can reach the DNS server by IP.
3. Test internal hostname resolution.
4. Test external name resolution.
5. Check whether the issue affects one client, one VLAN, or all clients.
6. Review DNS service status and event logs.
7. Check recent DNS record changes.
8. For AD issues, verify domain controller SRV record resolution.
9. Document commands, timestamps, affected scope, and resolution.

Useful checks:

- `ipconfig /all`
- `nslookup <hostname>`
- `Resolve-DnsName <hostname>`
- DNS event log review
- DNS zone and record review

## DHCP Troubleshooting Workflow

1. Confirm physical or virtual network link.
2. Confirm VLAN assignment and gateway path.
3. Check whether the client has an APIPA address.
4. Renew the client lease.
5. Verify DHCP service status.
6. Confirm scope has available addresses.
7. Confirm DHCP options for gateway and DNS.
8. Check for reservation conflicts.
9. Review lease history and event logs.
10. Document findings before making changes.

Useful checks:

- `ipconfig /release`
- `ipconfig /renew`
- `ipconfig /all`
- DHCP lease review
- DHCP scope utilization review
- Event Viewer service logs

## Common Operational Failures

| Symptom | Likely Area | Review Steps |
|---|---|---|
| Client has APIPA address | DHCP, VLAN, switch port | Check link, VLAN, DHCP scope, relay behavior |
| Can ping IP but not hostname | DNS | Check DNS server assignment and records |
| Domain login slow or failing | DNS or AD | Check SRV records and domain controller reachability |
| One VLAN cannot lease address | VLAN/DHCP path | Check firewall, relay, trunk, and scope mapping |
| VPN client cannot resolve internal names | VPN/DNS | Check VPN DNS assignment and allowed routes |

## Validation Checklist

- Confirm DHCP lease is issued from expected scope.
- Confirm gateway option is correct.
- Confirm DNS server option is correct.
- Confirm internal hostname resolution.
- Confirm external name resolution.
- Confirm domain controller SRV record resolution if AD is in scope.
- Confirm lease release/renew behavior.
- Confirm DNS and DHCP logs show expected activity.
- Confirm firewall rules allow required DNS/DHCP paths only.

## Recovery Considerations

- Export DNS and DHCP configuration before major changes.
- Document current scopes, options, reservations, and forwarders.
- Keep local console or alternate management access available before changing network services.
- Roll back DHCP options or DNS forwarding changes if client impact is detected.
- Preserve evidence of the change, validation, and rollback decision.

## Audit and Monitoring Recommendations

- Review DHCP scope utilization periodically.
- Review DNS forwarders and conditional forwarding rules.
- Track reservation changes.
- Log failed DNS or DHCP service events.
- Compare expected VLAN/scope mapping against actual leases.
- Keep evidence snapshots for future migration review.
