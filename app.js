(function () {
  var TRACK_ORDER = ["architecture", "tools-mcp", "claude-code", "prompting", "reliability", "implementation", "exam-drills", "practice-sets"];

  var TRACK_DESC = {
    "architecture": "Agentic loops, orchestration, delegation, deterministic gates, hooks, and session continuity.",
    "tools-mcp": "Tool interfaces, recovery-aware errors, MCP scope, built-in tools, and least privilege.",
    "claude-code": "CLAUDE.md, skills, commands, subagents, permissions, planning, and CI workflows.",
    "prompting": "Few-shot examples, schemas, validation, retries, batch processing, and multi-pass review.",
    "reliability": "Context budgets, provenance, escalation, review gates, and recovering from failures.",
    "implementation": "Reference configurations, code-level contracts, policy gates, CI boundaries, and evaluation harnesses.",
    "exam-drills": "Original architecture scenarios that train the decision logic behind multiple-choice questions.",
    "practice-sets": "Twenty-five original multiple-choice questions with answer reasoning across all five exam domains."
  };

  var TRACK_NAV_LABEL = {
    "architecture": "Architecture",
    "tools-mcp": "Tools & MCP",
    "claude-code": "Claude Code",
    "prompting": "Prompting",
    "reliability": "Reliability",
    "implementation": "Implementation",
    "exam-drills": "Exam Drills",
    "practice-sets": "Practice Sets"
  };

  function content() {
    return window.SITE_CONTENT || {};
  }

  function buildSidebar() {
    var nav = document.getElementById("sidebar-nav");
    nav.innerHTML = "";
    TRACK_ORDER.forEach(function (key) {
      var data = content()[key];
      if (!data) return;

      var track = document.createElement("div");
      track.className = "track";

      var title = document.createElement("a");
      title.className = "track-title";
      title.href = "#" + key;
      title.textContent = data.track;
      track.appendChild(title);

      var list = document.createElement("ul");
      list.className = "step-list";
      data.steps.forEach(function (step, i) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + key + "/" + step.id;
        a.dataset.track = key;
        a.dataset.step = step.id;
        var badge = document.createElement("span");
        badge.className = "step-num-badge";
        badge.textContent = (i + 1) + ".";
        a.appendChild(badge);
        a.appendChild(document.createTextNode(" " + step.title));
        li.appendChild(a);
        list.appendChild(li);
      });
      track.appendChild(list);
      nav.appendChild(track);
    });
  }

  function buildTopbarTracks() {
    var nav = document.getElementById("topbar-tracks");
    if (!nav) return;
    nav.innerHTML = "";
    TRACK_ORDER.forEach(function (key) {
      var data = content()[key];
      if (!data) return;
      var a = document.createElement("a");
      a.href = "#" + key;
      a.dataset.track = key;
      a.textContent = TRACK_NAV_LABEL[key] || data.track;
      nav.appendChild(a);
    });
  }

  function renderHome() {
    var pane = document.getElementById("content-pane");
    var html = '<h1>Claude Certified Architect — Foundations</h1>';
    html += '<p class="subtitle">A scenario-first study course for CCAR-F. Learn the architecture choice, the reason it wins, and the tempting alternative that fails.</p>';
    html += '<div class="landing-cards">';
    TRACK_ORDER.forEach(function (key) {
      var data = content()[key];
      if (!data) return;
      html += '<a class="landing-card" href="#' + key + '">' +
        '<span class="title">' + data.track + '</span>' +
        '<span class="desc">' + TRACK_DESC[key] + '</span>' +
        '</a>';
    });
    html += '</div>';
    pane.innerHTML = html;
  }

  function renderStep(trackKey, stepId) {
    var data = content()[trackKey];
    if (!data) { renderHome(); return; }

    var idx = data.steps.findIndex(function (s) { return s.id === stepId; });
    if (idx === -1) idx = 0;
    var step = data.steps[idx];

    var pane = document.getElementById("content-pane");
    var html = '<div class="crumb"><a href="#">Claude Certified Architect — Foundations</a><span class="sep">&rsaquo;</span><a href="#' + trackKey + '">' + data.track + '</a><span class="sep">&rsaquo;</span>Step ' + (idx + 1) + ' of ' + data.steps.length + '</div>';
    html += '<h1>' + step.title + '</h1>';
    html += step.body;

    html += '<div class="step-nav">';
    if (idx > 0) {
      var prev = data.steps[idx - 1];
      html += '<a class="prev" href="#' + trackKey + '/' + prev.id + '"><span class="dir">Previous</span>' + prev.title + '</a>';
    } else {
      html += '<span class="placeholder"></span>';
    }
    if (idx < data.steps.length - 1) {
      var next = data.steps[idx + 1];
      html += '<a class="next" href="#' + trackKey + '/' + next.id + '"><span class="dir">Next</span>' + next.title + '</a>';
    } else {
      html += '<span class="placeholder"></span>';
    }
    html += '</div>';

    pane.innerHTML = html;
    highlightActive(trackKey, step.id);
    window.scrollTo(0, 0);
    document.getElementById("content-pane").scrollTo && document.getElementById("content-pane").scrollTo(0, 0);
  }

  function highlightActive(trackKey, stepId) {
    var links = document.querySelectorAll(".step-list a");
    links.forEach(function (a) {
      a.classList.toggle("active", a.dataset.track === trackKey && a.dataset.step === stepId);
    });
    var topLinks = document.querySelectorAll(".topbar-tracks a");
    topLinks.forEach(function (a) {
      a.classList.toggle("active", a.dataset.track === trackKey);
    });
  }

  function route() {
    var hash = location.hash.replace(/^#/, "");
    if (!hash) { renderHome(); highlightActive(null, null); return; }
    var parts = hash.split("/");
    var trackKey = parts[0];
    var stepId = parts[1];
    if (!content()[trackKey]) { renderHome(); return; }
    if (!stepId) {
      renderStep(trackKey, content()[trackKey].steps[0].id);
    } else {
      renderStep(trackKey, stepId);
    }
    closeSidebarMobile();
  }

  function closeSidebarMobile() {
    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("sidebar-overlay");
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
    var toggle = document.getElementById("sidebar-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildSidebar();
    buildTopbarTracks();
    route();

    var toggle = document.getElementById("sidebar-toggle");
    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("sidebar-overlay");
    toggle.addEventListener("click", function () {
      var opened = sidebar.classList.toggle("open");
      overlay.classList.toggle("open", opened);
      toggle.setAttribute("aria-expanded", String(opened));
    });
    overlay.addEventListener("click", closeSidebarMobile);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeSidebarMobile();
    });
  });

  window.addEventListener("hashchange", route);
})();
