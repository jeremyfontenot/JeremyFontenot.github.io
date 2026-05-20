#!/usr/bin/env python3
import os, json
ROOT = os.path.abspath('.')
SITE_BASE = 'https://jeremyfontenot.online'
ACTIVE_HTML_LIST = os.path.join('artifacts', 'active-html-files.txt')

def load_active_html_files():
    if os.path.exists(ACTIVE_HTML_LIST):
        with open(ACTIVE_HTML_LIST, 'r', encoding='utf-8') as fh:
            return [line.strip().replace('\\', '/') for line in fh if line.strip()]

    report_path = os.path.join('scripts', 'ahrefs_report.json')
    if os.path.exists(report_path):
        with open(report_path, 'r', encoding='utf-8') as fh:
            report = json.load(fh)
        return [rel.replace('\\', '/') for rel in report.get('html_files', [])]

    return []

urls = []
for rel in load_active_html_files():
    if rel.startswith('internal') or rel.startswith('assets') or rel.startswith('cdn-cgi'):
        continue
    # map index.html to directory
    if rel.endswith('index.html'):
        dirpath = '/' + os.path.dirname(rel)
        if dirpath == '/':
            url = SITE_BASE + '/'
        else:
            url = SITE_BASE + dirpath + '/'
    else:
        url = SITE_BASE + '/' + rel
    urls.append(url)

# write sitemap.xml
from datetime import datetime, UTC
now = datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%SZ')
entries = []
for u in urls:
    entries.append(f'  <url>\n    <loc>{u}</loc>\n    <lastmod>{now}</lastmod>\n  </url>')

smap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(entries) + '\n</urlset>\n'
with open('sitemap.xml','w',encoding='utf-8') as fh:
    fh.write(smap)

# IndexNow payload (urls list)
payload = {
    'host': 'jeremyfontenot.online',
    'key': 'REPLACE_WITH_YOUR_INDEXNOW_KEY',
    'urlList': urls
}
with open(os.path.join('scripts','indexnow_payload.json'),'w',encoding='utf-8') as fh:
    json.dump(payload, fh, indent=2)

print('Wrote sitemap.xml with', len(urls), 'URLs')
print('Wrote scripts/indexnow_payload.json')
