#!/usr/bin/env python3
import os, json, re, shutil
ROOT = os.path.abspath('.')
REPORT = os.path.join('scripts','ahrefs_report.json')
SITE_BASE = 'https://jeremyfontenot.online'

def backup(path):
    bak = path + '.bak'
    if not os.path.exists(bak):
        shutil.copy2(path, bak)

with open(REPORT,'r',encoding='utf-8') as fh:
    report = json.load(fh)

changed_files = []

def insert_into_head(html, insertion):
    # place before </head>
    if '</head>' in html.lower():
        idx = html.lower().rfind('</head>')
        return html[:idx] + insertion + html[idx:]
    else:
        return insertion + html

for rel in report['html_files']:
    path = os.path.join(ROOT, rel)
    if 'internal' in rel.split('/'):
        continue
    with open(path,'r',encoding='utf-8',errors='ignore') as fh:
        html = fh.read()
    orig = html
    modified = False

    # backup
    backup(path)

    # remove meta refresh
    new_html = re.sub(r'<meta[^>]*http-equiv=["\']refresh["\'][^>]*>', '', html, flags=re.I)
    if new_html != html:
        html = new_html
        modified = True

    # replace http:// with https:// for absolute links
    new_html = re.sub(r'href=["\']http://', 'href="https://', html, flags=re.I)
    new_html = re.sub(r'src=["\']http://', 'src="https://', new_html, flags=re.I)
    if new_html != html:
        html = new_html
        modified = True

    # add meta description if missing
    if rel in report['missing_meta_description']:
        # generate from visible text
        text = re.sub(r'<[^>]+>',' ', html)
        text = re.sub(r'\s+',' ', text).strip()
        desc = text[:150].strip()
        if len(desc) < 50:
            desc = f"Personal portfolio and technical documentation by Jeremy Fontenot about cloud, automation, and infrastructure."[:150]
        meta = f'\n  <meta name="description" content="{desc}">\n'
        html = insert_into_head(html, meta)
        modified = True

    # add OG + twitter
    if rel in report['missing_og'] or rel in report['missing_twitter']:
        title_m = re.search(r'<title>(.*?)</title>', html, re.I|re.S)
        title = title_m.group(1).strip() if title_m else os.path.basename(rel)
        md_m = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']', html, re.I)
        desc = md_m.group(1).strip() if md_m else (title + ' — portfolio and technical notes')
        og = []
        og.append(f'<meta property="og:title" content="{title}">')
        og.append(f'<meta property="og:description" content="{desc}">')
        og.append(f'<meta property="og:url" content="{SITE_BASE}/{rel}">')
        og.append(f'<meta property="og:type" content="website">')
        # try site OG image
        og_img = '/assets/og/og-portfolio.png'
        og.append(f'<meta property="og:image" content="{SITE_BASE}{og_img}">')
        og_block = '\n  ' + '\n  '.join(og) + '\n'
        html = insert_into_head(html, og_block)
        # twitter
        tw = []
        tw.append('<meta name="twitter:card" content="summary_large_image">')
        tw.append(f'<meta name="twitter:title" content="{title}">')
        tw.append(f'<meta name="twitter:description" content="{desc}">')
        tw.append(f'<meta name="twitter:image" content="{SITE_BASE}{og_img}">')
        tw_block = '\n  ' + '\n  '.join(tw) + '\n'
        html = insert_into_head(html, tw_block)
        modified = True

    # H1 fixes
    h1s = re.findall(r'<h1[^>]*>.*?</h1>', html, re.I|re.S)
    if len(h1s) == 0:
        # create from title
        title_m = re.search(r'<title>(.*?)</title>', html, re.I|re.S)
        title = title_m.group(1).strip() if title_m else os.path.splitext(os.path.basename(rel))[0]
        # insert after body open
        if '<body' in html.lower():
            # find first > after body tag
            m = re.search(r'<body[^>]*>', html, re.I)
            if m:
                idx = m.end()
                html = html[:idx] + f"\n  <h1>{title}</h1>\n" + html[idx:]
                modified = True
    if len(h1s) > 1:
        # convert extra H1s to H2 but keep the first H1
        parts = re.split(r'(<h1[^>]*>.*?</h1>)', html, flags=re.I|re.S)
        new_parts = []
        seen = 0
        for part in parts:
            if re.match(r'<h1', part, re.I):
                seen += 1
                if seen == 1:
                    new_parts.append(part)
                else:
                    replaced = re.sub(r'^<h1', '<h2', re.sub(r'</h1>$', '</h2>', part, flags=re.I), flags=re.I)
                    new_parts.append(replaced)
            else:
                new_parts.append(part)
        html = ''.join(new_parts)
        modified = True

    # pages with no outgoing links or only one internal link: add a contextual link
    if rel in report['pages_no_outgoing_links'] or rel in report['pages_one_internal_link']:
        addp = '\n  <p>Explore more: <a href="/docs/">Documentation & projects</a></p>\n'
        # insert before </body>
        if '</body>' in html.lower():
            idx = html.lower().rfind('</body>')
            html = html[:idx] + addp + html[idx:]
            modified = True

    # write back
    if modified and html != orig:
        with open(path,'w',encoding='utf-8') as fh:
            fh.write(html)
        changed_files.append(rel)

# compress large images (simple approach: skip actual compression here; list them for manual compression)
large_imgs = report.get('large_images', [])
# attempt to compress PNG/JPG using Pillow if available
try:
    from PIL import Image
    for item in large_imgs:
        img_rel = item['image']
        page = item['page']
        img_path = os.path.normpath(os.path.join(os.path.dirname(page), img_rel)).replace('\\','/')
        full = os.path.join(ROOT, img_path)
        if os.path.exists(full):
            backup(full)
            im = Image.open(full)
            # convert and save as optimized JPEG if not transparent
            if im.mode in ('RGBA','LA'):
                # save as webp
                outp = full
                im.save(outp, optimize=True, quality=85)
            else:
                im = im.convert('RGB')
                im.save(full, optimize=True, quality=85)
            changed_files.append(img_path)
except Exception as e:
    pass

# output changed files
with open(os.path.join('scripts','ahrefs_changed_files.json'),'w',encoding='utf-8') as out:
    json.dump({'changed': changed_files}, out, indent=2)

print('Fix pass complete. Files changed:', len(changed_files))
print('Changed list written to scripts/ahrefs_changed_files.json')
