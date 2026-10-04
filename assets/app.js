/* Telas: 1 plataforma, 2 autoatendimento (POC), 3 agentes, fases. Cada tela monta um mapa e o que fica ao lado dele. */
(function () {
  "use strict";
  var D = window.DW, view = document.getElementById("view"), nav = document.getElementById("nav");
  var TABS = [["plataforma", "1", "Plataforma"], ["autoatendimento", "2", "Autoatendimento"], ["agentes", "3", "Agentes"], ["fases", "", "Fases"]];
  var live = { stop: function () {}, key: null };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function head(eyebrow, title, lead) { return "<div class='head'><p class='eyebrow'>" + esc(eyebrow) + "</p><h1>" + esc(title) + "</h1><p class='lead'>" + esc(lead) + "</p></div>"; }
  function table(cols, rows, cls) {
    return "<div class='tscroll'><table><thead><tr>" + cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td" + (cls && cls[i] ? " class='" + cls[i] + "'" : "") + ">" + (i === 0 ? "<b>" + esc(c) + "</b>" : esc(c)) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  function stage(top, legend, noCaption) {
    return "<section class='stage'><div class='stage-top'>" + top + "</div><div class='scroll'><svg id='map' role='img'></svg></div>" +
      (noCaption ? "" : "<div class='caption' id='cap' aria-live='polite'></div>") + "<div class='legend'>" + legend + "</div></section>";
  }
  /* tela cheia do palco: só aparece onde o navegador permite */
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
  var LEG = "<span><i class='l-core'></i>Peça da plataforma</span><span><i class='l-ext'></i>Já existe hoje</span><span><i class='l-person'></i>Pessoa</span>";

  /* ---------- 1 · A plataforma: passar o cursor acende a peça ou a ligação ---------- */
  function plataforma() {
    view.innerHTML = head("1 · A plataforma", "Quatro peças que conversam entre si",
        "O Automation Hub executa automações em Python. O Now Event Hub distribui os eventos do ServiceNow. O ServiceNow MCP abre o ServiceNow como ferramentas. Os agentes usam as três.") +
      "<div class='work'>" + stage("<div><h2>A estrutura final</h2><p>O ServiceNow aparece duas vezes: à esquerda, como quem pede; à direita, como o sistema que as ferramentas leem e configuram.</p></div><div class='controls'>" + FS + "</div>", LEG) +
      "<aside class='side'><div class='panel'><h2>As quatro peças</h2><ul class='items' id='pieces'>" + D.pieces.map(function (p, i) {
        return "<li data-p='" + i + "'><small>" + esc(p.phase) + "</small><b>" + esc(p.name) + "</b><span>" + esc(p.text) + "</span></li>"; }).join("") + "</ul></div>" +
      "</aside></div>" +
      "<div class='below'><div><h2>Quem fala com quem</h2><p class='sub'>Onze ligações. Cada uma é um contrato entre duas partes.</p></div><ul class='linkgrid' id='links'>" + D.links.map(function (l, i) { return "<li data-l='" + i + "'><b>" + esc(l.name) + "</b><span>" + esc(l.text) + "</span></li>"; }).join("") + "</ul>" +
      "<div><h2>Regras do desenho</h2></div><div class='cols'>" + D.rules.map(function (r) { return "<div class='col'><h3>" + esc(r[0]) + "</h3><p>" + esc(r[1]) + "</p></div>"; }).join("") + "</div></div>";

    var map = D.Map($("map")), cap = $("cap"), pinned = null;
    $("map").setAttribute("aria-label", "Mapa da plataforma: ServiceNow, Automation Hub, Now Event Hub, ServiceNow MCP e agentes");
    var HINT = "<p class='k'>Como ler</p><p class='hint'>Passe o cursor, ou toque, em uma peça ou em uma ligação para ver o que passa por ali.</p>";

    function clearLists() { Array.prototype.forEach.call(view.querySelectorAll("li.on"), function (li) { li.classList.remove("on"); }); }
    function reset() { map.idle(); cap.innerHTML = HINT; clearLists(); }
    function focus(nodes, edges, k, title, text) {
      for (var n in map.nodes) map.node(n, nodes.indexOf(n) >= 0 ? "hi" : "off");
      for (var e in map.edges) map.edge(e, edges.indexOf(e) >= 0 ? "hi" : "off", edges.indexOf(e) >= 0 ? map.natural(e) : 0);
      cap.innerHTML = "<p class='k'>" + esc(k) + "</p><h3>" + esc(title) + "</h3><p>" + esc(text) + "</p>";
    }
    function showLink(i) {
      var l = D.links[i], nodes = [];
      l.edges.forEach(function (e) { var d = map.edges[e].def; nodes.push(d.a, d.b); });
      focus(nodes, l.edges, "Ligação", l.name, l.text); clearLists(); $("links").children[i].classList.add("on");
    }
    function showNode(nid) {
      var edges = [], nodes = [nid], piece = null, def = map.nodes[nid].def;
      for (var e in map.edges) { var d = map.edges[e].def; if (d.a === nid || d.b === nid) edges.push(e); }
      D.pieces.forEach(function (p, i) { if (p.id === nid) piece = i; });
      focus(nodes, edges, piece != null ? D.pieces[piece].phase : "Fora da plataforma", def.t, piece != null ? D.pieces[piece].text : EXTRA[nid]);
      edges.forEach(function (e) { var d = map.edges[e].def, o = d.a === nid ? d.b : d.a; map.node(o, ""); });
      clearLists(); if (piece != null) $("pieces").children[piece].classList.add("on");
    }
    var EXTRA = {
      user: "Quem pede. Nada muda para ele: o pedido continua entrando pelo catálogo do ServiceNow.",
      now: "A origem dos pedidos e dos eventos. Chama o Hub por uma ação de Flow e publica os eventos selecionados.",
      nowapi: "O mesmo ServiceNow, visto como sistema: as ferramentas do MCP leem com as ACLs do usuário e configuram só em sub-produção.",
      llm: "O gateway corporativo de modelos. Único caminho dos agentes para um modelo de linguagem.",
      target: "Onde a automação age: Entra ID, SAP e os demais sistemas com API.",
      client: "Os clientes do MCP: o chat dos funcionários e a IDE do próprio time.",
      ci: "Repositório, testes e deploy. Um pull request de agente passa pelos mesmos gates de um pull request humano.",
      team: "As pessoas do Digital Workplace nos pontos de decisão: priorizar, revisar, aprovar e promover."
    };
    function bind(el, show, key) {
      el.addEventListener("mouseenter", function () { if (!pinned) show(); });
      el.addEventListener("mouseleave", function () { if (!pinned) reset(); });
      el.addEventListener("click", function () { if (pinned === key) { pinned = null; reset(); } else { pinned = key; show(); } });
    }
    D.pieces.forEach(function (p, i) { bind($("pieces").children[i], function () { showNode(p.id); }, "n" + p.id); });
    D.links.forEach(function (l, i) { bind($("links").children[i], function () { showLink(i); }, "l" + i); });
    Object.keys(map.nodes).forEach(function (n) { map.nodes[n].base += " click"; bind(map.nodes[n].g, function () { showNode(n); }, "n" + n); });
    Object.keys(map.edges).forEach(function (e) {
      var li = -1; D.links.forEach(function (l, i) { if (l.edges.indexOf(e) >= 0) li = i; });
      if (li >= 0) bind(map.edges[e].hit, function () { showLink(li); }, "l" + li);
    });
    var all = [HINT];
    D.links.forEach(function (l, i) { showLink(i); all.push(cap.innerHTML); });
    Object.keys(map.nodes).forEach(function (n) { showNode(n); all.push(cap.innerHTML); });
    reset(); lock(cap, all);
    live = { stop: function () {}, key: function (k) { if (k === "Escape") { pinned = null; reset(); return true; } return false; } };
  }

  /* ---------- exemplos sobre o mapa (telas 2 e 3) ---------- */
  function player(groups, startId) {
    var list = []; groups.forEach(function (g) { g.ids.forEach(function (id) { list.push(byId(D.scenarios, id)); }); });
    $("pick").innerHTML = groups.map(function (g) {
      var chips = "<div class='chips'>" + g.ids.map(function (id) { var s = byId(D.scenarios, id); return "<button class='chip' data-s='" + id + "'><b>Fase " + s.phase + "</b>" + esc(s.title) + "</button>"; }).join("") + "</div>";
      return g.name ? "<div class='grp'><p>" + esc(g.name) + "</p>" + chips + "</div>" : chips;
    }).join("");

    var map = D.Map($("map")), cap = $("cap"), stepsEl = $("steps"), sc = null, i = -1, playing = false, token = 0;
    function pairs(path) { var out = []; for (var k = 0; k < path.length - 1; k++) out.push(map.between(path[k], path[k + 1])); return out; }

    function capOf(k) {
      var s = k >= 0 ? sc.steps[k] : null;
      return s ? "<p class='k'>Passo " + (k + 1) + " de " + sc.steps.length + "</p><h3>" + esc(s.t) + "</h3><p>" + esc(s.d) + "</p>"
        : "<p class='k'>" + sc.steps.length + " passos</p><h3>Aperte Play para ver o fluxo andar</h3><p class='hint'>Ou avance passo a passo, pelas setas do teclado ou clicando em um passo da lista.</p>";
    }
    /* estado parado do passo i: o que já passou fica marcado, o passo atual fica em destaque */
    function paint(arriving) {
      var inN = {}, inE = {}, seenN = {}, seenE = {}, curE = {}, st = i >= 0 ? sc.steps[i] : null;
      sc.steps.forEach(function (s, k) {
        s.path.forEach(function (n) { inN[n] = 1; if (k < i) seenN[n] = 1; });
        pairs(s.path).forEach(function (p) { inE[p.id] = 1; if (k < i) seenE[p.id] = p.dir; if (k === i) curE[p.id] = p.dir; });
      });
      var actN = st ? (arriving ? st.path[0] : st.path[st.path.length - 1]) : null;
      if (st && !arriving) st.path.forEach(function (n) { seenN[n] = 1; });
      for (var n in map.nodes) {
        var text = (st && st.sub && st.sub[n]) || (sc.sub && sc.sub[n]) || null;
        map.sub(n, text);
        map.node(n, !inN[n] ? "off" : n === actN ? "act" : seenN[n] ? "seen" : "", text ? "swap" : "");
      }
      for (var e in map.edges) {
        if (!inE[e]) map.edge(e, "off", 0);
        else if (curE[e] && !arriving) map.edge(e, "cur", curE[e]);
        else if (seenE[e]) map.edge(e, "seen", seenE[e]);
        else map.edge(e, "in", 0);
      }
      cap.innerHTML = capOf(i);
      Array.prototype.forEach.call(stepsEl.children, function (li, k) { li.className = k === i ? "cur" : k < i ? "past" : ""; });
      $("prev").disabled = i <= -1; $("next").disabled = i >= sc.steps.length - 1;
    }

    /* anda até o passo k; com animação, o ponto percorre cada ligação do passo */
    function go(k, animate) {
      var my = ++token; map.stop(); i = k;
      if (i < 0 || !animate) { paint(false); return Promise.resolve(my === token); }
      var st = sc.steps[i], ps = pairs(st.path);
      paint(true);
      if (!ps.length) { paint(false); map.pulse(st.path[0]); return wait(500).then(function () { return my === token; }); }
      var chain = Promise.resolve(true);
      ps.forEach(function (p, j) {
        chain = chain.then(function (ok) {
          if (!ok || my !== token) return false;
          map.edge(p.id, "act", p.dir);
          return map.travel(p.id, p.dir, 720).then(function (done) {
            if (!done || my !== token) return false;
            map.edge(p.id, "cur", p.dir); map.node(st.path[j], "seen", map.nodes[st.path[j]].g.classList.contains("swap") ? "swap" : "");
            map.node(st.path[j + 1], "act", map.nodes[st.path[j + 1]].g.classList.contains("swap") ? "swap" : "");
            return true;
          });
        });
      });
      return chain.then(function (ok) { if (ok && my === token) paint(false); return ok && my === token; });
    }
    function stop() { playing = false; $("play").textContent = "▶ Play"; }
    function play() {
      if (playing) { stop(); token++; map.stop(); paint(false); return; }
      playing = true; $("play").textContent = "❚❚ Pausar";
      var k = i >= sc.steps.length - 1 ? 0 : i + 1;
      (function loop(k) {
        go(k, true).then(function (ok) {
          if (!ok || !playing) return;
          if (k >= sc.steps.length - 1) { stop(); return; }
          var my = token; wait(2300).then(function () { if (playing && my === token) loop(k + 1); });
        });
      })(k);
    }
    function load(id) {
      stop(); token++; sc = byId(D.scenarios, id); i = -1;
      Array.prototype.forEach.call($("pick").querySelectorAll(".chip"), function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-s") === id ? "true" : "false"); });
      $("sc-title").textContent = sc.title; $("sc-today").innerHTML = "<b>HOJE</b>" + esc(sc.today);
      $("map").setAttribute("aria-label", sc.title);
      stepsEl.innerHTML = sc.steps.map(function (s, k) { return "<li data-k='" + k + "'><span class='n'>" + (k < 9 ? "0" : "") + (k + 1) + "</span><span>" + esc(s.t) + "</span></li>"; }).join("");
      map.idle(); paint(false);
      locks = []; var all = [capOf(-1)]; sc.steps.forEach(function (s, k) { all.push(capOf(k)); }); lock(cap, all);
    }
    $("pick").addEventListener("click", function (ev) { var c = ev.target.closest(".chip"); if (c) load(c.getAttribute("data-s")); });
    stepsEl.addEventListener("click", function (ev) { var li = ev.target.closest("li"); if (li) { stop(); go(+li.getAttribute("data-k"), true); } });
    $("play").addEventListener("click", play);
    $("prev").addEventListener("click", function () { stop(); go(i - 1, false); });
    $("next").addEventListener("click", function () { stop(); go(i + 1, true); });
    $("reset").addEventListener("click", function () { stop(); go(-1, false); });
    live = { stop: function () { stop(); token++; map.stop(); }, key: function (k) {
      if (k === "ArrowRight") { if (i < sc.steps.length - 1) { stop(); go(i + 1, true); } }
      else if (k === "ArrowLeft") { if (i > -1) { stop(); go(i - 1, false); } }
      else if (k === " ") play(); else return false;
      return true;
    } };
    load(startId && byId(list, startId) ? startId : list[0].id);
  }
  function playerShell(eyebrow, title, lead, below) {
    view.innerHTML = head(eyebrow, title, lead) + "<div class='pick' id='pick'></div><div class='work'>" +
      stage("<div><h2 id='sc-title'></h2><p id='sc-today'></p></div><div class='controls'><button class='btn pri' id='play'>▶ Play</button><button class='btn' id='prev'>Anterior</button><button class='btn' id='next'>Próximo</button><button class='btn' id='reset'>Reiniciar</button>" + FS + "</div>",
        "<span><i class='l-act'></i>Passo atual</span><span><i class='l-new'></i>Já percorrido</span>" + LEG + "<span><kbd>←</kbd> <kbd>→</kbd> passos · <kbd>espaço</kbd> play</span>", true) +
      "<aside class='side'><div class='panel now'><div class='caption' id='cap' aria-live='polite'></div></div><div class='panel'><h2>Passos</h2><ol class='steps' id='steps'></ol></div></aside></div><div class='below'>" + below + "</div>";
  }

  /* ---------- 2 · Autoatendimento no ServiceNow (POC) ---------- */
  function autoatendimento(arg) {
    playerShell("2 · Autoatendimento no ServiceNow", "A POC: o Digital Workplace se serve primeiro",
      "Antes de qualquer agente, a plataforma atende pedidos reais do nosso próprio ServiceNow. Três fluxos mostram o que muda: o pedido resolvido sem toque, o evento que dispara a automação e o time se servindo pelas ferramentas.",
      "<div><h2>A POC em uma página</h2><p class='sub'>A linha de base é medida antes de começar. As metas numéricas são definidas depois dela.</p></div><div class='cols'>" +
      D.poc.map(function (c) { return "<div class='col'><h3>" + esc(c[0]) + "</h3><ul>" + c[1].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>"; }).join("") + "</div>");
    player(D.acts.autoatendimento, arg);
  }

  /* ---------- 3 · Agentes ---------- */
  function agentes(arg) {
    playerShell("3 · Agentes", "Agentes no trabalho repetitivo, pessoas nas decisões",
      "Com a plataforma de pé, os agentes entram em três frentes: a operação do ServiceNow, o time de automações e as operações que pedem automações. Cada agente entrega algo que uma pessoa revisa.",
      "<div><h2>O que muda no trabalho de cada papel</h2><p class='sub'>A capacidade liberada é remanejada conforme os indicadores de lead time e de qualidade, não pelo calendário.</p></div>" +
      table(["Papel", "Deixa de", "Passa a"], D.roles, ["nb", "was", ""]) +
      "<div><h2>Os sete agentes</h2><p class='sub'>Cada um recebe uma entrada estruturada e devolve algo que uma pessoa aprova.</p></div>" +
      table(["Agente", "Assume", "Entrega", "Fase"], D.agents, ["nb", "", "", "nb"]) +
      "<div><h2>Onde um agente não entra</h2></div><div class='cols'>" + D.notAgent.map(function (r) { return "<div class='col'><h3>" + esc(r[0]) + "</h3><p>" + esc(r[1]) + "</p></div>"; }).join("") + "</div>");
    player(D.acts.agentes, arg);
  }

  /* ---------- Fases: o mapa mostra o que existe em cada fase ---------- */
  function fases() {
    view.innerHTML = head("Fases", "Cinco fases: primeiro a fundação, depois os agentes",
        "Escolha uma fase, ou aperte Play, para ver a plataforma nascer. A fundação são as Fases 0 a 2: base, Automation Hub, MCP e Event Hub.") +
      "<div class='phases' id='phases'>" + D.phases.map(function (p, k) { return "<button class='ph' data-k='" + k + "'><b>" + esc(p.n) + "</b><span>" + esc(p.name) + "</span><small>" + esc(p.when) + "</small></button>"; }).join("") + "</div>" +
      "<div class='work'>" + stage("<div><h2 id='ph-title'></h2><p id='ph-goal'></p></div><div class='controls'><button class='btn pri' id='play'>▶ Play</button><button class='btn' id='prev'>Anterior</button><button class='btn' id='next'>Próxima</button>" + FS + "</div>",
        "<span><i class='l-new'></i>Entra nesta fase</span><span><i class='l-core'></i>Construído antes</span><span><i class='l-ext'></i>Já existe hoje</span><span><i class='l-ghost'></i>Ainda não existe</span><span><kbd>←</kbd> <kbd>→</kbd> fases</span>", true) +
      "<aside class='side'><div class='panel'><h2>O que entra</h2><div class='pbody' id='ph-items'></div></div><div class='panel'><h2>Critério de saída</h2><div class='pbody' id='ph-gate'></div></div></aside></div>";
    var map = D.Map($("map")), cur = 1, timer = null;
    $("map").setAttribute("aria-label", "Mapa da plataforma por fase");
    function set(k) {
      cur = k; var P = D.phases[k];
      for (var n in map.nodes) {
        var d = map.nodes[n].def, nw = P.news && P.news[n], last = null;
        for (var j = 0; j <= k; j++) if (D.phases[j].news && D.phases[j].news[n]) last = D.phases[j].news[n];
        map.sub(n, d.p > k ? null : last);
        map.node(n, d.p > k ? "ghost" : nw ? "new" : "");
      }
      for (var e in map.edges) { var p = map.edges[e].def.p; map.edge(e, p > k ? "ghost" : p === k ? "new" : "seen", p > k ? 0 : map.natural(e)); }
      Array.prototype.forEach.call($("phases").children, function (b, j) { b.setAttribute("aria-pressed", j === k ? "true" : "false"); b.classList.toggle("reached", j < k); });
      $("ph-title").textContent = P.n + " · " + P.name + " · " + P.when; $("ph-goal").textContent = P.goal;
      $("ph-items").innerHTML = "<ul>" + P.items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
      $("ph-gate").innerHTML = "<div class='gate'>" + esc(P.gate) + "</div>" + (P.works.length ? "<p class='lab'>Passa a funcionar</p>" + P.works.map(function (id) {
        var s = byId(D.scenarios, id), tab = D.acts.autoatendimento[0].ids.indexOf(id) >= 0 ? "autoatendimento" : "agentes";
        return "<button class='link' data-go='" + tab + "' data-arg='" + id + "'>" + esc(s.title) + " →</button>"; }).join("") : "");
      $("prev").disabled = k === 0; $("next").disabled = k === D.phases.length - 1;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } $("play").textContent = "▶ Play"; }
    $("phases").addEventListener("click", function (ev) { var b = ev.target.closest(".ph"); if (b) { stop(); set(+b.getAttribute("data-k")); } });
    $("play").addEventListener("click", function () {
      if (timer) { stop(); return; }
      set(0); this.textContent = "❚❚ Pausar";
      timer = setInterval(function () { if (cur >= D.phases.length - 1) { stop(); return; } set(cur + 1); }, 3000);
    });
    $("prev").addEventListener("click", function () { stop(); if (cur > 0) set(cur - 1); });
    $("next").addEventListener("click", function () { stop(); if (cur < D.phases.length - 1) set(cur + 1); });
    live = { stop: stop, key: function (k) {
      if (k === "ArrowRight") { stop(); if (cur < D.phases.length - 1) set(cur + 1); }
      else if (k === "ArrowLeft") { stop(); if (cur > 0) set(cur - 1); }
      else if (k === " ") $("play").click(); else return false;
      return true;
    } };
    set(D.phases.length - 1);
    lock($("ph-goal"), D.phases.map(function (p) { return esc(p.goal); }));
  }

  /* ---------- navegação ---------- */
  var VIEWS = { plataforma: plataforma, autoatendimento: autoatendimento, agentes: agentes, fases: fases };
  function show(tab, arg) {
    if (!VIEWS[tab]) tab = "plataforma";
    live.stop(); live = { stop: function () {}, key: null }; locks = [];
    nav.innerHTML = TABS.map(function (t) { return "<button class='tab' data-tab='" + t[0] + "'" + (t[0] === tab ? " aria-current='page'" : "") + ">" + (t[1] ? "<i>" + t[1] + "</i>" : "") + esc(t[2]) + "</button>"; }).join("") +
      "<a class='tab out' href='automacoes/'>Time de automações →</a>";
    VIEWS[tab](arg); fullscreen();
    try { history.replaceState(null, "", "#" + tab); } catch (e) {}
  }
  nav.addEventListener("click", function (ev) { var b = ev.target.closest("[data-tab]"); if (b) { show(b.getAttribute("data-tab")); window.scrollTo(0, 0); } });
  view.addEventListener("click", function (ev) { var b = ev.target.closest("[data-go]"); if (b) { show(b.getAttribute("data-go"), b.getAttribute("data-arg")); window.scrollTo(0, 0); } });
  document.querySelector(".brand").addEventListener("click", function (ev) { ev.preventDefault(); show("plataforma"); });
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
