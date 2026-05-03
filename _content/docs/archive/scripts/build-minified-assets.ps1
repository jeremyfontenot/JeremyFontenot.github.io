param(
    [Parameter(Mandatory = $false)]
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$pythonCandidates = @(
    (Join-Path $RepoRoot '.venv\Scripts\python.exe'),
    'C:\Users\jeremyfontenot\AppData\Local\Programs\Python\Python314\python.exe'
)

$pythonExe = $pythonCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if (-not $pythonExe) {
    throw "Python executable not found. Create .venv or update python path in scripts/build-minified-assets.ps1."
}

$pythonCode = @'
from pathlib import Path
import sys
import subprocess

repo = Path(sys.argv[1])

try:
    import rcssmin  # type: ignore
    import rjsmin  # type: ignore
except Exception:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "rcssmin", "rjsmin"])
    import rcssmin  # type: ignore
    import rjsmin  # type: ignore

css_src = (repo / "css" / "styles.css").read_text(encoding="utf-8")
js_src = (repo / "script.js").read_text(encoding="utf-8")
arch_src = (repo / "architecture.js").read_text(encoding="utf-8-sig")

(repo / "css" / "styles.min.css").write_text(rcssmin.cssmin(css_src), encoding="utf-8")
(repo / "script.min.js").write_text(rjsmin.jsmin(js_src), encoding="utf-8")
(repo / "architecture.min.js").write_text(rjsmin.jsmin(arch_src), encoding="utf-8")

print("Minified assets generated:")
print("- css/styles.min.css")
print("- script.min.js")
print("- architecture.min.js")
'@

Write-Host "Building minified assets from $RepoRoot"
& $pythonExe -c $pythonCode $RepoRoot
if ($LASTEXITCODE -ne 0) {
    throw "Asset minification failed with exit code $LASTEXITCODE"
}

Write-Host "Asset build complete."
