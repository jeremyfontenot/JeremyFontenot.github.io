(() => {
  const navButton = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('#primary-menu');
  if (navButton && navMenu) {
    navButton.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      navButton.setAttribute('aria-expanded', String(open));
    });
  }
  const searchRoot = document.querySelector('[data-evidence-search]');
  if (!searchRoot) return;
  const input = searchRoot.querySelector('#evidence-query');
  const category = searchRoot.querySelector('#category-filter');
  const project = searchRoot.querySelector('#project-filter');
  const skill = searchRoot.querySelector('#skill-filter');
  const proof = searchRoot.querySelector('#proof-filter');
  const count = searchRoot.querySelector('#result-count');
  const results = searchRoot.querySelector('#evidence-results');
  const normalize = value => String(value || '').toLowerCase();
  const esc = value => String(value || '').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const fillSelect = (select, values, label) => { if (!select) return; select.innerHTML = '<option value="">' + label + '</option>' + [...new Set(values.filter(Boolean))].sort().map(value => '<option value="' + esc(value) + '">' + esc(value) + '</option>').join(''); };
  const render = items => {
    const q = normalize(input?.value);
    const filtered = items.filter(item => {
      const text = normalize([item.title,item.summary,item.path,item.originalSourcePath,item.category,item.subcategory,item.proofType,item.status,item.relatedProject,item.relatedSkill,(item.tags||[]).join(' ')].join(' '));
      return (!q || text.includes(q)) && (!category?.value || item.category === category.value) && (!project?.value || item.relatedProject === project.value) && (!skill?.value || item.relatedSkill === skill.value) && (!proof?.value || item.proofType === proof.value);
    });
    if (count) count.textContent = filtered.length + ' result' + (filtered.length === 1 ? '' : 's');
    if (!results) return;
    if (!filtered.length) { results.innerHTML = '<div class="result-card" role="status">No matching preserved evidence found. Adjust the search text or filters.</div>'; return; }
    results.innerHTML = filtered.map(item => '<article class="result-card"><div class="result-meta"><span class="status-badge">' + esc(item.status) + '</span><span class="badge">' + esc(item.category) + '</span><span class="badge">' + esc(item.proofType) + '</span></div><h3>' + esc(item.title) + '</h3><p>' + esc(item.summary) + '</p><p><strong>Project:</strong> ' + esc(item.relatedProject || 'General') + ' <strong>Skill:</strong> ' + esc(item.relatedSkill || 'General') + '</p><a class="button" href="/' + esc(item.path) + '">Open evidence</a></article>').join('');
  };
  fetch('/evidence-library/evidence-search-index.json').then(response => { if (!response.ok) throw new Error('Search index unavailable'); return response.json(); }).then(items => { fillSelect(category, items.map(i => i.category), 'All categories'); fillSelect(project, items.map(i => i.relatedProject), 'All projects'); fillSelect(skill, items.map(i => i.relatedSkill), 'All skills'); fillSelect(proof, items.map(i => i.proofType), 'All proof types'); [input, category, project, skill, proof].forEach(el => el && el.addEventListener('input', () => render(items))); render(items); }).catch(() => { if (count) count.textContent = 'Search index unavailable'; if (results) results.innerHTML = '<div class="result-card" role="status">The evidence search index could not be loaded. Use the documentation and evidence pages to browse promoted records.</div>'; });
})();
