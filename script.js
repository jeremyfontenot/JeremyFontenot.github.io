/* =========================================================
   Jeremy Fontenot — script.js v3
   Modern • Technical • Innovative • Precise • Trustworthy
   - Unified brand particles (resize-aware)
   - Reduced-motion friendly
   - Modal (delegated) for any card image
   - Smooth scroll, hamburger, section highlight
   - Mailto contact handling
   ========================================================= */

/* -----------------------
   Global preferences/util
   ----------------------- */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* rAF-throttled resize helper */
function onResize(cb) {
  let ticking = false;
  window.addEventListener('resize', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => { cb(); ticking = false; });
      ticking = true;
    }
  });
}

/* -----------------------
   1) Particles — unified canvas version (brand palette + ResizeObserver)
   ----------------------- */
const BRAND_COLORS = ['#1AE0D7', '#007BFF', '#0A2A43', '#FFFFFF']; // neon aqua, electric blue, cyber blue, white

function initCanvasParticles(canvasId, opts = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // The section is the canvas' parent; we size to it
  const section = canvas.parentElement;

  // Tunable defaults (consistent across sections)
  const settings = {
    count: 90,
    speed: 0.9,         // lower = calmer
    radiusMin: 0.8,
    radiusMax: 2.5,
    ...opts
  };

  function sizeToSection() {
    // use client sizes (include padding, exclude scrollbars)
    canvas.width  = section.clientWidth;
    canvas.height = section.clientHeight;
  }
  sizeToSection();

  // Build particle set
  let particles = [];
  function resetParticles() {
    particles = [];
    for (let i = 0; i < settings.count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * (settings.radiusMax - settings.radiusMin) + settings.radiusMin,
        dx: (Math.random() * 2 - 1) * settings.speed,
        dy: (Math.random() * 2 - 1) * settings.speed,
        c: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)]
      });
    }
  }
  resetParticles();

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.fill();
    }
    if (!prefersReducedMotion) requestAnimationFrame(frame);
  }
  if (!prefersReducedMotion) requestAnimationFrame(frame);

  // Keep canvases correct when sections resize (fonts load, content changes, etc.)
  const ro = new ResizeObserver(() => {
    sizeToSection();
    resetParticles();
  });
  ro.observe(section);

  onResize(() => {
    sizeToSection();
    resetParticles();
  });
}

/* -----------------------
   2) Particles.js (line-linked) for Experience section – optional
   Will only run if:
     - window.particlesJS exists, AND
     - the target element is NOT a <canvas> (particles.js manages its own canvas)
   Otherwise we fall back to our unified canvas particles.
   ----------------------- */
function initExperienceParticles(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return false;

  // If target is a CANVAS, do NOT run particles.js (it expects a container DIV)
  if (el.tagName === 'CANVAS') return false;
  if (typeof window.particlesJS !== 'function') return false;

  const speed = prefersReducedMotion ? 0 : 1.8;
  window.particlesJS(containerId, {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 900 } },
      color:  { value: BRAND_COLORS },
      shape:  { type: 'circle' },
      opacity:{ value: 0.45 },
      size:   { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#1AE0D7',
        opacity: 0.35,
        width: 1
      },
      move: { enable: !prefersReducedMotion, speed }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: !prefersReducedMotion, mode: 'grab' } },
      modes: {  grab: { distance: 140, line_linked: { opacity: 1 } } }
    },
    retina_detect: true
  });
  return true;
}

/* Initialize all canvases consistently; special-case Experience */
window.addEventListener('load', () => {
  const ids = [
    'hero-particles','about-me-particles','recommended-particles',
    /* 'experience-particles' handled below */, 'home-lab-particles',
    'tools-particles','certifications-particles','contact-particles','footer-particles'
  ];
  ids.forEach(id => initCanvasParticles(id, { count: 90, speed: 0.9 }));

  // Experience: try line-linked particles.js if possible; else fall back to our canvas
  const expOK = initExperienceParticles('experience-particles');
  if (!expOK) initCanvasParticles('experience-particles', { count: 90, speed: 0.9 });
});

/* -----------------------
   3) Smooth scroll for anchor links
   ----------------------- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});

/* -----------------------
   4) About Me reveal on scroll
   ----------------------- */
window.addEventListener('scroll', () => {
  const aboutMeOverlay = document.querySelector('#about-me .about-me-overlay');
  if (!aboutMeOverlay) return;
  const sectionPosition = aboutMeOverlay.getBoundingClientRect().top;
  const screenPosition = window.innerHeight / 1.3;
  if (sectionPosition < screenPosition) aboutMeOverlay.classList.add('visible');
}, { passive: true });

/* -----------------------
   5) Image Modal — delegated to document
   Works for ANY .image-container img in cards
   ----------------------- */
(function initModal() {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const caption = document.getElementById('caption');
  const closeBtn = document.querySelector('.modal .close');
  if (!modal || !modalImg || !caption || !closeBtn) return;

  function openModal(src, alt) {
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    modalImg.src = src;
    modalImg.alt = alt || '';
    caption.textContent = alt || '';
  }
  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }

  document.addEventListener('click', e => {
    const img = e.target.closest('.image-container img');
    if (!img) return;
    openModal(img.src, img.alt);
  });
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();

/* -----------------------
   6) Contact form — mailto handler
   ----------------------- */
(function bindContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const message = document.getElementById('message')?.value || '';
    const subject = `Message from ${name}`;
    const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${message}`;
    const mailto = `mailto:jeremy.fontenot@jeremyfontenot.online?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
})();

/* -----------------------
   7) Typewriter (hero) — respects reduced motion
   ----------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const textElement = document.getElementById('hero-title');
  if (!textElement) return;

  const text = 'Welcome to My Digital Space';
  if (prefersReducedMotion) { textElement.textContent = text; return; }

  let index = 0, isDeleting = false;
  const typingSpeed = 100, deleteSpeed = 50, pauseBetween = 1500, loopPause = 1000;

  function typeEffect() {
    if (!isDeleting) {
      if (index < text.length) {
        textElement.textContent += text.charAt(index++);
        setTimeout(typeEffect, typingSpeed);
      } else {
        setTimeout(() => { isDeleting = true; typeEffect(); }, pauseBetween);
      }
    } else {
      if (index > 0) {
        textElement.textContent = text.substring(0, index - 1);
        index--;
        setTimeout(typeEffect, deleteSpeed);
      } else {
        isDeleting = false;
        setTimeout(typeEffect, loopPause);
      }
    }
  }
  textElement.textContent = '';
  typeEffect();
});

/* -----------------------
   8) Hamburger menu with aria-expanded
   ----------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  function updateExpanded() {
    const expanded = navLinks.classList.contains('active');
    hamburger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    updateExpanded();
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      updateExpanded();
    });
  });
});

/* -----------------------
   9) Active section highlighting in the navbar
   ----------------------- */
(function activeSectionHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const nav = document.querySelector('.nav-links');
  if (!sections.length || !nav) return;

  const links = Array.from(nav.querySelectorAll('a')).map(a => {
    const href = a.getAttribute('href') || '';
    return { a, id: href.startsWith('#') ? href.slice(1) : null };
  });

  function updateActive() {
    let currentId = null;
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      // Use header offset (~64px) and detect the section under that line
      if (rect.top <= 120 && rect.bottom >= 120) currentId = sec.id;
    });
    links.forEach(({ a, id }) => {
      const isActive = id && id === currentId;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  document.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('load', updateActive);
})();