import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = path.join(root, 'artifacts', 'site-audit.json');
const activeListPath = path.join(root, 'artifacts', 'active-html-files.txt');
const skipDirPrefixes = [
  '.git',
  'node_modules',
  'sorted-documents',
  'proof-staging',
  'legacy-site-backup',
  'artifacts',
  'docs/archive',
  'docs/automation',
  'docs/m365-documentation-archive',
  'docs/brandguide-archive',
  'docs/curated'
];
const publicSkipDirs = new Set(['internal', 'reports', 'components']);
const localSchemes = /^(https?:|mailto:|tel:|javascript:|data:|\$\{)/i;
const assetAttrs = /\b(?:href|src)=["']([^"']+)["']/gi;
const imgTags = /<img\b[^>]*>/gi;
const idAttrs = /\bid=["']([^"']+)["']/gi;
const badText = /\b(lorem ipsum|todo\b|coming soon|insert .* here|auto-generated placeholder)\b/i;

function rel(file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

function normalizeRepoPath(value) {
  return value.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/+$/, '');
}

function shouldSkipDirectory(dirRel) {
  const normalized = normalizeRepoPath(dirRel);
  if (!normalized) return false;
  return skipDirPrefixes.some(prefix => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const child = path.join(dir, entry.name);
    const childRel = rel(child);
    if (entry.isDirectory()) {
      if (shouldSkipDirectory(childRel)) continue;
      walk(child, files);
    } else if (entry.isFile()) {
      files.push(childRel);
    }
  }
  return files;
}

function readActiveHtmlList(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map(item => normalizeRepoPath(item.trim()))
    .filter(Boolean);
}

function writeActiveHtmlList(filePath, files) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${files.join('\n')}${files.length ? '\n' : ''}`, 'utf8');
}

function sortUnique(files) {
  return [...new Set(files.map(item => normalizeRepoPath(item)).filter(Boolean))].sort();
}

function discoverActiveHtmlFiles() {
  return sortUnique(
    walk(root)
      .filter(file => file.toLowerCase().endsWith('.html') && !file.toLowerCase().endsWith('.bak'))
      .filter(isPublicFile)
  );
}

function discoverPublicFiles() {
  return sortUnique(walk(root).filter(isPublicFile));
}

function diffLists(previousFiles, currentFiles) {
  const previousSet = new Set(previousFiles);
  const currentSet = new Set(currentFiles);
  const newlyDiscovered = currentFiles.filter(file => !previousSet.has(file));
  const missingFromCurrent = previousFiles.filter(file => !currentSet.has(file));
  return {
    previousCount: previousFiles.length,
    currentCount: currentFiles.length,
    newlyDiscovered,
    removedOrMissing: missingFromCurrent,
    previouslyListedButNoLongerPresent: missingFromCurrent
  };
}

function isPublicFile(fileRel) {
  return !fileRel.split('/').some(part => publicSkipDirs.has(part));
}

function isNoindex(html) {
  const robots = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  return Boolean(robots && robots[1].toLowerCase().includes('noindex'));
}

function withoutFragment(value) {
  return decodeURIComponent(value.split('#', 1)[0].split('?', 1)[0]);
}

function candidates(fromRel, ref) {
  const clean = withoutFragment(ref);
  if (!clean || localSchemes.test(clean) || clean.startsWith('#')) return [];
  const out = [];
  if (clean.startsWith('/')) {
    const item = clean.slice(1);
    out.push(item, `${item}.html`, path.posix.join(item, 'index.html'));
  } else {
    const base = path.posix.dirname(fromRel);
    const item = path.posix.normalize(path.posix.join(base, clean));
    out.push(item, `${item}.html`, path.posix.join(item, 'index.html'));
  }
  return out.map(item => item.replace(/^\/+/, ''));
}

const previousActiveList = readActiveHtmlList(activeListPath);
const activeList = discoverActiveHtmlFiles();
const inventoryDrift = diffLists(previousActiveList, activeList);
const knownFiles = discoverPublicFiles();
const existing = new Set(knownFiles);
for (const file of knownFiles) {
  if (file.endsWith('/index.html')) existing.add(file.slice(0, -'index.html'.length));
  existing.add(`/${file}`);
}

writeActiveHtmlList(activeListPath, activeList);

const htmlFiles = activeList;
const findings = [];

for (const file of htmlFiles) {
  const full = path.join(root, file);
  const html = fs.readFileSync(full, 'utf8');
  const noindex = isNoindex(html);

  if (!noindex) {
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? '';
    if (title.length < 10) findings.push({ file, type: 'metadata', message: 'Missing or weak title.' });

    const description = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() ?? '';
    if (description.length < 140 || description.length > 160) {
      findings.push({ file, type: 'metadata', message: `Meta description length is ${description.length}; expected 140-160.` });
    }

    if (!/<link[^>]*rel=["']canonical["']/i.test(html)) {
      findings.push({ file, type: 'metadata', message: 'Missing canonical link.' });
    }
  }

  if (badText.test(html)) {
    findings.push({ file, type: 'content', message: 'Potential placeholder or unfinished wording found.' });
  }

  if (noindex) continue;

  const ids = new Map();
  for (const match of html.matchAll(idAttrs)) {
    ids.set(match[1], (ids.get(match[1]) ?? 0) + 1);
  }
  for (const [id, count] of ids.entries()) {
    if (count > 1) findings.push({ file, type: 'accessibility', message: `Duplicate id "${id}" appears ${count} times.` });
  }

  for (const match of html.matchAll(imgTags)) {
    const tag = match[0];
    if (!/\balt=["'][^"']+["']/i.test(tag)) {
      findings.push({ file, type: 'accessibility', message: 'Image is missing meaningful alt text.' });
    }
  }

  for (const match of html.matchAll(assetAttrs)) {
    const value = match[1].trim();
    if (!value || value.startsWith('#') || localSchemes.test(value)) continue;
    const possible = candidates(file, value);
    if (possible.length && !possible.some(item => existing.has(item) || existing.has(`/${item}`))) {
      findings.push({ file, type: 'reference', message: `Unresolved local reference: ${value}` });
    }
  }
}

const grouped = findings.reduce((acc, item) => {
  acc[item.type] = (acc[item.type] ?? 0) + 1;
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  scannedHtmlFiles: htmlFiles.length,
  inventoryDrift,
  findingsByType: grouped,
  findings
};

fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`Scanned ${htmlFiles.length} HTML files.`);
console.log(`Inventory drift: +${inventoryDrift.newlyDiscovered.length} new, -${inventoryDrift.removedOrMissing.length} removed/missing.`);
if (inventoryDrift.newlyDiscovered.length) {
  console.log(`Newly discovered: ${inventoryDrift.newlyDiscovered.slice(0, 10).join(', ')}${inventoryDrift.newlyDiscovered.length > 10 ? ' ...' : ''}`);
}
if (inventoryDrift.removedOrMissing.length) {
  console.log(`Previously listed but no longer present: ${inventoryDrift.removedOrMissing.slice(0, 10).join(', ')}${inventoryDrift.removedOrMissing.length > 10 ? ' ...' : ''}`);
}
console.log(`Findings: ${findings.length}`);
console.log(`Report: ${path.relative(root, outputPath).replace(/\\/g, '/')}`);

if (findings.length > 0) {
  for (const item of findings.slice(0, 25)) {
    console.log(`${item.type}: ${item.file} - ${item.message}`);
  }
  process.exitCode = 1;
}
