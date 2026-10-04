/* Página do time de automações: jornada, base, recursos, times e agentes. O conteúdo vem de assets/team-data.js. */
(function () {
  "use strict";
  var T = window.TEAM, drawMap = window.DW.Map, view = document.getElementById("view"), nav = document.getElementById("nav");
  var TABS = [["jornada", "1", "Jornada"], ["base", "2", "Base"], ["recursos", "3", "Recursos"], ["times", "4", "Times"], ["agentes", "5", "Agentes"]];
  var live = { stop: function () {}, key: null };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function head(eyebrow, title, lead) { return "<div class='head'><p class='eyebrow'>" + esc(eyebrow) + "</p><h1>" + esc(title) + "</h1><p class='lead'>" + esc(lead) + "</p></div>"; }
  function stage(top, legend, noCaption) {
    return "<section class='stage'><div class='stage-top'>" + top + "</div><div class='scroll'><svg id='map' role='img'></svg></div>" +
      (noCaption ? "" : "<div class='caption' id='cap' aria-live='polite'></div>") + "<div class='legend'>" + legend + "</div></section>";
  }
  var FS = "<button class='btn' id='fs' hidden>Tela cheia</button>";
  function fullscreen() {
    var b = $("fs"), w = view.querySelector(".work");
    if (!b || !w || !w.requestFullscreen || !document.fullscreenEnabled) return;
    b.hidden = false;
    b.addEventListener("click", function () {
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      var p = w.requestFullscreen(); if (p && p.catch) p.catch(function () {});
    });
  }
  document.addEventListener("fullscreenchange", function () { var b = $("fs"); if (b) b.textContent = document.fullscreenElement ? "Sair da tela cheia" : "Tela cheia"; relock(); });
  /* um bloco de texto que troca de conteúdo ocupa sempre a altura do maior: nada pula sob o cursor */
  var locks = [];
  function relock() { locks.forEach(function (f) { f(); }); }
  function lock(el, htmls) {
    function fit() {
      var m = el.cloneNode(false), max = 0;
      m.removeAttribute("id"); m.removeAttribute("aria-live");
      m.style.cssText = "position:absolute;visibility:hidden;min-height:0;width:" + el.offsetWidth + "px";
      el.parentNode.appendChild(m);
      htmls.forEach(function (h) { m.innerHTML = h; if (m.offsetHeight > max) max = m.offsetHeight; });
      el.parentNode.removeChild(m);
      el.style.minHeight = max + "px";
    }
    locks.push(fit); fit();
  }
  window.addEventListener("resize", relock);

  /* ---------- 1 · Jornada: o mapa cresce a cada passo ---------- */
  function jornada() {
    var J = T.journey;
    view.innerHTML = head("1 · Jornada", "Um catálogo no centro. Todo o resto se conecta a ele.",
        "Primeiro as automações migram para o Hub. Depois entram os agentes, o ServiceNow por eventos e por ferramentas, o Stellar e qualquer outro produto.") +
      "<div class='phases n6' id='phases'>" + J.steps.map(function (s, k) { return "<button class='ph' data-k='" + k + "'><b>" + esc(s.b) + "</b><span>" + esc(s.name) + "</span><small>" + esc(s.when || "antes da plataforma") + "</small></button>"; }).join("") + "</div>" +
      "<div class='work'>" + stage("<div><h2 id='st-title'></h2><p id='st-text'></p></div><div class='controls'><button class='btn pri' id='play'>▶ Play</button><button class='btn' id='prev'>Anterior</button><button class='btn' id='next'>Próximo</button>" + FS + "</div>",
        "<span><i class='l-new'></i>Entra neste passo</span><span><i class='l-core'></i>Construído pelo time</span><span><i class='l-ext'></i>Já existe</span><span><i class='l-ghost'></i>Ainda não conectado</span><span><kbd>←</kbd> <kbd>→</kbd> passos · <kbd>espaço</kbd> play</span>", true) +
      "<aside class='side'><div class='panel'><h2>O que muda</h2><div class='pbody' id='st-items'></div></div><div class='panel'><h2>Pronto quando</h2><div class='pbody' id='st-gate'></div></div></aside></div>";
    var map = drawMap($("map"), J), cur = 0, timer = null;
    $("map").setAttribute("aria-label", "Jornada: das automações de hoje ao catálogo usado pelo ServiceNow, pelo Stellar e por outros produtos");
    function set(k) {
      cur = k; var S = J.steps[k];
      for (var n in map.nodes) {
        var d = map.nodes[n].def, gh = d.p > k || (S.ghost && S.ghost.indexOf(n) >= 0), sub = S.subs && S.subs[n];
        map.sub(n, sub || null);
        map.node(n, gh ? "ghost" : d.p === k ? "new" : "", sub && !gh ? "swap" : "");
      }
      for (var e in map.edges) {
        var x = map.edges[e].def, hidden = x.p > k || (x.until != null && k > x.until);
        map.edge(e, hidden ? "ghost" : x.p === k ? "new" : "seen", hidden ? 0 : map.natural(e));
      }
      Array.prototype.forEach.call($("phases").children, function (b, j) { b.setAttribute("aria-pressed", j === k ? "true" : "false"); b.classList.toggle("reached", j < k); });
      $("st-title").textContent = S.title; $("st-text").textContent = S.text;
      $("st-items").innerHTML = "<ul>" + S.items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
      $("st-gate").innerHTML = S.gate ? "<div class='gate'>" + esc(S.gate) + "</div>" : "<p class='mut'>É o ponto de partida.</p>";
      $("prev").disabled = k === 0; $("next").disabled = k === J.steps.length - 1;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } $("play").textContent = "▶ Play"; }
    $("phases").addEventListener("click", function (ev) { var b = ev.target.closest(".ph"); if (b) { stop(); set(+b.getAttribute("data-k")); } });
    $("play").addEventListener("click", function () {
      if (timer) { stop(); return; }
      set(0); this.textContent = "❚❚ Pausar";
      timer = setInterval(function () { if (cur >= J.steps.length - 1) { stop(); return; } set(cur + 1); }, 3200);
    });
    $("prev").addEventListener("click", function () { stop(); if (cur > 0) set(cur - 1); });
    $("next").addEventListener("click", function () { stop(); if (cur < J.steps.length - 1) set(cur + 1); });
    live = { stop: stop, key: function (k) {
      if (k === "ArrowRight") { stop(); if (cur < J.steps.length - 1) set(cur + 1); }
      else if (k === "ArrowLeft") { stop(); if (cur > 0) set(cur - 1); }
      else if (k === " ") $("play").click(); else return false;
      return true;
    } };
    set(J.steps.length - 1);
    lock($("st-text"), J.steps.map(function (s) { return esc(s.text); }));
  }

  /* ---------- 2 · Base ---------- */
  function base() {
    var n = 0;
    view.innerHTML = head("2 · Base", "A base, passo a passo",
        "Cada passo termina com algo que roda. Nenhum deles depende de um agente para começar. Os marcados já estão em código, com teste: falta rodar no ambiente.") +
      "<div class='rail'><div class='rhead'><span></span><span>Passo</span><span>Pronto quando</span><span>Onde</span></div>" + T.base.map(function (g) {
        return "<section class='rsec'><header><b>" + esc(g.phase) + "</b><small>" + esc(g.when) + "</small></header>" + g.steps.map(function (s) {
          return "<div class='rstep'><span class='n'>" + pad(++n) + "</span><b>" + esc(s[0]) + "</b><p>" + esc(s[1]) + "</p><span class='tagc'>" + esc(s[2]) + (s[3] ? "<i>em código</i>" : "") + "</span></div>"; }).join("") + "</section>"; }).join("") + "</div>" +
      "<div class='below'><div><h2>Seis repositórios</h2><p class='sub'>Cada peça no seu lugar. O pull request de um agente passa pelos mesmos gates de um pull request humano.</p></div><div class='cols n6'>" +
      T.repos.map(function (r) { return "<div class='col'><h3 class='mono'>" + esc(r[0]) + "</h3><p>" + esc(r[1]) + "</p></div>"; }).join("") + "</div></div>";
  }

  /* ---------- 3 · Recursos ---------- */
  function recursos() {
    function when(w) { return "<small class='" + (w === "agora" ? "w-now" : w === "pronto" ? "w-done" : "") + "'>" + esc(w) + "</small>"; }
    view.innerHTML = head("3 · Recursos", "O que pedir para começar",
        "Um ambiente de dev, pequeno, para validar de ponta a ponta. Produção entra depois do primeiro fluxo completo.") +
      "<div class='cards'>" + T.resources.map(function (g) {
        return "<div class='card'><h3>" + esc(g[0]) + "</h3><ul>" + g[1].map(function (i) { return "<li><span>" + esc(i[0]) + "</span>" + when(i[1]) + "</li>"; }).join("") + "</ul></div>"; }).join("") + "</div>" +
      "<div class='below'><div><h2>Quem</h2><p class='sub'>A capacidade que os agentes liberam é remanejada conforme os indicadores, não pelo calendário.</p></div><div class='cols n6'>" +
      T.people.map(function (p) { return "<div class='col'><h3>" + esc(p[0]) + "</h3><p>" + esc(p[1]) + "</p></div>"; }).join("") + "</div>" +
      "<p class='sub'>A lista completa, com tamanhos e nomes, fica no repositório <span class='mono'>dw-platform-infra</span>.</p></div>";
  }

  /* ---------- 4 · Times: passar o cursor acende o combinado com cada time ---------- */
  function times() {
    var X = T.teams;
    view.innerHTML = head("4 · Times", "Seis times, um combinado com cada um",
        "O que pedimos, o que cada time recebe e quando. Os pedidos de maior prazo saem na Fase 0.") +
      "<div class='work'>" + stage("<div><h2>Quem entra, e quando</h2><p>Passe o cursor, ou toque, em um time.</p></div><div class='controls'>" + FS + "</div>",
        "<span><i class='l-core'></i>Time de automações</span><span><i class='l-person'></i>Time parceiro</span>") +
      "<aside class='side'><div class='panel'><h2>Os seis times</h2><ul class='items' id='tlist'>" + X.list.map(function (l, i) {
        var d = X.nodes.filter(function (n) { return n.id === l[0]; })[0];
        return "<li data-i='" + i + "'><small>" + esc(l[1]) + "</small><b>" + esc(d.t) + "</b></li>"; }).join("") + "</ul></div></aside></div>";
    var map = drawMap($("map"), X), cap = $("cap"), pinned = null;
    $("map").setAttribute("aria-label", "O time de automações e os seis times parceiros");
    var HINT = "<p class='k'>Como ler</p><p class='hint'>Cada ligação é um combinado: o que pedimos e o que o time recebe.</p>";
    function clear() { Array.prototype.forEach.call($("tlist").children, function (li) { li.classList.remove("on"); }); }
    function reset() { map.idle(); cap.innerHTML = HINT; clear(); }
    function capOf(i) { var l = X.list[i]; return "<p class='k'>" + esc(l[1]) + "</p><h3>" + esc(map.nodes[l[0]].def.t) + "</h3><p><b class='lb'>Pedimos</b>" + esc(l[2]) + "</p><p><b class='lb'>Entregamos</b>" + esc(l[3]) + "</p>"; }
    function showTeam(i) {
      var l = X.list[i], id = l[0];
      for (var n in map.nodes) map.node(n, n === id ? "hi" : n === "us" ? "" : "off");
      for (var e in map.edges) { var x = map.edges[e].def, on = x.a === id || x.b === id; map.edge(e, on ? "hi" : "off", on ? 2 : 0); }
      cap.innerHTML = capOf(i);
      clear(); $("tlist").children[i].classList.add("on");
    }
    function bind(el, i) {
      el.addEventListener("mouseenter", function () { if (pinned == null) showTeam(i); });
      el.addEventListener("mouseleave", function () { if (pinned == null) reset(); });
      el.addEventListener("click", function () { if (pinned === i) { pinned = null; reset(); } else { pinned = i; showTeam(i); } });
    }
    X.list.forEach(function (l, i) { bind($("tlist").children[i], i); map.nodes[l[0]].base += " click"; bind(map.nodes[l[0]].g, i); });
    reset(); lock(cap, [HINT].concat(X.list.map(function (l, i) { return capOf(i); })));
    live = { stop: function () {}, key: function (k) { if (k === "Escape") { pinned = null; reset(); return true; } return false; } };
  }

  /* ---------- 5 · Agentes ---------- */
  function agentes() {
    var F = T.functions, count = {}, cur = "";
    F.forEach(function (f) { count[f[5]] = (count[f[5]] || 0) + 1; });
    view.innerHTML = head("5 · Agentes", F.length + " funções mapeadas. Só " + count.agente + " pedem um agente.",
        "A regra é a menor arquitetura que resolve: código antes de modelo, modelo antes de agente. Cada degrau a mais custa mais e erra mais.") +
      "<div class='ladder'>" + T.ladder.map(function (l, i) { return "<div><small>" + (i + 1) + (l[2] ? " · " + esc(l[2]) : "") + "</small><b>" + esc(l[0]) + "</b><span>" + esc(l[1]) + "</span></div>"; }).join("") + "</div>" +
      "<div class='below'><div><h2>Todas as funções</h2><p class='sub'>Toque em uma função para ver o antes, o depois e o que continua com pessoas. As marcadas como proposta ainda não estão no plano de fases.</p></div>" +
      "<div class='chips' id='filter'>" + T.groups.map(function (g) { return "<button class='chip' data-g='" + g[0] + "'>" + esc(g[1]) + "<b>" + (g[0] ? count[g[0]] : F.length) + "</b></button>"; }).join("") + "</div>" +
      "<div class='fgrid' id='fgrid'>" + F.map(function (f, i) {
        return "<button class='fcard" + (f[9] ? " named" : "") + "' data-g='" + f[5] + "' aria-expanded='false'><small>" + esc(f[0]) + (f[9] ? " · agente " + esc(f[9]) : "") + "</small><b>" + esc(f[1]) + "</b>" +
          "<span class='chipsm'><i class='g-" + f[5] + "'>" + esc(f[4]) + "</i><i>" + esc(f[6]) + "</i><i>" + (f[10] ? "proposta" : "Fase " + esc(f[8])) + "</i></span>" +
          "<span class='more'><span><em>Hoje</em>" + esc(f[2]) + "</span><span><em>Com a plataforma</em>" + esc(f[3]) + "</span><span><em>Continua com pessoas</em>" + esc(f[7]) + "</span></span></button>"; }).join("") + "</div>" +
      "<div><h2>Como implementar um agente</h2><p class='sub'>Oito passos, os mesmos para todos. Sem conjunto de avaliação, o agente não vai para uso real.</p></div>" +
      "<ol class='stepper'>" + T.build.map(function (b, i) { return "<li><small>" + pad(i + 1) + "</small><b>" + esc(b[0]) + "</b><span>" + esc(b[1]) + "</span></li>"; }).join("") + "</ol>" +
      "<div><h2>O que todo agente tem</h2></div><div class='cols'>" + T.controls.map(function (c) { return "<div class='col'><h3>" + esc(c[0]) + "</h3><p>" + esc(c[1]) + "</p></div>"; }).join("") + "</div></div>";
    function filter(g) {
      cur = g;
      Array.prototype.forEach.call($("filter").children, function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-g") === g ? "true" : "false"); });
      Array.prototype.forEach.call($("fgrid").children, function (c) { c.hidden = !!g && c.getAttribute("data-g") !== g; });
    }
    $("filter").addEventListener("click", function (ev) { var c = ev.target.closest(".chip"); if (c) filter(c.getAttribute("data-g")); });
    $("fgrid").addEventListener("click", function (ev) { var c = ev.target.closest(".fcard"); if (c) c.setAttribute("aria-expanded", c.getAttribute("aria-expanded") === "true" ? "false" : "true"); });
    filter("");
  }

  /* ---------- navegação ---------- */
  var VIEWS = { jornada: jornada, base: base, recursos: recursos, times: times, agentes: agentes };
  function show(tab) {
    if (!VIEWS[tab]) tab = "jornada";
    live.stop(); live = { stop: function () {}, key: null }; locks = [];
    nav.innerHTML = TABS.map(function (t) { return "<button class='tab' data-tab='" + t[0] + "'" + (t[0] === tab ? " aria-current='page'" : "") + "><i>" + t[1] + "</i>" + esc(t[2]) + "</button>"; }).join("") +
      "<a class='tab out' href='../'>A plataforma →</a>";
    VIEWS[tab](); fullscreen();
    try { history.replaceState(null, "", "#" + tab); } catch (e) {}
  }
  nav.addEventListener("click", function (ev) { var b = ev.target.closest("[data-tab]"); if (b) { show(b.getAttribute("data-tab")); window.scrollTo(0, 0); } });
  document.querySelector(".brand").addEventListener("click", function (ev) { ev.preventDefault(); show("jornada"); });
  document.addEventListener("keydown", function (ev) {
    if (!live.key || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    var tag = (ev.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    if (ev.key === " " && tag === "button") return;
    if (live.key(ev.key)) ev.preventDefault();
  });
  window.addEventListener("hashchange", function () { var h = location.hash.replace("#", ""); if (VIEWS[h] && !document.querySelector(".tab[data-tab='" + h + "'][aria-current]")) show(h); });
  show((location.hash || "").replace("#", ""));
})();
