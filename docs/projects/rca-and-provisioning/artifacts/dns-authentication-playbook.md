# DNS Authentication Failure Playbook

## Purpose

Provide a repeatable workflow for isolating authentication issues that may be caused by DNS resolution, domain controller reachability, or stale client configuration.

## Triage Steps

1. Confirm user impact, start time, affected sites, and affected services.
2. Test name resolution for domain controllers from an affected endpoint.
3. Validate client DNS server assignment with `ipconfig /all`.
4. Query SRV records for the domain with `Resolve-DnsName`.
5. Review Directory Service, DNS Server, and System event logs.
6. Apply a documented remediation and capture pre/post validation.

## Validation Commands

```powershell
Resolve-DnsName -Name _ldap._tcp.dc._msdcs.ad.jeremyfontenot -Type SRV
Test-NetConnection dc01.ad.jeremyfontenot -Port 389
nltest /dsgetdc:ad.jeremyfontenot
```

## Evidence Required

- Incident timeline
- Command output summary
- Root cause statement
- Remediation action
- Validation result
- Prevention or monitoring recommendation
