# Network Infrastructure Validation Report (2026)

## Purpose

Document the validated network infrastructure design used in the portfolio lab, including switch port mapping, VLAN segmentation, DHCP relay behavior, and DNS resolution testing.

## Environment

* Firewall/router: pfSense
* Virtualization host: Proxmox
* Server VLAN: VLAN 20
* Client VLAN: VLAN 30
* IoT VLAN: VLAN 40
* Guest VLAN: VLAN 50
* DNS/DHCP server: Windows Server lab host

## Scope

This report validates that the network topology supports segmented infrastructure operations and that core network services are reachable from the intended VLANs.

## Validation Procedure

```powershell
Test-NetConnection 10.20.20.10 -Port 53
Test-NetConnection 10.20.20.10 -Port 3389
nslookup server01.ad.jeremyfontenot
nslookup microsoft.com
ipconfig /all
```

## 1. Switch Port Mapping

* Port 1: Firewall WAN uplink
* Port 2: Firewall LAN uplink
* Ports 3-8: VLAN 20 Server network
* Ports 9-12: VLAN 30 Client network

## 2. VLAN Validation

* VLAN 20: Servers
* VLAN 30: Clients
* VLAN 40: IoT
* VLAN 50: Guest

Validation confirmed logical segmentation between network zones.

## 3. DHCP Relay Validation

* DHCP relay enabled on VLANs 20, 30, 40, and 50
* Relay target configured as 10.20.20.10

Validation confirmed successful address assignment through centralized DHCP services.

## 4. DNS Resolution Validation

* Internal lookup: server01.ad.jeremyfontenot
* External lookup: microsoft.com

Validation confirmed successful internal and external name resolution.

## Result

Network segmentation, DHCP relay services, and DNS resolution validated successfully. The environment supports documented service desk, infrastructure, and systems administration workflows.