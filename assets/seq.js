/* Desenho em raias: uma coluna por participante, uma linha por etapa. Os serviços do Azure ficam juntos, dentro de uma zona, por camada.
   Mostra, em cada etapa de um processo, por quais recursos ela passa; passar o cursor em um participante mostra em quais etapas ele entra.
   As telas usam com os mesmos controles do mapa (assets/ui.js). */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg", uid = 0, pen = null;
  var GW = 232, CW = 108, BW = 96, BH = 46, TOP = 44, RH = 44, PAD = 10;   /* margem das etapas, coluna, caixa, topo, linha */

  function el(name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  /* largura de um texto na fonte da página, para quebrar o título da etapa em até duas linhas */
  function width(text, font) {
    if (!pen) pen = document.createElement("canvas").getContext("2d");
    pen.font = font;
    return pen.measureText(text).width;
  }
  function wrap(text, font, max) {
    var lines = [""], k = 0;
    text.split(" ").forEach(function (w) {
      var t = lines[k] ? lines[k] + " " + w : w;
      if (lines[k] && k < 1 && width(t, font) > max) lines[++k] = w; else lines[k] = t;
    });
    return lines;
  }

  /* lib: { parts: {id: {t, d, k, g}}, groups: [{id, az, label, short}] }: quem pode participar, o papel de cada um e em que camada fica.
     "|" quebra o título em duas linhas. spec: { parts: [id ou "id:Título"] }: quem participa deste processo.
     steps: [{t, hops: [[de, para, rótulo]]}]; de igual a para é trabalho interno.
     onPick(k): a pessoa escolheu a etapa k. onPeek(p ou null): a pessoa está olhando o participante p ({name, role, rows, of}). */
  function Seq(svg, spec, steps, lib, onPick, onPeek) {
    var id = "q" + (++uid), order = lib.groups.map(function (g) { return g.id; }), run = 0, pinned = null, shown = null;
    var parts = spec.parts.map(function (p) {
      var cut = p.indexOf(":"), pid = cut < 0 ? p : p.slice(0, cut), base = lib.parts[pid];
      return { id: pid, t: cut < 0 ? base.t : p.slice(cut + 1), d: base.d, k: base.k, g: base.g };
    });
    parts.sort(function (a, b) { return order.indexOf(a.g) - order.indexOf(b.g); });   /* por camada; dentro dela, na ordem pedida */
    var n = parts.length, by = {}, P = {}, R = [];
    var W = GW + n * CW + PAD, rows0 = TOP + BH + 16, H = rows0 + steps.length * RH + 12;
    parts.forEach(function (p, c) { p.c = c; p.x = GW + c * CW + CW / 2; by[p.id] = p; });
    var family = window.getComputedStyle(document.body).fontFamily;

    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("class", "map seq");
    svg.style.maxWidth = W + "px";
    svg.style.minWidth = Math.min(W, 1040) + "px";   /* um desenho estreito não é ampliado: o texto tem o mesmo tamanho em todos */
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var defs = el("defs", {});
    ["idle", "ink", "gold"].forEach(function (k) {
      var m = el("marker", { id: id + "-" + k, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, markerUnits: "userSpaceOnUse", orient: "auto-start-reverse" });
      m.appendChild(el("path", { d: "M0 0.8L10 5L0 9.2z", "class": "mk-" + k }));
      defs.appendChild(m);
    });
    svg.appendChild(defs);

    /* a zona do Azure e o nome de cada camada dentro dela */
    var az = parts.filter(function (p) { return lib.groups[order.indexOf(p.g)].az; });
    if (az.length) {
      var zx = GW + az[0].c * CW + 3, zw = az.length * CW - 6;
      svg.appendChild(el("rect", { "class": "zone sq-zone", x: zx, y: 18, width: zw, height: H - 23, rx: 12 }));
      svg.appendChild(el("path", { "class": "sq-hex", transform: "translate(" + (zx + 3) + ",1.5)", d: "M6 0.5l5 2.9v5.8l-5 2.9l-5-2.9V3.4z" }));
      svg.appendChild(el("text", { "class": "zone-l", x: zx + 19, y: 11 }, "AZURE"));
    }
    lib.groups.forEach(function (g) {
      var m = parts.filter(function (p) { return p.g === g.id; });
      if (!m.length || !g.label) return;
      var label = g.label.length * 6.9 <= m.length * CW - 16 ? g.label : g.short;   /* o nome curto, quando a camada tem uma coluna só */
      svg.appendChild(el("text", { "class": "sq-g", x: GW + (m[0].c + m.length / 2) * CW, y: 35 }, label));
      if (az.length && m[0] !== az[0]) svg.appendChild(el("line", { "class": "sq-sep", x1: GW + m[0].c * CW, y1: 24, x2: GW + m[0].c * CW, y2: H - 10 }));
    });
    svg.appendChild(el("text", { "class": "sq-g sq-gl", x: 16, y: TOP + BH / 2 + 3 }, "ETAPAS"));

    var gL = el("g", {}), gR = el("g", {}), gP = el("g", {}), gT = el("g", {});   /* raias, etapas, participantes e o ponto que anda */
    [gL, gR, gP, gT].forEach(function (g) { svg.appendChild(g); });

    /* olhar um participante: as etapas em que ele entra ficam acesas, as outras apagam */
    function peek(pid) {
      shown = pid;
      svg.classList.toggle("pick", !!pid);
      parts.forEach(function (p) { P[p.id].g.classList.toggle("hi", p.id === pid); P[p.id].life.setAttribute("class", "sq-life" + (p.id === pid ? " hi" : "")); });
      R.forEach(function (r) { r.g.classList.toggle("hit", !!pid && r.uses[pid] === 1); });
    }
    function look(pid) {
      peek(pid);
      if (!onPeek) return;
      var p = pid && by[pid];
      onPeek(p ? { name: p.name, role: p.d, rows: R.filter(function (r) { return r.uses[pid]; }).length, of: R.length } : null);
    }
    parts.forEach(function (p) {
      var lines = p.t.split("|"), g = el("g", { "class": "nd click " + p.k, tabindex: 0, role: "button" }), x = p.x - BW / 2;
      var life = el("line", { "class": "sq-life", x1: p.x, y1: TOP + BH, x2: p.x, y2: H - 8 });
      p.name = p.t.replace("|", " ");
      g.setAttribute("aria-label", p.name + ": " + p.d);
      gL.appendChild(life);
      g.appendChild(el("rect", { "class": "box", x: x, y: TOP, width: BW, height: BH, rx: 8 }));
      if (/core/.test(p.k)) g.appendChild(el("rect", { "class": "acc", x: x + 12, y: TOP + 5, width: BW - 24, height: 3, rx: 1.5 }));
      lines.forEach(function (ln, j) { g.appendChild(el("text", { "class": "t", x: p.x, y: TOP + (lines.length > 1 ? 21 + j * 15 : 29) + (/core/.test(p.k) ? 2 : 0) }, ln)); });
      g.addEventListener("mouseenter", function () { if (!pinned) look(p.id); });
      g.addEventListener("mouseleave", function () { if (!pinned) look(null); });
      g.addEventListener("focus", function () { if (!pinned) look(p.id); });
      g.addEventListener("blur", function () { if (!pinned) look(null); });
      g.addEventListener("click", function (ev) { ev.stopPropagation(); pinned = pinned === p.id ? null : p.id; look(pinned); });   /* um toque fixa; outro solta */
      g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ev.stopPropagation(); pinned = pinned === p.id ? null : p.id; look(pinned); } });
      gP.appendChild(g);
      P[p.id] = { g: g, life: life, base: "nd click " + p.k };
    });
    svg.addEventListener("click", function () { if (pinned) { pinned = null; look(null); } });

    /* dois trechos da mesma etapa que se sobrepõem ficam em alturas diferentes; um trecho que continua o anterior fica na mesma altura */
    function lanes(hops) {
      var used = [], out = [], prev = null;
      function free(lane, a, b) { return !used[lane] || used[lane].every(function (r) { return b <= r[0] || a >= r[1]; }); }
      hops.forEach(function (h, j) {
        var a = Math.min(by[h[0]].c, by[h[1]].c), b = Math.max(by[h[0]].c, by[h[1]].c), lane = 0;
        if (prev && prev.to === h[0] && free(prev.lane, a, b)) lane = prev.lane; else while (!free(lane, a, b)) lane++;
        (used[lane] = used[lane] || []).push([a, b]);
        out[j] = lane; prev = { to: h[1], lane: lane };
      });
      return { of: out, n: used.length };
    }

    steps.forEach(function (s, k) {
      var cy = rows0 + k * RH + RH / 2, g = el("g", { "class": "sq-row", "aria-label": "Etapa " + (k + 1) + ": " + s.t });   /* pelo teclado, as etapas andam com as setas e com a barra do palco */
      var L = lanes(s.hops), off = L.n === 1 ? [0] : L.n === 2 ? [-8, 8] : [-12, 0, 12], stops = {}, hops = [], gS = el("g", {}), uses = {};
      s.hops.forEach(function (h) { uses[h[0]] = uses[h[1]] = 1; });
      g.appendChild(el("rect", { "class": "sq-band", x: 4, y: cy - RH / 2 + 2, width: W - 8, height: RH - 4, rx: 6 }));
      g.appendChild(el("rect", { "class": "sq-mark", x: 4, y: cy - RH / 2 + 2, width: 4, height: RH - 4, rx: 2 }));
      g.appendChild(el("text", { "class": "sq-n", x: 16, y: cy + 4 }, pad(k + 1)));
      var lines = wrap(s.t, "700 12.5px " + family, GW + CW / 2 - 42 - 16);   /* o título pode chegar perto da primeira raia: à esquerda dela não há desenho */
      lines.forEach(function (ln, j) { g.appendChild(el("text", { "class": "sq-t", x: 42, y: cy + 4.5 + (j - (lines.length - 1) / 2) * 15 }, ln)); });
      s.hops.forEach(function (h, j) {
        var a = by[h[0]], b = by[h[1]], y = cy + off[L.of[j]], dir = b.x > a.x ? 1 : -1, hop = { self: a === b, x1: a.x, x2: b.x, y: y, to: h[1] };
        if (hop.self) hop.p = el("rect", { "class": "sq-hop sq-self", x: a.x - 8, y: y - 8, width: 16, height: 16, rx: 4 });
        else {
          hop.p = el("path", { "class": "sq-hop", d: "M" + (a.x + dir * 5) + " " + y + "L" + (b.x - dir * 6.5) + " " + y });
          stops[a.id + "/" + y] = [a.x, y]; stops[b.id + "/" + y] = [b.x, y];
          if (h[2]) g.appendChild(el("text", { "class": "sq-l", x: b.x - dir * CW / 2, y: y - 5 }, h[2]));
        }
        g.appendChild(hop.p); hops.push(hop);
      });
      Object.keys(stops).forEach(function (key) { gS.appendChild(el("circle", { "class": "sq-stop", cx: stops[key][0], cy: stops[key][1], r: 3.6 })); });
      g.appendChild(gS);
      g.addEventListener("click", function (ev) { ev.stopPropagation(); if (onPick) onPick(k); });
      gR.appendChild(g);
      R.push({ g: g, hops: hops, uses: uses });
    });

    var token = el("circle", { "class": "token", r: 6 }); token.style.display = "none"; gT.appendChild(token);

    /* estado de um trecho: "" parado, todo (ainda não percorrido no passo atual), run (o ponto está passando), done */
    function hopState(h, st, row) {
      var mk = row === "cur" && st !== "todo" ? "gold" : row === "past" ? "ink" : "idle";
      h.p.setAttribute("class", "sq-hop" + (h.self ? " sq-self" : "") + (st ? " " + st : ""));
      if (!h.self) h.p.setAttribute("marker-end", "url(#" + id + "-" + mk + ")");
    }
    function light(pid, cls) { P[pid].g.setAttribute("class", P[pid].base + (cls ? " " + cls : "") + (pid === shown ? " hi" : "")); }

    var api = {
      parts: parts, rows: R,
      /* estado parado na etapa i (-1: o desenho inteiro, sem destaque). arriving: a etapa vai começar a ser percorrida. */
      paint: function (i, arriving) {
        var act = {}, seen = {};
        steps.forEach(function (s, k) {
          var cls = i < 0 ? "" : k < i ? "past" : k === i ? "cur" : "next";
          R[k].g.setAttribute("class", "sq-row" + (cls ? " " + cls : "") + (shown && R[k].uses[shown] ? " hit" : ""));
          R[k].hops.forEach(function (h) { hopState(h, k === i ? (arriving ? "todo" : "done") : "", cls); });
          s.hops.forEach(function (h) {
            if (k < i) seen[h[0]] = seen[h[1]] = 1;
            if (k === i && !arriving) act[h[0]] = act[h[1]] = 1;
          });
        });
        if (i >= 0 && arriving) act[steps[i].hops[0][0]] = 1;
        parts.forEach(function (p) { light(p.id, act[p.id] ? "act" : seen[p.id] ? "seen" : ""); });
      },
      stop: function () { run++; token.style.display = "none"; },
      peek: function (pid) { pinned = pid || null; look(pinned); },
      peeking: function () { return shown; },
      /* o ponto percorre o trecho j da etapa k; resolve true se chegou, false se foi interrompido */
      travel: function (k, j, ms) {
        var h = R[k].hops[j], my = ++run, t0 = null;
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ms = 1;
        hopState(h, "run", "cur");
        function arrive(done) { token.style.display = "none"; hopState(h, "done", "cur"); light(h.to, "act"); done(true); }
        return new Promise(function (done) {
          if (h.self) { setTimeout(function () { if (my !== run) done(false); else arrive(done); }, Math.min(ms, 360)); return; }
          token.setAttribute("cx", h.x1); token.setAttribute("cy", h.y); token.style.display = "";
          function frame(ts) {
            if (my !== run) { done(false); return; }
            if (t0 == null) t0 = ts;
            var q = Math.min(1, (ts - t0) / ms), e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
            token.setAttribute("cx", h.x1 + (h.x2 - h.x1) * e);
            if (q < 1) requestAnimationFrame(frame); else arrive(done);
          }
          requestAnimationFrame(frame);
        });
      }
    };
    api.paint(-1, false);
    return api;
  }

  (window.DW = window.DW || {}).Seq = Seq;
})();
