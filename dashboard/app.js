(function(){
  const SUMMARY_URL = '/artifacts/manifest-integrity/summary.json';
  const HISTORY_URL = '/artifacts/history.json';
  const MANIFEST_URL = '/docs/manifest.json';
  const formatDisplayTitle = window.TitleFormat?.formatDisplayTitle || ((baseTitle, context)=>context?`${baseTitle} — ${context}`:baseTitle);

  function el(tag, className, text){
    const node = document.createElement(tag);
    if(className) node.className = className;
    if(text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function formatDate(value){
    if(!value) return 'n/a';
    const date = new Date(value);
    if(Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }

  function severityFromScore(score, passed){
    if(passed) return 'none';
    if(score < 50) return 'critical';
    if(score < 80) return 'high';
    return 'medium';
  }

  function statusClass(passed){
    return passed ? 'status-pass' : 'status-fail';
  }

  function renderStatGrid(target, items){
    target.innerHTML = '';
    items.forEach(item => {
      const card = el('div', 'stat');
      card.appendChild(el('div', 'label', item.label));
      if(item.pill){
        const value = el('div');
        value.appendChild(el('span', `status-pill ${item.pillClass || 'status-neutral'}`, item.value));
        card.appendChild(value);
      } else {
        card.appendChild(el('div', 'value', item.value));
      }
      if(item.detail){
        const detail = el('div', 'dashboard-footer-note', item.detail);
        card.appendChild(detail);
      }
      target.appendChild(card);
    });
  }

  function renderEmpty(target, message){
    target.innerHTML = '';
    target.appendChild(el('div', 'empty-state', message));
  }

  function normalizeHistory(data){
    if(Array.isArray(data)) return data;
    if(data && Array.isArray(data.history)) return data.history;
    if(data && Array.isArray(data.runs)) return data.runs;
    return [];
  }

  function normalizeSummary(summary){
    return summary && typeof summary === 'object' ? summary : {};
  }

  function normalizeManifest(manifest){
    return Array.isArray(manifest) ? manifest : [];
  }

  function latestEntry(history, summary){
    if(history.length) return history[history.length - 1];
    return {
      timestamp: summary.generated_at,
      mode: summary.mode,
      score: summary.score,
      threshold: summary.threshold,
      passed: summary.passed,
      structural_issues: summary.structural_issues,
      warning_issues: summary.warning_issues,
    };
  }

  function lastFailure(history){
    for(let index = history.length - 1; index >= 0; index -= 1){
      if(history[index] && history[index].passed === false) return history[index];
    }
    return null;
  }

  function lastRecovery(history){
    let seenFailure = false;
    for(let index = history.length - 1; index >= 0; index -= 1){
      const entry = history[index];
      if(!entry) continue;
      if(entry.passed === false){
        seenFailure = true;
        continue;
      }
      if(seenFailure && entry.passed === true) return entry;
    }
    return null;
  }

  function buildSummaryRows(summary){
    return [
      { label: 'Manifest entries', value: String(summary.manifest_count ?? 'n/a') },
      { label: 'Docs discovered', value: String(summary.actual_docs_count ?? 'n/a') },
      { label: 'Structural issues', value: String(summary.structural_issues ?? 'n/a') },
      { label: 'Warnings', value: String(summary.warning_issues ?? 'n/a') },
    ];
  }

  function buildLatestRows(latest){
    const score = Number(latest.score ?? 0);
    const passed = latest.passed === true;
    return [
      { label: 'Mode', value: String(latest.mode ?? 'n/a') },
      { label: 'Score', value: `${Number.isFinite(score) ? score : 'n/a'} / 100` },
      { label: 'Status', value: passed ? 'Pass' : 'Fail', pill: true, pillClass: statusClass(passed) },
      { label: 'Threshold', value: String(latest.threshold ?? 'n/a') },
    ];
  }

  function buildIncidentRows(latest, failure, recovery){
    const passed = latest.passed === true;
    const score = Number(latest.score ?? 0);
    const severity = severityFromScore(score, passed);
    return [
      { label: 'Open incident', value: passed ? 'No' : 'Yes', pill: true, pillClass: passed ? 'status-pass' : 'status-fail' },
      { label: 'Severity', value: severity, pill: true, pillClass: passed ? 'status-pass' : severity === 'critical' ? 'status-fail' : 'status-warn' },
      { label: 'Last failure', value: formatDate(failure && failure.timestamp ? failure.timestamp : (passed ? null : latest.timestamp)) },
      { label: 'Last recovery', value: formatDate(recovery && recovery.timestamp ? recovery.timestamp : (passed ? latest.timestamp : null)) },
    ];
  }

  function renderTitleSamples(target, manifest){
    target.innerHTML = '';
    const sample = normalizeManifest(manifest).filter(item => item && item.title).slice(0, 4);
    if(!sample.length){
      renderEmpty(target, 'No title samples are currently available.');
      return;
    }

    sample.forEach(item => {
      const card = el('div', 'stat');
      card.appendChild(el('div', 'label', 'Document'));
      const titleLine = el('div');
      titleLine.appendChild(el('div', 'value', item.title || 'n/a'));
      if(item.context){
        titleLine.appendChild(el('span', 'status-pill status-neutral', item.context));
      }
      card.appendChild(titleLine);
      card.appendChild(el('div', 'dashboard-footer-note', item.displayTitle || formatDisplayTitle(item.title, item.context)));
      target.appendChild(card);
    });
  }

  function renderTrend(target, history){
    target.innerHTML = '';
    if(!history.length){
      renderEmpty(target, 'No history has been recorded yet. The validator will append runs to artifacts/history.json after each execution.');
      return;
    }

    const list = el('ul', 'trend-list');
    const visible = history.slice(-10).reverse();
    visible.forEach(entry => {
      const item = el('li', 'trend-item');
      const meta = el('div', 'trend-meta');
      const left = el('div');
      left.appendChild(el('div', null, `${formatDate(entry.timestamp)}`));
      left.appendChild(el('div', 'dashboard-footer-note', `${String(entry.mode ?? 'n/a')} · ${entry.passed ? 'pass' : 'fail'}`));
      meta.appendChild(left);
      meta.appendChild(el('div', `status-pill ${statusClass(entry.passed === true)}`, entry.passed === true ? 'Pass' : 'Fail'));
      item.appendChild(meta);

      const scoreRow = el('div');
      scoreRow.appendChild(el('div', 'trend-score', `${Number(entry.score ?? 0)} / 100`));
      const meter = el('div', 'meter');
      const fill = el('span');
      fill.style.width = `${Math.max(0, Math.min(100, Number(entry.score ?? 0)))}%`;
      meter.appendChild(fill);
      scoreRow.appendChild(meter);
      item.appendChild(scoreRow);

      list.appendChild(item);
    });
    target.appendChild(list);
  }

  async function loadJson(path){
    const response = await fetch(path, {cache: 'no-store'});
    if(!response.ok) throw new Error(`${path} (${response.status})`);
    return response.json();
  }

  async function init(){
    const statusNode = document.getElementById('data-status');
    const latestNode = document.getElementById('latest-run');
    const summaryNode = document.getElementById('integrity-summary');
    const titleSampleNode = document.getElementById('title-sample-list');
    const trendNode = document.getElementById('trend-list');
    const incidentNode = document.getElementById('incident-summary');

    try{
      const [summaryResult, historyResult, manifestResult] = await Promise.allSettled([loadJson(SUMMARY_URL), loadJson(HISTORY_URL), loadJson(MANIFEST_URL)]);
      const summary = normalizeSummary(summaryResult.status === 'fulfilled' ? summaryResult.value : {});
      const history = normalizeHistory(historyResult.status === 'fulfilled' ? historyResult.value : []);
      const manifest = normalizeManifest(manifestResult.status === 'fulfilled' ? manifestResult.value : []);
      const latest = latestEntry(history, summary);
      const failure = lastFailure(history);
      const recovery = lastRecovery(history);

      renderStatGrid(latestNode, buildLatestRows(latest));
      renderStatGrid(summaryNode, buildSummaryRows(summary));
      renderStatGrid(incidentNode, buildIncidentRows(latest, failure, recovery));
      renderTitleSamples(titleSampleNode, manifest);
      renderTrend(trendNode, history.length ? history : (summary.generated_at ? [latest] : []));

      if(statusNode){
        const parts = [];
        parts.push(summaryResult.status === 'fulfilled' ? 'Summary loaded' : 'Summary unavailable');
        parts.push(historyResult.status === 'fulfilled' ? 'history loaded' : 'history unavailable');
        statusNode.textContent = parts.join(' · ');
      }
    }catch(error){
      if(statusNode) statusNode.textContent = 'Unable to load dashboard data.';
      renderEmpty(latestNode, 'Dashboard data could not be loaded. Make sure the manifest integrity workflow has generated summary.json and history.json.');
      renderEmpty(summaryNode, 'No integrity summary is currently available.');
      renderEmpty(titleSampleNode, 'No title samples are currently available.');
      renderEmpty(incidentNode, 'No incident state is currently available.');
      renderEmpty(trendNode, 'No trend data is currently available.');
      console.error(error);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();