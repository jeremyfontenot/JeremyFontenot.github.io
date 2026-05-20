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
  const statTargets = Array.from(document.querySelectorAll('[data-page-stats]'));
  const featuredTargets = Array.from(document.querySelectorAll('[data-featured-evidence]'));
  const relationshipTargets = Array.from(document.querySelectorAll('[data-relationship-rail]'));
  const categoryTargets = Array.from(document.querySelectorAll('[data-category-breakdown]'));
  const hasHubSurface = Boolean(searchRoot || statTargets.length || featuredTargets.length || relationshipTargets.length || categoryTargets.length);

  if (!hasHubSurface) return;

  const INDEX_URL = '/evidence-library/evidence-search-index.json';
  const RELATIONSHIPS_URL = '/evidence-library/evidence-relationships.json';
  const pageMode = document.querySelector('[data-hub-mode]')?.dataset.hubMode || 'hub';

  const input = searchRoot?.querySelector('#evidence-query') || null;
  const category = searchRoot?.querySelector('#category-filter') || null;
  const project = searchRoot?.querySelector('#project-filter') || null;
  const skill = searchRoot?.querySelector('#skill-filter') || null;
  const proof = searchRoot?.querySelector('#proof-filter') || null;
  const count = searchRoot?.querySelector('#result-count') || null;
  const results = searchRoot?.querySelector('#evidence-results') || null;
  const clearButton = searchRoot?.querySelector('[data-clear-filters]') || null;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"]/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[ch]));

  const normalize = value => String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const tokenize = value => normalize(value).replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(Boolean);
  const uniq = values => [...new Set(values.filter(Boolean))];
  const uniqSorted = values => uniq(values).sort((left, right) => left.localeCompare(right));
  const escapeRegExp = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const fetchJson = async url => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unable to load ${url}`);
    return response.json();
  };

  const pageConfig = {
    hub: { limit: 6 },
    search: { limit: 6 },
    documents: { limit: 6 },
    evidence: { limit: 8 },
    library: { limit: 6 }
  };

  const state = {
    items: [],
    itemMap: new Map(),
    relatedLookup: new Map(),
    stats: null,
    loaded: false,
    urlApplied: false
  };

  const priorityByStatus = {
    AUTHORITATIVE: 0,
    DOCUMENTATION: 1,
    'SUPPORTING ARCHIVE': 2,
    'MANUAL REVIEW': 3
  };

  const selectedItemMode = item => {
    if (item.status === 'AUTHORITATIVE') return 'canonical';
    if (item.status === 'SUPPORTING ARCHIVE') return 'archive';
    if (item.confidenceLevel === 'manual-review-required' || /generated-gap-evidence/i.test(item.originalSourcePath || '')) return 'generated';
    return 'documentation';
  };

  const searchableText = item => normalize([
    item.title,
    item.summary,
    item.path,
    item.originalSourcePath,
    item.category,
    item.subcategory,
    item.proofType,
    item.status,
    item.relatedProject,
    item.relatedSkill,
    (item.tags || []).join(' ')
  ].join(' '));

  const subsequenceMatch = (needle, haystack) => {
    let index = 0;
    for (const character of needle) {
      index = haystack.indexOf(character, index);
      if (index === -1) return false;
      index += 1;
    }
    return true;
  };

  const scoreToken = (text, token) => {
    if (!token) return 0;
    if (text.includes(token)) return 6 + Math.min(4, token.length);
    const words = text.split(/\s+/);
    if (words.some(word => word.startsWith(token))) return 4;
    if (subsequenceMatch(token, text)) return 1;
    return 0;
  };

  const scoreItem = (item, queryTokens) => {
    if (!queryTokens.length) return 1;
    const text = searchableText(item);
    let score = 0;
    for (const token of queryTokens) {
      const tokenScore = scoreToken(text, token);
      if (!tokenScore) return 0;
      score += tokenScore;
    }
    if (normalize(item.title).includes(queryTokens.join(' '))) score += 8;
    if (normalize(item.relatedProject || '').includes(queryTokens.join(' '))) score += 3;
    if (normalize(item.relatedSkill || '').includes(queryTokens.join(' '))) score += 3;
    return score;
  };

  const highlight = (text, queryTokens) => {
    const source = String(text ?? '');
    if (!queryTokens.length) return escapeHtml(source);
    const regex = new RegExp(`(${queryTokens.map(escapeRegExp).join('|')})`, 'ig');
    return escapeHtml(source).replace(regex, match => `<mark>${escapeHtml(match)}</mark>`);
  };

  const buildQueryState = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || '',
      category: params.get('category') || '',
      project: params.get('project') || '',
      skill: params.get('skill') || '',
      proof: params.get('proof') || ''
    };
  };

  const syncQueryState = queryState => {
    const params = new URLSearchParams();
    if (queryState.q) params.set('q', queryState.q);
    if (queryState.category) params.set('category', queryState.category);
    if (queryState.project) params.set('project', queryState.project);
    if (queryState.skill) params.set('skill', queryState.skill);
    if (queryState.proof) params.set('proof', queryState.proof);
    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash || ''}`;
    window.history.replaceState({}, '', nextUrl);
  };

  const setSelectOptions = (select, values, label) => {
    if (!select) return;
    const list = uniqSorted(values);
    select.innerHTML = [`<option value="">${escapeHtml(label)}</option>`]
      .concat(list.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`))
      .join('');
  };

  const buildRelationshipLookup = relationships => {
    const lookup = new Map();
    const append = (sourceId, relation) => {
      const list = lookup.get(sourceId) || [];
      list.push(relation);
      lookup.set(sourceId, list);
    };

    for (const relation of relationships) {
      if (!relation?.sourceId || !relation?.targetId) continue;
      append(relation.sourceId, {
        relatedId: relation.targetId,
        relationshipType: relation.relationshipType || 'related',
        confidenceLevel: relation.confidenceLevel || 'reviewed-preserve',
        note: relation.note || ''
      });
      append(relation.targetId, {
        relatedId: relation.sourceId,
        relationshipType: relation.relationshipType || 'related',
        confidenceLevel: relation.confidenceLevel || 'reviewed-preserve',
        note: relation.note || ''
      });
    }
    return lookup;
  };

  const computeStats = items => {
    const byCategory = new Map();
    const byProject = new Map();
    const bySkill = new Map();
    const byProof = new Map();
    let canonical = 0;
    let archive = 0;
    let generated = 0;
    let manualReview = 0;

    for (const item of items) {
      byCategory.set(item.category, (byCategory.get(item.category) || 0) + 1);
      byProject.set(item.relatedProject, (byProject.get(item.relatedProject) || 0) + 1);
      bySkill.set(item.relatedSkill, (bySkill.get(item.relatedSkill) || 0) + 1);
      byProof.set(item.proofType, (byProof.get(item.proofType) || 0) + 1);
      if (item.status === 'AUTHORITATIVE') canonical += 1;
      if (item.status === 'SUPPORTING ARCHIVE') archive += 1;
      if (selectedItemMode(item) === 'generated') generated += 1;
      if (item.status === 'MANUAL REVIEW' || item.confidenceLevel === 'manual-review-required') manualReview += 1;
    }

    return {
      total: items.length,
      canonical,
      archive,
      generated,
      manualReview,
      categories: byCategory.size,
      projects: byProject.size,
      skills: bySkill.size,
      proofs: byProof.size,
      byCategory,
      byProject,
      bySkill,
      byProof
    };
  };

  const renderMetricCards = (target, metrics) => {
    if (!target) return;
    target.innerHTML = metrics.map(metric => `
      <article class="stat-card">
        <div class="stat-value">${escapeHtml(metric.value)}</div>
        <div class="stat-label">${escapeHtml(metric.label)}</div>
        ${metric.detail ? `<p class="stat-detail">${escapeHtml(metric.detail)}</p>` : ''}
      </article>
    `).join('');
  };

  const renderCategoryChips = (target, entries, label) => {
    if (!target) return;
    const chips = entries.slice(0, 6).map(([name, value]) => `<span class="chip"><strong>${escapeHtml(name)}</strong> ${escapeHtml(String(value))}</span>`);
    target.innerHTML = chips.length ? `<p class="chip-label">${escapeHtml(label)}</p><div class="badge-list">${chips.join('')}</div>` : '';
  };

  const pickFeaturedItems = (items, mode) => {
    const filtered = items.filter(item => {
      if (mode === 'documents') return ['projects', 'skills', 'validation-reports', 'experience'].includes(item.category);
      if (mode === 'evidence') return ['AUTHORITATIVE', 'SUPPORTING ARCHIVE', 'DOCUMENTATION'].includes(item.status);
      if (mode === 'library') return item.status === 'AUTHORITATIVE' || item.status === 'SUPPORTING ARCHIVE';
      return true;
    });

    return filtered
      .slice()
      .sort((left, right) => {
        const leftRank = (priorityByStatus[left.status] ?? 4) * 100 - (left.confidenceLevel === 'reviewed-preserve' ? 12 : 0) + (left.status === 'AUTHORITATIVE' ? 12 : 0);
        const rightRank = (priorityByStatus[right.status] ?? 4) * 100 - (right.confidenceLevel === 'reviewed-preserve' ? 12 : 0) + (right.status === 'AUTHORITATIVE' ? 12 : 0);
        if (leftRank !== rightRank) return leftRank - rightRank;
        return left.title.localeCompare(right.title);
      })
      .slice(0, pageConfig[mode]?.limit || 6);
  };

  const getRelatedSuggestions = (item, limit = 3) => {
    const related = [];
    const seen = new Set([item.id]);

    for (const relation of state.relatedLookup.get(item.id) || []) {
      const candidate = state.itemMap.get(relation.relatedId);
      if (!candidate || seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      related.push({ candidate, relation });
      if (related.length >= limit) return related;
    }

    const fallback = state.items
      .filter(candidate => candidate.id !== item.id && !seen.has(candidate.id) && (
        candidate.relatedProject === item.relatedProject ||
        candidate.relatedSkill === item.relatedSkill ||
        candidate.category === item.category
      ))
      .sort((left, right) => {
        const leftPriority = Number(left.relatedProject === item.relatedProject) + Number(left.relatedSkill === item.relatedSkill) + Number(left.category === item.category);
        const rightPriority = Number(right.relatedProject === item.relatedProject) + Number(right.relatedSkill === item.relatedSkill) + Number(right.category === item.category);
        return rightPriority - leftPriority || left.title.localeCompare(right.title);
      });

    for (const candidate of fallback) {
      related.push({
        candidate,
        relation: {
          relatedId: candidate.id,
          relationshipType: candidate.relatedProject === item.relatedProject ? 'same-project' : 'related',
          confidenceLevel: candidate.status === 'AUTHORITATIVE' ? 'reviewed-preserve' : 'manual-review-required',
          note: ''
        }
      });
      if (related.length >= limit) break;
    }

    return related;
  };

  const renderItemBadges = item => {
    const badges = [
      `<span class="status-badge">${escapeHtml(item.status)}</span>`,
      `<span class="badge badge-${escapeHtml(selectedItemMode(item))}">${escapeHtml(selectedItemMode(item))}</span>`,
      `<span class="badge">${escapeHtml(item.category)}</span>`,
      `<span class="badge">${escapeHtml(item.proofType)}</span>`
    ];
    return badges.join('');
  };

  const renderRelatedChips = item => {
    const related = getRelatedSuggestions(item, 3);
    if (!related.length) return '';
    return `
      <div class="result-links">
        <span class="result-links-label">Related evidence</span>
        ${related.map(({ candidate, relation }) => `
          <a class="chip chip-link" href="/${escapeHtml(candidate.path)}" title="${escapeHtml(relation.relationshipType)}">
            ${escapeHtml(candidate.title)}
          </a>
        `).join('')}
      </div>
    `;
  };

  const renderResultCard = (item, queryTokens) => `
    <article class="result-card">
      <div class="result-meta">
        ${renderItemBadges(item)}
      </div>
      <h3>${highlight(item.title, queryTokens)}</h3>
      <p>${highlight(item.summary, queryTokens)}</p>
      <p class="result-meta-line"><strong>Project:</strong> ${escapeHtml(item.relatedProject || 'General')} <strong>Skill:</strong> ${escapeHtml(item.relatedSkill || 'General')}</p>
      ${renderRelatedChips(item)}
      <a class="button" href="/${escapeHtml(item.path)}" aria-label="Open evidence ${escapeHtml(item.title)}">Open evidence</a>
    </article>
  `;

  const renderEmptyState = queryTokens => `
    <div class="empty-state" role="status">
      <h3>No matching preserved evidence found.</h3>
      <p>Try clearing one filter at a time, broadening the keyword query, or browsing the featured evidence below.</p>
      <div class="actions">
        <button class="button" type="button" data-clear-filters>Clear filters</button>
        <a class="button primary" href="/evidence-library/index.html">Browse evidence library</a>
      </div>
      ${queryTokens.length ? `<p class="chip-label">Active query</p><div class="badge-list">${queryTokens.map(token => `<span class="chip">${escapeHtml(token)}</span>`).join('')}</div>` : ''}
    </div>
  `;

  const updateUrlState = () => {
    if (!searchRoot) return;
    const queryState = {
      q: input?.value.trim() || '',
      category: category?.value || '',
      project: project?.value || '',
      skill: skill?.value || '',
      proof: proof?.value || ''
    };
    syncQueryState(queryState);
  };

  const populateSearchResults = () => {
    if (!searchRoot || !results) return;
    const queryTokens = tokenize(input?.value || '');
    const selectedCategory = category?.value || '';
    const selectedProject = project?.value || '';
    const selectedSkill = skill?.value || '';
    const selectedProof = proof?.value || '';

    const ranked = state.items
      .map(item => ({ item, score: scoreItem(item, queryTokens) }))
      .filter(entry => entry.score > 0)
      .filter(entry => (!selectedCategory || entry.item.category === selectedCategory) && (!selectedProject || entry.item.relatedProject === selectedProject) && (!selectedSkill || entry.item.relatedSkill === selectedSkill) && (!selectedProof || entry.item.proofType === selectedProof))
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        const leftPriority = priorityByStatus[left.item.status] ?? 9;
        const rightPriority = priorityByStatus[right.item.status] ?? 9;
        if (leftPriority !== rightPriority) return leftPriority - rightPriority;
        return left.item.title.localeCompare(right.item.title);
      })
      .map(entry => entry.item);

    if (count) {
      const total = state.items.length;
      count.textContent = `${ranked.length} result${ranked.length === 1 ? '' : 's'} shown from ${total} preserved records`;
    }

    if (!ranked.length) {
      results.innerHTML = renderEmptyState(queryTokens);
      return;
    }

    results.innerHTML = ranked.map(item => renderResultCard(item, queryTokens)).join('');
  };

  const focusFirstResult = () => {
    const firstButton = results?.querySelector('.result-card .button');
    if (firstButton) firstButton.focus();
  };

  const handleInputKeydown = event => {
    if (event.key === 'ArrowDown' || event.key === 'Enter') {
      event.preventDefault();
      focusFirstResult();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      if (input) input.value = '';
      if (category) category.value = '';
      if (project) project.value = '';
      if (skill) skill.value = '';
      if (proof) proof.value = '';
      populateSearchResults();
      updateUrlState();
      input?.focus();
    }
  };

  const renderHubPanel = () => {
    const items = state.items;
    const stats = state.stats || computeStats(items);

    const modeMetrics = {
      search: [
        { label: 'Promoted records', value: String(stats.total), detail: 'Curated records in the active evidence set' },
        { label: 'Canonical proof', value: String(stats.canonical), detail: 'Reviewed, preservation-first items' },
        { label: 'Documentation', value: String(stats.documentation), detail: 'Review-ready docs and runbooks' },
        { label: 'Categories', value: String(stats.categories), detail: 'Distinct evidence groupings' }
      ],
      documents: [
        { label: 'Document records', value: String(stats.total), detail: 'Preserved docs and runbooks' },
        { label: 'Review-ready', value: String(stats.documentation + stats.canonical), detail: 'Documentation-backed evidence' },
        { label: 'Projects', value: String(stats.projects), detail: 'Distinct portfolio projects' },
        { label: 'Skills', value: String(stats.skills), detail: 'Distinct skill areas' }
      ],
      evidence: [
        { label: 'Evidence records', value: String(stats.total), detail: 'Curated canonical and supporting proof' },
        { label: 'Canonical', value: String(stats.canonical), detail: 'Authoritative evidence artifacts' },
        { label: 'Archive', value: String(stats.archive), detail: 'Preserved historical support records' },
        { label: 'Generated / review', value: String(stats.generated + stats.manualReview), detail: 'Review-needed conceptual documentation' }
      ],
      library: [
        { label: 'Promoted evidence', value: String(stats.total), detail: 'Curated public evidence inventory' },
        { label: 'Canonical', value: String(stats.canonical), detail: 'Best evidence for direct review' },
        { label: 'Archive', value: String(stats.archive), detail: 'Historical supporting material' },
        { label: 'Manual review', value: String(stats.manualReview), detail: 'Conceptual or review-needed items' }
      ]
    };

    for (const target of statTargets) {
      renderMetricCards(target, modeMetrics[pageMode] || modeMetrics.library);
    }

    const categoryEntries = Array.from(stats.byCategory.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
    const projectEntries = Array.from(stats.byProject.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
    const skillEntries = Array.from(stats.bySkill.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));

    for (const target of categoryTargets) {
      renderCategoryChips(target, categoryEntries, 'Document counts by category');
    }

    for (const target of featuredTargets) {
      const featured = pickFeaturedItems(items, pageMode);
      const queryTokens = [];
      target.innerHTML = featured.map(item => `
        <article class="featured-card">
          <div class="result-meta">
            ${renderItemBadges(item)}
          </div>
          <h3>${highlight(item.title, queryTokens)}</h3>
          <p>${highlight(item.summary, queryTokens)}</p>
          <p class="result-meta-line"><strong>Project:</strong> ${escapeHtml(item.relatedProject || 'General')} <strong>Skill:</strong> ${escapeHtml(item.relatedSkill || 'General')}</p>
          ${renderRelatedChips(item)}
          <a class="button" href="/${escapeHtml(item.path)}">Open evidence</a>
        </article>
      `).join('');
    }

    for (const target of relationshipTargets) {
      const featured = pickFeaturedItems(items, pageMode).slice(0, 4);
      const cards = [];
      for (const item of featured) {
        for (const relation of state.relatedLookup.get(item.id) || []) {
          const related = state.itemMap.get(relation.relatedId);
          if (!related) continue;
          cards.push({ source: item, related, relation });
          if (cards.length >= 4) break;
        }
        if (cards.length >= 4) break;
      }

      if (!cards.length) {
        target.innerHTML = '<div class="empty-state" role="status">Related evidence will appear here after the index loads.</div>';
        continue;
      }

      target.innerHTML = cards.map(card => `
        <article class="relation-card">
          <div class="result-meta">
            <span class="status-badge">${escapeHtml(card.relation.relationshipType)}</span>
            <span class="badge badge-${escapeHtml(selectedItemMode(card.related))}">${escapeHtml(selectedItemMode(card.related))}</span>
          </div>
          <h3>${escapeHtml(card.source.title)}</h3>
          <p>${escapeHtml(card.relation.note || 'Related preserved evidence')}</p>
          <p class="result-meta-line"><strong>Related:</strong> ${escapeHtml(card.related.title)} <strong>Project:</strong> ${escapeHtml(card.related.relatedProject || 'General')}</p>
          <a class="button" href="/${escapeHtml(card.related.path)}">Open related evidence</a>
        </article>
      `).join('');
    }

    if (searchRoot) {
      const queryState = buildQueryState();
      if (!state.urlApplied) {
        if (input) input.value = queryState.q;
        if (category) category.value = queryState.category;
        if (project) project.value = queryState.project;
        if (skill) skill.value = queryState.skill;
        if (proof) proof.value = queryState.proof;
        state.urlApplied = true;
      }

      setSelectOptions(category, items.map(item => item.category), 'All categories');
      setSelectOptions(project, items.map(item => item.relatedProject), 'All projects');
      setSelectOptions(skill, items.map(item => item.relatedSkill), 'All skills');
      setSelectOptions(proof, items.map(item => item.proofType), 'All proof types');

      if (count) count.setAttribute('aria-atomic', 'true');
      populateSearchResults();
      updateUrlState();
    }

    if (categoryTargets.length) {
      for (const target of categoryTargets) {
        const topProjects = projectEntries.slice(0, 4);
        const topSkills = skillEntries.slice(0, 4);
        const chips = [
          ...topProjects.map(([name, value]) => `<span class="chip"><strong>${escapeHtml(name)}</strong> ${escapeHtml(String(value))}</span>`),
          ...topSkills.map(([name, value]) => `<span class="chip"><strong>${escapeHtml(name)}</strong> ${escapeHtml(String(value))}</span>`)
        ];
        const existing = target.innerHTML;
        target.innerHTML = existing ? `${existing}<div class="badge-list">${chips.join('')}</div>` : `<div class="badge-list">${chips.join('')}</div>`;
      }
    }
  };

  const bootstrap = async () => {
    const [itemsPayload, relationshipsPayload] = await Promise.all([
      fetchJson(INDEX_URL),
      fetchJson(RELATIONSHIPS_URL).catch(() => ({ relationships: [] }))
    ]);

    state.items = Array.isArray(itemsPayload) ? itemsPayload : [];
    state.itemMap = new Map(state.items.map(item => [item.id, item]));
    state.relatedLookup = buildRelationshipLookup(Array.isArray(relationshipsPayload.relationships) ? relationshipsPayload.relationships : []);
    state.stats = computeStats(state.items);
    state.loaded = true;

    renderHubPanel();

    if (searchRoot) {
      [input, category, project, skill, proof].forEach(element => {
        if (!element) return;
        element.addEventListener('input', () => {
          populateSearchResults();
          updateUrlState();
        });
      });

      if (input) input.addEventListener('keydown', handleInputKeydown);
      if (clearButton) {
        clearButton.addEventListener('click', () => {
          if (input) input.value = '';
          if (category) category.value = '';
          if (project) project.value = '';
          if (skill) skill.value = '';
          if (proof) proof.value = '';
          populateSearchResults();
          updateUrlState();
          input?.focus();
        });
      }
    }
  };

  bootstrap().catch(() => {
    if (count) count.textContent = 'Search index unavailable';
    if (results) {
      results.innerHTML = '<div class="empty-state" role="status">The evidence search index could not be loaded. Browse the documentation hub or the evidence library directly.</div>';
    }
    for (const target of statTargets) {
      target.innerHTML = '<div class="empty-state" role="status">Evidence statistics are unavailable.</div>';
    }
    for (const target of featuredTargets) {
      target.innerHTML = '<div class="empty-state" role="status">Featured evidence is unavailable.</div>';
    }
    for (const target of relationshipTargets) {
      target.innerHTML = '<div class="empty-state" role="status">Related evidence is unavailable.</div>';
    }
  });
})();
