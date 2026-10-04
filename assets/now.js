/* Página do time do ServiceNow: 1 operação e 2 desenvolvimento (o modelo por fase e, embaixo, cada etapa no Azure), 3 exemplos, 4 agentes, 5 garantias.
   O conteúdo vem de assets/now-data.js e, para as funções, de assets/team-data.js; as peças das telas, de assets/ui.js; as raias, de assets/seq.js. */
(function () {
  "use strict";
  var N = window.NOW, T = window.TEAM, U = window.DW.ui, esc = U.esc, view = U.view;
  function seqOf(id) { return U.byId(N.seqs, id); }
  function down(el) { el.scrollIntoView({ behavior: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }

  /* ---------- 1 e 2 · um modelo por fase: etapas em colunas; embaixo, o desenho em raias de cada etapa ---------- */
  function model(tab, M, arg, title, lead) {
    var ids = [];
    M.stages.forEach(function (s) { s.caps.forEach(function (c) { if (c.seq && ids.indexOf(c.seq) < 0) ids.push(c.seq); }); });
    var seqs = ids.map(function (id) { var s = seqOf(id); return Object.assign({}, s, { more: s.ex ? ["exemplos", s.ex, "Ver o exemplo →"] : null }); });
    seqs.sort(function (a, b) { return (a.ph < b.ph ? -1 : a.ph > b.ph ? 1 : 0); });   /* no menu, na ordem das fases; as propostas por último */

    function cap(c) {
      var tag = c.seq || c.go ? "button" : "div";
      return "<li data-p='" + c.p + "'><" + tag + " class='opm-cap'" + (c.seq ? " type='button' data-seq='" + c.seq + "'" : c.go ? " type='button' data-go='" + c.go[0] + "' data-arg='" + c.go[1] + "'" : "") + ">" +
        "<span class='ph'>" + (c.p > 4 ? "Proposta" : "Fase " + c.p) + "</span><span class='tx'>" + esc(c.t) + "</span>" +
        "<span class='ft'>" + (c.pieces || []).map(function (p) { return "<span class='pz'>" + esc(p) + "</span>"; }).join("") +
        (c.seq ? "<span class='in'>por dentro ↓</span>" : c.go ? "<span class='in'>ver na lista →</span>" : "") + "</span></" + tag + "></li>";
    }
    var board = "<div class='opm-top'><div><span class='lab'>Quem pede</span>" + M.who.map(function (w) { return "<span class='who'>" + esc(w) + "</span>"; }).join("") + "</div>" +
      "<div><span class='lab'>O time usa</span>" + N.pieces.map(function (p) {
        return p.to ? "<a class='pc' data-p='" + p.p + "' href='../#plataforma/" + p.to + "' title='Ver na página da plataforma'>" + esc(p.t) + "</a>" :
          "<span class='pc' data-p='" + p.p + "' data-was='1' title='" + esc(p.tip) + "'>" + esc(p.t) + "</span>"; }).join("") + "</div></div>" +
      "<ol class='opm-row'>" + M.stages.map(function (s, n) {
        return "<li class='opm-s'><div class='opm-h'><i>" + U.pad(n + 1) + "</i><b>" + esc(s.name) + "</b></div><div class='opm-t'><small></small><p></p></div><ul class='opm-c'>" + s.caps.map(cap).join("") + "</ul></li>"; }).join("") + "</ol>";

    view.innerHTML = U.head(title, lead) +
      "<div class='part' id='mo'>" + U.timeline(M.steps.map(function (s) { return { b: s.b, name: s.name, when: s.when }; })) +
      "<div class='work solo'>" + U.stage("play", U.legend([["new", "Entra nesta fase"], ["core", "Já funciona"], ["ghost", "Ainda não existe"], ["team", "Continua com o time"]]), "model") + "</div></div>" +
      "<div class='part' id='tec'>" + U.sect("Técnico", "Por dentro: cada etapa no Azure",
        "Uma linha por etapa, uma coluna por participante. Dentro da zona tracejada está o que roda no Azure. Passe o cursor, ou toque, em um participante para ver o papel dele e em quais etapas entra.") +
      U.seg([{ items: seqs.map(function (s) { return [s.id, s.short, s.ph]; }) }], "Desenhos técnicos") +
      "<div class='work solo'>" + U.stage("play", U.legend(N.seqLegend)) + "</div></div>" +
      "<div class='below'>" + (M.areas ? U.sect(null, "Para quem atende RH, TI e sistemas", "As mesmas peças servem às três frentes. O que muda é o que cada uma ganha, e quando.") +
        "<div class='cols'>" + M.areas.map(function (a) { return "<div class='col'><h3>" + esc(a[0]) + "</h3><ul>" + a[1].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>"; }).join("") + "</div>" : "") +
      U.sect(null, "Como saber se funcionou",
        "A linha de base é medida antes de começar, e as metas saem dela. A capacidade liberada é remanejada conforme estes indicadores, não pelo calendário.") +
      U.cols(M.measures) + "</div>";

    var mo = document.getElementById("mo"), tec = document.getElementById("tec"), canvas = mo.querySelector(".js-model");
    canvas.innerHTML = board;
    canvas.setAttribute("role", "group");
    var cols = canvas.querySelectorAll(".opm-s");
    function apply(k) {
      M.stages.forEach(function (s, n) {
        var live = s.caps.some(function (c) { return c.p <= k; }), fresh = s.caps.some(function (c) { return c.p === k; }), col = cols[n];
        col.className = "opm-s" + (fresh ? " live fresh" : live ? " live" : "");
        col.querySelector(".opm-t small").textContent = live ? "Continua com o time" : "Hoje, com o time";
        col.querySelector(".opm-t p").textContent = live ? s.keeps : s.today;
      });
      Array.prototype.forEach.call(canvas.querySelectorAll("[data-p]"), function (e) {
        var p = +e.getAttribute("data-p"), st = p > k ? "ghost" : p === k ? "new" : "on";
        if (e.tagName === "LI") e.className = st; else e.className = "pc " + (st === "ghost" && e.getAttribute("data-was") ? "was" : st);   /* o que já existe hoje não aparece como tracejado */
      });
      return { title: M.steps[k].title, sub: M.steps[k].text };
    }
    var player = U.Player(tec, { scenarios: seqs, start: arg, lib: N, tag: function (s) { return s.tag; }, onPick: function (id) { U.hash(tab, id); } });
    U.Phased(mo, { steps: M.steps, start: 4, apply: apply, subOf: function (k) { return M.steps[k].text; }, primary: true, aria: M.aria });
    canvas.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-seq]"); if (!b) return;
      player.load(b.getAttribute("data-seq")); U.hash(tab, b.getAttribute("data-seq")); down(tec);
    });
    if (arg && U.byId(seqs, arg)) tec.scrollIntoView();
  }
  function operacao(arg) {
    model("operacao", N.run, arg, "O time decide. O que se repete sai da fila.",
      "O dia a dia de um time que atende RH, TI e sistemas, etapa por etapa: o que a plataforma assume em cada fase e o que continua com as pessoas.");
  }
  function desenvolvimento(arg) {
    model("desenvolvimento", N.dev, arg, "Desenvolver no ServiceNow: menos montagem, mais revisão",
      "Da demanda à promoção. Em cada etapa, o que deixa de ser feito à mão em cada fase. Quem decide e promove continua sendo o time.");
  }

  /* ---------- cartão do quadro: um artefato do ServiceNow ou da plataforma ---------- */
  function chip(st) { return "<i class='st" + (st[0] ? " st-" + st[0] : "") + "'>" + esc(st[1]) + "</i>"; }
  function card(c) {
    var cls = "ac" + (c.wide ? " wide" : ""), body = "";
    if (c.fields) body += "<ul class='fld'>" + c.fields.map(function (f) {
      return "<li><b>" + esc(f.l) + (f.req ? "<em title='obrigatório'>*</em>" : "") + "</b><span class='ty'>" + esc(f.ty) +
        (f.opts ? "<span class='opts'>" + f.opts.map(function (o) { return "<i>" + esc(o) + "</i>"; }).join("") + "</span>" : "") + "</span>" +
        (f.to ? "<span class='to'>→ " + esc(f.to) + "</span>" : "") + "</li>"; }).join("") + "</ul>";
    if (c.form) body += "<div class='pv' role='img' aria-label='Prévia do formulário, como o funcionário vê'>" + c.form.map(function (f) {
      return f.ty === "check" ? "<span class='pv-c'><i" + (f.v ? " class='on'" : "") + "></i>" + esc(f.l) + "</span>" :
        "<span class='pv-f'><small>" + esc(f.l) + (f.req ? "<em>*</em>" : "") + "</small><i class='" + f.ty + (f.ph ? " ph" : "") + "'>" + esc(f.v) + "</i></span>"; }).join("") + "<span class='pv-b'>Pedir</span></div>";
    if (c.steps) body += "<ol class='flow'>" + c.steps.map(function (s) {
      return "<li" + (s.hl ? " class='hl'" : "") + "><small>" + esc(s.k) + "</small>" + (s.t ? "<span>" + esc(s.t) + "</span>" : "") +
        (s.ends ? "<span class='ends'>" + s.ends.map(function (e) { return chip(e); }).join("") + "</span>" : "") + "</li>"; }).join("") + "</ol>";
    if (c.doc) body += "<div class='doc'>" + c.doc.map(function (d) { return "<p><b>" + esc(d[0]) + "</b>" + esc(d[1]) + "</p>"; }).join("") + "</div>";
    if (c.code) body += "<pre class='code'>" + esc(c.code) + "</pre>";
    if (c.rows) body += "<dl class='kv'>" + c.rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>";
    if (c.bar) body += "<div class='slabar' role='img' aria-label='" + esc(c.bar.label) + "'><i style='width:" + c.bar.at + "%'></i><span style='left:" + c.bar.at + "%'>" + esc(c.bar.label) + "</span></div>";
    if (c.items) body += "<ul class='rows'>" + c.items.map(function (i) {
      return "<li" + (i.nw ? " class='new'" : "") + "><span>" + esc(i.t) + (i.s ? "<small>" + esc(i.s) + "</small>" : "") + "</span>" + (i.st ? chip(i.st) : "") + "</li>"; }).join("") + "</ul>";
    if (c.q) body += "<blockquote class='q'>" + esc(c.q) + "</blockquote>";
    return "<article class='" + cls + "' data-id='" + c.id + "' data-base='" + cls + "'><header><small>" + esc(c.k) + "</small><b>" + esc(c.t) + "</b>" + (c.st ? chip(c.st) : "") + "</header>" +
      "<div class='ac-b'>" + body + "</div>" + (c.by ? "<footer>" + esc(c.by) + "</footer>" : "") + "</article>";
  }

  /* ---------- 3 · Exemplos: o que o time recebe; embaixo, o caminho do exemplo escolhido ---------- */
  function exemplos(arg) {
    var items = N.exGroups.map(function (g) { return { name: g.name, items: g.ids.map(function (id) { return [id, U.byId(N.examples, id).short]; }) }; });
    var list = N.examples.map(function (e) { return Object.assign({}, e, { down: "Ver por dentro ↓" }); });
    /* o desenho técnico acompanha o exemplo: o mesmo processo das outras abas, com o aviso do que muda quando o exemplo é proposta */
    var paths = N.examples.map(function (e) { var s = seqOf(e.seq); return Object.assign({}, s, { id: e.id, more: null, note: e.tech || s.note }); });
    view.innerHTML = U.head(N.examples.length + " exemplos do que o time recebe pronto",
        "Oferta, formulário, flow, contrato de SLA e artigo de conhecimento, entre outros. Em todos, o time revisa e decide.") +
      "<div class='part' id='ex'>" + U.seg(items, "Exemplos") +
      "<div class='work'>" + U.stage("play", U.legend([["new", "Passo atual"]]) + "<span class='js-fl'><b class='rq'>*</b>obrigatório</span><span class='js-fl'><b class='ar'>→</b>para onde o valor vai</span>", "board") + "<aside class='side'>" + U.steps() + "</aside></div></div>" +
      "<div class='part' id='tec'>" + U.sect("Técnico", "Por dentro: o caminho deste exemplo no Azure",
        "Uma linha por etapa, uma coluna por participante. Dentro da zona tracejada está o que roda no Azure. Passe o cursor, ou toque, em um participante para ver em quais etapas ele entra.") +
      "<div class='work solo'>" + U.stage("play", U.legend(N.seqLegend)) + "</div></div>";
    var tec = document.getElementById("tec"), ex = document.getElementById("ex");
    /* a legenda dos campos só aparece nos exemplos que têm formulário */
    function legend(id) {
      var has = U.byId(N.examples, id).cards.some(function (c) { return c.fields; });
      Array.prototype.forEach.call(ex.querySelectorAll(".js-fl"), function (e) { e.hidden = !has; });
    }
    var path = U.Player(tec, { scenarios: paths, start: arg, lib: N, tag: function (s) { return s.tag; } });
    var board = U.Player(ex, {
      scenarios: list, start: arg, primary: true, card: card,
      tag: function (c) { return c.tag; }, onPick: function (id) { U.hash("exemplos", id); path.load(id); legend(id); }
    });
    legend(board.current());
    ex.addEventListener("click", function (ev) { if (ev.target.closest(".js-down")) down(tec); });
  }

  /* ---------- 4 · Agentes: cada trabalho de hoje com a menor solução que resolve ---------- */
  function agentes(arg) {
    var F = T.functions.filter(function (f) { return f[11]; });
    var agents = F.filter(function (f) { return f[5] === "agente"; }).length, plan = F.filter(function (f) { return !f[10]; }).length;
    view.innerHTML = U.head(F.length + " trabalhos de hoje que a plataforma assume ou acelera. Só " + agents + " pedem um agente.",
        plan + " estão no plano de fases. Os outros " + (F.length - plan) + " são propostas, para o time escolher. Toque em um cartão para ver o antes, o depois e o que continua com pessoas.") +
      "<div class='part' id='fn'>" + U.functions(F, N.temas, true, 11) + "</div>" +
      "<div class='below'>" + U.sect(null, "Quem o time vai encontrar na Fase 4", "Cada um entrega algo que uma pessoa revisa. Nenhum promove, publica, reatribui ou fecha sozinho.") +
      U.table(["Quem", "O que é", "Entrega", "Limite"], N.named, ["nb", "nb", "", ""]) +
      U.sect(null, "A menor solução que resolve", "Código antes de modelo, modelo antes de agente. É por isso que a maior parte da lista não é agente.") +
      "<div class='ladder'>" + T.ladder.map(function (l, i) { return "<div><small>" + (i + 1) + (l[2] ? " · " + esc(l[2]) : "") + "</small><b>" + esc(l[0]) + "</b><span>" + esc(l[1]) + "</span></div>"; }).join("") + "</div>" +
      U.sect(null, "O que todo agente tem") + U.cols(T.controls) +
      "<p class='aside'><b>Ferramenta nova.</b> " + esc(N.tools) + "</p>" +
      "<p class='aside'><b>Por dentro.</b> O desenho técnico de uma execução de agente no Azure está na página da <a href='../#plataforma/ag'>plataforma</a>.</p></div>";
    U.Functions(document.getElementById("fn"), arg && N.temas.some(function (t) { return t[0] === arg; }) ? arg : "");
  }

  /* ---------- 5 · Garantias ---------- */
  function garantias() {
    view.innerHTML = U.head("O time continua no controle da instância", "Três cores decidem o que cada ferramenta pode fazer. A regra é aplicada no servidor, não no agente.") +
      "<div class='sem'>" + N.lights.map(function (l) { return "<div class='c-" + l[0] + "'><small>" + esc(l[1]) + "</small><b>" + esc(l[2]) + "</b><span>" + esc(l[3]) + "</span></div>"; }).join("") + "</div>" +
      "<div class='below'>" + U.sect(null, "O que não acontece") + U.cols(N.never) + "</div>" +
      "<div class='part' id='inside'>" + U.sect("Técnico", "Por dentro: o que entra na instância",
        "Poucas peças, as mesmas para todas as integrações. O que está em dourado é novo; o resto é a instância de hoje.") +
      "<div class='work'>" + U.stage("play", U.legend(N.insideLegend)) + "<aside class='side'>" + U.steps() + "</aside></div></div>" +
      "<div class='below'>" + U.sect(null, "O que entra na instância, e quando", "Quem constrói e mantém é o time do ServiceNow. O que a plataforma entrega é a fonte de cada artefato, para revisão.") +
      U.table(["Fase", "O time constrói", "Passa a funcionar"], N.asks, ["nb", "", ""]) +
      "<p class='aside'>" + esc(N.owner) + "</p></div>";
    U.Player(document.getElementById("inside"), { scenarios: [N.inside], tag: function (s) { return s.tag; } });
  }

  U.shell({
    page: "servicenow", base: "../",
    tabs: [["operacao", "Operação"], ["desenvolvimento", "Desenvolvimento"], ["exemplos", "Exemplos"], ["agentes", "Agentes"], ["garantias", "Garantias"]],
    views: { operacao: operacao, desenvolvimento: desenvolvimento, exemplos: exemplos, agentes: agentes, garantias: garantias }
  });
})();
