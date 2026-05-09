// /js/main.js - shared UI utilities: copy buttons, code copy, accessible focus management
document.addEventListener('click', function (e) {
  const target = e.target;
  if (target.matches('.copy-btn')) {
    const targetId = target.getAttribute('data-target');
    const el = document.getElementById(targetId);
    if (!el) return;
    const text = el.innerText || el.value || el.textContent;
    navigator.clipboard?.writeText(text).then(() => {
      const prev = target.innerText;
      target.innerText = 'Copied';
      setTimeout(() => target.innerText = prev, 1500);
    }).catch(() => {
      target.innerText = 'Copy';
    });
  }
});