# Incident Summary — Evidence Notes (2026)

## 1. Impact Summary
Service: DNS resolution
Impact: 12-minute outage
Affected: 6 devices

Code

## 2. Triage Notes
Root cause: Misconfigured DNS forwarder
Detection: User report + monitoring alert

Code

## 3. Corrective Action
Corrected DNS forwarder
Flushed resolver cache
Restarted DNS service

Code

## 4. Validation
nslookup internal → Success
nslookup external → Success

Code

## 5. Lessons Learned
Add DNS health check
Improve change review

Code
