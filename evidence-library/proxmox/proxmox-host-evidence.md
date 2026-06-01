# Proxmox Host Validation — Evidence Notes (2026)

## 1. Node Health
Node: proxmox01
CPU: Normal
Memory: Normal
Storage: 68% used

Code

## 2. Network Bridge Validation
vmbr0 → Trunk (VLAN aware)
vmbr1 → Management (VLAN 10)

Code

## 3. VM Connectivity Tests
WIN11-CLIENT01 → VLAN 30 → DHCP OK
SERVER01 → VLAN 20 → DNS OK

Code
