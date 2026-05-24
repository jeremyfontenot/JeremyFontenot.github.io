# Service Desk Network Troubleshooting Workflow 2026

Status: Sanitized service desk workflow
Scope: Endpoint, DNS, DHCP, VPN, VLAN, and firewall triage
Evidence type: Troubleshooting runbook

## Purpose

This workflow provides a practical service desk approach for network troubleshooting in the home lab. It documents methodical troubleshooting, escalation judgment, ticket documentation, and root cause analysis discipline.

This is not a fabricated incident record. It is a reusable troubleshooting workflow for future real tickets, lab faults, or validation exercises.

## Objective

Standardize the first-response process for endpoint, DNS, DHCP, VPN, VLAN, and firewall symptoms so evidence is captured before settings are changed.

## Technical Areas Demonstrated

- Windows endpoint troubleshooting with `ipconfig`, route checks, DNS tests, and service-specific validation.
- Linux/network troubleshooting concepts such as interface state, gateway reachability, and DNS resolver checks.
- DNS/DHCP validation and lease review.
- VLAN and pfSense firewall path isolation.
- VPN route, authentication, and DNS behavior review.
- Ticket triage, escalation criteria, RCA triggers, and evidence handoff.

## Triage Workflow

1. Capture the user impact.
2. Identify affected system, network location, and time started.
3. Determine whether the issue affects one device, one VLAN, one service, or multiple users.
4. Check physical or virtual connectivity.
5. Validate IP configuration.
6. Validate DNS resolution.
7. Validate gateway and routing.
8. Validate service-specific access.
9. Review VPN or firewall path if remote access is involved.
10. Escalate with evidence when the issue crosses system, network, or security boundaries.

## Verification Method

- Record the expected network path before testing.
- Capture current IP configuration before renewals, DNS flushes, or adapter resets.
- Test gateway, DNS, and service reachability separately.
- Use a known-good endpoint or segment only after documenting the affected endpoint state.
- Preserve screenshots or command output only from actual systems.
- Document the final result, unresolved risk, and escalation owner or next action.

## Layer 1 to Layer 7 Reasoning

| Layer | Review Question | Evidence |
|---|---|---|
| Physical | Is the cable, NIC, switch port, or VM adapter connected? | Link state, switch port, hypervisor adapter |
| Data Link | Is the endpoint on the correct VLAN or port mode? | VLAN assignment, MAC table, bridge mapping |
| Network | Does the endpoint have IP, gateway, and route? | `ipconfig /all`, route table, ping gateway |
| Transport | Are required ports reachable? | Targeted connection tests |
| Session | Is VPN or authentication path established? | VPN status, authentication logs |
| Presentation | Are name resolution or certificate issues present? | DNS checks, certificate review |
| Application | Is the service itself healthy? | Service status, app logs, user error message |

## DNS Troubleshooting

- Confirm the endpoint is using the intended DNS server.
- Test internal and external resolution separately.
- Check whether DNS failure is isolated to one device or one segment.
- For AD-related issues, verify domain records and domain controller reachability.
- Capture commands and results before changing DNS settings.

## DHCP Troubleshooting

- Check whether the endpoint has an APIPA address.
- Confirm lease source, scope, gateway option, and DNS option.
- Review reservation conflicts for known systems.
- Check whether other clients in the same segment can renew leases.
- Escalate if scope exhaustion or relay/firewall behavior is suspected.

## VPN Troubleshooting

- Confirm VPN client status and assigned address.
- Confirm allowed routes and DNS behavior.
- Test one approved internal service and one restricted target.
- Review firewall logs for denied traffic.
- Escalate if authentication, routing, or policy mismatch is found.

## Endpoint Troubleshooting

- Confirm local adapter status.
- Confirm IP configuration.
- Flush DNS only after recording current behavior.
- Renew DHCP lease if DHCP is in scope.
- Test with another known-good endpoint when available.
- Avoid changing multiple settings at once.

## Ticket Documentation Guidance

Document:

- Affected user or system.
- Business or lab impact.
- Time issue started.
- Network segment or access path.
- Commands run and results.
- Screenshots or logs collected from real systems.
- Hypothesis and evidence.
- Escalation reason if needed.
- Resolution or next action.

## Escalation Criteria

Escalate when:

- Multiple users or segments are affected.
- Firewall, switch, or hypervisor changes are required.
- AD, DNS, or DHCP service health is suspect.
- VPN authentication or security policy is involved.
- Evidence suggests a recurring or systemic issue.
- A rollback or change window is needed.

## RCA Escalation Triggers

Start a root cause analysis record when:

- A change caused outage or degraded access.
- A firewall or VLAN rule unintentionally blocked required traffic.
- DNS or DHCP failure impacted authentication or multiple clients.
- A backup or rollback procedure was required.
- The same symptom repeats after remediation.
