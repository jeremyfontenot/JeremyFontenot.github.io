# DHCP and DNS Validation Report (2026)

## Purpose

Validate DHCP lease assignment and DNS name resolution services within the segmented lab environment.

## Environment

* DHCP Server: Windows Server
* DNS Server: Windows Server
* Client System: WIN11-CLIENT01
* Client VLAN: VLAN 30
* Server VLAN: VLAN 20

## Scope

This validation confirms that client systems can obtain network configuration automatically and successfully resolve both internal and external DNS records.

## Validation Procedure

```powershell
ipconfig /all
ipconfig /renew
nslookup server01.ad.jeremyfontenot
nslookup microsoft.com
```

## DHCP Lease Validation

### Client

WIN11-CLIENT01

### Expected Result

Client receives a valid IP address, subnet mask, gateway, and DNS server assignment from the DHCP service.

### Observed Result

Client successfully obtained a DHCP lease within the VLAN 30 address scope.

## DNS Resolution Validation

### Internal DNS Test

```powershell
nslookup server01.ad.jeremyfontenot
```

Expected Result:
Internal host resolves to the Windows Server address.

Observed Result:
Name resolution completed successfully.

### External DNS Test

```powershell
nslookup microsoft.com
```

Expected Result:
External internet host resolves successfully through configured DNS forwarding.

Observed Result:
External name resolution completed successfully.

## Result

DHCP and DNS services validated successfully. Client systems were able to obtain network configuration automatically and resolve both internal and external DNS records from the tested network segment.