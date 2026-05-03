# Documentation Rebuild Project Log
This log tracks all actions, decisions, commands, and progress made during the documentation restructuring project.

---

## 1. Project Overview
This project restructures and curates all documentation for JeremyFontenot.online.  
The goal is to separate raw archive files from curated, portfolio-ready content.

---

## 2. Completed Steps

### **Step 1 — Created curated/ and archive/ folders**
**Commands:**
- New-Item -ItemType Directory -Name "curated"
- New-Item -ItemType Directory -Name "archive"

**Result:**  
Base structure created.

---

### **Step 2 — Moved all existing folders into archive/**
**Commands:**
- Move-Item brandguide archive
- Move-Item certifications archive
- Move-Item home-lab archive
- Move-Item "M365 PCL" archive
- Move-Item "M365 Personal Cloud Lab Documentation - Documents" archive
- Move-Item script-documentation archive
- Move-Item scripts archive

**Result:**  
All raw files preserved in archive/.

---

### **Step 3 — Created curated subfolders**
**Commands:**
- New-Item -ItemType Directory -Path "curated\brandguide"
- New-Item -ItemType Directory -Path "curated\certifications"
- New-Item -ItemType Directory -Path "curated\home-lab"
- New-Item -ItemType Directory -Path "curated\M365-PCL"
- New-Item -ItemType Directory -Path "curated\script-documentation"
- New-Item -ItemType Directory -Path "curated\scripts"

**Result:**  
Curated structure ready for content.

---

### **Step 4 — Created top-level documentation index.html**
**Commands:**
- New-Item -ItemType File -Path "index.html"
- Set-Content index.html (HTML template inserted)

**Result:**  
Website documentation index created.

---

### **Step 5 — Created README placeholders in curated folders**
**Commands:**  
(One README.md created per curated folder)

**Result:**  
Each curated section now has a curation tracking file.

---

## 3. In Progress
- Preparing curated content workflow  
- Mapping archive content to curated sections  
- Reviewing archive folder structures  

---

## 4. Next Steps (Planned)
- Begin curation of Brand Guide  
- Begin curation of Certifications  
- Begin curation of Home Lab  
- Begin curation of M365 PCL  
- Begin curation of Script Documentation  
- Begin curation of Scripts  
- Generate automation scripts for archive analysis (optional)

---

## 5. Notes & Decisions
- All seven original folders contain mixed raw files and deep nested structures.  
- Curated content will be assembled from multiple archive sources.  
- Archive remains untouched to preserve original documentation.  
- Curated content will be built slowly and intentionally.

---

## 6. Change Log
(Add entries here as you continue working.)

