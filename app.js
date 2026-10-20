(function () {
  'use strict';

  var DOMAIN_ORDER = ['architecture', 'tools-mcp', 'claude-code', 'prompting', 'reliability'];
  var DOMAIN_DESC = {
    architecture: 'Loops, delegation, enforcement, hooks, and session continuity.',
    'tools-mcp': 'Tool contracts, error recovery, MCP scope, and built-in tools.',
    'claude-code': 'Project instructions, commands, skills, planning, and CI.',
    prompting: 'Precision, schemas, validation, batches, and independent review.',
    reliability: 'Context, provenance, escalation, recovery, and human review.'
  };
  var SUPPLEMENTARY = {
    architecture: ['exam-blueprint', 'implement-agent-loop', 'implement-pre-execution-gate', 'implement-subagent-handoff', 'architecture-practice'],
    'tools-mcp': ['implement-tool-contract', 'implement-mcp-project-config', 'tools-practice'],
    'claude-code': ['implement-claude-md-layout', 'implement-noninteractive-ci', 'claude-code-practice'],
    prompting: ['implement-structured-output', 'implement-evaluation-harness', 'prompting-practice'],
    reliability: ['reliability-practice']
  };

  var pane = document.getElementById('content-pane');
  var sidebar = document.getElementById('sidebar');
  var scrim = document.getElementById('sidebar-scrim');
  var toggle = document.getElementById('sidebar-toggle');
  var content = function () { return window.SITE_CONTENT || {}; };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }
  function allSteps() {
    return Object.keys(content()).flatMap(function (key) { return content()[key].steps || []; });
  }
  function stepById(id) { return allSteps().find(function (step) { return step.id === id; }); }
  function route() {
    var key = location.hash.replace(/^#/, '');
    return DOMAIN_ORDER.includes(key) ? key : 'architecture';
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    scrim.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }
  function openSidebar() {
    sidebar.classList.add('open');
    scrim.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }
  function label(track) {
    return track.replace(/^\d+\.\s*/, '').replace(/\s+—\s+\d+%$/, '');
  }
  function weight(track) {
    var found = track.match(/\d+%/);
    return found ? found[0] : '';
  }
  function buildSidebar(activeKey) {
    var nav = document.getElementById('sidebar-nav');
    nav.innerHTML = DOMAIN_ORDER.map(function (key, index) {
      var domain = content()[key];
      return '<a class="domain-link' + (key === activeKey ? ' active' : '') + '" href="#' + key + '"' + (key === activeKey ? ' aria-current="page"' : '') + '><span class="domain-number">' + String(index + 1).padStart(2, '0') + '</span><span><strong>' + escapeHtml(label(domain.track)) + '</strong><small>' + escapeHtml(DOMAIN_DESC[key]) + '</small></span></a>';
    }).join('');
  }
  function sectionMarkup(step, index, supplementary) {
    return '<section class="concept-section" id="' + escapeHtml(step.id) + '"><div class="concept-kicker">' + (supplementary ? 'Implementation and practice' : 'Syllabus concept') + ' · ' + String(index + 1).padStart(2, '0') + '</div><h2>' + escapeHtml(step.title) + '</h2><div class="lesson-prose">' + step.body + '</div></section>';
  }
  function renderDomain(key) {
    var domain = content()[key];
    var core = domain.steps;
    var extra = SUPPLEMENTARY[key].map(stepById).filter(Boolean);
    var html = '<article class="reader"><div class="eyebrow">Domain ' + (DOMAIN_ORDER.indexOf(key) + 1) + ' · ' + escapeHtml(weight(domain.track)) + '</div><h1>' + escapeHtml(label(domain.track)) + '</h1><p class="lede">' + escapeHtml(DOMAIN_DESC[key]) + '</p><nav class="on-page-nav" aria-label="On this page"><span>On this page</span>' + core.map(function (step, index) { return '<a href="#' + key + '" data-section="' + escapeHtml(step.id) + '">' + String(index + 1).padStart(2, '0') + ' ' + escapeHtml(step.title) + '</a>'; }).join('') + '</nav><div class="sections">' + core.map(function (step, index) { return sectionMarkup(step, index, false); }).join('') + '<section class="supplementary"><div class="supplementary-head"><div><div class="concept-kicker">Applied study</div><h2>Implementation and review</h2></div><p>Concrete implementation patterns and original practice for this domain.</p></div>' + extra.map(function (step, index) { return sectionMarkup(step, index, true); }).join('') + '</section></div></article>';
    pane.innerHTML = html;
    document.getElementById('topbar-title').textContent = label(domain.track);
    buildSidebar(key);
    decorateCode();
    window.scrollTo(0, 0);
    pane.focus({ preventScroll: true });
    closeSidebar();
  }
  function decorateCode() {
    pane.querySelectorAll('pre').forEach(function (pre) {
      if (pre.closest('.code-panel')) return;
      var code = pre.querySelector('code');
      if (!code) return;
      var panel = document.createElement('div');
      panel.className = 'code-panel';
      var head = document.createElement('div');
      head.className = 'code-head';
      var labelNode = document.createElement('span');
      labelNode.textContent = detectLanguage(code.textContent);
      var copy = document.createElement('button');
      copy.type = 'button'; copy.className = 'code-copy'; copy.textContent = 'Copy';
      copy.setAttribute('aria-label', 'Copy code example');
      head.appendChild(labelNode); head.appendChild(copy);
      pre.replaceWith(panel); panel.appendChild(head); panel.appendChild(pre);
    });
  }
  function detectLanguage(source) {
    var text = (source || '').trim();
    if (/^(from |import |def |async def )/.test(text)) return 'Python';
    if (/^(\{|\[)/.test(text)) return 'JSON';
    if (/^(name:|on:|jobs:|---)/.test(text)) return 'YAML';
    if (/^(claude |npm |pnpm |git |# )/.test(text)) return 'Shell';
    return 'Code';
  }
  function render() { renderDomain(route()); }

  pane.addEventListener('click', async function (event) {
    var sectionLink = event.target.closest('a[data-section]');
    if (sectionLink) {
      event.preventDefault();
      var section = document.getElementById(sectionLink.dataset.section);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    var button = event.target.closest('.code-copy');
    if (!button) return;
    try { await navigator.clipboard.writeText(button.closest('.code-panel').querySelector('code').textContent); button.textContent = 'Copied'; }
    catch (_) { button.textContent = 'Select text'; }
    window.setTimeout(function () { button.textContent = 'Copy'; }, 1600);
  });
  toggle.addEventListener('click', function () { sidebar.classList.contains('open') ? closeSidebar() : openSidebar(); });
  document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
  scrim.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeSidebar(); });
  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', render);
})();
