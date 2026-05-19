#!/usr/bin/env python3
import os, re, json, urllib.parse
from html import unescape
ROOT = os.path.abspath('.')
EXCLUDE_DIRS = ('assets','css','js','internal','reports','cdn-cgi','components')
INVALID_LINK_PREFIXES = ('internal','reports','cdn-cgi')
EXCLUDE_FILES = ('sitemap.xml','scripts/indexnow_payload.json')

def is_excluded_path(path):
    parts = path.replace('\\','/').split('/')
    for ex in EXCLUDE_DIRS:
        if ex in parts:
            return True
    return False

# gather public files for link resolution
public_files = set()
for dirpath, dirnames, filenames in os.walk(ROOT):
    rel_dir = os.path.relpath(dirpath, ROOT).replace('\\','/')
    parts = rel_dir.split('/')
    if any(part in ('.git', '.github', 'node_modules', 'internal', 'reports') for part in parts):
        continue
    for fn in filenames:
        if fn.lower().endswith('.bak'):
            continue
        full_rel = os.path.relpath(os.path.join(dirpath, fn), ROOT).replace('\\','/')
        if full_rel in EXCLUDE_FILES:
            continue
        public_files.add(full_rel)

# gather public HTML pages for quality checks
html_files = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    rel = os.path.relpath(dirpath, ROOT).replace('\\','/')
    if is_excluded_path(dirpath):
        continue
    for fn in filenames:
        full_rel = os.path.relpath(os.path.join(dirpath, fn), ROOT).replace('\\','/')
        if full_rel in EXCLUDE_FILES:
            continue
        if fn.lower().endswith('.bak'):
            continue
        if not fn.lower().endswith('.html'):
            continue
        html_files.append(full_rel)

# build existing set for resolution
existing = set(public_files)
for f in list(html_files):
    if f.endswith('index.html'):
        d = os.path.dirname(f)
        existing.add(d + '/')
        existing.add('/' + d + '/')
        existing.add('/' + f)
    existing.add('/' + f)
for f in list(public_files):
    existing.add('/' + f)

# helper to get visible text
def visible_text(html):
    t = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.I|re.S)
    t = re.sub(r'<style[^>]*>.*?</style>', '', t, flags=re.I|re.S)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = unescape(t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

# helpers to find hrefs
# Only anchor hrefs are navigational links for this verifier.
href_re = re.compile(r'<a[^>]*href=["\']([^"\']+)["\']', re.I)

report = {
    'broken_links': [],
    'duplicate_pages': [],
    'missing_canonicals': [],
    'weak_meta_descriptions': [],
    'thin_content_pages': [],
    'unnormalized_links': [],
    'invalid_internal_links': [],
    'sitemap_mismatches': {'missing_from_sitemap': [], 'sitemap_missing_pages': []},
    'indexnow_mismatches': {'missing_from_indexnow': [], 'indexnow_removed_pages': []},
    'orphan_pages': []
}

noindex_pages = set()

# load sitemap if present
sitemap_paths = set()
if os.path.exists('sitemap.xml'):
    with open('sitemap.xml','r',encoding='utf-8',errors='ignore') as fh:
        s = fh.read()
    urls = re.findall(r'<loc>(.*?)</loc>', s, re.I)
    for u in urls:
        # try to map to local path
        if u.startswith('http'):
            path = u.split('://',1)[1].split('/',1)[1] if '/' in u.split('://',1)[1] else ''
            path = path.rstrip('/')
            if path == '':
                sitemap_paths.add('index.html')
            else:
                if path.endswith('.html'):
                    sitemap_paths.add(path)
                else:
                    sitemap_paths.add(path + '/index.html')
        else:
            # relative
            p = u.lstrip('/').rstrip('/')
            if p == '':
                sitemap_paths.add('index.html')
            else:
                sitemap_paths.add(p + '/index.html' if not p.endswith('.html') else p)

# load indexnow payload if present
indexnow_urls = set()
if os.path.exists('scripts/indexnow_payload.json'):
    try:
        with open('scripts/indexnow_payload.json','r',encoding='utf-8') as fh:
            idx = json.load(fh)
        for u in idx.get('urlList',[]):
            # map to path
            if u.startswith('http'):
                path = u.split('://',1)[1].split('/',1)[1] if '/' in u.split('://',1)[1] else ''
                path = path.rstrip('/')
                if path == '':
                    indexnow_urls.add('index.html')
                else:
                    if path.endswith('.html'):
                        indexnow_urls.add(path)
                    else:
                        indexnow_urls.add(path + '/index.html')
    except Exception:
        pass

# build inbound link counts
inbound = {f: 0 for f in html_files}

# helper to resolve an href to local candidate paths
def resolve_href(src_rel, href):
    href = href.strip()
    # ignore external
    if href.startswith('http') or href.startswith('mailto:') or href.startswith('tel:') or href.startswith('javascript:') or href.startswith('#') or href.strip()=='' or href.startswith('${'):
        return None, []
    # remove URL fragment before path resolution
    href = urllib.parse.unquote(href.split('#', 1)[0])
    if href == '':
        return None, []
    # ignore obvious non-HTML asset links
    href_no_query = href.split('?', 1)[0].split('#', 1)[0].lower()
    asset_exts = ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.ico', '.css', '.js', '.pdf', '.txt', '.xml', '.json', '.zip', '.md', '.yml', '.yaml', '.csv', '.aspx')
    # normalize
    candidates = []
    if href.startswith('/'):
        cand = href.lstrip('/')
        candidates.append(cand)
        candidates.append(cand + '.html')
        if not cand.endswith('/'):
            candidates.append(os.path.join(cand, 'index.html'))
        else:
            candidates.append(cand.rstrip('/') + '/index.html')
    else:
        base = os.path.dirname(src_rel)
        joined = os.path.normpath(os.path.join(base, href)).replace('\\','/')
        candidates.append(joined)
        candidates.append(joined + '.html')
        candidates.append(os.path.join(joined, 'index.html'))
        # folder candidate
        if not href.endswith('/'):
            candidates.append(os.path.join(base, href, 'index.html'))
    # normalize candidates
    norm = []
    for c in candidates:
        c = c.replace('\\','/')
        c = c.lstrip('/')
        norm.append(c)
    return 'internal', norm

# scan files
meta_map = {}
for rel in html_files:
    full = os.path.join(ROOT, rel)
    with open(full, 'r', encoding='utf-8', errors='ignore') as fh:
        html = fh.read()
    robots = re.search(r'<meta[^>]*name=["\']robots["\'][^>]*content=["\']([^"\']*)["\']', html, re.I)
    is_noindex = bool(robots and 'noindex' in robots.group(1).lower())
    if is_noindex:
        noindex_pages.add(rel)

    # canonical
    if not is_noindex and not re.search(r'<link[^>]*rel=["\']canonical["\']', html, re.I):
        report['missing_canonicals'].append(rel)
    # meta description
    md = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', html, re.I)
    if md:
        content = md.group(1).strip()
    else:
        content = None
    meta_map[rel] = content
    if is_noindex:
        meta_map[rel] = content
    else:
        meta_map[rel] = content
    # visible text
    vt = visible_text(html)
    wc = len(vt.split())
    if not is_noindex and wc < 150:
        report['thin_content_pages'].append({'file': rel, 'words': wc})
    if is_noindex:
        continue

    # hrefs
    for m in href_re.finditer(html):
        href = m.group(1)
        kind, cands = resolve_href(rel, href)
        if kind is None:
            continue
        # check invalid internal links to excluded folders
        if any(href.lstrip('/').startswith(ex + '/') or href.lstrip('/').startswith(ex) for ex in INVALID_LINK_PREFIXES):
            report['invalid_internal_links'].append({'file': rel, 'href': href})
            continue
        # check unnormalized (directory-style) links: hrefs ending with '/' or no .html and no protocol
        if (href.endswith('/') or (not href.endswith('.html') and not href.startswith('/') and not '/' in href and href.endswith('/')) or (href.startswith('/') and not href.endswith('.html') and not '.' in os.path.basename(href))):
            # treat as directory-style
            report['unnormalized_links'].append({'file': rel, 'href': href})
        # resolve existence
        exists = False
        for c in cands:
            if c in existing or ('/' + c) in existing:
                exists = True
                # increment inbound for resolved target if it's in our files
                target = c if c in html_files else (c if c in existing else None)
                # map to file path in html_files if possible
                # prefer exact match
                for candidate in (c, c.replace('/index.html','/index.html')):
                    if candidate in inbound:
                        inbound[candidate] += 1
                        break
                break
        if not exists:
            report['broken_links'].append({'file': rel, 'href': href, 'candidates': cands})

# meta description issues: duplicates and length issues
# duplicates
content_to_files = {}
for f,c in meta_map.items():
    if f in noindex_pages:
        continue
    if c:
        content_to_files.setdefault(c, []).append(f)
for c, files in content_to_files.items():
    if len(files) > 1:
        for f in files:
            report['weak_meta_descriptions'].append({'file': f, 'issue': 'duplicate_description'})
# length issues
for f,c in meta_map.items():
    if f in noindex_pages:
        continue
    if not c:
        report['weak_meta_descriptions'].append({'file': f, 'issue': 'missing'})
    else:
        L = len(c)
        if L < 140:
            report['weak_meta_descriptions'].append({'file': f, 'issue': 'too_short', 'length': L})
        elif L > 160:
            report['weak_meta_descriptions'].append({'file': f, 'issue': 'too_long', 'length': L})
        # low quality heuristics
        lowq_terms = ['explore more','continue to','return to','skip to','explore','click here']
        lowq = any(t in c.lower() for t in lowq_terms)
        if lowq:
            report['weak_meta_descriptions'].append({'file': f, 'issue': 'low_quality', 'sample': c[:80]})

# sitemap mismatches: pages missing from sitemap and entries pointing to missing pages
if sitemap_paths:
    sitemap_set = set(sitemap_paths)
    # missing from sitemap: public html files not in sitemap_set
    for f in html_files:
        if f in noindex_pages:
            continue
        mapped = f
        if mapped not in sitemap_set and ('/' + mapped) not in sitemap_set:
            report['sitemap_mismatches']['missing_from_sitemap'].append(f)
    # sitemap entries pointing to removed pages
    for s in sitemap_set:
        if s not in html_files and ('/' + s) not in html_files:
            report['sitemap_mismatches']['sitemap_missing_pages'].append(s)

# indexnow mismatches
if indexnow_urls:
    idx_set = set(indexnow_urls)
    # missing from indexnow: pages in sitemap not in indexnow
    for f in html_files:
        if f in noindex_pages:
            continue
        mapped = f
        if mapped not in idx_set:
            report['indexnow_mismatches']['missing_from_indexnow'].append(f)
    for u in idx_set:
        if u not in html_files and ('/' + u) not in html_files:
            report['indexnow_mismatches']['indexnow_removed_pages'].append(u)

# orphan pages: inbound count zero
for f,count in inbound.items():
    if f in noindex_pages:
        continue
    if count == 0:
        report['orphan_pages'].append(f)

# counts
summary = {k: len(v) if not isinstance(v, dict) else {sk: len(sv) for sk,sv in v.items()} for k,v in report.items()}

out = 'ahrefs_verification_report.json'
with open(out, 'w', encoding='utf-8') as fh:
    json.dump({'report': report, 'summary': summary}, fh, indent=2)
print('Wrote', out)
