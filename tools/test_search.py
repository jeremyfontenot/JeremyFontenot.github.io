#!/usr/bin/env python3
import json, os, re, urllib.request, urllib.parse, sys

MANIFEST = 'docs/manifest.json'
MAX = 300

def load_manifest():
    with open(MANIFEST, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_title_body(path):
    p = path.lstrip('/')
    if not os.path.exists(p):
        return '(missing)', ''
    with open(p, 'r', encoding='utf-8', errors='ignore') as f:
        txt = f.read()
    m = re.search(r'<title[^>]*>(.*?)</title>', txt, re.I | re.S)
    if m:
        title = re.sub(r'\s+', ' ', m.group(1)).strip()
    else:
        m2 = re.search(r'<h1[^>]*>(.*?)</h1>', txt, re.I | re.S)
        title = re.sub(r'<[^>]+>', '', m2.group(1)).strip() if m2 else os.path.basename(p)
    body = re.sub(r'<script[^>]*>.*?</script>', '', txt, flags=re.I | re.S)
    body = re.sub(r'<style[^>]*>.*?</style>', '', body, flags=re.I | re.S)
    body_text = re.sub(r'<[^>]+>', ' ', body)
    body_text = re.sub(r'\s+', ' ', body_text).strip()
    return title, body_text

def score_item(item, q):
    if not q:
        return 1
    q = q.lower()
    score = 0
    if item.get('title') and q in item.get('title', '').lower():
        score += 5
    if item.get('tags') and any(q in t.lower() for t in item.get('tags', [])):
        score += 3
    if item.get('body') and q in item.get('body', '').lower():
        score += 1
    return score

def snippet(body, q, ctx=120):
    if not body: return ''
    lo = body.lower().find(q.lower())
    if lo == -1:
        return body[:300]
    start = max(0, lo - ctx)
    end = min(len(body), lo + len(q) + ctx)
    s = body[start:end]
    # rudimentary highlight for console
    return s.replace(q, f'**{q}**')

def http_status(path):
    url = 'http://localhost:8000' + urllib.parse.quote(path, safe='/')
    try:
        r = urllib.request.urlopen(url, timeout=6)
        return r.getcode()
    except Exception as e:
        return f'ERR:{type(e).__name__}'

if __name__ == '__main__':
    q = sys.argv[1] if len(sys.argv) > 1 else 'automation'
    print(f"Running test search for query: '{q}' (max {MAX} entries)")
    manifest = load_manifest()
    items = []
    count = 0
    for e in manifest:
        if count >= MAX: break
        path = e.get('path')
        title, body = extract_title_body(path)
        item = {'path': path, 'title': title, 'tags': e.get('tags', []), 'categories': e.get('categories', []), 'body': body}
        items.append(item)
        count += 1
    scored = []
    for it in items:
        s = score_item(it, q)
        if s > 0:
            scored.append((s, it))
    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:10]
    if not top:
        print('No matches found')
        sys.exit(0)
    print('\nTop results:')
    for s, it in top:
        st = http_status(it['path'])
        print('---')
        print(f"Score: {s}  Path: {it['path']}  HTTP: {st}")
        print(f"Title: {it['title']}")
        sn = snippet(it['body'], q)
        print(f"Snippet: {sn[:800]}\n")
    print('---\nTest complete.')
