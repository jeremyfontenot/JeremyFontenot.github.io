# Firewall Rule Validation Report (2026)

## Purpose

Validate firewall policy enforcement, inter-VLAN segmentation, and outbound access controls within the lab environment.

## Environment

* Firewall Platform: pfSense
* Server Network: VLAN 20
* Client Network: VLAN 30
* IoT Network: VLAN 40
* Guest Network: VLAN 50

## Scope

This validation confirms that firewall rules enforce intended segmentation boundaries while allowing approved traffic flows.

## Validation Procedure

```powershell
Test-NetConnection 10.20.20.10 -Port 53
Test-NetConnection 10.20.20.10 -Port 445
Test-NetConnection 1.1.1.1 -Port 443
```

## Inter-VLAN Segmentation Validation

### Approved Access

* Management to Servers: Allowed

### Restricted Access

* IoT to Management: Blocked
* Guest to Servers: Blocked

### Expected Result

Unauthorized east-west traffic is denied between protected network segments.

### Observed Result

Firewall rules enforced intended segmentation boundaries successfully.

## Outbound Access Validation

### Approved Internet Access

* IoT to Internet: Allowed
* Guest to Internet: Allowed

### Expected Result

Internet access remains available while internal protected resources remain restricted.

### Observed Result

Outbound connectivity succeeded without violating segmentation policies.

## Result

Firewall policies validated successfully. Segmentation controls, access restrictions, and outbound connectivity behaved as designed within the tested environment.