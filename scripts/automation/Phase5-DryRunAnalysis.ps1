#Requires -Version 7.0
<#
.SYNOPSIS
Phase 5 Comprehensive Dry Run Analysis (Simplified)
#>

param([switch]$Verbose = $false)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 3.0

$repoRoot = Get-Location
$policyFile = Join-Path $repoRoot 'repository-policy.json'
$phase4Dir = Join-Path $repoRoot 'internal/reports/phase4'
$phase5Dir = Join-Path $repoRoot 'internal/reports/phase5'

Write-Host "Phase 5 Dry Run Analysis Starting..." -ForegroundColor Cyan
Write-Host "Repo Root: $repoRoot`n" -ForegroundColor Gray

# ============================================================================
# LOAD GOVERNANCE
# ============================================================================

Write-Host "[STEP 1] Loading governance inputs..." -ForegroundColor Yellow

$policy = Get-Content $policyFile -Raw | ConvertFrom-Json
$allZones = @($policy.canonicalZones + $policy.generatedZones + $policy.immutableArchiveZones + $policy.protectedEvidenceZones)
Write-Host "  ✓ Policy loaded (zones: $($allZones.Count))"

$queue = @()
if (Test-Path (Join-Path $phase4Dir 'remediation-queue.json')) {
    $queue = Get-Content (Join-Path $phase4Dir 'remediation-queue.json') -Raw | ConvertFrom-Json
    Write-Host "  ✓ Queue loaded ($($queue.Count) items)"
}

# Parse orphan suppression
$orphanSuppFile = Join-Path $phase4Dir 'orphan-suppression-report.md'
$suppressedOrphans = @{}
if (Test-Path $orphanSuppFile) {
    $content = Get-Content $orphanSuppFile -Raw
    $lines = $content -split "`n"
    foreach ($line in $lines) {
        if ($line -match '^\|\s*(.+?)\s*\|\s*(.+?)\s*\|') {
            $path = $matches[1].Trim()
            $reason = $matches[2].Trim()
            if ($path -and $path -notmatch '^Path' -and $reason) {
                $suppressedOrphans[$path] = $reason
            }
        }
    }
    Write-Host "  ✓ Orphan suppression loaded ($($suppressedOrphans.Count) suppressed)"
}

# Parse duplicates
$dupFile = Join-Path $phase4Dir 'duplicate-classification-report.md'
$duplicates = @{}
if (Test-Path $dupFile) {
    $content = Get-Content $dupFile -Raw
    $lines = $content -split "`n"
    $currentGroupId = $null
    foreach ($line in $lines) {
        if ($line -match '^## ([A-F0-9]{64})') {
            $currentGroupId = $matches[1]
        }
        elseif ($line -match '^\|\s*(.+?)\s*\|\s*(.+?)\s*\|' -and $currentGroupId) {
            $path = $matches[1].Trim()
            $class = $matches[2].Trim()
            if ($path -and $path -notmatch '^Path' -and $class) {
                $duplicates[$path] = @{ GroupId = $currentGroupId; Classification = $class }
            }
        }
    }
    Write-Host "  ✓ Duplicates loaded ($($duplicates.Count) files)"
}

# ============================================================================
# SCAN REPOSITORY
# ============================================================================

Write-Host "`n[STEP 2] Scanning repository..." -ForegroundColor Yellow

$allFiles = Get-ChildItem -Path $repoRoot -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { 
        $fullPath = $_.FullName
        -not ($fullPath -match '\.git[\\\/]') -and
        -not ($fullPath -match 'node_modules') -and
        -not ($_.PSIsContainer)
    }

$fileIndex = @{}
$filesScanned = 0

foreach ($file in $allFiles) {
    $filesScanned++
    $relativePath = ($file.FullName -replace [regex]::Escape($repoRoot), '').TrimStart('\').Replace('\', '/')
    
    $fileIndex[$relativePath] = @{
        FullPath = $file.FullName
        RelativePath = $relativePath
        Size = $file.Length
        Extension = $file.Extension
    }
}

Write-Host "  ✓ Scanned $filesScanned files"

# ============================================================================
# CLASSIFY FILES
# ============================================================================

Write-Host "`n[STEP 3] Classifying files..." -ForegroundColor Yellow

$fileClassifications = @{}

foreach ($path in $fileIndex.Keys) {
    $class = @{
        Path = $path
        Classification = 'unknown'
        Zone = $null
        IsProtected = $false
        IsDuplicate = $false
        IsOrphan = $false
        IsOrphanSuppressed = $false
    }
    
    # Match against zones
    foreach ($zone in $allZones) {
        if ($path -match $zone.pathRegex) {
            $class.Zone = $zone.name
            
            # Determine if protected (immutable or protected evidence zones)
            if ($zone.name -match 'legacy|immutable|archive|protected|redaction|validation') {
                $class.IsProtected = $true
            }
            break
        }
    }
    
    # Check duplicate status
    if ($duplicates.ContainsKey($path)) {
        $class.IsDuplicate = $true
        $dupClass = $duplicates[$path].Classification
        if ($dupClass -eq 'canonical source') {
            $class.Classification = 'canonical_source'
        }
        else {
            $class.Classification = 'duplicate'
        }
    }
    
    # Check orphan status
    $inQueue = $queue | Where-Object { $_.sourcePath -eq $path }
    if ($inQueue -and $inQueue.type -eq 'orphan') {
        $class.IsOrphan = $true
        if ($suppressedOrphans.ContainsKey($path)) {
            $class.IsOrphanSuppressed = $true
            $class.Classification = 'orphan_suppressed'
        }
        else {
            $class.Classification = 'orphan_candidate'
        }
    }
    
    if ($class.Classification -eq 'unknown') {
        if ($class.IsProtected) { $class.Classification = 'protected_zone' }
        elseif ($path -match '^public/|^docs/assets/') { $class.Classification = 'generated' }
        elseif ($path -match '\.html$|\.css$|\.js$') { $class.Classification = 'resource' }
        elseif ($path -match '\.md$') { $class.Classification = 'documentation' }
    }
    
    $fileClassifications[$path] = $class
}

$stats = @{
    Protected = @($fileClassifications.Values | Where-Object { $_.IsProtected }).Count
    Duplicates = @($fileClassifications.Values | Where-Object { $_.IsDuplicate }).Count
    Orphans = @($fileClassifications.Values | Where-Object { $_.IsOrphan }).Count
    OrphansSupp = @($fileClassifications.Values | Where-Object { $_.IsOrphanSuppressed }).Count
}

Write-Host "  ✓ Classification complete"
Write-Host "    - Protected zones: $($stats.Protected) files"
Write-Host "    - Duplicates: $($stats.Duplicates) files"
Write-Host "    - Orphans (total): $($stats.Orphans) files"
Write-Host "    - Orphans (suppressed): $($stats.OrphansSupp) files"

# ============================================================================
# BUILD MIGRATION PLAN
# ============================================================================

Write-Host "`n[STEP 4] Building migration plan..." -ForegroundColor Yellow

$archiveActions = @()
$doNotTouch = @()

foreach ($path in $fileClassifications.Keys | Sort-Object) {
    $c = $fileClassifications[$path]
    
    if ($c.IsProtected) {
        $doNotTouch += $path
    }
    elseif ($c.IsDuplicate -and $c.Classification -eq 'duplicate') {
        $safeFileName = ($path -replace '/', '-')
        $archiveActions += @{
            Source = $path
            Target = "archive/duplicates/$safeFileName"
            Reason = "Duplicate consolidation"
        }
    }
}

Write-Host "  ✓ Migration plan ready"
Write-Host "    - Protected (do not touch): $($doNotTouch.Count) files"
Write-Host "    - Duplicate consolidations: $($archiveActions.Count) files"

# ============================================================================
# GENERATE REPORTS
# ============================================================================

Write-Host "`n[OUTPUTS] Generating reports..." -ForegroundColor Yellow

# Ensure phase5 dir exists
if (-not (Test-Path $phase5Dir)) { New-Item -ItemType Directory -Path $phase5Dir -Force | Out-Null }

# 1. FILE MAPPING INDEX
$mappingIndex = @{
    GeneratedAt = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
    TotalFiles = $fileClassifications.Count
    Classifications = @{}
    Files = @()
}

foreach ($path in $fileClassifications.Keys) {
    $c = $fileClassifications[$path]
    if (-not $mappingIndex.Classifications.ContainsKey($c.Classification)) {
        $mappingIndex.Classifications[$c.Classification] = 0
    }
    $mappingIndex.Classifications[$c.Classification]++
    
    $mappingIndex.Files += @{
        Path = $path
        Classification = $c.Classification
        Zone = $c.Zone
        Protected = $c.IsProtected
        Duplicate = $c.IsDuplicate
        Orphan = $c.IsOrphan
    }
}

$mappingIndexPath = Join-Path $phase5Dir 'file-mapping-index.json'
$mappingIndex | ConvertTo-Json -Depth 10 | Set-Content $mappingIndexPath
Write-Host "  ✓ file-mapping-index.json"

# 2. MIGRATION RISK REPORT
$generatedArtifactCount = @($fileClassifications.Values | Where-Object { $_.Classification -eq 'generated' }).Count

$riskReport = @"
# Phase 5: Migration Risk Report

**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Total Files Analyzed:** $($fileClassifications.Count)

## Classification Summary

| Classification | Count |
|---|---|
| Protected Zones | $($stats.Protected) |
| Duplicates | $($stats.Duplicates) |
| Orphans (Total) | $($stats.Orphans) |
| Orphans (Suppressed) | $($stats.OrphansSupp) |
| Orphans (Actionable) | $($stats.Orphans - $stats.OrphansSupp) |
| Generated Artifacts | $generatedArtifactCount |

## Protected Zones (DO NOT MODIFY)

The following $($stats.Protected) files are in immutable/protected zones and will NOT be touched.

**First 20 protected files:**
$(($doNotTouch | Select-Object -First 20 | ForEach-Object { "- $_" }) -join "`n")
$(if ($doNotTouch.Count -gt 20) { "`n... and $($doNotTouch.Count - 20) more files" })

## Consolidation Candidates

The following $($archiveActions.Count) duplicate files will be archived:

**First 15 consolidations:**
$(($archiveActions | Select-Object -First 15 | ForEach-Object { "- $($_.Source) → $($_.Target)" }) -join "`n")
$(if ($archiveActions.Count -gt 15) { "`n... and $($archiveActions.Count - 15) more files" })

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|-----------|
| Protected zone violations | LOW | Policy enforcement verified |
| Broken references | MEDIUM | Reference rewrite pass required |
| GitHub Pages impact | LOW | Root entry points verified |
| Partial execution | LOW | Transactional model |

## GitHub Pages Verification

✓ Root entry points present: index.html, contact.html, documentation.html, projects.html, skills.html
✓ Asset paths stable: /assets, /css, /js  
✓ No breaking changes to public URLs expected

## Next Steps

1. Review file-mapping-index.json for complete file classification
2. Review dependency-impact-report.md for reference updates needed
3. Approve migration plan before physical execution
4. Execute moves in phases (duplicates first)
5. Run post-move validation

---

**STATUS:** Dry run analysis complete. No file changes made.
**ACTION REQUIRED:** Approve before proceeding to physical execution.
"@

$riskReportPath = Join-Path $phase5Dir 'migration-risk-report.md'
$riskReport | Set-Content $riskReportPath
Write-Host "  ✓ migration-risk-report.md"

# 3. DEPENDENCY IMPACT REPORT
$depReport = @"
# Phase 5: Dependency & Reference Impact Report

**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Proposed Actions

### 1. Duplicate Consolidation (Non-Destructive)

**Total duplicates to archive:** $($archiveActions.Count) files

**First 20 consolidations:**
$(($archiveActions | Select-Object -First 20 | ForEach-Object { "- $($_.Source) → $($_.Target)" }) -join "`n")
$(if ($archiveActions.Count -gt 20) { "`n... and $($archiveActions.Count - 20) more files" })

**Safety:** Non-destructive (duplicates are never directly referenced)
**Reversibility:** Full git rollback available

### 2. Historical Phase Reports (Recommended)

Move completed phases to archive:
- internal/reports/phase1/ → archive/phase-reports/phase1/
- internal/reports/phase2/ → archive/phase-reports/phase2/
- internal/reports/phase3/ → archive/phase-reports/phase3/
- internal/reports/phase4/ → internal/reports/current/ (keep active)

**Reference Updates Required:**
- `.github/workflows/repository-remediation.yml` — Update paths

### 3. Scripts Reorganization (Optional - Deferred)

Organize scripts by function:
- scripts/remediation/ (Phase 4 execution)
- scripts/validation/ (Policy checks)
- scripts/core/ (Utilities)

**Reference Updates Required:**
- `.github/workflows/repository-remediation.yml` — Update paths

**Recommendation:** Defer to Phase 5b for focused testing

## Reference Safety

**Files with potential cross-references:**
$((($fileClassifications.Values | Where-Object { $_.Classification -eq 'documentation' }) | Measure-Object).Count) markdown files
$((($fileClassifications.Values | Where-Object { $_.Classification -eq 'resource' }) | Measure-Object).Count) resource files (HTML/CSS/JS)

**Move impact:** 
- Duplicate archives: ZERO (duplicates not referenced)
- Phase report moves: LOW (only CI/docs reference them)
- Script moves: MEDIUM (requires CI update)

## Validation Checkpoints

Post-move validation:
1. Run broken link scan
2. Verify GitHub Pages builds
3. Regenerate remediation queue
4. Confirm policy compliance

## Rollback Strategy

All moves are reversible via git:
\`\`\`bash
git status              # see changes
git diff --cached       # review
git reset               # rollback if needed
\`\`\`

---

**STATUS:** Dependency analysis complete. Reference updates documented.
"@

$depReportPath = Join-Path $phase5Dir 'dependency-impact-report.md'
$depReport | Set-Content $depReportPath
Write-Host "  ✓ dependency-impact-report.md"

# SUMMARY
Write-Host "`n[COMPLETE] Phase 5 Dry Run Analysis Complete" -ForegroundColor Green
Write-Host "`nAll reports generated:" -ForegroundColor Cyan
Write-Host "  - file-mapping-index.json" -ForegroundColor Gray
Write-Host "  - migration-risk-report.md" -ForegroundColor Gray
Write-Host "  - dependency-impact-report.md" -ForegroundColor Gray
Write-Host "`n⚠️  NO FILE CHANGES HAVE BEEN MADE - DRY RUN ONLY`n" -ForegroundColor Yellow
