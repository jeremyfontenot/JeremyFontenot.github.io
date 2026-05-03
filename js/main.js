/* =========================================================
   REFINED INTERACTION ENGINE
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.section, .card, .timeline-item');

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  let ticking = false;
  document.addEventListener('mousemove', (e) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const hero = document.querySelector('.hero');
        if (hero) {
          const x = (e.clientX / window.innerWidth - 0.5) * 15;
          const y = (e.clientY / window.innerHeight - 0.5) * 15;
          hero.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        backToTop.style.display = 'block';
        setTimeout(() => backToTop.style.opacity = '1', 10);
      } else {
        backToTop.style.opacity = '0';
        setTimeout(() => backToTop.style.display = 'none', 300);
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});