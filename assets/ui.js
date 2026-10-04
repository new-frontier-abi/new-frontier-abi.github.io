/* Peças comuns às três páginas: navegação, palco, controles do Play, menus de troca e catálogo de funções.
   Cada página monta as próprias telas com estas peças e com o mapa de assets/map.js. */
(function () {
  "use strict";
  var DW = (window.DW = window.DW || {}), U = (DW.ui = {});
  var view = document.getElementById("view"), nav = document.getElementById("nav");
  var PAGES = [["plataforma", "Plataforma", ""], ["automacoes", "Automações", "automacoes/"], ["servicenow", "ServiceNow", "servicenow/"]];

  U.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  U.byId = function (list, id) { return list.filter(function (x) { return x.id === id; })[0]; };
  U.pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var HOP = 560;   /* tempo do ponto em cada trecho das raias */
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  var esc = U.esc;

  var ICON = {
    play: "<svg viewBox='0 0 16 16' aria-hidden='true'><path d='M4.5 2.8v10.4l8.6-5.2z' fill='currentColor' stroke='none'/></svg>",
    pause: "<svg viewBox='0 0 16 16' aria-hidden='true'><path d='M5 3v10M11 3v10'/></svg>",
    again: "<svg viewBox='0 0 16 16' aria-hidden='true'><path d='M3.2 8a4.8 4.8 0 1 0 1.5-3.5M3.2 2.6v2.9h2.9'/></svg>",
    prev: "<svg viewBox='0 0 16 16' aria-hidden='true'><path d='M10 3L5 8l5 5'/></svg>",
    next: "<svg viewBox='0 0 16 16' aria-hidden='true'><path d='M6 3l5 5-5 5'/></svg>",
    full: "<svg viewBox='0 0 16 16' aria-hidden='true'><path d='M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10'/></svg>",
    exit: "<svg viewBox='0 0 16 16' aria-hidden='true'><path d='M6 2.5V6H2.5M13.5 6H10V2.5M10 13.5V10h3.5M2.5 10H6v3.5'/></svg>"
  };

  /* ---------- blocos de página ---------- */
  U.head = function (title, lead) { return "<div class='head'><h1>" + esc(title) + "</h1>" + (lead ? "<p class='lead'>" + esc(lead) + "</p>" : "") + "</div>"; };
  U.sect = function (kicker, title, sub, id) {
    return "<div class='sect'" + (id ? " id='" + id + "'" : "") + ">" + (kicker ? "<p class='eyebrow'>" + esc(kicker) + "</p>" : "") + "<h2>" + esc(title) + "</h2>" + (sub ? "<p class='sub'>" + esc(sub) + "</p>" : "") + "</div>";
  };
  /* legenda: [classe do quadradinho, texto] */
  U.legend = function (items) { return items.map(function (i) { return "<span><i class='l-" + i[0] + "'></i>" + esc(i[1]) + "</span>"; }).join(""); };
  /* tabela: no telefone, cada linha vira um bloco, com o nome da coluna antes de cada valor (data-th) */
  U.table = function (cols, rows, cls) {
    return "<div class='tscroll'><table><thead><tr>" + cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td data-th='" + esc(cols[i]) + "'" + (cls && cls[i] ? " class='" + cls[i] + "'" : "") + ">" + (i === 0 ? "<b>" + esc(c) + "</b>" : esc(c)) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  };
  U.cols = function (items, cls) { return "<div class='cols" + (cls ? " " + cls : "") + "'>" + items.map(function (c) { return "<div class='col'><h3>" + esc(c[0]) + "</h3><p>" + esc(c[1]) + "</p></div>"; }).join("") + "</div>"; };

  /* palco: o que se vê, os controles, o desenho e a legenda. kind "play" traz os controles do Play.
     canvas: "board" troca o mapa por um quadro de cartões; "model", por um quadro que a própria tela monta (js-model). */
  U.stage = function (kind, legend, canvas) {
    var fs = "<button class='ib js-fs' type='button' title='Tela cheia (F)' aria-label='Tela cheia' hidden>" + ICON.full + "</button>";
    var ctl = kind !== "play" ? fs :
      "<button class='btn pri js-play' type='button'></button>" +
      "<div class='ctl-nav'><button class='ib js-prev' type='button' title='Anterior (←)' aria-label='Passo anterior'>" + ICON.prev + "</button>" +
      "<span class='ctl-n js-count'></span><button class='ib js-next' type='button' title='Próximo (→)' aria-label='Próximo passo'>" + ICON.next + "</button></div>" +
      "<button class='ib js-reset' type='button' title='Voltar ao começo' aria-label='Voltar ao começo'>" + ICON.again + "</button>" + fs;
    return "<section class='stage" + (kind === "play" ? " play" : "") + (canvas === "board" ? " deck" : "") + "'><div class='stage-head'><div class='stage-top'><div class='st-text' aria-live='polite'><p class='k js-k' hidden></p><h2 class='js-title'></h2><p class='js-sub'></p></div><div class='ctl'>" + ctl + "</div></div>" +
      (kind === "play" ? "<div class='prog js-prog'></div>" : "") + "</div>" +
      (canvas === "board" ? "<div class='board js-board'></div>" : canvas === "model" ? "<div class='opm js-model'></div>" : "<div class='scroll'><svg class='js-map' role='img'></svg></div>") +
      (legend ? "<div class='legend'>" + legend + "</div>" : "") + "</section>";
  };
  U.steps = function (title) { return "<div class='panel'><h2>" + esc(title || "Passos") + "</h2><ol class='steps js-steps'></ol></div>"; };

  /* um bloco de texto que troca de conteúdo ocupa sempre a altura do maior: nada pula sob o cursor */
  var locks = [];
  function relock() { locks.forEach(function (l) { l.fit(); }); }
  U.lock = function (el, htmls) {
    function fit() {
      if (!el.parentNode) return;
      var m = el.cloneNode(false), max = 0;
      m.removeAttribute("id"); m.removeAttribute("aria-live");
      m.style.cssText = "position:absolute;visibility:hidden;min-height:0;width:" + el.offsetWidth + "px";
      el.parentNode.appendChild(m);
      htmls.forEach(function (h) { m.innerHTML = h; if (m.offsetHeight > max) max = m.offsetHeight; });
      el.parentNode.removeChild(m);
      el.style.minHeight = max + "px";
    }
    locks = locks.filter(function (l) { return l.el !== el; });
    locks.push({ el: el, fit: fit }); fit();
  };
  window.addEventListener("resize", relock);

  /* ---------- quem responde ao teclado: o palco em que a pessoa mexeu por último; sem isso, o principal que estiver à vista ---------- */
  var comps = [], touched = null;
  function register(c) {
    comps.push(c);
    c.root.addEventListener("pointerdown", function () { touched = c; }, true);
    c.root.addEventListener("focusin", function () { touched = c; });
  }
  function stopAll() { comps.forEach(function (c) { if (c.stop) c.stop(); }); comps = []; touched = null; locks = []; }
  /* quanto do palco aparece na tela: uma tecla nunca mexe em algo que não se vê */
  function shows(c, min) {
    var r = (c.root.querySelector(".stage") || c.root).getBoundingClientRect();
    return Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0) > Math.min(min, r.height / 2);
  }
  function listeners() {
    var rest = comps.filter(function (c) { return c !== touched && shows(c, 160); });
    rest.sort(function (a, b) { return (b.primary ? 1 : 0) - (a.primary ? 1 : 0); });
    return (touched && shows(touched, 40) ? [touched] : []).concat(rest);
  }

  /* tela cheia do palco: o botão só aparece onde o navegador permite */
  function fullscreen(work) {
    var b = work.querySelector(".js-fs");
    if (!b || !work.requestFullscreen || !document.fullscreenEnabled) return function () {};
    b.hidden = false;
    function toggle() {
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      var p = work.requestFullscreen(); if (p && p.catch) p.catch(function () {});
    }
    b.addEventListener("click", toggle);
    return toggle;
  }
  document.addEventListener("fullscreenchange", function () {
    each(document.querySelectorAll(".js-fs"), function (b) {
      var on = !!document.fullscreenElement && document.fullscreenElement.contains(b);
      b.innerHTML = on ? ICON.exit : ICON.full; b.title = on ? "Sair da tela cheia (Esc)" : "Tela cheia (F)"; b.setAttribute("aria-label", on ? "Sair da tela cheia" : "Tela cheia");
    });
    relock();
  });

  /* quem aperta um controle vê o palco inteiro: se ele está cortado pela janela, a página rola o mínimo para mostrá-lo */
  function calm() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"; }
  function frame(work) {
    if (document.fullscreenElement) return;
    var r = work.querySelector(".stage").getBoundingClientRect(), vh = window.innerHeight, dy = 0;
    if (r.top < 0) dy = r.top - 8;
    else if (r.bottom > vh) dy = Math.min(r.bottom - vh + 8, r.top - 8);
    if (Math.abs(dy) > 4) window.scrollBy({ top: dy, behavior: calm() });
  }

  /* ---------- menu de troca: grupos de botões em uma linha; um grupo com nome não se separa do nome ao quebrar. item: [id, rótulo, contagem] ---------- */
  U.seg = function (groups, label) {
    return "<div class='seg js-seg' role='group' aria-label='" + esc(label || "Exemplos") + "'>" + groups.map(function (g) {
      return "<span class='seg-grp'>" + (g.name ? "<span class='seg-g'>" + esc(g.name) + "</span>" : "") + g.items.map(function (it) {
        return "<button class='seg-b' type='button' data-s='" + esc(it[0]) + "' aria-pressed='false'>" + esc(it[1]) + (it[2] != null ? "<i>" + esc(it[2]) + "</i>" : "") + "</button>"; }).join("") + "</span>";
    }).join("") + "</div>";
  };
  function segSet(el, id) { each(el.querySelectorAll(".seg-b"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-s") === id ? "true" : "false"); }); }

  /* ---------- mapa de leitura: passar o cursor, ou tocar, mostra o que é a peça ou a ligação ---------- */
  /* o: { data, title, hint, aria, nodes: {id: {k, title, text, html, more: [id, rótulo], group}}, links: [{edges, name, text ou html, k}] }; nó com valor null não reage */
  U.Hover = function (work, o) {
    var svg = work.querySelector(".js-map"), map = DW.Map(svg, o.data), pinned = null;
    var kEl = work.querySelector(".js-k"), tEl = work.querySelector(".js-title"), sEl = work.querySelector(".js-sub"), box = work.querySelector(".st-text");
    svg.setAttribute("aria-label", o.aria || o.title);
    function text(k, title, body, more) {
      kEl.hidden = !k; kEl.textContent = k || ""; tEl.textContent = title;
      sEl.innerHTML = body + (more ? " <button class='link js-more' type='button' data-more='" + esc(more[0]) + "'>" + esc(more[1]) + "</button>" : "");
    }
    function reset() { map.idle(); text("", o.title, esc(o.hint)); }
    function focus(nodes, edges) {
      for (var n in map.nodes) map.node(n, nodes.indexOf(n) >= 0 ? "hi" : "off");
      for (var e in map.edges) map.edge(e, edges.indexOf(e) >= 0 ? "hi" : "off", edges.indexOf(e) >= 0 ? map.natural(e) : 0);
    }
    function showNode(nid, pin) {
      var edges = [], info = (o.nodes && o.nodes[nid]) || {}, def = map.nodes[nid].def;
      for (var e in map.edges) { var d = map.edges[e].def; if (d.a === nid || d.b === nid) edges.push(e); }
      focus((info.group || []).concat([nid]), edges);
      edges.forEach(function (e) { var d = map.edges[e].def; map.node(d.a === nid ? d.b : d.a, ""); });
      text(info.k || "", info.title || def.t, info.html || esc(info.text || def.s), pin ? info.more : null);
    }
    function showLink(i) {
      var l = o.links[i], nodes = [];
      l.edges.forEach(function (e) { var d = map.edges[e].def; nodes.push(d.a, d.b); });
      focus(nodes, l.edges); text(l.k || "Ligação", l.name, l.html || esc(l.text));
    }
    function unpin() { pinned = null; reset(); }
    function bind(el, show, key) {
      el.addEventListener("mouseenter", function () { if (!pinned) show(false); });
      el.addEventListener("mouseleave", function () { if (!pinned) reset(); });
      el.addEventListener("focus", function () { if (!pinned) show(false); });
      el.addEventListener("blur", function () { if (!pinned) reset(); });
      el.addEventListener("click", function (ev) { ev.stopPropagation(); if (pinned === key) unpin(); else { pinned = key; show(true); } });
      el.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ev.stopPropagation(); el.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
    }
    var shown = Object.keys(map.nodes).filter(function (n) { return !o.nodes || o.nodes[n] !== null; });
    shown.forEach(function (n) {
      var g = map.nodes[n].g; map.nodes[n].base += " click";
      g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.setAttribute("aria-label", map.nodes[n].def.t);
      bind(g, function (pin) { showNode(n, pin); }, "n:" + n);
    });
    (o.links || []).forEach(function (l, i) { l.edges.forEach(function (e) { bind(map.edges[e].hit, function () { showLink(i); }, "l:" + i); }); });
    svg.addEventListener("click", function () { if (pinned) unpin(); });
    /* a altura do texto fica travada na do maior */
    var all = [];
    function snap() { all.push(box.innerHTML); }
    reset(); snap();
    shown.forEach(function (n) { showNode(n, true); snap(); });
    (o.links || []).forEach(function (l, i) { showLink(i); snap(); });
    reset(); U.lock(box, all);
    var fs = fullscreen(work);
    var comp = { root: work, map: map, stop: function () {}, pin: function (nid) { pinned = "n:" + nid; showNode(nid, true); }, key: function (k) {
      if (k === "Escape" && pinned) { unpin(); return true; }
      if (k === "f" || k === "F") { fs(); return true; }
      return false;
    } };
    register(comp);
    return comp;
  };

  /* ---------- controles do Play: iguais em todo palco que anda por passos ---------- */
  /* core: { first, count(), index(), go(k, animate) → Promise<bool>, settle(), dwell(k): tempo de leitura, span(k): duração do passo inteiro,
             show(): põe o palco à vista; só quando a pessoa aperta um controle, nunca no meio do Play } */
  function Transport(work, core) {
    var playB = work.querySelector(".js-play"), prevB = work.querySelector(".js-prev"), nextB = work.querySelector(".js-next"), resetB = work.querySelector(".js-reset");
    var countEl = work.querySelector(".js-count"), prog = work.querySelector(".js-prog"), playing = false, token = 0, fs = fullscreen(work);
    function label() {
      var end = core.first < 0 && core.index() >= core.count() - 1;   /* um exemplo que chegou ao fim; na linha do tempo, o Play recomeça do início */
      playB.innerHTML = playing ? ICON.pause + "<span>Pausar</span>" : end ? ICON.again + "<span>De novo</span>" : ICON.play + "<span>Play</span>";
      playB.setAttribute("aria-label", playing ? "Pausar" : end ? "Tocar de novo" : "Tocar os passos");
      playB.title = playing ? "Pausar (espaço)" : "Tocar (espaço)";
    }
    function refresh(running) {
      var i = core.index(), n = core.count();
      countEl.textContent = (i + 1) + " / " + n;
      prevB.disabled = i <= core.first; nextB.disabled = i >= n - 1; resetB.disabled = i <= core.first;
      each(prog.children, function (b, k) {
        b.className = k < i ? "past" : k === i ? "cur" + (running ? " run" : "") : "";
        if (k === i && running) b.style.setProperty("--dwell", core.span(i) + "ms");
      });
      label();
    }
    function pause() { if (playing) { playing = false; token++; } refresh(false); }
    /* o contador e a barra andam no começo do passo; o fim da animação só confirma */
    function jump(k, animate) { pause(); var my = token, going = core.go(k, animate); refresh(false); core.show(); return going.then(function (ok) { if (my === token) refresh(false); return ok; }); }
    function play() {
      if (playing) { pause(); core.settle(); return; }
      playing = true; var my = ++token;
      label(); core.show();
      (function loop(k) {
        var last = k >= core.count() - 1, going = core.go(k, true);
        refresh(!last);   /* a barra do passo enche enquanto ele dura: o caminho e o tempo de leitura */
        going.then(function (ok) {
          if (!ok || my !== token) return;
          if (last) { playing = false; refresh(false); return; }
          wait(core.dwell(k)).then(function () { if (my === token) loop(k + 1); });
        });
      })(core.index() >= core.count() - 1 ? Math.max(core.first, 0) : core.index() + 1);
    }
    prog.innerHTML = "";
    for (var k = 0; k < core.count(); k++) prog.insertAdjacentHTML("beforeend", "<button type='button' data-k='" + k + "' aria-label='Ir para o passo " + (k + 1) + "'></button>");
    prog.addEventListener("click", function (ev) { var b = ev.target.closest("button"); if (b) jump(+b.getAttribute("data-k"), true); });
    playB.addEventListener("click", play);
    prevB.addEventListener("click", function () { if (core.index() > core.first) jump(core.index() - 1, false); });
    nextB.addEventListener("click", function () { if (core.index() < core.count() - 1) jump(core.index() + 1, true); });
    resetB.addEventListener("click", function () { jump(core.first, false); });
    refresh(false);
    return {
      refresh: refresh, pause: pause, jump: jump, play: play, playing: function () { return playing; },
      key: function (k) {
        if (k === "ArrowRight") { if (core.index() < core.count() - 1) jump(core.index() + 1, true); }
        else if (k === "ArrowLeft") { if (core.index() > core.first) jump(core.index() - 1, false); }
        else if (k === " ") play();
        else if (k === "Home") jump(core.first, false);
        else if (k === "f" || k === "F") fs();
        else return false;
        return true;
      }
    };
  }
  /* os controles são refeitos a cada troca de exemplo: sem ouvintes do exemplo anterior */
  function fresh(work) {
    ["js-prog", "js-play", "js-prev", "js-next", "js-reset", "js-fs"].forEach(function (c) {
      var b = work.querySelector("." + c), n = b.cloneNode(c !== "js-prog"); b.parentNode.replaceChild(n, b);
    });
  }

  /* ---------- exemplos: passos que andam sobre um mapa, sobre um desenho em raias ou sobre um quadro de cartões ---------- */
  /* o: { scenarios, data (mapa padrão), lib (participantes das raias), start, tag(sc), card(c) para o quadro, onPick(id) }
     passo no mapa: path (anda pelas ligações) ou on (acende um conjunto de nós); nas raias (sc.seq): hops, os trechos da etapa;
     no quadro: on (cartões; o primeiro é o que fica à vista). sc.focus: só o conjunto do passo atual fica aceso.
     sc.more [aba, exemplo, rótulo] e sc.down (rótulo) põem um atalho no texto do exemplo parado. */
  U.Player = function (root, o) {
    var work = root.querySelector(".work"), segEl = root.querySelector(".js-seg"), stepsEl = work.querySelector(".js-steps");
    var svg = work.querySelector(".js-map"), board = work.querySelector(".js-board"), box = work.querySelector(".st-text");
    var kEl = work.querySelector(".js-k"), tEl = work.querySelector(".js-title"), sEl = work.querySelector(".js-sub");
    var map = null, flow = null, sc = null, i = -1, run = 0, transport = null;
    function pairs(path) { var out = []; for (var k = 0; k < path.length - 1; k++) out.push(map.between(path[k], path[k + 1])); return out; }

    /* estado parado do passo i: o que já passou fica marcado, o passo atual fica em destaque */
    function paintMap(arriving) {
      var inN = {}, inE = {}, seenN = {}, seenE = {}, curE = {}, actN = {}, st = i >= 0 ? sc.steps[i] : null;
      sc.steps.forEach(function (s, k) {
        (s.path || s.on).forEach(function (n) { inN[n] = 1; if (k < i) seenN[n] = 1; });
        if (s.path) pairs(s.path).forEach(function (p) { inE[p.id] = 1; if (k < i) seenE[p.id] = p.dir; if (k === i) curE[p.id] = p.dir; });
      });
      if (st && st.on) st.on.forEach(function (n) { actN[n] = 1; });
      else if (st) { actN[arriving ? st.path[0] : st.path[st.path.length - 1]] = 1; if (!arriving) st.path.forEach(function (n) { seenN[n] = 1; }); }
      for (var n in map.nodes) {
        var sub = (st && st.sub && st.sub[n]) || (sc.sub && sc.sub[n]) || null;
        map.sub(n, sub);
        map.node(n, !inN[n] ? "off" : actN[n] ? "act" : sc.focus && st ? "off" : seenN[n] ? "seen" : "", sub ? "swap" : "");
      }
      for (var e in map.edges) {
        if (!inE[e]) map.edge(e, "off", 0);
        else if (curE[e] && !arriving) map.edge(e, "cur", curE[e]);
        else if (seenE[e]) map.edge(e, "seen", seenE[e]);
        else map.edge(e, "in", 0);
      }
    }
    function paintBoard() {
      var seen = {}, act = {};
      sc.steps.forEach(function (s, k) { s.on.forEach(function (id) { if (k < i) seen[id] = 1; if (k === i) act[id] = 1; }); });
      each(board.children, function (c) { var id = c.getAttribute("data-id"); c.className = c.getAttribute("data-base") + (i < 0 ? "" : act[id] ? " act" : seen[id] ? " seen" : " dim"); });
    }
    /* o texto do palco: o exemplo, parado; o passo atual, andando */
    function caption(k) {
      var s = k >= 0 ? sc.steps[k] : null;
      if (s) return [s.t, esc(s.d || "")];
      return [sc.title, (sc.today ? "<b>Hoje</b>" + esc(sc.today) : esc(sc.lead || "")) + (sc.note ? "<br><b>Proposta</b>" + esc(sc.note) : "") +
        (sc.more ? " <button class='link' type='button' data-go='" + esc(sc.more[0]) + "' data-arg='" + esc(sc.more[1]) + "'>" + esc(sc.more[2]) + "</button>" : "") +
        (sc.down ? " <button class='link js-down' type='button'>" + esc(sc.down) + "</button>" : "")];
    }
    /* nas raias, olhar um participante troca o texto do palco pelo papel dele; ao sair, volta o texto do passo */
    function role(text, n, of) { return esc(text) + " <b class='cnt'>Entra em " + n + " de " + of + " etapas</b>"; }
    function peeked(p) {
      var c = p ? [p.name, role(p.role, p.rows, p.of)] : caption(i);
      tEl.textContent = c[0]; sEl.innerHTML = c[1];
    }
    function paint(arriving) {
      if (board) paintBoard(); else if (flow) flow.paint(i, arriving); else paintMap(arriving);
      if (!(flow && flow.peeking())) { var c = caption(i); tEl.textContent = c[0]; sEl.innerHTML = c[1]; }   /* o texto do participante fica enquanto a pessoa olha */
      if (stepsEl) each(stepsEl.children, function (li, k) { li.className = k === i ? "cur" : k < i ? "past" : ""; if (k === i) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); });
    }
    /* o que está em destaque fica à vista: o cartão do passo, na página; o nó ou a etapa do passo, no desenho que rola de lado */
    function reveal() {
      var smooth = calm();
      if (board) {
        var c = i >= 0 && board.querySelector(".ac[data-id='" + sc.steps[i].on[0] + "']"); if (!c) return;   /* o primeiro cartão do passo é o principal */
        var full = document.fullscreenElement && document.fullscreenElement.contains(board);   /* em tela cheia, quem rola é o quadro */
        var r = c.getBoundingClientRect(), area = board.getBoundingClientRect(), head = work.querySelector(".stage-head").getBoundingClientRect();
        var edge = (full ? area.top : head.bottom) + 12;      /* acima disto, o cartão está escondido */
        var stuck = (full ? area.top : head.height) + 12;     /* até onde o cartão pode subir: o texto do passo fica preso no topo */
        var bottom = (full ? area.bottom : window.innerHeight) - 14, dy = 0;
        if (r.top < edge) dy = r.top - edge;
        else if (r.bottom > bottom) dy = Math.max(0, Math.min(r.bottom - bottom, r.top - stuck));   /* desce sem esconder o começo do cartão */
        if (dy) (full ? board : window).scrollBy({ top: dy, behavior: smooth });
        return;
      }
      var g = flow ? i >= 0 && flow.rows[i].g.querySelector(".sq-hop") : svg.querySelector(".nd.act"), box = svg.parentNode; if (!g) return;
      var a = g.getBoundingClientRect(), b = box.getBoundingClientRect();
      if (a.left < b.left + 8 || a.right > b.right - 8) box.scrollTo({ left: box.scrollLeft + a.left + a.width / 2 - b.left - b.width / 2, behavior: smooth });
    }
    /* anda até o passo k; com animação, o ponto percorre cada ligação do passo */
    function go(k, animate) {
      var my = ++run; if (map) map.stop(); if (flow) flow.stop(); i = k;
      if (i < 0 || !animate) { paint(false); reveal(); return Promise.resolve(true); }
      var st = sc.steps[i], chain = Promise.resolve(true);
      if (flow) {                                      /* nas raias, o ponto percorre cada trecho da etapa */
        paint(true); reveal();
        st.hops.forEach(function (h, j) {
          chain = chain.then(function (ok) { return ok && my === run ? flow.travel(i, j, HOP).then(function (done) { return done && my === run; }) : false; });
        });
        return chain.then(function (ok) { if (ok && my === run) paint(false); return ok && my === run; });
      }
      if (board || !st.path) { paint(false); reveal(); return wait(380).then(function () { return my === run; }); }
      var ps = pairs(st.path);
      paint(true); reveal();
      if (!ps.length) { paint(false); map.pulse(st.path[0]); return wait(500).then(function () { return my === run; }); }
      ps.forEach(function (p, j) {
        chain = chain.then(function (ok) {
          if (!ok || my !== run) return false;
          map.edge(p.id, "act", p.dir);
          return map.travel(p.id, p.dir, 720).then(function (done) {
            if (!done || my !== run) return false;
            map.edge(p.id, "cur", p.dir); map.node(st.path[j], "seen", map.nodes[st.path[j]].g.classList.contains("swap") ? "swap" : "");
            map.node(st.path[j + 1], "act", map.nodes[st.path[j + 1]].g.classList.contains("swap") ? "swap" : "");
            reveal();
            return true;
          });
        });
      });
      return chain.then(function (ok) { if (ok && my === run) paint(false); return ok && my === run; });
    }
    var core = {
      first: -1,
      count: function () { return sc.steps.length; }, index: function () { return i; }, go: go,
      settle: function () { run++; if (map) map.stop(); if (flow) flow.stop(); paint(false); },
      /* tempo de leitura de cada passo: cresce com o tamanho do texto */
      dwell: function (k) { var s = sc.steps[k]; return Math.max(2200, Math.min(5200, 1400 + 32 * ((s.t + (s.d || "")).length))); },
      span: function (k) { var s = sc.steps[k], hops = s.path ? s.path.length - 1 : 0; return (flow ? s.hops.length * HOP : board || !s.path ? 380 : hops ? hops * 720 : 500) + core.dwell(k); },
      show: function () { if (!board) frame(work); }   /* no quadro, quem fica à vista é o cartão do passo */
    };
    function load(id) {
      if (transport) transport.pause();
      run++; sc = U.byId(o.scenarios, id); i = -1;
      if (segEl) segSet(segEl, id);
      var tag = o.tag ? o.tag(sc) : "";
      kEl.hidden = !tag; kEl.textContent = tag;
      if (stepsEl) stepsEl.innerHTML = sc.steps.map(function (s, k) { return "<li data-k='" + k + "'><span class='n'>" + U.pad(k + 1) + "</span><b>" + esc(s.t) + "</b></li>"; }).join("");
      map = flow = null;
      if (board) board.innerHTML = sc.cards.map(o.card).join("");
      else if (sc.seq) { flow = DW.Seq(svg, sc.seq, sc.steps, o.lib, function (k) { transport.jump(k, true); }, peeked); svg.setAttribute("aria-label", sc.title + ": " + sc.steps.length + " etapas"); }
      else { map = DW.Map(svg, sc.map || o.data); svg.setAttribute("aria-label", sc.title); }
      paint(false);
      var all = [];
      for (var k = -1; k < sc.steps.length; k++) { var c = caption(k); all.push("<p class='k'>" + esc(tag || "") + "</p><h2>" + esc(c[0]) + "</h2><p class='js-sub'>" + c[1] + "</p>"); }
      if (flow) flow.parts.forEach(function (p) { all.push("<p class='k'>" + esc(tag || "") + "</p><h2>" + esc(p.name) + "</h2><p class='js-sub'>" + role(p.d, sc.steps.length, sc.steps.length) + "</p>"); });
      U.lock(box, all);
      fresh(work);
      transport = Transport(work, core);
    }
    if (segEl) segEl.addEventListener("click", function (ev) { var b = ev.target.closest(".seg-b"); if (b) { load(b.getAttribute("data-s")); if (o.onPick) o.onPick(b.getAttribute("data-s")); } });
    if (stepsEl) stepsEl.addEventListener("click", function (ev) { var li = ev.target.closest("li"); if (li) transport.jump(+li.getAttribute("data-k"), true); });
    var comp = { root: root, primary: !!o.primary, load: load, current: function () { return sc.id; },
      stop: function () { if (transport) transport.pause(); run++; if (map) map.stop(); if (flow) flow.stop(); },
      key: function (k) { if (k === "Escape" && flow && flow.peeking()) { flow.peek(null); return true; } return transport.key(k); } };
    register(comp);
    load(o.start && U.byId(o.scenarios, o.start) ? o.start : o.scenarios[0].id);
    return comp;
  };

  /* ---------- fases e jornada: uma linha do tempo em cima; o mapa, ou o quadro da tela, mostra o que existe em cada ponto ---------- */
  /* o: { data, steps: [{b, name, when}], apply(k, map) → {title, sub}, subOf(k), start, aria }. Sem mapa no palco, apply recebe null. */
  U.timeline = function (steps) {
    return "<ol class='tl js-tl'>" + steps.map(function (s, k) {
      return "<li><button class='tl-b' type='button' data-k='" + k + "' aria-pressed='false'><i></i><b>" + esc(s.b) + "</b><span>" + esc(s.name) + "</span>" + (s.when ? "<small>" + esc(s.when) + "</small>" : "") + "</button></li>"; }).join("") + "</ol>";
  };
  U.Phased = function (root, o) {
    var work = root.querySelector(".work"), tl = root.querySelector(".js-tl"), svg = work.querySelector(".js-map");
    var tEl = work.querySelector(".js-title"), sEl = work.querySelector(".js-sub"), map = svg ? DW.Map(svg, o.data) : null, cur = 0;
    (svg || work.querySelector(".js-model")).setAttribute("aria-label", o.aria);
    work.querySelector(".stage").classList.add("quiet");   /* a linha do tempo já mostra o progresso */
    function set(k) {
      cur = k; var out = o.apply(k, map);
      tEl.textContent = out.title; sEl.textContent = out.sub;
      each(tl.children, function (li, j) { li.className = j < k ? "reached" : j === k ? "reached now" : ""; li.firstChild.setAttribute("aria-pressed", j === k ? "true" : "false"); });
    }
    var core = {
      first: 0, count: function () { return o.steps.length; }, index: function () { return cur; }, settle: function () {},
      go: function (k) { set(k); return Promise.resolve(true); }, dwell: function () { return 3000; }, span: function () { return 3000; },
      show: function () { frame(work); }
    };
    set(o.start != null ? o.start : o.steps.length - 1);
    var transport = Transport(work, core);
    tl.addEventListener("click", function (ev) { var b = ev.target.closest(".tl-b"); if (b) transport.jump(+b.getAttribute("data-k"), false); });
    U.lock(sEl, o.steps.map(function (s, k) { return esc(o.subOf(k)); }));
    var comp = { root: root, primary: !!o.primary, stop: function () { transport.pause(); }, key: function (k) { return transport.key(k); } };
    register(comp);
    return comp;
  };

  /* ---------- catálogo de funções: filtro por abordagem e cartões que abrem ---------- */
  /* função: [área, função, hoje, com a plataforma, abordagem, grupo, nível, continua com pessoas, fase, agente, proposta, tema]
     by: o campo do filtro; sem ele, o grupo da abordagem (5). Com outro campo, o nome do grupo aparece no alto de cada cartão, no lugar da área. */
  U.functions = function (list, groups, noArea, by) {
    var count = {}; by = by || 5;
    list.forEach(function (f) { count[f[by]] = (count[f[by]] || 0) + 1; });
    var items = groups.filter(function (g) { return !g[0] || count[g[0]]; }).map(function (g) { return [g[0], g[1], g[0] ? count[g[0]] : list.length]; });
    var names = {}; groups.forEach(function (g) { names[g[0]] = g[1]; });
    function small(f) { var t = (by !== 5 ? [names[f[by]]] : noArea ? [] : [f[0]]).concat(f[9] ? ["agente " + f[9]] : []).join(" · "); return t ? "<small>" + esc(t) + "</small>" : ""; }
    return U.seg([{ items: items }], by === 5 ? "Abordagem" : "Tema") + "<div class='fgrid js-fgrid'>" + list.map(function (f) {
      return "<button class='fcard" + (f[9] ? " named" : "") + (f[10] ? " prop" : "") + "' type='button' data-g='" + f[by] + "' aria-expanded='false'>" + small(f) + "<b>" + esc(f[1]) + "</b>" +
        "<span class='chipsm'><i class='g-" + f[5] + "'>" + esc(f[4]) + "</i><i>" + esc(f[6]) + "</i><i>" + (f[10] ? "Proposta" : "Fase " + esc(f[8])) + "</i></span>" +
        "<span class='more'><span><em>Hoje</em>" + esc(f[2]) + "</span><span><em>Com a plataforma</em>" + esc(f[3]) + "</span><span><em>Continua com pessoas</em>" + esc(f[7]) + "</span></span></button>"; }).join("") + "</div>";
  };
  U.Functions = function (root, start) {
    var seg = root.querySelector(".js-seg"), grid = root.querySelector(".js-fgrid");
    function filter(g) { segSet(seg, g); each(grid.children, function (c) { c.hidden = !!g && c.getAttribute("data-g") !== g; }); }
    seg.addEventListener("click", function (ev) { var b = ev.target.closest(".seg-b"); if (b) filter(b.getAttribute("data-s")); });
    grid.addEventListener("click", function (ev) { var c = ev.target.closest(".fcard"); if (c) c.setAttribute("aria-expanded", c.getAttribute("aria-expanded") === "true" ? "false" : "true"); });
    filter(start || "");
  };

  /* ---------- navegação: páginas no cabeçalho, seções logo abaixo, endereço em #seção ou #seção/exemplo ---------- */
  /* cfg: { page, base, tabs: [[id, rótulo]], views: {id: fn(arg)} } */
  U.shell = function (cfg) {
    document.getElementById("pages").innerHTML = PAGES.map(function (p) {
      return "<a href='" + cfg.base + p[2] + "'" + (p[0] === cfg.page ? " aria-current='page'" : "") + ">" + esc(p[1]) + "</a>"; }).join("");
    function show(tab, arg, keep) {
      if (!cfg.views[tab]) { tab = cfg.tabs[0][0]; arg = null; }
      stopAll();
      nav.innerHTML = cfg.tabs.map(function (t, k) { return "<button class='tab' type='button' data-tab='" + t[0] + "'" + (t[0] === tab ? " aria-current='page'" : "") + "><i>" + (k + 1) + "</i>" + esc(t[1]) + "</button>"; }).join("");
      cfg.views[tab](arg);
      U.hash(tab, arg);
      if (!keep) window.scrollTo(0, 0);
    }
    U.hash = function (tab, arg) { try { history.replaceState(null, "", "#" + tab + (arg ? "/" + arg : "")); } catch (e) { /* o endereço fica como está */ } };
    function fromHash() { var h = (location.hash || "").replace("#", "").split("/"); return [h[0], h[1] || null]; }
    nav.addEventListener("click", function (ev) { var b = ev.target.closest("[data-tab]"); if (b) show(b.getAttribute("data-tab")); });
    view.addEventListener("click", function (ev) { var b = ev.target.closest("[data-go]"); if (b) show(b.getAttribute("data-go"), b.getAttribute("data-arg")); });
    document.querySelector(".brand").addEventListener("click", function (ev) { if (cfg.page === "plataforma") { ev.preventDefault(); show(cfg.tabs[0][0]); } });
    document.addEventListener("keydown", function (ev) {
      if (!comps.length || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      var tag = (ev.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if ((ev.key === " " || ev.key === "Enter") && (tag === "button" || tag === "a")) return;
      var order = listeners();
      for (var k = 0; k < order.length; k++) if (order[k].key && order[k].key(ev.key)) { ev.preventDefault(); return; }
    });
    window.addEventListener("hashchange", function () { var h = fromHash(); if (cfg.views[h[0]] && !nav.querySelector("[data-tab='" + h[0] + "'][aria-current]")) show(h[0], h[1]); });
    var h = fromHash(); show(h[0], h[1], true);
    return { show: show };
  };
  U.view = view;
})();
