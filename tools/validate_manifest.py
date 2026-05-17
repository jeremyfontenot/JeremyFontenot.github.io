#!/usr/bin/env python3
"""Validate docs/manifest.json paths are URL-encoded (no literal spaces)."""
import json, sys

path = 'docs/manifest.json'
try:
    data = json.load(open(path, 'r', encoding='utf-8'))
except Exception as e:
    print('ERROR: failed loading', path, e)
    sys.exit(2)

bad = [x.get('path') for x in data if ' ' in x.get('path','')]
if bad:
    print('FOUND: unencoded spaces in manifest paths (sample):')
    for p in bad[:20]:
        print(' -', p)
    sys.exit(1)
print('OK: no unencoded spaces in', path)
