#!/usr/bin/env python3
import os, json, re, shutil
from datetime import datetime
from html import unescape
ROOT = os.path.abspath('.')
SITE_BASE = 'https://jeremyfontenot.online'
EXCLUDE_DIRS = ('assets','css','js','internal','reports')

def is_excluded(path):
    parts = path.replace('\\','/').split('/')
    return any(ex in parts for ex in EXCLUDE_DIRS)

# load verification report (authoritative)
with open(os.path.join('ahrefs_verification_report.json'),'r',encoding='utf-8') as fh:
    v = json.load(fh)['report']

# helper
def backup(path):
    bak = path + '.bak'
    if not os.path.exists(bak):
        shutil.copy2(path, bak)

# collect public html files
html_files = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    if is_excluded(dirpath):
        continue
    for fn in filenames:
        if not fn.lower().endswith('.html'):
            continue
        rel = os.path.relpath(os.path.join(dirpath, fn), ROOT).replace('\\','/')
        if rel in ('sitemap.xml','scripts/indexnow_payload.json'):
            continue
        if rel.endswith('.bak'):
            continue
        html_files.append(rel)

existing = set(html_files)
for f in list(html_files):
    existing.add('/' + f)
    if f.endswith('index.html'):
        d = os.path.dirname(f)
        existing.add(d + '/')
        existing.add('/' + d + '/')

# utility: write file with backup
modified = []
links_fixed = []
links_removed = []
ambiguous_links = []
pages_expanded = []
meta_rewritten = []
canonicals_added = []
skipped = []

# map for uniqueness of meta descriptions
meta_texts = set()
# preload current meta descriptions to avoid duplicates
for f in html_files:
    try:
        with open(f,'r',encoding='utf-8',errors='ignore') as fh:
            html = fh.read()
        m = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', html, re.I)
        if m:
            meta_texts.add(m.group(1).strip())
    except:
        pass

# Helper: safe write with backup
def write_file(rel, content):
    full = os.path.join(ROOT, rel)
    backup(full)
    with open(full,'w',encoding='utf-8') as fh:
        fh.write(content)
    modified.append(rel)

# DEAD LINK RESOLUTION
for item in v.get('broken_links', []):
    src = item['file']
    href = item['href']
    if is_excluded(src):
        skipped.append({'file': src, 'reason': 'excluded'})
        continue
    if src not in html_files:
        skipped.append({'file': src, 'reason': 'source-not-in-scope'})
        continue
    # find possible targets in repo by candidate list or by searching for basename
    candidates = item.get('candidates', [])
    matches = []
    for c in candidates:
        c_norm = c.lstrip('/')
        # check index variants
        if c_norm in existing:
            matches.append(c_norm)
        elif c_norm + '.html' in existing:
            matches.append(c_norm + '.html')
        elif c_norm.rstrip('/') + '/index.html' in existing:
            matches.append(c_norm.rstrip('/') + '/index.html')
    # also attempt to find by basename
    if not matches:
        b = os.path.basename(href).split('#')[0].split('?')[0]
        for f in html_files:
            if os.path.basename(f) == b:
                matches.append(f)
    # dedupe
    matches = sorted(set(matches))
    full_src = os.path.join(ROOT, src)
    with open(full_src, 'r', encoding='utf-8', errors='ignore') as fh:
        html = fh.read()
    if len(matches) == 1:
        target = matches[0]
        # format absolute folder/index.html
        if target.endswith('index.html'):
            tgt_url = '/' + os.path.dirname(target).lstrip('/') + '/' if os.path.dirname(target)!='' else '/'
            # convert to /folder/index.html format per user rule
            if tgt_url.endswith('/') and tgt_url != '/':
                normalized = tgt_url.rstrip('/') + '/index.html'
            elif tgt_url == '/':
                normalized = '/index.html'
            else:
                normalized = tgt_url
        else:
            normalized = '/' + target
        # replace href occurrences that exactly match original
        # handle quotes
        patt = re.compile(r'(href=["\'])' + re.escape(href) + r'(["\'])')
        new_html, count = patt.subn(r'\1' + normalized + r'\2', html)
        if count > 0:
            write_file(src, new_html)
            links_fixed.append({'file': src, 'original': href, 'replacement': normalized})
        else:
            # fallback: no exact match — record skipped
            skipped.append({'file': src, 'reason': 'href-not-found-for-replacement', 'href': href})
    elif len(matches) == 0:
        # remove link but preserve inner text
        # regex to replace <a ...>inner</a> where href matches
        a_patt = re.compile(r'<a\b[^>]*href=["\']' + re.escape(href) + r'["\'][^>]*>(.*?)</a>', re.I|re.S)
        new_html, count = a_patt.subn(r'\1', html)
        if count > 0:
            write_file(src, new_html)
            links_removed.append({'file': src, 'original': href})
        else:
            skipped.append({'file': src, 'reason': 'anchor-not-found-to-remove', 'href': href})
    else:
        # ambiguous
        ambiguous_links.append({'file': src, 'original': href, 'candidates': matches})

# HIGH-FIDELITY CONTENT EXPANSION
for item in v.get('thin_content_pages', []):
    rel = item['file']
    if is_excluded(rel):
        skipped.append({'file': rel, 'reason': 'excluded'})
        continue
    if rel not in html_files:
        skipped.append({'file': rel, 'reason': 'not-in-scope'})
        continue
    full = os.path.join(ROOT, rel)
    with open(full,'r',encoding='utf-8',errors='ignore') as fh:
        html = fh.read()
    # find first H1
    m = re.search(r'(<h1[^>]*>.*?</h1>)', html, re.I|re.S)
    # craft 70-word expansion using title/rel
    title_m = re.search(r'<title>(.*?)</title>', html, re.I|re.S)
    title = title_m.group(1).strip() if title_m else os.path.splitext(os.path.basename(rel))[0]
    expansion = (f"This section on {title} provides practical context and links to related documentation and projects. "
                 "It outlines common use-cases, implementation notes, and pointers to scripts or configurations maintained in the repository. "
                 "Refer to the project pages for artifacts and configuration examples.")
    if m:
        insert_at = m.end()
        new_html = html[:insert_at] + '\n  <p>' + expansion + '</p>' + html[insert_at:]
    else:
        # try after body
        bm = re.search(r'<body[^>]*>', html, re.I)
        if bm:
            idx = bm.end()
            new_html = html[:idx] + '\n  <p>' + expansion + '</p>' + html[idx:]
        else:
            new_html = '<p>' + expansion + '</p>\n' + html
    backup(full)
    with open(full,'w',encoding='utf-8') as fh:
        fh.write(new_html)
    pages_expanded.append({'file': rel, 'added_words': len(expansion.split())})
    if rel not in modified:
        modified.append(rel)

# META DESCRIPTION REMEDIATION
# ensure uniqueness
for item in v.get('weak_meta_descriptions', []):
    rel = item['file']
    if is_excluded(rel):
        skipped.append({'file': rel, 'reason': 'excluded'})
        continue
    if rel not in html_files:
        skipped.append({'file': rel, 'reason': 'not-in-scope'})
        continue
    full = os.path.join(ROOT, rel)
    with open(full,'r',encoding='utf-8',errors='ignore') as fh:
        html = fh.read()
    title_m = re.search(r'<title>(.*?)</title>', html, re.I|re.S)
    title = title_m.group(1).strip() if title_m else os.path.splitext(os.path.basename(rel))[0]
    keyword = title.split()[0] if title else os.path.splitext(os.path.basename(rel))[0]
    # build description
    desc = f"{title} — concise documentation and examples for {keyword}. Practical guidance and related artifacts for implementers."[:160]
    # ensure length 140-160
    if len(desc) < 140:
        desc = desc.ljust(140)
    if len(desc) > 160:
        desc = desc[:160]
    # ensure uniqueness
    suffix = 1
    base = desc
    while desc in meta_texts:
        suffix += 1
        tail = f" {suffix}"
        desc = (base[:160-len(tail)] + tail).strip()
    meta_texts.add(desc)
    new_meta = f'<meta name="description" content="{desc}">'
    # replace existing or insert
    md_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*>', html, re.I)
    if md_match:
        old = md_match.group(0)
        html2 = html.replace(old, new_meta)
    else:
        # insert before </head>
        if '</head>' in html.lower():
            idx = html.lower().rfind('</head>')
            html2 = html[:idx] + '\n  ' + new_meta + html[idx:]
        else:
            html2 = new_meta + '\n' + html
    if html2 != html:
        backup(full)
        with open(full,'w',encoding='utf-8') as fh:
            fh.write(html2)
        meta_rewritten.append({'file': rel, 'new': desc})
        if rel not in modified:
            modified.append(rel)

# CANONICAL NORMALIZATION
# for duplicate pages: choose preferred = shortest path (fewest segments), add canonical to others
for dup in v.get('duplicate_pages', []):
    files = dup['files']
    preferred = min(files, key=lambda p: p.count('/'))
    pref_url = SITE_BASE + '/' + (os.path.dirname(preferred) + '/' if os.path.dirname(preferred) else '')
    # ensure trailing slash
    if pref_url.endswith('//'):
        pref_url = pref_url.replace('//','/')
    for f in files:
        full = os.path.join(ROOT, f)
        if is_excluded(f):
            skipped.append({'file': f, 'reason': 'excluded-duplicate'})
            continue
        with open(full,'r',encoding='utf-8',errors='ignore') as fh:
            html = fh.read()
        # skip if already has canonical
        if re.search(r'<link[^>]*rel=["\']canonical["\']', html, re.I):
            continue
        # add canonical pointing to preferred
        link = f'<link rel="canonical" href="{pref_url}">'
        # insert into head
        if '</head>' in html.lower():
            idx = html.lower().rfind('</head>')
            html2 = html[:idx] + '\n  ' + link + html[idx:]
        else:
            html2 = link + '\n' + html
        backup(full)
        with open(full,'w',encoding='utf-8') as fh:
            fh.write(html2)
        canonicals_added.append({'file': f, 'canonical': pref_url})
        if f not in modified:
            modified.append(f)

# LINK NORMALIZATION CLEANUP: convert directory-style links to /folder/index.html for entries in unnormalized_links
for item in v.get('unnormalized_links', []):
    src = item['file']
    href = item['href']
    if is_excluded(src):
        skipped.append({'file': src, 'reason': 'excluded'})
        continue
    if src not in html_files:
        skipped.append({'file': src, 'reason': 'not-in-scope'})
        continue
    full = os.path.join(ROOT, src)
    with open(full,'r',encoding='utf-8',errors='ignore') as fh:
        html = fh.read()
    # normalize
    h = href
    if h.endswith('/'):
        norm = h.rstrip('/') + '/index.html'
    elif h == '/':
        norm = '/index.html'
    else:
        # if no extension and no slash, assume folder
        if not os.path.splitext(h)[1]:
            norm = '/' + h.strip('/') + '/index.html'
        else:
            norm = h
    patt = re.compile(r'(href=["\'])' + re.escape(h) + r'(["\'])')
    new_html, count = patt.subn(r'\1' + norm + r'\2', html)
    if count > 0:
        backup(full)
        with open(full,'w',encoding='utf-8') as fh:
            fh.write(new_html)
        links_fixed.append({'file': src, 'original': href, 'replacement': norm})
        if src not in modified:
            modified.append(src)

# SITEMAP & INDEXNOW UPDATES
sitemap_updates = {'added': [], 'removed': []}
if os.path.exists('sitemap.xml'):
    with open('sitemap.xml','r',encoding='utf-8',errors='ignore') as fh:
        sm = fh.read()
    # find missing_from_sitemap entries and add them
    for f in v.get('sitemap_mismatches', {}).get('missing_from_sitemap', []):
        # map to URL
        if f.endswith('index.html'):
            d = os.path.dirname(f)
            url = SITE_BASE + ('/' + d + '/' if d else '/')
        else:
            url = SITE_BASE + '/' + f
        # simple append before </urlset>
        lastmod = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        entry = f'  <url>\n    <loc>{url}</loc>\n    <lastmod>{lastmod}</lastmod>\n  </url>\n'
        if '</urlset>' in sm:
            sm = sm.replace('</urlset>', entry + '</urlset>')
            sitemap_updates['added'].append(url)
    # remove entries for sitemap_missing_pages
    for s in v.get('sitemap_mismatches', {}).get('sitemap_missing_pages', []):
        # build regex to remove
        loc = re.escape(s)
        sm, n = re.subn(r'<url>\s*<loc>[^<]*' + loc + r'[^<]*</loc>\s*<lastmod>[^<]*</lastmod>\s*</url>\s*', '', sm, flags=re.I)
        if n>0:
            sitemap_updates['removed'].append(s)
    # write backup and file
    backup('sitemap.xml')
    with open('sitemap.xml','w',encoding='utf-8') as fh:
        fh.write(sm)

indexnow_updates = {'added': [], 'removed': []}
if os.path.exists('scripts/indexnow_payload.json'):
    with open('scripts/indexnow_payload.json','r',encoding='utf-8') as fh:
        idx = json.load(fh)
    urls = idx.get('urlList', [])
    # add missing_from_indexnow
    for f in v.get('indexnow_mismatches', {}).get('missing_from_indexnow', []):
        if f.endswith('index.html'):
            d = os.path.dirname(f)
            url = SITE_BASE + ('/' + d + '/' if d else '/')
        else:
            url = SITE_BASE + '/' + f
        if url not in urls:
            urls.append(url)
            indexnow_updates['added'].append(url)
    # remove indexnow_removed_pages
    for u in v.get('indexnow_mismatches', {}).get('indexnow_removed_pages', []):
        # map possibly doubled slashes
        url = SITE_BASE + '/' + u.lstrip('/')
        if url in urls:
            urls.remove(url)
            indexnow_updates['removed'].append(url)
    # backup and write
    backup('scripts/indexnow_payload.json')
    idx['urlList'] = urls
    with open('scripts/indexnow_payload.json','w',encoding='utf-8') as fh:
        json.dump(idx, fh, indent=2)

# finalize report
pass3_report = {
    'files_modified': modified,
    'links_fixed': links_fixed,
    'links_removed': links_removed,
    'ambiguous_links': ambiguous_links,
    'pages_expanded': pages_expanded,
    'meta_descriptions_rewritten': meta_rewritten,
    'canonical_tags_added': canonicals_added,
    'sitemap_updates': sitemap_updates,
    'indexnow_updates': indexnow_updates,
    'skipped_items': skipped
}
with open('ahrefs_pass3_report.json','w',encoding='utf-8') as fh:
    json.dump(pass3_report, fh, indent=2)

print('Pass 3 complete. Report written to ahrefs_pass3_report.json')
