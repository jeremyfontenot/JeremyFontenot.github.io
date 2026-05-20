# DNS Authentication Playbook — 2026

Purpose
-------
This playbook documents validated steps for diagnosing and resolving DNS-related authentication issues that affect domain-joined clients and Entra ID synchronization points.

Pre-checks
----------
- Confirm authoritative DNS server reachability (timeout < 250ms) from affected host.
- Verify time sync on domain controllers and clients (NTP).

Steps
-----
1. Verify basic DNS resolution from the client: `nslookup <fqdn>` and `ping -n 1 <fqdn>`.
2. Confirm SRV records for LDAP/GC and Kerberos exist: `_ldap._tcp.dc._msdcs.<domain>`.
3. Check DNS scavenging or replication issues on DNS servers; review event logs for DNS-related errors.
4. For split-brain DNS, confirm the internal zone contains correct A and CNAME records for domain controllers and services.
5. Validate conditional access and identity provider endpoints reachable from client network segments.

Validation
----------
- After remediation, re-run authentication flows and capture `nltest /sc_verify:<domain>` and `klist` outputs.
- Record timestamped validation notes and attach DNS query traces to the incident log.

References
----------
- RFC 1035 — DNS Basics
- Internal lab notes: network validation checklist and pfSense segmentation documentation.
