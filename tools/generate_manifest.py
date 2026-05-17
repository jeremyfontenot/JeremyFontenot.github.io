#!/usr/bin/env python3
"""Generate docs/manifest.json by scanning the docs folder.

Usage: python tools/generate_manifest.py

Outputs to docs/manifest.json (overwrites). Uses simple heuristics to set categories and tags.
Also assigns stable path-derived ids and separates canonical titles from UI context.
"""
import os, json, re
import urllib.parse
from html import unescape

from title_format import compact_context, format_display_title, humanize

ROOT = os.path.join(os.path.dirname(__file__), '..')
DOCS = os.path.join(ROOT, 'docs')
CANONICAL_DOCS = os.path.join(DOCS, 'curated')

def slugify(text):
    value = humanize(text).lower()
    value = re.sub(r'[^a-z0-9]+', '-', value)
    value = re.sub(r'-+', '-', value).strip('-')
    return value

def find_title(html_text):
    m = re.search(r'<title>(.*?)</title>', html_text, re.IGNORECASE|re.DOTALL)
    if m:
        return unescape(m.group(1).strip())
    h = re.search(r'<h1[^>]*>(.*?)</h1>', html_text, re.IGNORECASE|re.DOTALL)
    if h:
        return unescape(re.sub('<[^<]+?>','',h.group(1))).strip()
    return None

def infer_category(relpath):
    parts = relpath.split(os.sep)
    if 'home-lab' in parts: return 'Labs'
    if 'script-documentation' in parts: return 'Projects'
    if 'brandguide' in parts or 'm365-documentation-archive' in parts: return 'Reference'
    if 'certifications' in parts: return 'Certifications'
    return 'Notes'

def infer_tags(relpath):
    parts = relpath.replace('.html','').split(os.sep)
    tags = []
    for p in parts:
        if p and p not in ('docs','html','aspx','assets','library'):
            tags.append(p.lower().replace(' ','-'))
    return list(dict.fromkeys(tags))

def normalize_title(title):
    return humanize(title) or ''

entries = []
for dirpath, dirs, files in os.walk(CANONICAL_DOCS):
    dirs.sort()
    files.sort()
    for f in files:
        if not f.lower().endswith(('.html','.json')): continue
        ab = os.path.join(dirpath,f)
        rel = os.path.relpath(ab, ROOT).replace('\\','/')
        webpath = '/' + rel
        # make web-safe URL (percent-encode spaces and unsafe chars, keep slashes)
        try:
            webpath = urllib.parse.quote(webpath, safe='/')
        except Exception:
            pass
        title = None
        try:
            with open(ab, 'r', encoding='utf-8', errors='ignore') as fh:
                text = fh.read()
                if f.lower().endswith('.html'):
                    title = find_title(text) or os.path.splitext(f)[0]
                else:
                    try:
                        j = json.loads(text)
                        title = j.get('title') or j.get('name') or os.path.splitext(f)[0]
                    except Exception:
                        title = os.path.splitext(f)[0]
        except Exception:
            title = os.path.splitext(f)[0]
        relpath = os.path.relpath(ab, DOCS)
        normalized_title = normalize_title(title)
        context = compact_context(relpath)
        entry = {
            'id': slugify(os.path.splitext(relpath)[0]),
            'path': webpath,
            'title': normalized_title,
            'context': context,
            'displayTitle': format_display_title(normalized_title, context),
            'sourceTitle': normalized_title,
            'sourceRelPath': relpath.replace('\\','/'),
            'tags': infer_tags(relpath),
            'categories': [infer_category(relpath)]
        }
        entries.append(entry)

out = os.path.join(DOCS, 'manifest.json')
entries.sort(key=lambda item: item['path'])
with open(out, 'w', encoding='utf-8') as fh:
    json.dump(entries, fh, indent=2, ensure_ascii=False)

print(f'Wrote {out} with {len(entries)} entries')
