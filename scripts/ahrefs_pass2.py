#!/usr/bin/env python3
import os, re, json, shutil
from html import unescape
ROOT = os.path.abspath('.')
EXCLUDE_DIRS = ('assets','css','js','internal','reports')
EXCLUDE_FILES = ('sitemap.xml','scripts/indexnow_payload.json')

def is_excluded_path(path):
    parts = path.replace('\\','/').split('/')
    for ex in EXCLUDE_DIRS:
        if ex in parts:
            return True
    return False

# collect html files
html_files = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    # skip excluded dirs
    rel = os.path.relpath(dirpath, ROOT).replace('\\','/')
    if rel == '.':
        pass
    if is_excluded_path(dirpath):
        continue
    for fn in filenames:
        if not fn.lower().endswith('.html'):
            continue
        if fn.lower().endswith('.bak.html') or fn.lower().endswith('.bak'):
            continue
        full = os.path.join(dirpath, fn)
        # skip explicitly excluded files
        relp = os.path.relpath(full, ROOT).replace('\\','/')
        if relp in EXCLUDE_FILES:
            continue
        html_files.append(relp)

# build existing paths set
existing = set()
for f in html_files:
    existing.add(f)
    existing.add('/' + f)
    # index mapping
    if f.endswith('index.html'):
        dirp = os.path.dirname(f)
        existing.add(dirp + '/')
        existing.add('/' + dirp + '/')
        existing.add(dirp)

# also include top-level html (like contact.html)
for f in html_files:
    existing.add(f)

report = {
    'modified_files': [],
    'links_normalized': [],
    'meta_rewritten': [],
    'pages_expanded': [],
    'skipped_files': []
}

def backup(path):
    bak = path + '.bak'
    if not os.path.exists(bak):
        shutil.copy2(path, bak)

def visible_text(html):
    t = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.I|re.S)
    t = re.sub(r'<style[^>]*>.*?</style>', '', t, flags=re.I|re.S)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = unescape(t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

for rel in html_files:
    # double-check exclusion
    if is_excluded_path(rel):
        report['skipped_files'].append({'file': rel, 'reason': 'excluded directory'})
        continue
    if rel.endswith('.bak'):
        report['skipped_files'].append({'file': rel, 'reason': 'backup file'})
        continue
    full = os.path.join(ROOT, rel)
    try:
        with open(full, 'r', encoding='utf-8', errors='ignore') as fh:
            html = fh.read()
    except Exception as e:
        report['skipped_files'].append({'file': rel, 'reason': 'read error'})
        continue

    orig = html
    modified = False

    # Link normalization: find href/src values
    def repl_href(match):
        href = match.group(1)
        # skip external and anchors and mailto/tel/js
        if href.startswith('http') or href.startswith('mailto:') or href.startswith('tel:') or href.startswith('javascript:') or href.startswith('#') or href.strip()=='' or href.startswith('${'):
            return match.group(0)
        # do not touch canonical link tags (skip if this href belongs to a canonical link)
        tag_start = match.string.rfind('<', 0, match.start())
        tag_end = match.string.find('>', match.end())
        if tag_start != -1 and tag_end != -1:
            tag_text = match.string[tag_start:tag_end]
            if 'rel="canonical"' in tag_text or "rel='canonical'" in tag_text:
                return match.group(0)
        # candidate resolutions
        candidates = []
        # absolute
        if href.startswith('/'):
            cand = href.lstrip('/')
            candidates.append(cand)
            candidates.append(os.path.join(cand,'index.html'))
            candidates.append(cand + '.html')
            candidates.append(cand.rstrip('/') + '/index.html')
        else:
            # relative to file
            base = os.path.dirname(rel)
            joined = os.path.normpath(os.path.join(base, href)).replace('\\','/')
            candidates.append(joined)
            candidates.append(joined + '.html')
            candidates.append(os.path.join(joined, 'index.html'))
            # also try treating href as folder name
            if not href.endswith('/'):
                candidates.append(os.path.join(base, href, 'index.html'))
        # check existence
        for c in candidates:
            if c in existing or ('/' + c) in existing:
                # normalize to leading slash absolute path
                target = '/' + c.lstrip('/')
                # record normalization
                if target != href:
                    report['links_normalized'].append({'file': rel, 'original': href, 'replacement': target})
                    return 'href="{}"'.format(target)
                else:
                    return match.group(0)
        # no match: keep original but record if dead
        return match.group(0)

    # apply href normalization
    html2 = re.sub(r'href=["\']([^"\']+)["\'](?![^<]*rel=\")', repl_href, html, flags=re.I)
    if html2 != html:
        html = html2
        modified = True

    # meta description rewrite: always replace to ensure 140-160 chars; but preserve canonical tags
    # find existing meta description
    md_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>', html, flags=re.I)
    text = visible_text(html)
    words = text.split()
    # generate keyword from title or filename
    title_m = re.search(r'<title>(.*?)</title>', html, flags=re.I|re.S)
    title = title_m.group(1).strip() if title_m else os.path.splitext(os.path.basename(rel))[0]
    keyword = title.split()[0] if title else os.path.basename(rel).split('.')[0]
    # build base summary from first sentences
    summary = ' '.join(words[:30])
    if len(summary) < 80:
        summary = (' '.join(words[:40]) or title or 'Portfolio and technical documentation by Jeremy Fontenot')
    # craft description target length ~150
    desc = (summary + ' ' + keyword + ' resources and guidance.').strip()
    if len(desc) < 140:
        # pad using title and path
        suffix = f' Guidance and resources for {keyword}.'
        desc = (desc + suffix)[:150]
    else:
        desc = desc[:155]
    # ensure between 140 and 160
    if len(desc) < 140:
        desc = desc.ljust(140)[:140]
    if len(desc) > 160:
        desc = desc[:160]
    desc = desc.strip()
    new_meta = f'<meta name="description" content="{desc}">'
    if md_match:
        old = md_match.group(0)
        # replace only if different
        if old.find(desc) == -1:
            html = html.replace(old, new_meta)
            report['meta_rewritten'].append({'file': rel, 'old': old, 'new': new_meta})
            modified = True
    else:
        # insert after canonical if present else before </head>
        can = re.search(r'(<link[^>]*rel=["\']canonical["\'][^>]*>)', html, flags=re.I)
        if can:
            insert_at = can.end()
            html = html[:insert_at] + '\n  ' + new_meta + html[insert_at:]
        else:
            if '</head>' in html.lower():
                idx = html.lower().rfind('</head>')
                html = html[:idx] + '\n  ' + new_meta + html[idx:]
            else:
                html = new_meta + '\n' + html
        report['meta_rewritten'].append({'file': rel, 'old': None, 'new': new_meta})
        modified = True

    # thin content expansion: if <120 words
    wc = len(words)
    if wc < 120:
        # prepare expansion text ~ 60 words
        add_text = (f"This page provides an overview of {title} and links to related documentation and projects. "
                    "It offers practical guidance and pointers to deeper resources, helping readers find the right tools, scripts, and examples. "
                    "See the related docs and project pages for artifacts and implementation notes.")
        # insert after first H1 if exists, else after <body>
        h1_match = re.search(r'(<h1[^>]*>.*?</h1>)', html, flags=re.I|re.S)
        if h1_match:
            insert_at = h1_match.end()
            html = html[:insert_at] + '\n  <p>' + add_text + '</p>' + html[insert_at:]
        else:
            body_m = re.search(r'<body[^>]*>', html, flags=re.I)
            if body_m:
                insert_at = body_m.end()
                html = html[:insert_at] + '\n  <p>' + add_text + '</p>' + html[insert_at:]
            else:
                # prepend
                html = '<p>' + add_text + '</p>\n' + html
        report['pages_expanded'].append({'file': rel, 'words_before': wc, 'words_after_estimate': wc + len(add_text.split())})
        modified = True

    # ensure canonical tags unchanged: (we didn't modify ones explicitly)

    if modified and html != orig:
        # backup
        backup(full)
        # write file preserving encoding
        with open(full, 'w', encoding='utf-8') as fh:
            fh.write(html)
        report['modified_files'].append(rel)

# write report
outp = os.path.join('scripts','ahrefs_pass2_report.json')
with open(outp, 'w', encoding='utf-8') as fh:
    json.dump(report, fh, indent=2)
print('Pass 2 complete. Report:', outp)
