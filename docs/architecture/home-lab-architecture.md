# Enterprise Home Lab Architecture

A Dell R710‑based enterprise lab environment built on Proxmox VE as the primary hypervisor,
with Windows Server 2022 AD DS, RHEL 9, pfSense routing, Suricata/Snort IDS/IPS, and full
monitoring via Wazuh, Zabbix, and Graylog.

---

## Core Architecture

- **Hypervisor:** Proxmox VE  
- **Firewall:** pfSense  
- **IDS/IPS:** Suricata / Snort  
- **Directory Services:** Windows Server 2022 AD DS  
- **Linux Services:** RHEL 9  
- **Monitoring:** Wazuh, Zabbix, Graylog  

---

## Architecture Diagram

[Internet]
|
[pfSense Firewall]
|
[Proxmox VE Host]
|--- Windows Server 2022 (Active Directory)
|--- RHEL 9 (Linux Services)
|--- Suricata/Snort (IDS/IPS)
|--- Wazuh Manager (Security Monitoring)
|--- Zabbix Server (Infrastructure Monitoring)
|--- Graylog (Log Aggregation)

---

## Evidence Excerpts

> “A Dell R710-based enterprise lab environment built on Proxmox VE as the primary hypervisor…”  
> “pfSense handling routing and firewall policy, Suricata/Snort providing IDS/IPS coverage…”  
> “Zabbix/Wazuh/Graylog supporting centralized monitoring and log analysis…”  
