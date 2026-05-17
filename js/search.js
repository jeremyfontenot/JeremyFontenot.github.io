/*
  Client-side documentation indexer and search. Fetches paths from /docs/manifest.json
  Builds a lightweight in-memory index and provides instant search with filtering and highlighting.
  Security: all dynamic rendering uses textContent or DOM methods; no innerHTML with untrusted data.
*/
const DOC_MANIFEST = '/docs/manifest.json';
let docsIndex = [];
const formatDisplayTitle = window.TitleFormat?.formatDisplayTitle || ((baseTitle, context)=>context?`${baseTitle} — ${context}`:baseTitle);

function normalizeDocPath(path){
  try{ return encodeURI(path); }catch(e){ return path }
}

async function loadManifest(){
  const res = await fetch(DOC_MANIFEST);
  if(!res.ok) throw new Error('Manifest load failed');
  return res.json();
}

function textFromDoc(docText, path){
  if(path.endsWith('.html')){
    const parser = new DOMParser();
    const doc = parser.parseFromString(docText, 'text/html');
    const title = (doc.querySelector('title')||{textContent:''}).textContent || (doc.querySelector('h1')||{textContent:''}).textContent;
    const body = doc.body ? doc.body.innerText : docText;
    return {title, body};
  }
  try{ const j = JSON.parse(docText); return {title: j.title || j.name || path, body: JSON.stringify(j)} }catch(e){ return {title:path, body:docText} }
}

async function fetchDoc(path){
  try{
    const r = await fetch(normalizeDocPath(path));
    if(!r.ok) throw new Error('fetch failed');
    const text = await r.text();
    return textFromDoc(text, path);
  }catch(e){ return {title:path, body:'(unavailable)'} }
}

function normalizeSearchText(text){
  return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function tokenizeSearchQuery(query){
  return normalizeSearchText(query).split(' ').filter(Boolean);
}

function fieldScore(text, query, weight){
  const normalizedText = normalizeSearchText(text);
  if(!normalizedText || !query){
    return {score: 0, exact: false, prefix: false};
  }

  const tokens = tokenizeSearchQuery(query);
  let score = 0;
  let exact = false;
  let prefix = false;

  if(normalizedText.includes(query)){
    score += weight;
    exact = true;
  }
  if(normalizedText.startsWith(query)){
    score += weight * 0.5;
    prefix = true;
  }

  if(tokens.length){
    const matchedTokens = tokens.filter(token => normalizedText.includes(token)).length;
    if(matchedTokens && !exact){
      score += weight * (matchedTokens / tokens.length) * 0.35;
    }
  }

  return {score, exact, prefix};
}

function scoreMatch(item, q){
  if(!q) return 1;
  const query = normalizeSearchText(q);
  let score = 0;
  let exactMatch = false;
  let prefixMatch = false;

  const fields = [
    ['title', item.title, 5],
    ['displayTitle', item.displayTitle, 4],
    ['context', item.context, 3],
    ['tags', Array.isArray(item.tags) ? item.tags.join(' ') : '', 3],
    ['categories', Array.isArray(item.categories) ? item.categories.join(' ') : '', 2],
    ['path', item.path, 2],
    ['body', item.body, 1],
  ];

  fields.forEach(([, value, weight]) => {
    const field = fieldScore(value, query, weight);
    score += field.score;
    exactMatch = exactMatch || field.exact;
    prefixMatch = prefixMatch || field.prefix;
  });

  if(exactMatch){
    score *= 1.5;
  } else if(prefixMatch){
    score *= 1.2;
  }

  return score;
}

function highlight(text, q){
  if(!q) return text;
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re = new RegExp('('+esc+')','ig');
  return text.replace(re, '<mark>$1</mark>');
}

async function buildIndex(){
  const manifest = await loadManifest();
  const items = [];
  await Promise.all(manifest.map(async entry=>{
    const data = await fetchDoc(entry.path);
    const item = {
      path: entry.path,
      id: entry.id,
      title: entry.title || data.title || entry.path,
      displayTitle: entry.displayTitle || entry.title || data.title || entry.path,
      context: entry.context || '',
      tags: entry.tags||[],
      categories: entry.categories||[],
      body: data.body
    };
    items.push(item);
  }));
  docsIndex = items;
}

function renderResults(list, q){
  const out = document.querySelector('#results');
  out.innerHTML = '';
  if(!list.length){ out.textContent = 'No results'; return }
  list.forEach(it=>{
    const el = document.createElement('article'); el.className='result';
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.flexWrap = 'wrap';
    header.style.alignItems = 'center';
    header.style.gap = '0.5rem';

    const link = document.createElement('a'); link.href = it.path; link.textContent = it.title || it.path; link.setAttribute('aria-label','Open document');
    link.href = normalizeDocPath(it.path);
    link.addEventListener('click', ev => {
      ev.preventDefault(); openDocModal(it.path, it.displayTitle || it.title);
    });
    header.appendChild(link);
    if(it.context){
      const badge = document.createElement('span');
      badge.className = 'tag';
      badge.textContent = it.context;
      header.appendChild(badge);
    }

    const br = document.createElement('div');
    br.className='breadcrumb';
    br.textContent = it.displayTitle && it.displayTitle !== it.title ? it.displayTitle : formatDisplayTitle(it.title, it.context) || it.path.replace(/^docs\//,'');
    const snippet = document.createElement('p'); snippet.innerHTML = highlight(escapeHtml(shorten(it.body,300)), q);
    const tagdiv = document.createElement('div'); tagdiv.className='tags';
    (it.tags||[]).slice(0,6).forEach(t=>{ const s = document.createElement('span'); s.className='tag'; s.textContent = t; tagdiv.appendChild(s)});
    el.appendChild(header); el.appendChild(br); el.appendChild(snippet); el.appendChild(tagdiv);
    out.appendChild(el);
  })
}

function openDocModal(path, title){
  const modal = document.getElementById('doc-modal');
  const panel = document.getElementById('modal-panel');
  panel.innerHTML = '';
  const h = document.createElement('h2'); h.textContent = title; panel.appendChild(h);
  const bc = document.createElement('div'); bc.className='breadcrumb';
  const parts = path.replace(/^\//,'').split('/');
  let accum = '';
  parts.forEach((p,i)=>{
    accum += '/' + p;
    const span = document.createElement('span'); span.textContent = (i? ' / ' : '') + p;
    bc.appendChild(span);
  });
  panel.appendChild(bc);
  const iframe = document.createElement('iframe');
  iframe.src = normalizeDocPath(path);
  iframe.style.width = '100%'; iframe.style.height = '70vh'; iframe.setAttribute('sandbox','allow-same-origin allow-scripts');
  iframe.title = title;
  panel.appendChild(iframe);
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
  modal.addEventListener('click', e=>{ if(e.target===modal){ closeModal(); } });
  document.addEventListener('keydown', escClose);
}

function closeModal(){ const modal=document.getElementById('doc-modal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.removeEventListener('keydown', escClose); }
function escClose(e){ if(e.key==='Escape') closeModal(); }

function shorten(text, n=240){ if(!text) return ''; return text.length>n? text.slice(0,n-1)+'…': text }

function escapeHtml(str){ const d=document.createElement('div'); d.textContent = str; return d.innerHTML }

function performQuery(){
  const q = document.querySelector('#doc-search').value.trim();
  const category = document.querySelector('#filter-category').value;
  const tag = document.querySelector('#filter-tag').value;
  let results = docsIndex.map(i=>({item:i,score:scoreMatch(i,q)})).filter(x=>x.score>0 || !q).map(x=>({...x.item, score:x.score}));
  if(category && category!=='all') results = results.filter(r=> (r.categories||[]).includes(category));
  if(tag) results = results.filter(r=> (r.tags||[]).includes(tag));
  results.sort((a,b)=> (b.score||0)-(a.score||0) || String(a.title || '').localeCompare(String(b.title || '')) || String(a.path || '').localeCompare(String(b.path || '')));
  renderResults(results, q);
}

function populateFilters(){
  const cats = new Set(); const tags = new Set();
  docsIndex.forEach(i=>{ (i.categories||[]).forEach(c=>cats.add(c)); (i.tags||[]).forEach(t=>tags.add(t)) });
  const csel = document.querySelector('#filter-category'); csel.innerHTML=''; csel.appendChild(option('all','All'));
  cats.forEach(c=>csel.appendChild(option(c,c)));
  const tsel = document.querySelector('#filter-tag'); tsel.innerHTML=''; tsel.appendChild(option('','Any Tag'));
  tags.forEach(t=>tsel.appendChild(option(t,t)));
}

function option(val, text){ const o=document.createElement('option'); o.value=val; o.textContent=text; return o }

document.addEventListener('DOMContentLoaded', async ()=>{
  const searchInput = document.querySelector('#doc-search');
  if(!searchInput) return;
  const STANDARD_CATEGORIES = ['All','Skills','Projects','Labs','Notes','Certifications','Reports','Reference'];
  try{
    await buildIndex();
    populateFilters();
    const cat = document.querySelector('#filter-category');
    if(cat){
      const existing = Array.from(cat.options).map(o=>o.value.toLowerCase());
      STANDARD_CATEGORIES.forEach(c=>{ if(!existing.includes(c.toLowerCase())) cat.appendChild(option(c.toLowerCase(), c)) });
    }
    performQuery();
  }catch(e){ console.error(e); document.querySelector('#results').textContent='Failed loading docs index'; }
  document.querySelector('#doc-search').addEventListener('input', debounce(performQuery,180));
  document.querySelector('#filter-category').addEventListener('change', performQuery);
  document.querySelector('#filter-tag').addEventListener('change', performQuery);
});

function debounce(fn,wait){ let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), wait) } }
