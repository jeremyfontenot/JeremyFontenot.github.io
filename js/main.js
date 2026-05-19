// Main interactive enhancements (keyboard shortcuts, accessibility helpers)
if(window.location.pathname.startsWith('/docs/')){
  document.body.classList.add('docs-page');
}

document.addEventListener('DOMContentLoaded',()=>{
  // Quick focus to search on '/docs' pages with '#q' present
  const q = document.querySelector('#doc-search');
  if(q){document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.metaKey){e.preventDefault();q.focus();}})}
});

async function injectPrimaryNav(){
  if(window.location.pathname.startsWith('/docs/')) return;

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

    const canonicalizePath = (path)=>{
      const normalized = path.replace(/\\/g, '/').replace(/\/index\.html$/, '/').replace(/\/+$/, '/');
      return normalized || '/';
    };
    const currentPath = canonicalizePath(window.location.pathname);
    navContainers.forEach((container)=>{
      container.querySelectorAll('a[href]').forEach((link)=>{
        const href = link.getAttribute('href');
        if(!href){
          return;
        }
        const linkPath = canonicalizePath(new URL(href, window.location.origin).pathname);
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

  // Fade-up reveal and micro-interactions
  document.addEventListener('DOMContentLoaded', ()=>{
    const animated = Array.from(document.querySelectorAll('[data-animate]'));
    if('IntersectionObserver' in window && animated.length){
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },{threshold:0.12});
      animated.forEach(el=>io.observe(el));
    }else{
      animated.forEach(el=>el.classList.add('in-view'));
    }

    // Set staggered animation delays for timeline cards
    const timelineCards = document.querySelectorAll('.timeline-card[data-animate]');
    timelineCards.forEach((card, index)=>{
      card.style.setProperty('--item-index', index);
    });

    // subtle hover pulse hooks (CSS handles visuals)
    const interactives = document.querySelectorAll('.btn, a.contact-email');
    interactives.forEach(el=>{
      el.addEventListener('mouseenter', ()=>el.classList.add('hovering'));
      el.addEventListener('mouseleave', ()=>el.classList.remove('hovering'));
    });

    // smooth-handle anchors
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        const href = a.getAttribute('href');
        if(!href || href === '#') return;
        const target = document.querySelector(href);
        if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth',block:'start'}); history.pushState(null,'',href); }
      });
    });
  });
