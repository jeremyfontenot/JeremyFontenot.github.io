# Enterprise‑Grade Home Lab Infrastructure

A Dell R710‑based enterprise lab environment built on Proxmox VE as the primary hypervisor,
with Windows Server 2022 AD DS, RHEL 9, pfSense routing, and full monitoring via Wazuh and Zabbix.

---

## Executive Summary

This Home Lab replicates a modern enterprise environment using virtualization, identity,
security monitoring, and network segmentation.

### Components
- **Hypervisor:** Proxmox VE  
- **Firewall:** pfSense  
- **Directory Services:** Windows Server 2022 AD DS  
- **Linux Services:** RHEL 9  
- **Monitoring:** Wazuh, Zabbix  
- **Endpoints:** Windows 11 (Intune test devices)  

---

## Architecture Diagram

[Internet]
|
[pfSense Firewall]
|
[Proxmox VE Host]
|--- Windows Server 2022 (Active Directory Domain Services)
|--- RHEL 9 (Linux Services)
|--- Wazuh Manager (Security Monitoring)
|--- Zabbix Server (Infrastructure Monitoring)
|--- Windows 11 (Intune Test Endpoint)

---

## Evidence Excerpts

> “A Dell R710-based enterprise lab environment built on Proxmox VE as the primary hypervisor…”  
> “Windows Server 2022 Active Directory and RHEL 9 systems, with pfSense handling routing and firewall policy…”  
> “Wazuh and Zabbix provide full-stack monitoring and security visibility across the environment…”  

---

## Technical Validation

- Implements real enterprise identity and security architecture  
- Supports hybrid cloud testing with Microsoft 365 and Azure  
- Provides a safe environment for automation and scripting development  
- Includes full monitoring and SIEM visibility  
- Replicates modern enterprise segmentation and access control  
