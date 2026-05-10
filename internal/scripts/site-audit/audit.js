#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { printConsoleReport, buildMarkdownReport, buildPrCommentSummary } = require('./reporters');

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'you', 'your', 'are', 'was', 'were', 'have', 'has', 'had',
  'not', 'but', 'use', 'used', 'using', 'into', 'over', 'under', 'about', 'page', 'site', 'portfolio', 'home', 'docs',
  'more', 'less', 'all', 'any', 'can', 'will', 'our', 'their', 'they', 'them', 'then', 'than', 'there', 'here', 'when',
  'what', 'why', 'how', 'who', 'where', 'which', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'zero', 'been', 'its', "it's", 'also', 'may', 'might', 'must', 'should', 'could', 'would', 'shall',
]);

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.bmp', '.tif', '.tiff']);
const TEXT_EXTS = new Set(['.html', '.htm', '.css', '.js', '.md', '.txt', '.xml', '.json', '.csv', '.yml', '.yaml', '.svg']);
const JS_EXTS = new Set(['.js', '.mjs', '.cjs']);
const CSS_EXTS = new Set(['.css']);
const HTML_EXTS = new Set(['.html', '.htm']);
const DEFAULT_REQUIRED_DIRS = ['assets', 'css', 'js', 'docs'];

function parseArgs(argv) {
  const options = {
    root: path.resolve(process.cwd(), 'public'),
    output: path.resolve(process.cwd(), 'internal', 'reports'),
    prComment: false,
    prCommentFile: null,
    fix: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--root' && argv[i + 1]) {
      options.root = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === '--output' && argv[i + 1]) {
      options.output = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === '--pr-comment') {
      options.prComment = true;
    } else if (arg === '--pr-comment-file' && argv[i + 1]) {
      options.prComment = true;
      options.prCommentFile = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === '--fix') {
      options.fix = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log('Usage: node audit.js [--root public] [--output internal/reports] [--pr-comment] [--pr-comment-file file] [--fix]');
}

function walkFiles(rootDir) {
  const files = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolutePath);
      } else {
        files.push(absolutePath);
      }
    }
  }

  return files;
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function lineFromIndex(text, index) {
  return text.slice(0, Math.max(0, index)).split('\n').length;
}

function stripTags(text) {
  return text.replace(/<[^>]*>/g, ' ');
}

function normalizeSlashes(value) {
  return value.split(path.sep).join('/');
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(value);
}

function isMailOrDataUrl(value) {
  return /^(mailto:|tel:|data:|sms:)/i.test(value);
}

function isJavascriptPlaceholder(value) {
  return /^javascript:/i.test(value) || value === '#' || value === '';
}

function extractAttr(attrs, name) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = attrs.match(pattern);
  if (!match) {
    return null;
  }
  return match[2] ?? match[3] ?? match[4] ?? null;
}

function extractAllAttrs(attrs) {
  const map = new Map();
  const attrPattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = attrPattern.exec(attrs)) !== null) {
    map.set(match[1].toLowerCase(), match[3] ?? match[4] ?? match[5] ?? '');
  }
  return map;
}

function parseHtmlMeta(html, filePath) {
  const info = {
    title: null,
    description: null,
    viewport: null,
    og: {},
    twitter: {},
    csp: null,
    anchors: new Set(),
    ids: new Set(),
    headings: [],
    images: [],
    interactive: [],
    links: [],
    scripts: [],
    stylesheets: [],
    metaRefreshTarget: null,
    jsRedirectTarget: null,
    inlineStyles: [],
    classNames: new Set(),
    visibleText: '',
  };

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    info.title = stripTags(titleMatch[1]).replace(/\s+/g, ' ').trim();
  }

  const metaRegex = /<meta\b([^>]*?)>/gi;
  let metaMatch;
  while ((metaMatch = metaRegex.exec(html)) !== null) {
    const attrs = metaMatch[1];
    const attrsMap = extractAllAttrs(attrs);
    const name = (attrsMap.get('name') || '').toLowerCase();
    const property = (attrsMap.get('property') || '').toLowerCase();
    const content = attrsMap.get('content') || '';
    const httpEquiv = (attrsMap.get('http-equiv') || '').toLowerCase();

    if (name === 'description') info.description = content;
    if (name === 'viewport') info.viewport = content;
    if (name.startsWith('twitter:')) info.twitter[name] = content;
    if (property.startsWith('og:')) info.og[property] = content;
    if (httpEquiv === 'content-security-policy') info.csp = content;
    if (httpEquiv === 'refresh') {
      const refreshMatch = content.match(/url\s*=\s*([^;]+)/i);
      if (refreshMatch) {
        info.metaRefreshTarget = refreshMatch[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }

  const headingRegex = /<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let headingMatch;
  while ((headingMatch = headingRegex.exec(html)) !== null) {
    info.headings.push({
      level: Number(headingMatch[1]),
      text: stripTags(headingMatch[3]).replace(/\s+/g, ' ').trim(),
      id: extractAttr(headingMatch[2], 'id'),
      line: lineFromIndex(html, headingMatch.index),
    });
  }

  const anchorRegex = /<a\b([^>]*?)>([\s\S]*?)<\/a>/gi;
  let anchorMatch;
  while ((anchorMatch = anchorRegex.exec(html)) !== null) {
    const attrs = anchorMatch[1];
    const attrsMap = extractAllAttrs(attrs);
    const href = attrsMap.get('href') || '';
    const text = stripTags(anchorMatch[2]).replace(/\s+/g, ' ').trim();
    if (href) {
      info.links.push({ tag: 'a', href, text, attrs, line: lineFromIndex(html, anchorMatch.index) });
    }
    if (text) {
      info.anchors.add(text.toLowerCase());
    }
  }

  const imageRegex = /<img\b([^>]*?)>/gi;
  let imageMatch;
  while ((imageMatch = imageRegex.exec(html)) !== null) {
    const attrs = imageMatch[1];
    const attrsMap = extractAllAttrs(attrs);
    info.images.push({
      src: attrsMap.get('src') || '',
      alt: attrsMap.get('alt'),
      attrs,
      line: lineFromIndex(html, imageMatch.index),
    });
  }

  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    const attrs = scriptMatch[1];
    const attrsMap = extractAllAttrs(attrs);
    const src = attrsMap.get('src') || '';
    info.scripts.push({
      src,
      attrs,
      inline: !src,
      defer: attrsMap.has('defer'),
      async: attrsMap.has('async'),
      type: attrsMap.get('type') || '',
      inHead: /<head[\s>]/i.test(html.slice(0, scriptMatch.index)),
      line: lineFromIndex(html, scriptMatch.index),
      content: scriptMatch[2] || '',
    });
  }

  const stylesheetRegex = /<link\b([^>]*?)>/gi;
  let stylesheetMatch;
  while ((stylesheetMatch = stylesheetRegex.exec(html)) !== null) {
    const attrs = stylesheetMatch[1];
    const attrsMap = extractAllAttrs(attrs);
    const rel = (attrsMap.get('rel') || '').toLowerCase();
    if (rel.includes('stylesheet')) {
      info.stylesheets.push({
        href: attrsMap.get('href') || '',
        attrs,
        line: lineFromIndex(html, stylesheetMatch.index),
      });
    }
  }

  const sourceLikeRegex = /<(source|audio|video|iframe|form|img|script)\b([^>]*?)>/gi;
  let sourceMatch;
  while ((sourceMatch = sourceLikeRegex.exec(html)) !== null) {
    const tag = sourceMatch[1].toLowerCase();
    const attrs = sourceMatch[2];
    const attrsMap = extractAllAttrs(attrs);
    const attributeNames = {
      source: ['src'],
      audio: ['src'],
      video: ['src', 'poster'],
      iframe: ['src'],
      form: ['action'],
      img: ['src'],
      script: ['src'],
    }[tag] || [];
    for (const name of attributeNames) {
      const value = attrsMap.get(name);
      if (value) {
        info.links.push({ tag, href: value, text: '', attrs, line: lineFromIndex(html, sourceMatch.index) });
      }
    }
  }

  const tabIndexRegex = /\btabindex\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let tabMatch;
  while ((tabMatch = tabIndexRegex.exec(html)) !== null) {
    const value = Number(tabMatch[2] ?? tabMatch[3] ?? tabMatch[4]);
    info.interactive.push({ kind: 'tabindex', value, line: lineFromIndex(html, tabMatch.index) });
  }

  const inlineStyleRegex = /style\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let styleMatch;
  while ((styleMatch = inlineStyleRegex.exec(html)) !== null) {
    info.inlineStyles.push({ value: styleMatch[2] ?? styleMatch[3] ?? '', line: lineFromIndex(html, styleMatch.index) });
  }

  const classRegex = /class\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let classMatch;
  while ((classMatch = classRegex.exec(html)) !== null) {
    const classes = (classMatch[2] ?? classMatch[3] ?? '').split(/\s+/).filter(Boolean);
    for (const className of classes) {
      info.classNames.add(className);
    }
  }

  info.visibleText = stripTags(html)
    .replace(/\s+/g, ' ')
    .trim();

  info.ids = new Set(Array.from(html.matchAll(/\bid\s*=\s*("([^"]+)"|'([^']+)')/gi), (m) => (m[2] ?? m[3] ?? '').trim()).filter(Boolean));
  for (const match of html.matchAll(/\bname\s*=\s*("([^"]+)"|'([^']+)')/gi)) {
    const name = (match[2] ?? match[3] ?? '').trim();
    if (name) {
      info.ids.add(name);
    }
  }

  const jsRedirectPatterns = [
    /(?:window\.)?location\.replace\(\s*['"]([^'"]+)['"]\s*\)/i,
    /(?:window\.)?location\.href\s*=\s*['"]([^'"]+)['"]/i,
    /location\.assign\(\s*['"]([^'"]+)['"]\s*\)/i,
  ];
  for (const pattern of jsRedirectPatterns) {
    const match = html.match(pattern);
    if (match) {
      info.jsRedirectTarget = match[1].trim();
      break;
    }
  }

  return info;
}

function stripQueryAndHash(value) {
  return value.split('#')[0].split('?')[0];
}

function isLikelyDirectoryLink(value) {
  return value.endsWith('/') || !path.extname(stripQueryAndHash(value));
}

function resolveInternalTarget(rawTarget, sourceFile, rootDir) {
  const cleaned = stripQueryAndHash(rawTarget.trim());
  const fragment = rawTarget.includes('#') ? rawTarget.split('#').slice(1).join('#') : '';

  if (!cleaned || isJavascriptPlaceholder(cleaned) || isMailOrDataUrl(cleaned)) {
    return null;
  }

  const relTarget = cleaned.startsWith('/') ? cleaned.replace(/^\/+/, '') : null;
  const attempts = [];

  if (relTarget !== null) {
    attempts.push(path.join(rootDir, relTarget));
  } else {
    attempts.push(path.resolve(path.dirname(sourceFile), cleaned));
  }

  const expandedAttempts = [];
  for (const candidate of attempts) {
    expandedAttempts.push(candidate);
    if (!path.extname(candidate)) {
      expandedAttempts.push(`${candidate}.html`);
      expandedAttempts.push(path.join(candidate, 'index.html'));
    }
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      expandedAttempts.push(path.join(candidate, 'index.html'));
    }
  }

  for (const candidate of expandedAttempts) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return { filePath: candidate, fragment };
    }
  }

  return null;
}

function extractCssData(cssText, filePath) {
  const noComments = cssText.replace(/\/\*[\s\S]*?\*\//g, ' ');
  const selectors = [];
  const classNames = new Set();
  const urls = [];
  const selectorCounts = new Map();
  const duplicateSelectors = [];
  const heavySelectors = [];
  const importantMatches = [];
  const contrastCandidates = [];

  const blockRegex = /([^{}@]+)\{([^}]*)\}/g;
  let blockMatch;
  while ((blockMatch = blockRegex.exec(noComments)) !== null) {
    const selectorGroup = blockMatch[1].trim();
    const body = blockMatch[2] || '';
    const selectorList = selectorGroup.split(',').map((selector) => selector.trim()).filter(Boolean);
    for (const selector of selectorList) {
      selectors.push(selector);
      classMatches(selector).forEach((className) => classNames.add(className));
      selectorCounts.set(selector, (selectorCounts.get(selector) || 0) + 1);
      if ((selectorCounts.get(selector) || 0) > 1) {
        duplicateSelectors.push({ selector, line: lineFromIndex(cssText, blockMatch.index) });
      }
      if (selector.split(/[ >+~]/).length > 4 || selector.includes(':not(') || selector.includes(':has(') || selector.includes(':nth-')) {
        heavySelectors.push({ selector, line: lineFromIndex(cssText, blockMatch.index) });
      }
    }

    const importantCount = (body.match(/!important/gi) || []).length;
    if (importantCount > 0) {
      importantMatches.push({ line: lineFromIndex(cssText, blockMatch.index), count: importantCount });
    }

    const colorMatch = body.match(/color\s*:\s*([^;]+);/i);
    const backgroundMatch = body.match(/background(?:-color)?\s*:\s*([^;]+);/i);
    if (colorMatch && backgroundMatch) {
      contrastCandidates.push({
        color: colorMatch[1].trim(),
        background: backgroundMatch[1].trim(),
        line: lineFromIndex(cssText, blockMatch.index),
      });
    }
  }

  for (const match of noComments.matchAll(/url\(([^)]+)\)/gi)) {
    const value = match[1].trim().replace(/^['"]|['"]$/g, '');
    if (value) {
      urls.push({ value, line: lineFromIndex(cssText, match.index) });
    }
  }

  return { selectors, classNames, urls, duplicateSelectors, heavySelectors, importantMatches, contrastCandidates };
}

function classMatches(selector) {
  return Array.from(selector.matchAll(/\.([a-zA-Z0-9_-]+)/g), (m) => m[1]);
}

function extractJsData(jsText, filePath) {
  const noComments = jsText.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:\\])\/\/.*$/gm, '$1');
  const issues = {
    consoleLogs: [],
    unsafeInnerHtml: [],
    documentWrite: [],
    fetchCalls: [],
    asyncFunctions: [],
    functionNames: [],
    variableNames: [],
    urlLiterals: [],
    classListNames: new Set(),
  };

  const consoleRegex = /\bconsole\.(log|debug|warn|info|error)\s*\(/g;
  let consoleMatch;
  while ((consoleMatch = consoleRegex.exec(noComments)) !== null) {
    issues.consoleLogs.push({ method: consoleMatch[1], line: lineFromIndex(jsText, consoleMatch.index) });
  }

  const innerHtmlRegex = /\binnerHTML\s*=/g;
  let innerMatch;
  while ((innerMatch = innerHtmlRegex.exec(noComments)) !== null) {
    issues.unsafeInnerHtml.push({ line: lineFromIndex(jsText, innerMatch.index) });
  }

  const documentWriteRegex = /\bdocument\.write\s*\(/g;
  let writeMatch;
  while ((writeMatch = documentWriteRegex.exec(noComments)) !== null) {
    issues.documentWrite.push({ line: lineFromIndex(jsText, writeMatch.index) });
  }

  const fetchRegex = /\bfetch\s*\(([^)]*)\)/g;
  let fetchMatch;
  while ((fetchMatch = fetchRegex.exec(noComments)) !== null) {
    issues.fetchCalls.push({ line: lineFromIndex(jsText, fetchMatch.index), expression: fetchMatch[0] });
  }

  const asyncFunctionRegex = /async\s+function\s+([a-zA-Z_$][\w$]*)?\s*\(|async\s*\([^)]*\)\s*=>|async\s+[a-zA-Z_$][\w$]*\s*=\s*\(/g;
  let asyncMatch;
  while ((asyncMatch = asyncFunctionRegex.exec(noComments)) !== null) {
    issues.asyncFunctions.push({ line: lineFromIndex(jsText, asyncMatch.index) });
  }

  for (const match of noComments.matchAll(/function\s+([a-zA-Z_$][\w$]*)\s*\(/g)) {
    issues.functionNames.push({ name: match[1], line: lineFromIndex(jsText, match.index) });
  }

  for (const match of noComments.matchAll(/\b(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=+/g)) {
    issues.variableNames.push({ name: match[1], line: lineFromIndex(jsText, match.index) });
  }

  for (const match of noComments.matchAll(/(?:location\.replace|window\.location\.replace|fetch|import)\(\s*['"]([^'"]+)['"]/g)) {
    issues.urlLiterals.push({ value: match[1], line: lineFromIndex(jsText, match.index) });
  }

  for (const match of noComments.matchAll(/classList\.(?:add|remove|toggle|contains)\(([^)]*)\)/g)) {
    const values = match[1].match(/['"]([^'"]+)['"]/g) || [];
    for (const value of values) {
      issues.classListNames.add(value.replace(/^['"]|['"]$/g, ''));
    }
  }

  return issues;
}

function createIssue(severity, category, file, line, message, suggestion, evidence, fixable = false) {
  return { severity, category, file, line, message, suggestion, evidence, fixable };
}

function makeCheckResult(name, issues) {
  const criticalCount = issues.filter((issue) => issue.severity === 'critical').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;
  const status = criticalCount > 0 ? 'fail' : warningCount > 0 ? 'warn' : 'pass';
  return {
    name,
    status,
    issueCount: issues.length,
    criticalCount,
    warningCount,
  };
}

function summarizeKeywordDensity(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  const counts = new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  const total = words.length || 1;
  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count, density: count / total }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function parseColor(value) {
  const normalized = value.trim().toLowerCase();
  const hexMatch = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex.split('').map((char) => char + char).join('');
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((part) => Number(part.trim())).slice(0, 3);
    if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
      return { r: parts[0], g: parts[1], b: parts[2] };
    }
  }

  return null;
}

function luminance(rgb) {
  const channels = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(colorA, colorB) {
  const a = parseColor(colorA);
  const b = parseColor(colorB);
  if (!a || !b) {
    return null;
  }
  const lumA = luminance(a);
  const lumB = luminance(b);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function fileExists(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function directoryExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

function gatherTextForSearch(records) {
  return records
    .filter((record) => TEXT_EXTS.has(record.ext))
    .map((record) => record.text)
    .join('\n');
}

function countWordOccurrences(haystack, word) {
  const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
  const matches = haystack.match(regex);
  return matches ? matches.length : 0;
}

function extractCandidateUrls(text) {
  const matches = [];
  const urlRegex = /(?:href|src|action|poster|url|fetch|location\.replace|window\.location\.replace)\s*[:=]?\s*(?:['"]|\()([^'"\)\s]+)(?:['"]|\))/gi;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

function resolveRedirectTarget(rawTarget, sourceFile, rootDir) {
  const resolved = resolveInternalTarget(rawTarget, sourceFile, rootDir);
  return resolved ? resolved.filePath : null;
}

function followRedirectChain(startFile, redirectMap) {
  const chain = [];
  const visited = new Set();
  let current = startFile;

  while (redirectMap.has(current)) {
    if (visited.has(current)) {
      chain.push(current);
      return { chain, loop: true };
    }
    visited.add(current);
    const next = redirectMap.get(current);
    chain.push(next);
    current = next;
    if (chain.length > 10) {
      return { chain, loop: true };
    }
  }

  return { chain, loop: false };
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function buildSitemapIssues(recordMap, rootDir) {
  const issues = [];
  const sitemapRecord = recordMap.get(path.join(rootDir, 'sitemap.xml'));
  if (!sitemapRecord) {
    issues.push(createIssue('critical', 'SEO', path.join(rootDir, 'sitemap.xml'), null, 'sitemap.xml is missing from the public root.', 'Add a sitemap.xml that lists only public pages.', 'Required by search engines.', true));
    return issues;
  }

  const sitemapUrls = Array.from(sitemapRecord.text.matchAll(/<loc>([^<]+)<\/loc>/gi), (match) => match[1].trim());
  for (const url of sitemapUrls) {
    if (/\/internal\//i.test(url) || /\/scripts\//i.test(url) || /\.ps1$/i.test(url) || /\.log$/i.test(url)) {
      issues.push(createIssue('critical', 'SEO', sitemapRecord.filePath, null, 'Sitemap contains non-public paths.', 'Remove any internal or generated-report URLs from sitemap.xml.', url));
    }
  }

  const hasSitemapLine = /sitemap:\s*https?:\/\//i.test(sitemapRecord.text);
  const robotsRecord = recordMap.get(path.join(rootDir, 'robots.txt'));
  if (!robotsRecord) {
    issues.push(createIssue('critical', 'Configuration', path.join(rootDir, 'robots.txt'), null, 'robots.txt is missing from the public root.', 'Add robots.txt with sitemap reference and crawler rules.', 'Required by search engines.', true));
  } else if (!hasSitemapLine) {
    issues.push(createIssue('warning', 'SEO', robotsRecord.filePath, null, 'robots.txt does not reference the sitemap.', 'Add a Sitemap line to robots.txt.', 'No Sitemap: directive found.'));
  }

  return issues;
}

function analyzeHtmlStructure(page, record, rootDir, redirectMap) {
  const issues = [];
  const filePath = record.filePath;
  const html = record.text;
  const relative = normalizeSlashes(path.relative(rootDir, filePath));

  if (!page.title) {
    issues.push(createIssue('critical', 'HTML', filePath, 1, 'Missing <title> tag.', 'Add a unique, descriptive title element to the document head.', relative));
  }
  if (!page.description) {
    issues.push(createIssue('warning', 'SEO', filePath, 1, 'Missing meta description.', 'Add <meta name="description"> with a concise summary of the page.', relative));
  }
  if (!page.viewport) {
    issues.push(createIssue('critical', 'HTML', filePath, 1, 'Missing viewport meta tag.', 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.', relative));
  }
  if (!page.og['og:title'] || !page.og['og:description'] || !page.og['og:type']) {
    issues.push(createIssue('warning', 'SEO', filePath, 1, 'OpenGraph metadata is incomplete.', 'Add og:title, og:description, and og:type tags.', relative));
  }
  if (!page.twitter['twitter:card']) {
    issues.push(createIssue('warning', 'SEO', filePath, 1, 'Twitter card metadata is missing.', 'Add <meta name="twitter:card"> for social previews.', relative));
  }

  const headingLevels = page.headings.map((heading) => heading.level);
  let previousLevel = 0;
  for (const heading of page.headings) {
    if (heading.level > previousLevel + 1 && previousLevel !== 0) {
      issues.push(createIssue('warning', 'Accessibility', filePath, heading.line, 'Heading levels skip a rank.', 'Keep heading hierarchy sequential to support assistive technologies.', `${previousLevel} -> ${heading.level}`));
      break;
    }
    previousLevel = heading.level;
  }

  for (const image of page.images) {
    if (!image.alt) {
      issues.push(createIssue('critical', 'Accessibility', filePath, image.line, 'Image is missing alt text.', 'Add meaningful alt text or use alt="" for decorative images.', image.src || '<img>'));
    }
  }

  for (const interactive of page.interactive) {
    if (interactive.kind === 'tabindex' && Number.isFinite(interactive.value) && interactive.value > 0) {
      issues.push(createIssue('warning', 'Accessibility', filePath, interactive.line, 'Positive tabindex value found.', 'Use tabindex="0" or remove positive tabindex values to preserve natural tab order.', `tabindex=${interactive.value}`));
    }
  }

  for (const link of page.links) {
    if (isJavascriptPlaceholder(link.href) || /coming soon/i.test(link.text) || /coming soon/i.test(link.href)) {
      issues.push(createIssue('warning', 'Links', filePath, link.line, 'Placeholder link detected.', 'Replace placeholder links with real destinations or remove them.', link.href));
    }
  }

  for (const script of page.scripts) {
    if (script.inHead && !script.defer && !script.async && script.type !== 'module' && script.src) {
      issues.push(createIssue('warning', 'Performance', filePath, script.line, 'Blocking script in the document head.', 'Add defer/async or move the script to the end of the body when safe.', script.src));
    }
  }

  const hasCsp = Boolean(page.csp);
  const hasExternalAssets = page.scripts.some((script) => script.src && isHttpUrl(script.src)) || page.stylesheets.some((sheet) => sheet.href && isHttpUrl(sheet.href));
  if (hasExternalAssets && !hasCsp) {
    issues.push(createIssue('warning', 'Security', filePath, 1, 'Missing Content Security Policy meta tag.', 'Add a CSP meta tag for static pages that rely on external assets.', relative));
  }

  const redirectTarget = page.metaRefreshTarget || page.jsRedirectTarget;
  if (redirectTarget) {
    const resolvedTarget = resolveInternalTarget(redirectTarget, filePath, rootDir);
    if (resolvedTarget) {
      redirectMap.set(filePath, resolvedTarget.filePath);
    }
  }

  return issues;
}

function analyzeCss(record, allClassNames, referenceMap, rootDir) {
  const issues = [];
  const cssData = extractCssData(record.text, record.filePath);
  const relative = normalizeSlashes(path.relative(rootDir, record.filePath));
  const selectorCounts = new Map();

  for (const selector of cssData.selectors) {
    selectorCounts.set(selector, (selectorCounts.get(selector) || 0) + 1);
  }

  for (const duplicate of cssData.duplicateSelectors) {
    issues.push(createIssue('warning', 'CSS', record.filePath, duplicate.line, 'Duplicate selector detected.', 'Consolidate duplicate selectors to keep styles maintainable.', duplicate.selector));
  }

  for (const heavy of cssData.heavySelectors) {
    issues.push(createIssue('warning', 'Performance', record.filePath, heavy.line, 'Complex selector may affect performance.', 'Simplify deep or overly specific selectors where possible.', heavy.selector));
  }

  const importantTotal = cssData.importantMatches.reduce((sum, item) => sum + item.count, 0);
  if (importantTotal > 8) {
    issues.push(createIssue('warning', 'CSS', record.filePath, 1, 'Heavy !important usage found.', 'Reduce !important usage to keep the cascade predictable.', `${importantTotal} occurrences`));
  }

  for (const className of cssData.classNames) {
    allClassNames.add(className);
  }

  for (const ref of cssData.urls) {
    if (!ref.value) continue;
    if (isHttpUrl(ref.value) || isMailOrDataUrl(ref.value)) continue;
    const resolved = resolveInternalTarget(ref.value, record.filePath, rootDir);
    if (!resolved) {
      issues.push(createIssue('critical', 'Links', record.filePath, ref.line, 'CSS references a missing asset.', 'Fix or remove the url(...) reference.', ref.value));
    } else {
      referenceMap.add(resolved.filePath);
    }
  }

  for (const contrast of cssData.contrastCandidates) {
    const ratio = contrastRatio(contrast.color, contrast.background);
    if (ratio !== null && ratio < 4.5) {
      issues.push(createIssue('warning', 'Accessibility', record.filePath, contrast.line, 'Low contrast color pair found.', 'Increase contrast to meet WCAG AA expectations.', `${contrast.color} on ${contrast.background}`));
    }
  }

  return issues;
}

function analyzeJs(record, globalSearchText, rootDir, usedClassNames) {
  const issues = [];
  const jsData = extractJsData(record.text, record.filePath);

  for (const item of jsData.consoleLogs) {
    issues.push(createIssue('warning', 'JavaScript', record.filePath, item.line, 'console.* call found in production code.', 'Remove console logging or gate it behind a debug flag.', item.method));
  }
  for (const item of jsData.unsafeInnerHtml) {
    issues.push(createIssue('critical', 'Security', record.filePath, item.line, 'innerHTML assignment detected.', 'Prefer textContent or trusted template rendering.', 'innerHTML = ...'));
  }
  for (const item of jsData.documentWrite) {
    issues.push(createIssue('critical', 'Security', record.filePath, item.line, 'document.write() detected.', 'Avoid document.write in production code.', 'document.write(...)'));
  }
  if (jsData.fetchCalls.length > 0 && !/\.catch\s*\(/.test(record.text)) {
    issues.push(createIssue('warning', 'JavaScript', record.filePath, jsData.fetchCalls[0].line, 'Fetch call may not handle promise failures.', 'Add .catch() or wrap the call in try/catch with await.', jsData.fetchCalls[0].expression));
  }
  if (jsData.asyncFunctions.length > 0 && /await\s+/.test(record.text) && !/try\s*\{[\s\S]*await[\s\S]*\}\s*catch/i.test(record.text)) {
    issues.push(createIssue('warning', 'JavaScript', record.filePath, jsData.asyncFunctions[0].line, 'Async code does not appear to have error handling.', 'Wrap await logic in try/catch or handle promise rejections explicitly.', 'async/await without visible catch'));
  }

  for (const fn of jsData.functionNames) {
    const occurrences = countWordOccurrences(globalSearchText, fn.name);
    if (occurrences <= 1 && fn.name.length > 2) {
      issues.push(createIssue('warning', 'JavaScript', record.filePath, fn.line, 'Function may be unused.', 'Remove the function or confirm it is called dynamically.', fn.name));
    }
  }
  for (const variable of jsData.variableNames) {
    const occurrences = countWordOccurrences(globalSearchText, variable.name);
    if (occurrences <= 1 && variable.name.length > 2) {
      issues.push(createIssue('warning', 'JavaScript', record.filePath, variable.line, 'Variable may be unused.', 'Remove the variable or confirm it is referenced dynamically.', variable.name));
    }
  }

  for (const className of jsData.classListNames) {
    usedClassNames.add(className);
  }

  return issues;
}

function analyzeSeo(record, page, rootDir) {
  const issues = [];
  const relative = normalizeSlashes(path.relative(rootDir, record.filePath));
  if (!page.title) {
    issues.push(createIssue('critical', 'SEO', record.filePath, 1, 'Missing title tag.', 'Add a unique title for this page.', relative));
  }
  if (!page.description) {
    issues.push(createIssue('warning', 'SEO', record.filePath, 1, 'Missing meta description.', 'Add a concise meta description.', relative));
  }
  if (!page.og['og:image']) {
    issues.push(createIssue('warning', 'SEO', record.filePath, 1, 'Missing OpenGraph image.', 'Add og:image for social previews.', relative));
  }
  return issues;
}

function analyzeAccessibility(record, page, rootDir) {
  const issues = [];
  for (const link of page.links) {
    const text = link.text.trim();
    const hasLabel = /aria-label\s*=\s*/i.test(link.attrs) || /title\s*=\s*/i.test(link.attrs);
    if ((text === '' || /^\W+$/.test(text)) && !hasLabel) {
      issues.push(createIssue('warning', 'Accessibility', record.filePath, link.line, 'Icon-only link may lack an accessible name.', 'Add aria-label or visible link text.', link.href));
    }
  }

  for (const script of page.scripts) {
    if (!script.inline && script.src && !script.defer && !script.async && script.inHead) {
      issues.push(createIssue('warning', 'Accessibility', record.filePath, script.line, 'Head script may delay interactive readiness.', 'Use defer so keyboard and screen reader users do not wait on blocking scripts.', script.src));
    }
  }

  return issues;
}

function analyzePerformance(record, page, rootDir) {
  const issues = [];
  const relative = normalizeSlashes(path.relative(rootDir, record.filePath));
  if (record.ext && IMAGE_EXTS.has(record.ext) && record.size > 500 * 1024) {
    issues.push(createIssue('warning', 'Performance', record.filePath, 1, 'Large image exceeds 500 KB.', 'Compress or convert the image to AVIF/WebP where possible.', `${relative} (${Math.round(record.size / 1024)} KB)`));
  }
  if (record.ext && ['.png', '.jpg', '.jpeg'].includes(record.ext) && record.size > 250 * 1024) {
    issues.push(createIssue('warning', 'Performance', record.filePath, 1, 'Raster image may be heavier than needed.', 'Consider AVIF/WebP or tighter compression.', `${relative} (${Math.round(record.size / 1024)} KB)`));
  }
  return issues;
}

function analyzeSecurity(record, page, rootDir) {
  const issues = [];
  const secrets = [
    { regex: /(?:api[_-]?key|secret|client[_-]?secret|token|password)\s*[:=]\s*['"][^'"\n]{8,}['"]/gi, message: 'Possible hardcoded secret found.' },
    { regex: /gh[pousr]_[A-Za-z0-9_]{20,}/g, message: 'Possible GitHub token found.' },
    { regex: /AKIA[0-9A-Z]{16}/g, message: 'Possible AWS access key found.' },
    { regex: /-----BEGIN [A-Z ]+PRIVATE KEY-----/g, message: 'Private key material found.' },
  ];

  for (const secret of secrets) {
    const match = secret.regex.exec(record.text);
    if (match) {
      issues.push(createIssue('critical', 'Security', record.filePath, lineFromIndex(record.text, match.index), secret.message, 'Remove secrets from the repository and rotate any exposed credentials.', match[0].slice(0, 40)));
    }
    secret.regex.lastIndex = 0;
  }

  if (/\binnerHTML\s*=/.test(record.text)) {
    issues.push(createIssue('critical', 'Security', record.filePath, lineFromIndex(record.text, record.text.search(/\binnerHTML\s*=/)), 'Unsafe innerHTML usage found.', 'Use textContent or a trusted DOM templating approach.', 'innerHTML = ...'));
  }

  if (page.csp === null && HTML_EXTS.has(record.ext)) {
    issues.push(createIssue('warning', 'Security', record.filePath, 1, 'No Content Security Policy meta tag detected.', 'Add a CSP meta tag where practical for static pages.', normalizeSlashes(path.relative(rootDir, record.filePath))));
  }

  return issues;
}

function analyzeLinks(records, pages, redirectMap, rootDir) {
  const issues = [];
  const referencedFiles = new Set();
  const externalUrls = new Set();
  const linkJobs = [];

  for (const page of pages) {
    for (const link of page.links) {
      const raw = (link.href || '').trim();
      if (!raw) {
        continue;
      }
      if (raw.startsWith('#')) {
        const fragment = raw.slice(1);
        if (fragment && !page.ids.has(fragment)) {
          issues.push(createIssue('warning', 'Links', page.filePath, link.line, 'Same-page anchor target is missing.', 'Add the matching id attribute or update the fragment.', raw));
        }
        continue;
      }
      if (isJavascriptPlaceholder(raw) || /coming soon/i.test(raw) || /#$/i.test(raw) || raw === '#') {
        issues.push(createIssue('warning', 'Links', page.filePath, link.line, 'Placeholder link detected.', 'Replace placeholder links with real destinations or remove them.', raw));
        continue;
      }
      if (isMailOrDataUrl(raw)) {
        continue;
      }
      if (isHttpUrl(raw)) {
        externalUrls.add(raw);
        continue;
      }

      const resolved = resolveInternalTarget(raw, page.filePath, rootDir);
      if (!resolved) {
        issues.push(createIssue('critical', 'Links', page.filePath, link.line, 'Broken internal link.', 'Fix the target path or restore the missing file.', raw));
        continue;
      }

      referencedFiles.add(resolved.filePath);
      const targetText = pages.find((candidate) => candidate.filePath === resolved.filePath);
      if (resolved.fragment && targetText && targetText.ids && !targetText.ids.has(resolved.fragment)) {
        issues.push(createIssue('warning', 'Links', page.filePath, link.line, 'Missing anchor target.', 'Add the missing id/name anchor or update the link fragment.', `${raw} -> #${resolved.fragment}`));
      }

      const redirect = followRedirectChain(resolved.filePath, redirectMap);
      if (redirect.loop) {
        issues.push(createIssue('critical', 'Links', page.filePath, link.line, 'Redirect loop detected.', 'Remove the cyclic redirect or link directly to the final page.', raw));
      } else if (redirect.chain.length > 0) {
        issues.push(createIssue('warning', 'Links', page.filePath, link.line, 'Redirect chain detected.', 'Link directly to the final destination to avoid extra hops.', `${raw} -> ${normalizeSlashes(path.relative(rootDir, redirect.chain[redirect.chain.length - 1]))}`));
      }
    }
  }

  for (const page of pages) {
    if (page.metaRefreshTarget) {
      const resolved = resolveInternalTarget(page.metaRefreshTarget, page.filePath, rootDir);
      if (resolved) {
        referencedFiles.add(resolved.filePath);
      }
    }
    if (page.jsRedirectTarget) {
      const resolved = resolveInternalTarget(page.jsRedirectTarget, page.filePath, rootDir);
      if (resolved) {
        referencedFiles.add(resolved.filePath);
      }
    }
  }

  return { issues, referencedFiles, externalUrls, linkJobs };
}

async function checkExternalUrl(targetUrl) {
  async function request(method, currentUrl, depth = 0) {
    if (depth > 5) {
      return { ok: false, statusCode: 599, finalUrl: currentUrl, redirectCount: depth, error: 'Redirect loop or excessive redirects.' };
    }

    return new Promise((resolve) => {
      const urlObject = new URL(currentUrl);
      const client = urlObject.protocol === 'https:' ? https : http;
      const req = client.request(
        {
          method,
          hostname: urlObject.hostname,
          port: urlObject.port || (urlObject.protocol === 'https:' ? 443 : 80),
          path: `${urlObject.pathname}${urlObject.search}`,
          headers: {
            'User-Agent': 'Portfolio-Audit/1.0',
            Accept: 'text/html,application/xhtml+xml',
          },
          timeout: 5000,
        },
        (res) => {
          const statusCode = res.statusCode || 0;
          const location = res.headers.location;
          if ([301, 302, 303, 307, 308].includes(statusCode) && location) {
            const nextUrl = new URL(location, currentUrl).toString();
            res.resume();
            request(method, nextUrl, depth + 1).then((result) => {
              resolve({ ...result, redirectCount: result.redirectCount + 1 });
            });
            return;
          }
          res.resume();
          resolve({ ok: statusCode < 400, statusCode, finalUrl: currentUrl, redirectCount: depth });
        }
      );

      req.on('timeout', () => {
        req.destroy(new Error('Request timed out.'));
      });
      req.on('error', (error) => {
        resolve({ ok: false, statusCode: 0, finalUrl: currentUrl, redirectCount: depth, error: error.message });
      });
      req.end();
    });
  }

  const headResult = await request('HEAD', targetUrl);
  if (headResult.ok || [404, 410].includes(headResult.statusCode)) {
    return headResult;
  }
  if ([405, 501, 0].includes(headResult.statusCode)) {
    return request('GET', targetUrl);
  }
  return headResult;
}

async function runConcurrent(items, limit, handler) {
  const queue = items.slice();
  const results = [];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item === undefined) {
        break;
      }
      results.push(await handler(item));
    }
  }

  const workers = Array.from({ length: Math.min(limit, queue.length || 1) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function auditSite(options) {
  const start = Date.now();
  const rootDir = options.root;
  const outputDir = options.output;

  if (!directoryExists(rootDir)) {
    throw new Error(`Root directory not found: ${rootDir}`);
  }

  ensureDirectory(outputDir);

  const allPaths = walkFiles(rootDir);
  const records = [];
  const recordMap = new Map();
  const pages = [];
  const cssRecords = [];
  const jsRecords = [];
  const htmlRecords = [];
  const allClassNames = new Set();
  const usedClassNames = new Set();
  const referencedFiles = new Set();
  const redirectMap = new Map();
  const externalUrls = new Set();

  for (const filePath of allPaths) {
    const ext = path.extname(filePath).toLowerCase();
    const size = fs.statSync(filePath).size;
    const record = { filePath, ext, size, text: '' };
    if (TEXT_EXTS.has(ext) && size < 15 * 1024 * 1024) {
      try {
        record.text = readText(filePath);
      } catch {
        record.text = '';
      }
    }
    records.push(record);
    recordMap.set(filePath, record);
    if (HTML_EXTS.has(ext)) htmlRecords.push(record);
    if (CSS_EXTS.has(ext)) cssRecords.push(record);
    if (JS_EXTS.has(ext)) jsRecords.push(record);
  }

  const globalSearchText = gatherTextForSearch(records);
  const checkResults = [];
  const issues = [];

  const structureIssues = [];
  for (const requiredDir of DEFAULT_REQUIRED_DIRS) {
    if (!directoryExists(path.join(rootDir, requiredDir))) {
      structureIssues.push(createIssue('critical', 'Structure', rootDir, 1, `Required folder is missing: ${requiredDir}`, 'Create the missing folder or update the deployment structure.', requiredDir));
    }
  }

  if (!fileExists(path.join(rootDir, '.nojekyll'))) {
    structureIssues.push(createIssue('warning', 'Configuration', path.join(rootDir, '.nojekyll'), 1, '.nojekyll is missing from the public root.', 'Add .nojekyll so GitHub Pages does not apply Jekyll processing.', '.nojekyll'));
  }
  if (!fileExists(path.join(rootDir, 'CNAME'))) {
    structureIssues.push(createIssue('warning', 'Configuration', path.join(rootDir, 'CNAME'), 1, 'CNAME file is missing from the public root.', 'Add CNAME if the repository uses a custom domain.', 'CNAME'));
  }
  checkResults.push(makeCheckResult('Structure', structureIssues));
  issues.push(...structureIssues);

  const linkContextByFile = new Map();
  for (const record of htmlRecords) {
    const page = parseHtmlMeta(record.text, record.filePath);
    pages.push({ ...page, filePath: record.filePath, text: record.text });
    linkContextByFile.set(record.filePath, page);
  }

  const pageIssues = [];
  for (const page of pages) {
    const record = recordMap.get(page.filePath);
    for (const className of page.classNames) {
      usedClassNames.add(className);
    }
    const pageAnalysisIssues = analyzeHtmlStructure(page, record, rootDir, redirectMap);
    pageIssues.push(...pageAnalysisIssues);
  }
  checkResults.push(makeCheckResult('HTML', pageIssues));
  issues.push(...pageIssues);

  const seoIssues = [];
  for (const page of pages) {
    const record = recordMap.get(page.filePath);
    seoIssues.push(...analyzeSeo(record, page, rootDir));
  }
  seoIssues.push(...buildSitemapIssues(recordMap, rootDir));
  checkResults.push(makeCheckResult('SEO', seoIssues));
  issues.push(...seoIssues);

  const cssIssues = [];
  for (const record of cssRecords) {
    cssIssues.push(...analyzeCss(record, allClassNames, referencedFiles, rootDir));
  }
  checkResults.push(makeCheckResult('CSS', cssIssues));
  issues.push(...cssIssues);

  const jsIssues = [];
  for (const record of jsRecords) {
    jsIssues.push(...analyzeJs(record, globalSearchText, rootDir, usedClassNames));
  }
  checkResults.push(makeCheckResult('JavaScript', jsIssues));
  issues.push(...jsIssues);

  const unusedCssIssues = [];
  for (const className of allClassNames) {
    if (!usedClassNames.has(className)) {
      unusedCssIssues.push(createIssue('warning', 'CSS', rootDir, 1, 'CSS class appears to be unused.', 'Remove the class or confirm it is applied dynamically.', className));
    }
  }
  if (unusedCssIssues.length > 0) {
    checkResults.push(makeCheckResult('Unused CSS', unusedCssIssues));
    issues.push(...unusedCssIssues);
  }

  const accessibilityIssues = [];
  for (const page of pages) {
    const record = recordMap.get(page.filePath);
    accessibilityIssues.push(...analyzeAccessibility(record, page, rootDir));
  }
  checkResults.push(makeCheckResult('Accessibility', accessibilityIssues));
  issues.push(...accessibilityIssues);

  const performanceIssues = [];
  for (const record of records) {
    if (IMAGE_EXTS.has(record.ext)) {
      const sizeKb = Math.round(record.size / 1024);
      if (record.size > 500 * 1024) {
        performanceIssues.push(createIssue('warning', 'Performance', record.filePath, 1, 'Large image exceeds the 500 KB threshold.', 'Compress or convert the image to AVIF/WebP.', `${sizeKb} KB`));
      }
      if (['.png', '.jpg', '.jpeg'].includes(record.ext) && record.size > 250 * 1024) {
        performanceIssues.push(createIssue('warning', 'Performance', record.filePath, 1, 'Raster image is relatively large.', 'Use AVIF/WebP or smaller raster assets where possible.', `${sizeKb} KB`));
      }
    }
  }
  for (const page of pages) {
    for (const script of page.scripts) {
      if (script.inHead && script.src && !script.defer && !script.async && script.type !== 'module') {
        performanceIssues.push(createIssue('warning', 'Performance', page.filePath, script.line, 'Render-blocking script in head.', 'Use defer or move the script to the body when safe.', script.src));
      }
    }
    for (const sheet of page.stylesheets) {
      if (sheet.href) {
        performanceIssues.push(createIssue('warning', 'Performance', page.filePath, sheet.line, 'Stylesheet is render-blocking by design.', 'Keep only the minimum stylesheets needed for first paint or inline critical CSS.', sheet.href));
      }
    }
  }
  checkResults.push(makeCheckResult('Performance', performanceIssues));
  issues.push(...performanceIssues);

  const securityIssues = [];
  for (const record of records) {
    if (!record.text) continue;
    securityIssues.push(...analyzeSecurity(record, linkContextByFile.get(record.filePath) || { csp: null }, rootDir));
  }
  checkResults.push(makeCheckResult('Security', securityIssues));
  issues.push(...securityIssues);

  const linkIssues = [];
  const linkAudit = analyzeLinks(records, pages, redirectMap, rootDir);
  linkIssues.push(...linkAudit.issues);
  referencedFiles.add(path.join(rootDir, '.nojekyll'));
  referencedFiles.add(path.join(rootDir, 'CNAME'));
  referencedFiles.add(path.join(rootDir, 'robots.txt'));
  referencedFiles.add(path.join(rootDir, 'sitemap.xml'));
  for (const item of linkAudit.externalUrls) {
    externalUrls.add(item);
  }
  checkResults.unshift(makeCheckResult('Links', linkIssues));
  issues.unshift(...linkIssues);

  const externalResults = await runConcurrent(Array.from(externalUrls), 4, checkExternalUrl);
  for (const result of externalResults) {
    if (!result.ok) {
      issues.push(createIssue('critical', 'Links', null, null, `External link failed (${result.statusCode || 'ERR'}).`, 'Fix, remove, or replace the broken external URL.', result.finalUrl));
    } else if (result.redirectCount > 0) {
      issues.push(createIssue('warning', 'Links', null, null, 'External link follows redirects.', 'Link directly to the final destination when practical.', result.finalUrl));
    }
  }
  if (externalResults.length > 0) {
    const externalCriticalCount = externalResults.filter((item) => !item.ok).length;
    const externalWarningCount = externalResults.filter((item) => item.ok && item.redirectCount > 0).length;
    checkResults[0].issueCount += externalCriticalCount + externalWarningCount;
    checkResults[0].criticalCount += externalCriticalCount;
    checkResults[0].warningCount += externalWarningCount;
    checkResults[0].status = checkResults[0].criticalCount > 0 ? 'fail' : checkResults[0].warningCount > 0 ? 'warn' : 'pass';
  }

  const referencedSet = new Set(Array.from(referencedFiles).map((filePath) => path.resolve(filePath)));
  const alwaysKeep = new Set([
    path.resolve(rootDir, '.nojekyll'),
    path.resolve(rootDir, 'CNAME'),
    path.resolve(rootDir, 'robots.txt'),
    path.resolve(rootDir, 'sitemap.xml'),
  ]);
  const orphanIssues = [];
  for (const record of records) {
    const absolute = path.resolve(record.filePath);
    if (alwaysKeep.has(absolute)) {
      continue;
    }
    if (HTML_EXTS.has(record.ext) || CSS_EXTS.has(record.ext) || JS_EXTS.has(record.ext)) {
      continue;
    }
    if (!referencedSet.has(absolute)) {
      orphanIssues.push(createIssue('warning', 'Structure', record.filePath, 1, 'File does not appear to be referenced from the public site.', 'Remove the file or link to it intentionally.', normalizeSlashes(path.relative(rootDir, record.filePath))));
    }
  }
  checkResults.push(makeCheckResult('Orphans', orphanIssues));
  issues.push(...orphanIssues);

  const keywordDensity = summarizeKeywordDensity(pages.length > 0 ? pages[0].text : '');
  const keywordIssue = keywordDensity.find((item) => item.density > 0.08);
  if (keywordIssue) {
    issues.push(createIssue('warning', 'SEO', pages[0]?.filePath || rootDir, 1, 'Possible keyword repetition on the landing page.', 'Review repeated wording so the page reads naturally.', `${keywordIssue.word} (${Math.round(keywordIssue.density * 100)}%)`));
  }

  const durationMs = Date.now() - start;
  const criticalIssues = issues.filter((issue) => issue.severity === 'critical').length;
  const warningIssues = issues.filter((issue) => issue.severity === 'warning').length;
  const passedChecks = checkResults.filter((check) => check.status === 'pass').length;

  const result = {
    generatedAt: new Date().toISOString(),
    rootDir,
    outputDir,
    durationMs,
    scanned: {
      totalFiles: records.length,
      htmlFiles: htmlRecords.length,
      cssFiles: cssRecords.length,
      jsFiles: jsRecords.length,
      externalLinks: externalUrls.size,
    },
    summary: {
      totalIssues: criticalIssues + warningIssues,
      criticalIssues,
      warningIssues,
      passedChecks,
    },
    checkResults,
    issues: issues.sort((a, b) => {
      const severityRank = { critical: 0, warning: 1 };
      if ((severityRank[a.severity] || 9) !== (severityRank[b.severity] || 9)) {
        return (severityRank[a.severity] || 9) - (severityRank[b.severity] || 9);
      }
      return String(a.category).localeCompare(String(b.category));
    }),
  };

  const markdown = buildMarkdownReport(result);
  const jsonPath = path.join(outputDir, 'audit-report.json');
  const mdPath = path.join(outputDir, 'audit-report.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdPath, `${markdown}\n`, 'utf8');

  if (options.prComment) {
    const prSummary = buildPrCommentSummary(result);
    if (options.prCommentFile) {
      fs.writeFileSync(options.prCommentFile, `${prSummary}\n`, 'utf8');
    } else {
      console.log('\n' + prSummary + '\n');
    }
  }

  printConsoleReport(result);

  return result;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  try {
    const result = await auditSite(options);
    if (result.summary.criticalIssues > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Audit failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  auditSite,
};
