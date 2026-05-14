#!/usr/bin/env python3
import os, sys, json, re
from html.parser import HTMLParser

ROOT = os.path.abspath('.')
EXCLUDE_DIRS = ['internal']

class MyParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.data = []
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
    def handle_data(self, data):
        self.data.append(data)


def is_excluded(path):
    parts = path.replace('\\','/').split('/')
    for ex in EXCLUDE_DIRS:
        if ex in parts:
            return True
    return False

report = {
    'files_scanned': 0,
    'html_files': [],
    'missing_targets': [],
    'pages_no_outgoing_links': [],
    'pages_broken_links': [],
    'pages_one_internal_link': [],
    'meta_refresh': [],
    'missing_meta_description': [],
    'low_word_count': [],
    'short_titles': [],
    'missing_h1': [],
    'multiple_h1': [],
    'missing_og': [],
    'missing_twitter': [],
    'duplicate_no_canonical': [],
    'large_images': [],
}

# gather list of html files
html_files = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    # skip EXCLUDE_DIRS
    if is_excluded(dirpath):
        continue
    for fn in filenames:
        if fn.lower().endswith('.html'):
            html_files.append(os.path.join(dirpath, fn))

report['files_scanned'] = len(html_files)

# helper to get visible text
TAG_RE = re.compile(r'<[^>]+>')

def visible_text(html):
    text = TAG_RE.sub('', html)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# build set of existing paths for link resolution
existing_paths = set()
for f in html_files:
    rel = os.path.relpath(f, ROOT).replace('\\','/')
    existing_paths.add('/' + rel)
    existing_paths.add(rel)

# also include assets files
assets_root = os.path.join(ROOT, 'assets')
if os.path.exists(assets_root):
    for dirpath, dirnames, filenames in os.walk(assets_root):
        for fn in filenames:
            relp = os.path.relpath(os.path.join(dirpath, fn), ROOT).replace('\\','/')
            existing_paths.add('/' + relp)
            existing_paths.add(relp)

for path in html_files:
    relpath = os.path.relpath(path, ROOT).replace('\\','/')
    with open(path, 'r', encoding='utf-8', errors='ignore') as fh:
        html = fh.read()
    report['html_files'].append(relpath)
    parser = MyParser()
    parser.feed(html)

    # title
    title_m = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE|re.S)
    title = title_m.group(1).strip() if title_m else ''
    if len(title) < 45:
        report['short_titles'].append(relpath)

    # meta description
    md = re.search(r'<meta[^>]*name=["\']description["\'][^>]*>', html, re.IGNORECASE)
    if not md:
        report['missing_meta_description'].append(relpath)

    # og tags
    ogs = ['og:title','og:description','og:url','og:type','og:image']
    missing_og = [o for o in ogs if o not in html]
    if missing_og:
        report['missing_og'].append(relpath)

    # twitter tags
    tws = ['twitter:card','twitter:title','twitter:description','twitter:image']
    missing_tw = [t for t in tws if t not in html]
    if missing_tw:
        report['missing_twitter'].append(relpath)

    # canonical
    can = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', html, re.IGNORECASE)
    if not can:
        pass

    # h1 count
    h1s = re.findall(r'<h1[^>]*>.*?</h1>', html, re.IGNORECASE|re.S)
    if len(h1s) == 0:
        report['missing_h1'].append(relpath)
    if len(h1s) > 1:
        report['multiple_h1'].append(relpath)

    # meta refresh
    if re.search(r'<meta[^>]*http-equiv=["\']refresh["\']', html, re.IGNORECASE):
        report['meta_refresh'].append(relpath)

    # word count
    vt = visible_text(html)
    wc = len(vt.split())
    if wc < 50:
        report['low_word_count'].append(relpath)

    # links
    hrefs = re.findall(r'href=["\'](.*?)["\']', html, re.IGNORECASE)
    internal_links = []
    missing_links = []
    for h in hrefs:
        if h.startswith('http') or h.startswith('mailto:') or h.startswith('tel:'):
            continue
        # normalize
        nh = h.split('#')[0].split('?')[0]
        if nh == '' or nh.startswith('javascript:'):
            continue
        # relative resolution
        cand = os.path.normpath(os.path.join(os.path.dirname(relpath), nh)).replace('\\','/')
        cand_slash = '/' + cand
        if cand in existing_paths or cand_slash in existing_paths or nh in existing_paths:
            internal_links.append(h)
        else:
            missing_links.append(h)

    if len(internal_links) == 0:
        report['pages_no_outgoing_links'].append(relpath)
    if len(internal_links) == 1:
        report['pages_one_internal_link'].append(relpath)
    if missing_links:
        report['pages_broken_links'].append({'file': relpath, 'broken': missing_links})
        for m in missing_links:
            report['missing_targets'].append({'source': relpath, 'target': m})

    # images check
    imgs = re.findall(r'<img[^>]*src=["\'](.*?)["\']', html, re.IGNORECASE)
    for img in imgs:
        if img.startswith('http'):
            continue
        imgpath = os.path.normpath(os.path.join(os.path.dirname(path), img)).replace('\\','/')
        if not os.path.isabs(imgpath):
            imgpath = os.path.join(ROOT, imgpath)
        if os.path.exists(imgpath):
            sz = os.path.getsize(imgpath)
            if sz > 200*1024:
                report['large_images'].append({'page': relpath, 'image': img, 'size_kb': sz/1024})

# duplicates heuristic: same filename different dirs without canonical
basename_map = {}
for f in report['html_files']:
    b = os.path.basename(f)
    basename_map.setdefault(b, []).append(f)
for b, files in basename_map.items():
    if len(files) > 1:
        any_canonical = False
        for f in files:
            p = os.path.join(ROOT, f)
            with open(p,'r',encoding='utf-8',errors='ignore') as fh:
                if 'rel="canonical"' in fh.read():
                    any_canonical = True
        if not any_canonical:
            report['duplicate_no_canonical'].append({'basename': b, 'files': files})

# dedupe lists
for k in ['missing_meta_description','short_titles','missing_og','missing_twitter','missing_h1','multiple_h1','meta_refresh','low_word_count']:
    report[k] = sorted(set(report.get(k,[])))

with open(os.path.join('scripts','ahrefs_report.json'),'w',encoding='utf-8') as out:
    json.dump(report, out, indent=2)

print('Scan complete. Files scanned:', report['files_scanned'])
print('Report written to scripts/ahrefs_report.json')
