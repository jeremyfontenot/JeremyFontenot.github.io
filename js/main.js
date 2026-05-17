// Main interactive enhancements (keyboard shortcuts, accessibility helpers)
document.addEventListener('DOMContentLoaded',()=>{
  // Quick focus to search on '/docs' pages with '#q' present
  const q = document.querySelector('#doc-search');
  if(q){document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.metaKey){e.preventDefault();q.focus();}})}
});

async function injectPrimaryNav(){
  const navContainers = Array.from(document.querySelectorAll('[data-primary-nav]'));
  if(!navContainers.length){
    return;
  }

  try{
    const response = await fetch('/components/primary-nav.html', { cache: 'no-cache' });
    if(!response.ok){
      throw new Error(response.status + ' ' + response.statusText);
    }
    const navMarkup = await response.text();

    navContainers.forEach((container)=>{
      container.innerHTML = navMarkup;
    });

    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    navContainers.forEach((container)=>{
      container.querySelectorAll('a[href]').forEach((link)=>{
        const href = link.getAttribute('href');
        if(!href){
          return;
        }
        const linkPath = href.replace(/\/$/, '') || '/';
        if(linkPath === currentPath){
          link.setAttribute('aria-current', 'page');
        }else{
          link.removeAttribute('aria-current');
        }
      });
    });
  }catch(error){
    console.warn('injectPrimaryNav', error);
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  injectPrimaryNav();
});

function normalizeDocPath(path){ try{ return encodeURI(path); }catch(e){ return path } }

// Simple helper: safe text snippet
function snippet(text, len=240){ if(!text) return ''; return text.length>len? text.slice(0,len-1)+'…':text }
// Load a fragment (selector) from a remote doc and insert into container
async function loadDocSnippet(containerSelector, docPath, fragmentSelector){
  try{
    const res = await fetch(normalizeDocPath(docPath), {cache: 'no-cache'});
    if(!res.ok) throw new Error(res.status+' '+res.statusText);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html,'text/html');
    const fragment = fragmentSelector? doc.querySelector(fragmentSelector) : doc.body;
    const container = document.querySelector(containerSelector);
    if(container && fragment){ container.innerHTML = fragment.innerHTML; }
  }catch(err){ console.warn('loadDocSnippet',docPath,err); }
}

// Auto-load any element annotated with data-docpath
async function loadDocSnippetElement(el, docPath, fragmentSelector){
  try{
    const res = await fetch(normalizeDocPath(docPath), {cache: 'no-cache'});
    if(!res.ok) throw new Error(res.status+' '+res.statusText);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html,'text/html');
    const fragment = fragmentSelector? doc.querySelector(fragmentSelector) : doc.body;
    if(el && fragment){ el.innerHTML = fragment.innerHTML; }
  }catch(err){ console.warn('loadDocSnippetElement',docPath,err); }
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-docpath]').forEach(el=>{
    const path = el.getAttribute('data-docpath');
    const frag = el.getAttribute('data-fragment');
    if(!path) return;
    const p = normalizeDocPath(path);
    if(el.id){ loadDocSnippet('#'+el.id, p, frag); }
    else { loadDocSnippetElement(el, p, frag); }
  });
});

window._siteHelpers = { snippet, loadDocSnippet };

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', ()=>{
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-menu');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', ()=>{
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
  // close on escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && nav.classList.contains('open')){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
      toggle.focus();
    }
  });
  // click outside to close
  document.addEventListener('click', (e)=>{
    if(!nav.classList.contains('open')) return;
    const target = e.target;
    if(!nav.contains(target) && target !== toggle){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }
  });
});
