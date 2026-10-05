/* Mapa da plataforma: desenha nós e ligações em SVG e expõe o que as telas precisam
   (estado de nó, estado de ligação, segunda linha do nó, ponto que percorre uma ligação, zonas). */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var G0 = { nw: 186, nh: 64, cp: 226, rp: 114, px: 16, py: 30 };
  var POP = 420;   /* quanto dura a entrada de um nó que aparece */
  var uid = 0;

  function el(name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function still() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* linha quebrada com cantos arredondados */
  function pathOf(p) {
    var d = "M" + p[0][0] + " " + p[0][1];
    for (var i = 1; i < p.length - 1; i++) {
      var a = p[i - 1], c = p[i], n = p[i + 1], r = 10;
      var u = [Math.sign(c[0] - a[0]), Math.sign(c[1] - a[1])], v = [Math.sign(n[0] - c[0]), Math.sign(n[1] - c[1])];
      d += " L" + (c[0] - u[0] * r) + " " + (c[1] - u[1] * r) + " Q" + c[0] + " " + c[1] + " " + (c[0] + v[0] * r) + " " + (c[1] + v[1] * r);
    }
    var z = p[p.length - 1];
    return d + " L" + z[0] + " " + z[1];
  }

  /* data: conjunto { nodes, edges, zone ou zones, geo } a desenhar; sem ele, vale window.DW. geo ajusta a grade e a largura máxima.
     Ligação: reta entre vizinhos da mesma linha ou coluna; bend "hv" ou "vh" faz um L; row fixa a linha de uma reta entre nós altos;
     elbow sobe pelo corredor de cima; step [de, até] desce em degrau até o nó da linha de baixo, na coluna ao lado. */
  function DWMap(svg, data) {
    var D = data || window.DW, id = "m" + (++uid), N = {}, E = {}, B = {}, Z = [], run = 0, G = {}, k;
    for (k in G0) G[k] = D.geo && D.geo[k] != null ? D.geo[k] : G0[k];
    var rMin = Math.min.apply(null, D.nodes.map(function (n) { return n.r; }));
    var cMax = Math.max.apply(null, D.nodes.map(function (n) { return n.c; }));
    var rMax = Math.max.apply(null, D.nodes.map(function (n) { return n.r + (n.h || 1) - 1; }));
    var W = G.px * 2 + cMax * G.cp + G.nw, H = G.py * 2 + (rMax - rMin) * G.rp + G.nh;

    function box(n) {
      var x = G.px + n.c * G.cp, y = G.py + (n.r - rMin) * G.rp, h = G.nh + ((n.h || 1) - 1) * G.rp;
      return { x: x, y: y, w: G.nw, h: h, cx: x + G.nw / 2, cy: y + h / 2, c: n.c, r: n.r };
    }
    D.nodes.forEach(function (n) { B[n.id] = box(n); });

    function rowY(r) { return G.py + (r - rMin) * G.rp + G.nh / 2; }
    function points(e) {
      var a = B[e.a], b = B[e.b];
      if (e.step) {                                    /* desce de a, anda no corredor entre as linhas e desce em b */
        var x0 = a.x + G.nw * e.step[0], x1 = b.x + G.nw * e.step[1], my = (a.y + a.h + b.y) / 2;
        return [[x0, a.y + a.h], [x0, my], [x1, my], [x1, b.y]];
      }
      if (e.elbow) {                                   /* sobe, anda no corredor entre as linhas, sobe de novo */
        var x = a.x + G.nw * e.elbow, gy = a.y - (G.rp - G.nh) / 2;
        return [[x, a.y], [x, gy], [b.cx, gy], [b.cx, b.y + b.h]];
      }
      if (e.bend === "hv") {                           /* sai pelo lado de a, anda até a coluna de b e entra por cima ou por baixo */
        var hy = e.row != null ? rowY(e.row) : a.cy, hx = b.x + G.nw * (e.at || 0.5);
        return [[hx > a.cx ? a.x + a.w : a.x, hy], [hx, hy], [hx, b.cy > hy ? b.y : b.y + b.h]];
      }
      if (e.bend === "vh") {                           /* sai por cima ou por baixo de a, anda até a linha de b e entra pelo lado */
        var sx = a.x + G.nw * (e.at || 0.5), sy = e.row != null ? rowY(e.row) : b.cy;
        return [[sx, sy > a.cy ? a.y + a.h : a.y], [sx, sy], [b.cx > sx ? b.x : b.x + b.w, sy]];
      }
      if (a.c === b.c) {                               /* mesma coluna: vertical */
        var vx = a.x + G.nw * (e.at || 0.5);
        return a.y < b.y ? [[vx, a.y + a.h], [vx, b.y]] : [[vx, a.y], [vx, b.y + b.h]];
      }
      var y = e.row != null ? rowY(e.row) : a.h > G.nh ? b.cy : a.cy;   /* nó alto: usa a altura do vizinho, ou a linha pedida */
      return a.x < b.x ? [[a.x + a.w, y], [b.x, y]] : [[a.x, y], [b.x + b.w, y]];
    }

    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("class", "map");
    svg.style.maxWidth = D.geo && D.geo.maxW ? D.geo.maxW + "px" : "";
    svg.style.minWidth = "";
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var defs = el("defs", {});
    ["idle", "ink", "gold"].forEach(function (k) {
      var m = el("marker", { id: id + "-" + k, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 9, markerHeight: 9, markerUnits: "userSpaceOnUse", orient: "auto-start-reverse" });
      m.appendChild(el("path", { d: "M0 0.8L10 5L0 9.2z", "class": "mk-" + k }));
      defs.appendChild(m);
    });
    svg.appendChild(defs);

    (D.zones || (D.zone ? [D.zone] : [])).forEach(function (z) {   /* zonas: caixas tracejadas com rótulo, atrás de tudo */
      var m = z.pad != null ? z.pad : 18, x0 = G.px + z.c0 * G.cp - m, y0 = G.py + (z.r0 - rMin) * G.rp - m;
      var x1 = G.px + z.c1 * G.cp + G.nw + m, y1 = G.py + (z.r1 - rMin) * G.rp + G.nh + m;
      var rect = el("rect", { "class": "zone", x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 14 }), label = el("text", { "class": "zone-l", x: x0 + 4, y: y0 - 9 }, z.label);
      svg.appendChild(rect); svg.appendChild(label);
      Z.push({ rect: rect, label: label, pad: m, box: [x0, y0 - 22, x1, y1], nodes: D.nodes.filter(function (n) { return n.c >= z.c0 && n.c <= z.c1 && n.r >= z.r0 && n.r <= z.r1; }).map(function (n) { return n.id; }) });
    });
    /* a zona encolhe para os nós dados que estão dentro dela; devolve a caixa que ela passa a ocupar, com o rótulo, ou null se nenhum está nela */
    function wrap(z, nodes) {
      var a = Infinity, b = Infinity, c = -Infinity, d = -Infinity, pad = z.pad;
      z.nodes.forEach(function (n) { if (nodes.indexOf(n) < 0) return; var q = B[n]; a = Math.min(a, q.x); b = Math.min(b, q.y); c = Math.max(c, q.x + q.w); d = Math.max(d, q.y + q.h); });
      if (a === Infinity) return null;
      z.rect.setAttribute("x", a - pad); z.rect.setAttribute("y", b - pad); z.rect.setAttribute("width", c - a + 2 * pad); z.rect.setAttribute("height", d - b + 2 * pad);
      z.label.setAttribute("x", a - pad + 4); z.label.setAttribute("y", b - pad - 9);
      return [a - pad, b - pad - 22, c + pad, d + pad];
    }

    var gE = el("g", {}), gN = el("g", {}), gT = el("g", {});
    svg.appendChild(gE); svg.appendChild(gN); svg.appendChild(gT);

    D.edges.forEach(function (e) {
      var pts = points(e), d = pathOf(pts), p = el("path", { d: d, "class": "ed" }), hit = el("path", { d: d, "class": "hit" });
      gE.appendChild(p); gE.appendChild(hit);
      E[e.id] = { def: e, p: p, hit: hit, pts: pts };
    });

    D.nodes.forEach(function (n) {
      var b = B[n.id], core = /core/.test(n.k), pad = core ? 24 : 14, g = el("g", { "class": "nd " + n.k });
      var ty = b.h > G.nh ? (n.ports ? b.y + G.nh / 2 + G.rp / 2 - 3 : b.cy - 3) : b.y + 28;   /* nó alto com saídas: título entre a 1ª e a 2ª linha */
      g.appendChild(el("rect", { "class": "box", x: b.x, y: b.y, width: b.w, height: b.h, rx: 10 }));
      if (core) g.appendChild(el("rect", { "class": "acc", x: b.x + 10, y: b.y + 12, width: 4, height: b.h - 24, rx: 2 }));
      g.appendChild(el("text", { "class": "t", x: b.x + pad, y: ty }, n.t));
      var s = el("text", { "class": "s", x: b.x + pad, y: ty + 19 }, n.s);
      g.appendChild(s);
      (n.ports || []).forEach(function (pt) {            /* rótulo de cada saída de um nó alto */
        var left = pt.side === "l";
        g.appendChild(el("text", { "class": "pt", x: left ? b.x + (core ? 22 : 10) : b.x + b.w - 10, y: G.py + (pt.r - rMin) * G.rp + G.nh / 2 + 4, "text-anchor": left ? "start" : "end" }, pt.t));
      });
      if (/person/.test(n.k)) {
        var ic = el("g", { "class": "ico", transform: "translate(" + (b.x + b.w - 30) + "," + (b.y + 13) + ")" });
        ic.appendChild(el("circle", { cx: 8, cy: 5, r: 3.8 }));
        ic.appendChild(el("path", { d: "M1 18c0-4.4 3.2-7 7-7s7 2.6 7 7" }));
        g.appendChild(ic);
      }
      if (/agent/.test(n.k)) g.appendChild(el("path", { "class": "ico", transform: "translate(" + (b.x + b.w - 28) + "," + (b.y + 11) + ")", d: "M8 0l2 6l6 2l-6 2l-2 6l-2-6l-6-2l6-2z" }));
      if (/az/.test(n.k)) g.appendChild(el("path", { "class": "ico", transform: "translate(" + (b.x + b.w - 27) + "," + (b.y + 11) + ")", d: "M7 0.5l6 3.4v6.9l-6 3.4l-6-3.4V3.9z" }));   /* serviço do Azure */
      gN.appendChild(g);
      N[n.id] = { def: n, g: g, s: s, base: "nd " + n.k, hid: false, pop: 0 };
    });

    var token = el("circle", { "class": "token", r: 7 }); token.style.display = "none"; gT.appendChild(token);

    var api = {
      nodes: N, edges: E, zones: Z,
      /* estado visual de um nó: "", off, seen, act, hi, new, ghost, hid (ainda não apareceu). Um nó que sai de hid entra com um movimento curto. */
      node: function (nid, cls, extra) {
        var n = N[nid], hid = cls === "hid", now = Date.now();
        if (n.hid && !hid && !still()) n.pop = now + POP;
        if (hid) n.pop = 0;
        n.hid = hid;
        n.g.setAttribute("class", n.base + (cls ? " " + cls : "") + (extra ? " " + extra : "") + (n.pop > now ? " pop" : ""));
      },
      /* estado de uma ligação e o sentido da seta: 1 = a→b, -1 = b→a, 0 = sem seta, 2 = as duas */
      edge: function (eid, cls, dir) {
        var e = E[eid], mk = cls === "cur" || cls === "hi" || cls === "new" ? "gold" : cls === "seen" ? "ink" : "idle";
        e.p.setAttribute("class", "ed" + (cls ? " " + cls : ""));
        e.p.style.strokeDasharray = ""; e.p.style.strokeDashoffset = "";
        var url = "url(#" + id + "-" + mk + ")";
        if (dir === 1 || dir === 2) e.p.setAttribute("marker-end", url); else e.p.removeAttribute("marker-end");
        if (dir === -1 || dir === 2) e.p.setAttribute("marker-start", url); else e.p.removeAttribute("marker-start");
      },
      /* uma zona aparece, ou some */
      zone: function (k, on) { Z[k].rect.setAttribute("class", "zone" + (on ? "" : " hid")); Z[k].label.setAttribute("class", "zone-l" + (on ? "" : " hid")); },
      /* enquadra só o que um fluxo usa: os nós, as ligações e as zonas em que eles estão. O desenho do fluxo ocupa o palco, sem o resto do mapa em volta. */
      fit: function (nodes, edges) {
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, m = 20;
        function add(a, b, c, d) { x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d); }
        nodes.forEach(function (n) { var b = B[n]; add(b.x, b.y, b.x + b.w, b.y + b.h); });
        edges.forEach(function (e) { E[e].pts.forEach(function (p) { add(p[0], p[1], p[0], p[1]); }); });
        Z.forEach(function (z) { var q = wrap(z, nodes); if (q) add(q[0], q[1], q[2], q[3]); });   /* a zona encolhe para os nós que o fluxo usa dentro dela */
        x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(W, x1 + m); y1 = Math.min(H, y1 + m);
        svg.setAttribute("viewBox", x0 + " " + y0 + " " + (x1 - x0) + " " + (y1 - y0));
        svg.style.maxWidth = Math.round((x1 - x0) * 1.15) + "px";   /* o texto nunca fica muito maior que no mapa inteiro */
        svg.style.minWidth = Math.min(780, Math.round(x1 - x0)) + "px";
      },
      /* segunda linha do nó; sem texto, volta ao padrão */
      sub: function (nid, text) { N[nid].s.textContent = text || N[nid].def.s; },
      /* ligação entre dois nós e o sentido em que foi pedida */
      between: function (a, b) {
        for (var k in E) { var d = E[k].def; if (d.a === a && d.b === b) return { id: k, dir: 1 }; if (d.a === b && d.b === a) return { id: k, dir: -1 }; }
        return null;
      },
      natural: function (eid) { return E[eid].def.bi ? 2 : 1; },
      idle: function () {
        run++; token.style.display = "none";
        for (var n in N) { api.node(n, ""); api.sub(n); }
        for (var e in E) api.edge(e, "", api.natural(e));
        Z.forEach(function (z, k) { api.zone(k, true); });
      },
      stop: function () { run++; token.style.display = "none"; },
      pulse: function (nid) { var g = N[nid].g; g.classList.remove("pulse"); void g.getBoundingClientRect(); g.classList.add("pulse"); },
      /* o ponto percorre a ligação; resolve true se chegou, false se foi interrompido.
         draw: a ligação ainda não está à vista, e a linha se desenha atrás do ponto. */
      travel: function (eid, dir, ms, draw) {
        var p = E[eid].p, L = p.getTotalLength(), my = ++run, t0 = null;
        if (still()) ms = 1;
        if (draw) {
          p.setAttribute("class", "ed draw"); p.removeAttribute("marker-end"); p.removeAttribute("marker-start");
          p.style.strokeDasharray = L + " " + L; p.style.strokeDashoffset = (dir > 0 ? L : -L);
        }
        token.style.display = "";
        return new Promise(function (done) {
          function frame(ts) {
            if (my !== run) { done(false); return; }
            if (t0 == null) t0 = ts;
            var k = Math.min(1, (ts - t0) / ms), q = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
            var pt = p.getPointAtLength((dir > 0 ? q : 1 - q) * L);
            token.setAttribute("cx", pt.x); token.setAttribute("cy", pt.y);
            if (draw) p.style.strokeDashoffset = (dir > 0 ? 1 : -1) * L * (1 - q);
            if (k < 1) requestAnimationFrame(frame); else { token.style.display = "none"; done(true); }
          }
          requestAnimationFrame(frame);
        });
      }
    };
    api.idle();
    return api;
  }

  (window.DW = window.DW || {}).Map = DWMap;
})();
