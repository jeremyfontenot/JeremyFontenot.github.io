# Network Validation — Evidence Notes (2026)

## 1. Switch Port Mapping
Port 1 → Firewall WAN
Port 2 → Firewall LAN
Ports 3–8 → VLAN 20 (Servers)
Ports 9–12 → VLAN 30 (Clients)

Code

## 2. VLAN Validation
VLAN 20 → Servers
VLAN 30 → Clients
VLAN 40 → IoT
VLAN 50 → Guest

Code

## 3. DHCP Relay Validation
DHCP relay enabled on VLANs 20, 30, 40, 50
Forwarding to 10.20.20.10

Code

## 4. DNS Resolution Tests
nslookup server01.ad.jeremyfontenot -> 10.20.20.10
nslookup microsoft.com → 20.112.x.x

Code
