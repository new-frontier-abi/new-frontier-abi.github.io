/* Peças comuns às três páginas: navegação, palco, controles, menus de troca, fluxos sobre o mapa e catálogo de funções.
   Cada página monta as próprias telas com estas peças e com o mapa de assets/map.js.
   Regra dos controles: nada muda de lugar enquanto a pessoa avança. A página nunca rola sozinha, e os botões têm tamanho fixo. */
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
  function calm() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"; }
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

  /* palco: o texto do passo e os controles em cima, o desenho embaixo e a legenda. kind "play" traz os controles de avançar.
     canvas: "board" troca o mapa por um quadro de cartões. Os controles ficam sempre no mesmo lugar: o texto ao lado tem altura travada. */
  U.stage = function (kind, legend, canvas) {
    var fs = "<button class='ib js-fs' type='button' title='Tela cheia (F)' aria-label='Tela cheia' hidden>" + ICON.full + "</button>";
    var ctl = kind !== "play" ? fs :
      "<button class='ib js-reset' type='button' title='Voltar ao começo (Home)' aria-label='Voltar ao começo'>" + ICON.again + "</button>" +
      "<button class='ib js-prev' type='button' title='Voltar (←)' aria-label='Voltar um passo'>" + ICON.prev + "</button>" +
      "<span class='ctl-n js-count'></span>" +
      "<button class='btn pri js-next' type='button' title='Avançar (→)'><span class='js-next-t'>Avançar</span>" + ICON.next + "</button>" +
      "<i class='ctl-sep' aria-hidden='true'></i>" +
      "<button class='btn js-play' type='button'></button>" + fs;
    return "<section class='stage" + (kind === "play" ? " play" : "") + (canvas === "board" ? " deck" : "") + "'><div class='stage-head'><div class='stage-top'><div class='st-text' aria-live='polite'><p class='k js-k' hidden></p><h2 class='js-title'></h2><p class='js-sub'></p></div><div class='ctl'>" + ctl + "</div></div>" +
      (kind === "play" ? "<div class='prog js-prog'></div>" : "") + "</div>" +
      (canvas === "board" ? "<div class='board js-board'></div>" : "<div class='scroll'><svg class='js-map' role='img'></svg><p class='hint js-hint' hidden></p></div>") +
      (legend ? "<div class='legend'>" + legend + (kind === "play" ? "<span class='keys' aria-hidden='true'><kbd>←</kbd><kbd>→</kbd>passo<kbd>espaço</kbd>tocar<kbd>F</kbd>tela cheia</span>" : "") + "</div>" : "") + "</section>";
  };
  /* a lista de passos, ao lado do palco. Em cima dela, o aviso de proposta; embaixo, os atalhos do exemplo (o desenho técnico, o que o time recebe). */
  U.steps = function (title) { return "<div class='panel'><p class='pnote js-xnote' hidden></p><h2>" + esc(title || "Passos") + "</h2><ol class='steps js-steps'></ol><p class='plinks js-xlinks' hidden></p></div>"; };

  /* um bloco de texto que troca de conteúdo ocupa sempre a altura do maior: nada pula sob o cursor */
  var locks = [], levels = [];
  function relock() { locks.forEach(function (l) { l.fit(); }); levels.forEach(function (f) { f(); }); }
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

  /* trocar o que um palco mostra nunca rola a página: se ela encurta abaixo do que está à vista, o fim dela ganha o espaço que falta */
  var building = false;   /* enquanto uma tela é montada, não há nada a segurar */
  function steady(fn) {
    if (building) { fn(); return; }
    var y = window.scrollY;
    view.style.minHeight = "";
    fn();
    var lack = y + window.innerHeight - document.documentElement.scrollHeight;
    if (lack > 0) view.style.minHeight = Math.ceil(view.getBoundingClientRect().height + lack) + "px";
    if (Math.abs(window.scrollY - y) > 0.5) window.scrollTo(0, y);
  }

  /* ---------- quem responde ao teclado: o palco em que a pessoa mexeu por último; sem isso, o principal que estiver à vista ---------- */
  var comps = [], touched = null;
  function register(c) {
    comps.push(c);
    c.root.addEventListener("pointerdown", function () { touched = c; }, true);
    c.root.addEventListener("focusin", function () { touched = c; });
  }
  function stopAll() { comps.forEach(function (c) { if (c.stop) c.stop(); }); comps = []; touched = null; locks = []; levels = []; }
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

  /* tela cheia: vai o palco e, quando existe, o menu ou a linha do tempo acima dele (host). O botão só aparece onde o navegador permite. */
  function fullscreen(work, host) {
    var b = work.querySelector(".js-fs"), el = host || work;
    if (!b || !el.requestFullscreen || !document.fullscreenEnabled) return function () {};
    b.hidden = false;
    function toggle() {
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      var p = el.requestFullscreen(); if (p && p.catch) p.catch(function () {});
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

  /* ---------- menu de troca: grupos de botões em uma linha; um grupo com nome não se separa do nome ao quebrar. item: [id, rótulo, marca] ---------- */
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

  /* ---------- controles: iguais em todo palco que anda por passos ---------- */
  /* core: { first, count(), index(), go(k, animate) → Promise<bool>, settle(), dwell(k): tempo de leitura, span(k): duração do passo inteiro,
             after() e before(): o que vem depois do último passo e antes do primeiro (o id de outro exemplo, ou nada), leave(dir): vai para lá, unit: o nome disso }
     Avançar é o botão principal: no último passo, leva ao próximo exemplo do menu. Tocar anda sozinho. */
  function Transport(work, core, host) {
    var playB = work.querySelector(".js-play"), prevB = work.querySelector(".js-prev"), nextB = work.querySelector(".js-next"), resetB = work.querySelector(".js-reset");
    var nextT = work.querySelector(".js-next-t"), countEl = work.querySelector(".js-count"), prog = work.querySelector(".js-prog"), playing = false, token = 0, fs = fullscreen(work, host);
    function after() { return core.after ? core.after() : null; }
    function before() { return core.before ? core.before() : null; }
    function label() {
      var end = core.first < 0 && core.index() >= core.count() - 1;   /* um exemplo que chegou ao fim; na linha do tempo, Tocar recomeça do início */
      playB.innerHTML = playing ? ICON.pause + "<span>Pausar</span>" : end ? ICON.again + "<span>De novo</span>" : ICON.play + "<span>Tocar</span>";
      playB.setAttribute("aria-label", playing ? "Pausar" : end ? "Tocar de novo" : "Tocar os passos sozinho");
      playB.title = playing ? "Pausar (espaço)" : "Tocar sozinho (espaço)";
      var last = core.index() >= core.count() - 1, to = last && after();
      nextT.textContent = to ? "Próximo " + (core.unit || "exemplo") : "Avançar";
      nextB.title = to ? "Ir para o próximo " + (core.unit || "exemplo") + " (→)" : "Avançar (→)";
    }
    function refresh(running) {
      var i = core.index(), n = core.count();
      countEl.textContent = (i + 1) + " / " + n;
      prevB.disabled = i <= core.first && !before(); nextB.disabled = i >= n - 1 && !after(); resetB.disabled = i <= core.first;
      each(prog.children, function (b, k) {
        b.className = k < i ? "past" : k === i ? "cur" + (running ? " run" : "") : "";
        if (k === i && running) b.style.setProperty("--dwell", core.span(i) + "ms");
      });
      label();
    }
    function pause() { if (playing) { playing = false; token++; } refresh(false); }
    /* o contador e a barra andam no começo do passo; o fim da animação só confirma */
    function jump(k, animate) { pause(); var my = token, going = core.go(k, animate); refresh(false); return going.then(function (ok) { if (my === token) refresh(false); return ok; }); }
    function forward() { if (core.index() < core.count() - 1) jump(core.index() + 1, true); else if (after()) { pause(); core.leave(1); } }
    function back() { if (core.index() > core.first) jump(core.index() - 1, false); else if (before()) { pause(); core.leave(-1); } }
    function play() {
      if (playing) { pause(); core.settle(); return; }
      playing = true; var my = ++token;
      label();
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
    prevB.addEventListener("click", back);
    nextB.addEventListener("click", forward);
    resetB.addEventListener("click", function () { jump(core.first, false); });
    refresh(false);
    return {
      refresh: refresh, pause: pause, jump: jump, play: play, playing: function () { return playing; },
      key: function (k) {
        if (k === "ArrowRight") forward();
        else if (k === "ArrowLeft") back();
        else if (k === " ") play();
        else if (k === "Home") jump(core.first, false);
        else if (k === "f" || k === "F") fs();
        else return false;
        return true;
      }
    };
  }
  /* os controles são refeitos a cada troca de exemplo: sem ouvintes do exemplo anterior. Cada botão novo fica exatamente onde o antigo estava. */
  function fresh(work) {
    ["js-prog", "js-play", "js-prev", "js-next", "js-reset", "js-fs"].forEach(function (c) {
      var b = work.querySelector("." + c), n = b.cloneNode(c !== "js-prog"); b.parentNode.replaceChild(n, b);
    });
  }

  /* ---------- exemplos: passos que andam sobre um mapa, sobre um desenho em raias ou sobre um quadro de cartões ---------- */
  /* o: { scenarios, data (mapa padrão), lib (participantes das raias), start, tag(sc), card(c) para o quadro, onPick(id), unit (o nome de um exemplo, para o botão),
          build: o mapa não vem pronto; cada peça aparece quando o passo chega nela (um exemplo pode dizer build: false) }
     O aviso de proposta (sc.note) e os atalhos (sc.more, sc.down) ficam ao lado da lista de passos; sem lista, vão no texto do exemplo parado.
     passo no mapa: path (anda pelas ligações) ou on (acende um conjunto de nós); nas raias (sc.seq): hops, os trechos da etapa;
     no quadro: on (cartões; o primeiro é o que fica à vista). sc.focus: só o conjunto do passo atual fica aceso.
     sc.more [aba, exemplo, rótulo] e sc.down (rótulo) são atalhos: para outra tela e para o desenho logo abaixo. */
  U.Player = function (root, o) {
    var work = root.querySelector(".work"), segEl = root.querySelector(".js-seg"), stepsEl = work.querySelector(".js-steps");
    var svg = work.querySelector(".js-map"), board = work.querySelector(".js-board"), box = work.querySelector(".st-text"), hint = work.querySelector(".js-hint");
    var kEl = work.querySelector(".js-k"), tEl = work.querySelector(".js-title"), sEl = work.querySelector(".js-sub");
    var noteEl = work.querySelector(".js-xnote"), linksEl = work.querySelector(".js-xlinks");
    var map = null, flow = null, sc = null, i = -1, run = 0, transport = null, build = false;
    var menu = !!(segEl || o.chain), locked = false;   /* com menu, o palco tem o mesmo tamanho em todos os exemplos: trocar de exemplo não muda nada de lugar */
    function pairs(path, m) { var out = []; for (var k = 0; k < path.length - 1; k++) out.push((m || map).between(path[k], path[k + 1])); return out; }
    function ids(s) { return s.path || s.on; }
    function builds(s) { return s.build != null ? !!s.build : !!o.build; }
    /* o palco enquadra só o que o fluxo usa */
    function frame(m, s) {
      var ns = {}, es = {};
      s.steps.forEach(function (st) { ids(st).forEach(function (n) { ns[n] = 1; }); if (st.path) pairs(st.path, m).forEach(function (p) { es[p.id] = 1; }); });
      m.fit(Object.keys(ns), Object.keys(es));
    }
    /* o desenho, ou o quadro, ocupa a altura do mais alto do menu, até onde o palco inteiro ainda cabe na tela: daí em diante, cada exemplo tem a própria altura.
       A medida é feita em uma cópia vazia, no lugar do original. */
    function level() {
      var real = board || svg;
      if (!menu || !real || document.fullscreenElement) return;
      real.style.minHeight = "";
      if (board && window.getComputedStyle(board).overflowY === "visible") return;   /* no telefone, o quadro acompanha o conteúdo */
      var stage = work.querySelector(".stage"), box0 = stage.getBoundingClientRect(), head = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue("--top")) || 0;
      var top = box0.top + window.scrollY, rest = box0.height - real.getBoundingClientRect().height;   /* onde o palco começa na página e quanto dele não é desenho */
      var room = window.innerHeight - (top <= window.innerHeight * 0.4 ? top : head + 12) - rest - 16;
      var probe = real.cloneNode(false), tall = 0;
      probe.removeAttribute("id"); probe.style.minHeight = "";
      real.parentNode.insertBefore(probe, real); real.style.display = "none";
      o.scenarios.forEach(function (s) {
        if (board) probe.innerHTML = s.cards.map(o.card).join("");
        else if (s.seq) return;
        else { var m = DW.Map(probe, s.map || o.data); if (builds(s)) frame(m, s); }
        tall = Math.max(tall, probe.getBoundingClientRect().height);
      });
      real.parentNode.removeChild(probe); real.style.display = "";
      tall = Math.floor(Math.min(tall, room));
      if (tall > 0) real.style.minHeight = tall + "px";
    }

    /* estado parado do passo i: o que já passou fica marcado, o passo atual fica em destaque.
       Em um mapa que se monta (build), só existe o que os passos até aqui já tocaram; antes do primeiro, só o ponto de partida. */
    function paintMap(arriving) {
      var inN = {}, inE = {}, seenN = {}, seenE = {}, curE = {}, actN = {}, upN = {}, st = i >= 0 ? sc.steps[i] : null;
      sc.steps.forEach(function (s, k) {
        ids(s).forEach(function (n) { inN[n] = 1; if (k < i) seenN[n] = upN[n] = 1; });
        if (s.path) pairs(s.path).forEach(function (p) { inE[p.id] = 1; if (k < i) seenE[p.id] = p.dir; if (k === i) curE[p.id] = p.dir; });
      });
      upN[ids(sc.steps[0])[0]] = 1;
      if (st && st.on) st.on.forEach(function (n) { actN[n] = upN[n] = 1; });
      else if (st) {
        actN[arriving ? st.path[0] : st.path[st.path.length - 1]] = 1; upN[st.path[0]] = 1;
        if (!arriving) st.path.forEach(function (n) { seenN[n] = upN[n] = 1; });
      }
      for (var n in map.nodes) {
        var sub = (st && st.sub && st.sub[n]) || (sc.sub && sc.sub[n]) || null;
        map.sub(n, sub);
        if (build && !upN[n]) map.node(n, "hid");
        else map.node(n, !inN[n] ? "off" : actN[n] ? "act" : sc.focus && st ? "off" : seenN[n] ? "seen" : "", sub ? "swap" : "");
      }
      for (var e in map.edges) {
        if (curE[e] && !arriving) map.edge(e, "cur", curE[e]);
        else if (seenE[e]) map.edge(e, "seen", seenE[e]);
        else if (build) map.edge(e, "hid", 0);
        else map.edge(e, inE[e] ? "in" : "off", 0);
      }
      map.zones.forEach(function (z, k) { map.zone(k, !build || z.nodes.some(function (n) { return upN[n]; })); });
      if (hint) hint.hidden = !(build && i < 0);
    }
    function paintBoard() {
      var seen = {}, act = {};
      sc.steps.forEach(function (s, k) { s.on.forEach(function (id) { if (k < i) seen[id] = 1; if (k === i) act[id] = 1; }); });
      each(board.children, function (c) { var id = c.getAttribute("data-id"); c.className = c.getAttribute("data-base") + (i < 0 ? "" : act[id] ? " act" : seen[id] ? " seen" : " dim"); });
    }
    /* o texto do palco: o exemplo, parado; o passo atual, andando */
    function shortcuts(x) {
      return (x.more ? " <button class='link' type='button' data-go='" + esc(x.more[0]) + "' data-arg='" + esc(x.more[1]) + "'>" + esc(x.more[2]) + "</button>" : "") +
        (x.down ? " <button class='link js-down' type='button'>" + esc(x.down) + "</button>" : "");
    }
    function captionOf(x, k) {
      var s = k >= 0 ? x.steps[k] : null;
      if (s) return [s.t, esc(s.d || "")];
      var body = x.today ? "<b>Hoje</b>" + esc(x.today) : esc(x.lead || "");
      return [x.title, linksEl ? body : body + (x.note ? "<br><b>Proposta</b>" + esc(x.note) : "") + shortcuts(x)];
    }
    function caption(k) { return captionOf(sc, k); }
    /* todos os textos que o palco mostra em um exemplo: o do exemplo parado e o de cada passo */
    function texts(x) {
      var tag = o.tag ? o.tag(x) : "", out = [];
      for (var k = -1; k < x.steps.length; k++) { var c = captionOf(x, k); out.push("<p class='k'>" + esc(tag || "") + "</p><h2>" + esc(c[0]) + "</h2><p class='js-sub'>" + c[1] + "</p>"); }
      return out;
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
    /* o que está em destaque fica à vista sem tirar os controles do lugar: o quadro e o desenho rolam por dentro do palco.
       Só quando o quadro não rola por dentro (telefone) a página acompanha o cartão, com o texto do passo preso no topo. */
    function reveal() {
      var smooth = calm();
      if (board) {
        var c = i >= 0 && board.querySelector(".ac[data-id='" + sc.steps[i].on[0] + "']"); if (!c) return;   /* o primeiro cartão do passo é o principal */
        var inner = window.getComputedStyle(board).overflowY !== "visible";   /* no computador, o quadro rola por dentro do palco */
        var r = c.getBoundingClientRect(), area = board.getBoundingClientRect(), head = work.querySelector(".stage-head").getBoundingClientRect();
        var edge = (inner ? area.top : head.bottom) + 12;      /* acima disto, o cartão está escondido */
        var stuck = (inner ? area.top : head.height) + 12;     /* até onde o cartão pode subir */
        var bottom = (inner ? area.bottom : window.innerHeight) - 14, dy = 0;
        if (r.top < edge) dy = r.top - edge;
        else if (r.bottom > bottom) dy = Math.max(0, Math.min(r.bottom - bottom, r.top - stuck));   /* desce sem esconder o começo do cartão */
        if (dy) (inner ? board : window).scrollBy({ top: dy, behavior: smooth });
        return;
      }
      var g = flow ? i >= 0 && flow.rows[i].g.querySelector(".sq-hop") : svg.querySelector(".nd.act"), area2 = svg.parentNode; if (!g) return;
      var a = g.getBoundingClientRect(), b = area2.getBoundingClientRect();
      if (a.left < b.left + 8 || a.right > b.right - 8) area2.scrollTo({ left: area2.scrollLeft + a.left + a.width / 2 - b.left - b.width / 2, behavior: smooth });
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
          return map.travel(p.id, p.dir, 720).then(function (done) {
            if (!done || my !== run) return false;
            map.edge(p.id, "cur", p.dir); map.node(st.path[j], "seen", map.nodes[st.path[j]].g.classList.contains("swap") ? "swap" : "");
            var sub = (st.sub && st.sub[st.path[j + 1]]) || (sc.sub && sc.sub[st.path[j + 1]]);
            map.node(st.path[j + 1], "act", sub ? "swap" : "");
            map.zones.forEach(function (z, zk) { if (z.nodes.indexOf(st.path[j + 1]) >= 0) map.zone(zk, true); });
            reveal();
            return true;
          });
        });
      });
      return chain.then(function (ok) { if (ok && my === run) paint(false); return ok && my === run; });
    }
    function neighbor(dir) {
      if (!segEl && !o.chain) return null;
      var k = o.scenarios.indexOf(sc) + dir;
      return k >= 0 && k < o.scenarios.length ? o.scenarios[k].id : null;
    }
    var core = {
      first: -1, unit: o.unit,
      count: function () { return sc.steps.length; }, index: function () { return i; }, go: go,
      settle: function () { run++; if (map) map.stop(); if (flow) flow.stop(); paint(false); },
      /* tempo de leitura de cada passo: cresce com o tamanho do texto */
      dwell: function (k) { var s = sc.steps[k]; return Math.max(2200, Math.min(5200, 1400 + 32 * ((s.t + (s.d || "")).length))); },
      span: function (k) { var s = sc.steps[k], hops = s.path ? s.path.length - 1 : 0; return (flow ? s.hops.length * HOP : board || !s.path ? 380 : hops ? hops * 720 : 500) + core.dwell(k); },
      after: function () { return neighbor(1); }, before: function () { return neighbor(-1); },
      leave: function (dir) { var id = neighbor(dir); if (!id) return; load(id); if (o.onPick) o.onPick(id); }
    };
    function load(id) { steady(function () { open(id); }); }
    function open(id) {
      if (transport) transport.pause();
      run++; sc = U.byId(o.scenarios, id); i = -1;
      if (segEl) segSet(segEl, id);
      var tag = o.tag ? o.tag(sc) : "";
      kEl.hidden = !tag; kEl.textContent = tag;
      if (stepsEl) stepsEl.innerHTML = sc.steps.map(function (s, k) { return "<li data-k='" + k + "'><span class='n'>" + U.pad(k + 1) + "</span><b>" + esc(s.t) + "</b></li>"; }).join("");
      if (linksEl) {
        var extra = shortcuts(sc);
        noteEl.hidden = !sc.note; noteEl.innerHTML = sc.note ? "<b>Proposta</b>" + esc(sc.note) : "";
        linksEl.hidden = !extra; linksEl.innerHTML = extra;
      }
      map = flow = null; build = false;
      if (board) { board.innerHTML = sc.cards.map(o.card).join(""); board.scrollTop = 0; }
      else if (sc.seq) { flow = DW.Seq(svg, sc.seq, sc.steps, o.lib, function (k) { transport.jump(k, true); }, peeked); svg.setAttribute("aria-label", sc.title + ": " + sc.steps.length + " etapas"); }
      else {
        map = DW.Map(svg, sc.map || o.data); build = builds(sc); svg.setAttribute("aria-label", sc.title);
        if (build) frame(map, sc);
      }
      if (svg) svg.classList.toggle("build", build);
      if (hint) { hint.textContent = "Avance para montar o fluxo, passo a passo."; hint.hidden = true; }
      paint(false);
      if (menu && !flow) {                                   /* o texto ocupa a altura do maior do menu inteiro, medida uma vez */
        if (!locked) { var whole = []; o.scenarios.forEach(function (x) { whole = whole.concat(texts(x)); }); U.lock(box, whole); locked = true; }
      } else {
        var all = texts(sc);
        if (flow) flow.parts.forEach(function (p) { all.push("<p class='k'>" + esc(tag || "") + "</p><h2>" + esc(p.name) + "</h2><p class='js-sub'>" + role(p.d, sc.steps.length, sc.steps.length) + "</p>"); });
        U.lock(box, all);
      }
      fresh(work);
      transport = Transport(work, core, segEl ? root : null);
    }
    if (segEl) segEl.addEventListener("click", function (ev) { var b = ev.target.closest(".seg-b"); if (b) { load(b.getAttribute("data-s")); if (o.onPick) o.onPick(b.getAttribute("data-s")); } });
    if (stepsEl) stepsEl.addEventListener("click", function (ev) { var li = ev.target.closest("li"); if (li) transport.jump(+li.getAttribute("data-k"), true); });
    var comp = { root: root, primary: !!o.primary, load: load, current: function () { return sc.id; },
      stop: function () { if (transport) transport.pause(); run++; if (map) map.stop(); if (flow) flow.stop(); },
      key: function (k) { if (k === "Escape" && flow && flow.peeking()) { flow.peek(null); return true; } return transport.key(k); } };
    register(comp);
    load(o.start && U.byId(o.scenarios, o.start) ? o.start : o.scenarios[0].id);
    level(); levels.push(level);   /* depois do primeiro exemplo: o texto do palco já tem a altura travada */
    return comp;
  };

  /* ---------- fluxos sobre o mapa da plataforma: o menu, o palco e a lista de passos. O mapa se monta à medida que o fluxo avança. ----------
     groups: [{name, ids: [id ou [id, rótulo]]}]; list: de onde vêm os fluxos (cada um com phase: 1 a 4, ou 5 para proposta). */
  var WALK = [["act", "Passo atual"], ["seen", "Já percorrido"]], KINDS = [["core", "Peça da plataforma"], ["ext", "Já existe hoje"], ["person", "Pessoa"]];
  function phase(s) { return s.phase > 4 ? "Proposta" : "Fase " + s.phase; }
  function picked(groups, list) {
    var out = [];
    groups.forEach(function (g) { g.ids.forEach(function (x) {
      var one = typeof x === "string", s = U.byId(list, one ? x : x[0]);
      out.push(one ? s : Object.assign({}, s, { short: x[1] }));
    }); });
    return out;
  }
  U.flows = function (id, groups, list, label) {
    var all = picked(groups, list), k = 0;
    var items = groups.map(function (g) { return { name: g.name, items: g.ids.map(function () { var s = all[k++]; return [s.id, s.short, s.phase > 4 ? "proposta" : "F" + s.phase]; }) }; });
    return "<div class='part' id='" + id + "'>" + U.seg(items, label || "Fluxos") +
      "<div class='work'>" + U.stage("play", U.legend(WALK.concat(KINDS))) + "<aside class='side'>" + U.steps() + "</aside></div></div>";
  };
  /* o: { start, primary, onPick(id), each(sc): acrescenta campos ao fluxo (more, por exemplo) } */
  U.Flows = function (id, groups, list, o) {
    var all = picked(groups, list).map(function (s) { return o.each ? Object.assign({}, s, o.each(s)) : s; });
    return U.Player(document.getElementById(id), {
      scenarios: all, start: o.start, primary: o.primary, build: true, unit: "fluxo",
      tag: function (s) { return phase(s) + " · " + s.short; }, onPick: o.onPick
    });
  };
  U.phase = phase;

  /* ---------- fases e jornada: uma linha do tempo em cima; o mapa mostra o que existe em cada ponto ---------- */
  /* o: { data, steps: [{b, name, when}], apply(k, map) → {title, sub}, subOf(k), start, aria } */
  U.timeline = function (steps) {
    return "<ol class='tl js-tl'>" + steps.map(function (s, k) {
      return "<li><button class='tl-b' type='button' data-k='" + k + "' aria-pressed='false'><i></i><b>" + esc(s.b) + "</b><span>" + esc(s.name) + "</span>" + (s.when ? "<small>" + esc(s.when) + "</small>" : "") + "</button></li>"; }).join("") + "</ol>";
  };
  U.Phased = function (root, o) {
    var work = root.querySelector(".work"), tl = root.querySelector(".js-tl"), svg = work.querySelector(".js-map");
    var tEl = work.querySelector(".js-title"), sEl = work.querySelector(".js-sub"), map = DW.Map(svg, o.data), cur = 0;
    svg.setAttribute("aria-label", o.aria);
    work.querySelector(".stage").classList.add("quiet");   /* a linha do tempo já mostra o progresso */
    function set(k) {
      cur = k; var out = o.apply(k, map);
      map.hug();   /* cada zona aparece com a primeira peça dela e cresce com as seguintes */
      tEl.textContent = out.title; sEl.textContent = out.sub;
      each(tl.children, function (li, j) { li.className = j < k ? "reached" : j === k ? "reached now" : ""; li.firstChild.setAttribute("aria-pressed", j === k ? "true" : "false"); });
    }
    var core = {
      first: 0, count: function () { return o.steps.length; }, index: function () { return cur; }, settle: function () {},
      go: function (k) { set(k); return Promise.resolve(true); }, dwell: function () { return 3000; }, span: function () { return 3000; }
    };
    set(o.start || 0);   /* começa no primeiro ponto: Avançar monta o resto */
    var transport = Transport(work, core, root);
    tl.addEventListener("click", function (ev) { var b = ev.target.closest(".tl-b"); if (b) transport.jump(+b.getAttribute("data-k"), false); });
    U.lock(sEl, o.steps.map(function (s, k) { return esc(o.subOf(k)); }));
    var comp = { root: root, primary: !!o.primary, stop: function () { transport.pause(); }, key: function (k) { return transport.key(k); } };
    register(comp);
    return comp;
  };

  /* ---------- catálogo de funções: filtro por abordagem e cartões que abrem ---------- */
  /* função: [área, função, hoje, com a plataforma, abordagem, grupo do filtro, nível, continua com pessoas, fase, agente, proposta, tema]
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

  /* ---------- navegação: páginas e seções no cabeçalho, que acompanha a rolagem; no fim de cada tela, a anterior e a próxima.
     O endereço é #seção ou #seção/exemplo, e o botão de voltar do navegador anda pelas seções. ---------- */
  /* cfg: { page, base, tabs: [[id, rótulo]], views: {id: fn(arg)} } */
  U.shell = function (cfg) {
    var here = PAGES.map(function (p) { return p[0]; }).indexOf(cfg.page);
    document.getElementById("pages").innerHTML = PAGES.map(function (p) {
      return "<a href='" + cfg.base + p[2] + "'" + (p[0] === cfg.page ? " aria-current='page'" : "") + ">" + esc(p[1]) + "</a>"; }).join("");
    function pager(tab) {
      var k = cfg.tabs.map(function (t) { return t[0]; }).indexOf(tab), prev = cfg.tabs[k - 1], next = cfg.tabs[k + 1], page = PAGES[here + 1];
      return "<nav class='pager' aria-label='Sequência das telas'>" +
        (prev ? "<button class='pg' type='button' data-go='" + prev[0] + "'><small>Anterior</small><b>" + esc(prev[1]) + "</b></button>" : "<span></span>") +
        (next ? "<button class='pg nx' type='button' data-go='" + next[0] + "'><small>A seguir</small><b>" + esc(next[1]) + "</b></button>" :
          page ? "<a class='pg nx' href='" + cfg.base + page[2] + "'><small>Próxima página</small><b>" + esc(page[1]) + "</b></a>" : "<span></span>") + "</nav>";
    }
    /* a altura do cabeçalho, para o que fica preso logo abaixo dele */
    var top = document.querySelector(".top");
    function measure() { document.documentElement.style.setProperty("--top", (top && window.getComputedStyle(top).position === "sticky" ? top.offsetHeight : 0) + "px"); }
    var shown = null, aim = null;   /* o exemplo que o endereço aponta agora; o trecho da tela a que o endereço leva */
    U.aim = function (el) { aim = el; };
    function show(tab, arg, o) {
      o = o || {};
      if (!cfg.views[tab]) { tab = cfg.tabs[0][0]; arg = null; }
      stopAll(); aim = null;
      if (!o.keep) window.scrollTo(0, 0);
      nav.innerHTML = cfg.tabs.map(function (t, k) { return "<button class='tab' type='button' data-tab='" + t[0] + "'" + (t[0] === tab ? " aria-current='page'" : "") + "><i>" + (k + 1) + "</i>" + esc(t[1]) + "</button>"; }).join("");
      measure();   /* os palcos medem a tela ao nascer */
      view.style.minHeight = ""; building = true;
      try { cfg.views[tab](arg); } finally { building = false; }
      view.insertAdjacentHTML("beforeend", pager(tab));
      var at = "#" + tab + (arg ? "/" + arg : "");
      shown = arg || null;
      try { if (o.push && location.hash !== at) history.pushState(null, "", at); else history.replaceState(null, "", at); } catch (e) { /* o endereço fica como está */ }
      measure();
      if (aim) aim.scrollIntoView();   /* com a tela inteira montada: o trecho pedido fica logo abaixo do cabeçalho */
    }
    U.hash = function (tab, arg) { shown = arg || null; try { history.replaceState(null, "", "#" + tab + (arg ? "/" + arg : "")); } catch (e) { /* o endereço fica como está */ } };
    function fromHash() { var h = (location.hash || "").replace("#", "").split("/"); return [h[0], h[1] || null]; }
    function current() { var t = nav.querySelector("[aria-current]"); return t && t.getAttribute("data-tab"); }
    nav.addEventListener("click", function (ev) { var b = ev.target.closest("[data-tab]"); if (b) show(b.getAttribute("data-tab"), null, { push: true }); });
    view.addEventListener("click", function (ev) { var b = ev.target.closest("[data-go]"); if (!b) return; if (b.tagName === "A") ev.preventDefault(); show(b.getAttribute("data-go"), b.getAttribute("data-arg"), { push: true }); });
    document.querySelector(".brand").addEventListener("click", function (ev) { if (cfg.page === "plataforma") { ev.preventDefault(); show(cfg.tabs[0][0], null, { push: true }); } });
    document.addEventListener("keydown", function (ev) {
      if (!comps.length || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      var tag = (ev.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if ((ev.key === " " || ev.key === "Enter") && (tag === "button" || tag === "a" || tag === "summary")) return;
      var order = listeners();
      for (var k = 0; k < order.length; k++) if (order[k].key && order[k].key(ev.key)) { ev.preventDefault(); return; }
    });
    /* voltar e avançar do navegador, um favorito ou um endereço digitado: a tela muda quando a seção ou o exemplo do endereço mudam */
    window.addEventListener("hashchange", function () { var h = fromHash(); if (cfg.views[h[0]] && (h[0] !== current() || h[1] !== shown)) show(h[0], h[1]); });
    window.addEventListener("resize", measure);
    /* a primeira tela espera a fonte: os desenhos medem o texto para quebrar as linhas */
    function start() { var h = fromHash(); show(h[0], h[1], { keep: true }); }
    var fonts = document.fonts && document.fonts.load ? Promise.all([document.fonts.load("700 15px Manrope"), document.fonts.load("500 12px Manrope")]) : Promise.resolve();
    Promise.race([fonts, wait(1000)]).then(start, start);
    return { show: show };
  };
  U.view = view;
})();
