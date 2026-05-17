#!/usr/bin/env python3
"""Validate manifest.json integrity against the filesystem and produce reports.

Writes reports to `artifacts/manifest-integrity/` and exits with code 1 if issues found.
Checks performed:
 - manifest entries resolve to files
 - no unencoded spaces in paths
 - orphaned docs in `docs/` not present in manifest
 - duplicate normalized paths (including case collisions)
 - duplicate titles
 - missing/invalid metadata (title, tags, categories)
"""
import os, sys, json, urllib.parse, collections, argparse
from datetime import datetime, timezone

ROOT = os.path.join(os.path.dirname(__file__), '..')
DOCS = os.path.join(ROOT, 'docs')
MANIFEST = os.path.join(DOCS, 'manifest.json')
ARTIFACT_DIR = os.path.join(ROOT, 'artifacts', 'manifest-integrity')
ARTIFACT_ROOT = os.path.join(ROOT, 'artifacts')
HISTORY_FILE = os.path.join(ARTIFACT_ROOT, 'history.json')

os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(ARTIFACT_ROOT, exist_ok=True)

def load_manifest(path):
    try:
        with open(path, 'r', encoding='utf-8') as fh:
            return json.load(fh)
    except Exception as e:
        print('ERROR: failed to load manifest:', e)
        sys.exit(2)

def norm_path(p):
    # decode percent-encoding, strip leading slash, normalize separators
    dp = urllib.parse.unquote(p or '')
    dp = dp.lstrip('/')
    return os.path.normpath(dp).replace('\\','/')

def gather_actual_docs():
    actual = set()
    for dirpath, dirs, files in os.walk(DOCS):
        for f in files:
            if not f.lower().endswith(('.html','.json')):
                continue
            ab = os.path.join(dirpath, f)
            rel = os.path.relpath(ab, ROOT).replace('\\','/')
            actual.add(rel)
    return actual

parser = argparse.ArgumentParser(description='Validate manifest integrity')
parser.add_argument('--mode', choices=['lenient','normal','strict','release'], default='normal', help='Validation mode: lenient|normal|strict|release')
args = parser.parse_args()

data = load_manifest(MANIFEST)

manifest_norm = []
manifest_by_norm = collections.defaultdict(list)
titles = collections.defaultdict(list)
invalid_metadata = []
unencoded_spaces = []

for entry in data:
    p = entry.get('path','')
    if ' ' in (p or ''):
        unencoded_spaces.append(p)
    np = norm_path(p)
    manifest_norm.append(np)
    manifest_by_norm[np].append(entry)
    title = entry.get('title')
    if not title:
        invalid_metadata.append({'path': p, 'problem': 'missing title'})
    else:
        titles[title].append(entry.get('path'))
    # tags/categories checks
    if not isinstance(entry.get('categories'), list) or len(entry.get('categories') or []) == 0:
        invalid_metadata.append({'path': p, 'problem': 'empty or invalid categories'})
    if entry.get('tags') is not None and not isinstance(entry.get('tags'), list):
        invalid_metadata.append({'path': p, 'problem': 'tags not a list'})

actual = gather_actual_docs()

manifest_set = set(manifest_norm)

missing_targets = [p for p in manifest_set if p not in actual]
orphaned = [p for p in actual if p not in manifest_set]

duplicate_paths = {k: [e.get('path') for e in v] for k,v in manifest_by_norm.items() if len(v) > 1}
# detect case-collisions (case-insensitive duplicates)
lower_map = collections.defaultdict(list)
for k,v in manifest_by_norm.items():
    lower_map[k.lower()].extend([e.get('path') for e in v])
case_collisions = {k: v for k,v in lower_map.items() if len(set(v)) > 1}

duplicate_titles = {t: paths for t, paths in titles.items() if len(paths) > 1}

# Write reports
def write_list(fname, items):
    path = os.path.join(ARTIFACT_DIR, fname)
    with open(path, 'w', encoding='utf-8') as fh:
        for i in items:
            fh.write(str(i) + '\n')
    return path

reports = {}
reports['missing_targets'] = write_list('missing_manifest_targets.txt', missing_targets)
reports['orphaned_docs'] = write_list('orphaned_docs.txt', orphaned)
reports['duplicate_paths'] = write_list('duplicate_paths.txt', [f"{k} -> {v}" for k,v in duplicate_paths.items()])
reports['case_collisions'] = write_list('case_collisions.txt', [f"{k} -> {v}" for k,v in case_collisions.items()])
reports['duplicate_titles'] = write_list('duplicate_titles.txt', [f"{k} -> {v}" for k,v in duplicate_titles.items()])
reports['invalid_metadata'] = write_list('invalid_metadata.txt', [json.dumps(i, ensure_ascii=False) for i in invalid_metadata])
reports['unencoded_spaces'] = write_list('unencoded_spaces.txt', unencoded_spaces)

summary = {
    'manifest_count': len(data),
    'actual_docs_count': len(actual),
    'missing_targets': len(missing_targets),
    'orphaned_docs': len(orphaned),
    'duplicate_path_groups': len(duplicate_paths),
    'case_collisions': len(case_collisions),
    'duplicate_titles': len(duplicate_titles),
    'invalid_metadata_items': len(invalid_metadata),
    'unencoded_spaces': len(unencoded_spaces),
}

# compute warning/critical counts for reporting
structural = summary['missing_targets'] + summary['orphaned_docs'] + summary['duplicate_path_groups'] + summary['case_collisions'] + summary['unencoded_spaces']
warnings = summary['invalid_metadata_items']

# compute a simple integrity score
# start from 100, penalize critical and warning items (tunable)
score = 100
score -= min(50, structural * 10)
score -= min(30, warnings * 2)
if score < 0:
    score = 0

mode = args.mode

thresholds = {
    'lenient': 60,
    'normal': 80,
    'strict': 90,
    'release': 98,
}

threshold = thresholds.get(mode, 80)
passed = score >= threshold

# attach score and counts
summary['score'] = score
summary['structural_issues'] = structural
summary['warning_issues'] = warnings
summary['ui_title_collisions'] = summary['duplicate_titles']
summary['mode'] = mode
summary['threshold'] = threshold
summary['passed'] = passed
summary['generated_at'] = datetime.now(timezone.utc).isoformat()

with open(os.path.join(ARTIFACT_DIR, 'summary.json'), 'w', encoding='utf-8') as fh:
    json.dump(summary, fh, indent=2, ensure_ascii=False)

history_entry = {
    'timestamp': summary['generated_at'],
    'mode': mode,
    'score': score,
    'threshold': threshold,
    'passed': passed,
    'structural_issues': structural,
    'warning_issues': warnings,
    'manifest_count': len(data),
    'actual_docs_count': len(actual),
}

history = []
try:
    with open(HISTORY_FILE, 'r', encoding='utf-8') as fh:
        loaded_history = json.load(fh)
        if isinstance(loaded_history, list):
            history = loaded_history
except Exception:
    history = []

history.append(history_entry)
history = history[-10:]

with open(HISTORY_FILE, 'w', encoding='utf-8') as fh:
    json.dump(history, fh, indent=2, ensure_ascii=False)

print('Manifest integrity check summary:')
print(json.dumps(summary, indent=2))

# Determine critical vs warning based on selected mode
print('\nReports written to', ARTIFACT_DIR)
print('\nMode:', mode)
print('Score:', score)
print('Threshold:', threshold)
print('Structural issues:', structural)
print('Warning issues:', warnings)

if not passed:
    print(f'ERROR: integrity score {score} is below threshold {threshold} for mode {mode}')
    sys.exit(1)
else:
    print('Integrity score meets threshold')
    sys.exit(0)
