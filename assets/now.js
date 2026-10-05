/* Página do time do ServiceNow: 1 operação e 2 desenvolvimento (os fluxos do trabalho do time e, embaixo, cada fluxo no Azure), 3 exemplos, 4 agentes, 5 garantias.
   O conteúdo vem de assets/now-data.js; o mapa e os fluxos dos agentes, de assets/data.js; as funções, de assets/team-data.js;
   as peças das telas, de assets/ui.js; as raias, de assets/seq.js. */
(function () {
  "use strict";
  var N = window.NOW, T = window.TEAM, D = window.DW, U = D.ui, esc = U.esc, view = U.view;
  var FLOWS = D.scenarios.concat(N.flows);   /* os fluxos da plataforma e os do time, sobre o mesmo mapa */
  var AGENTS = [{ name: "No ServiceNow", ids: ["a-nowdev"] }, { name: "Entrega de automações", ids: ["a-intake", "a-roi", "a-arch", "a-precode", "a-qa"] },
    { name: "Operação", ids: ["a-ops"] }, { name: "Jornada", ids: ["s-demanda"] }];
  function down(el) { el.scrollIntoView({ behavior: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }

  /* o desenho em raias de um fluxo: o processo que o mostra por dentro, com o texto próprio do fluxo quando ele tem um */
  function inside(flow) {
    var t = N.tech[flow.id], own = typeof t === "string" ? {} : t, q = U.byId(N.seqs, own.seq || t);
    return Object.assign({}, q, { id: flow.id, lead: own.lead || q.lead, note: own.note || q.note, tag: U.phase(flow) + " · " + flow.short });
  }
  /* o que muda para o time, uma linha por etapa do trabalho; a etapa leva ao fluxo que a mostra */
  function changes(tab, rows) {
    var cols = ["Etapa", "Hoje", "Com a plataforma", "Continua com o time"];
    return "<div class='tscroll'><table><thead><tr>" + cols.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr></thead><tbody>" + rows.map(function (r) {
      return "<tr><td data-th='" + cols[0] + "' class='nb'><b>" + esc(r[0]) + "</b>" + (r[4] ? "<button class='link sm' type='button' data-go='" + tab + "' data-arg='" + r[4] + "'>ver o fluxo</button>" : "") + "</td>" +
        "<td data-th='" + cols[1] + "' class='was'>" + esc(r[1]) + "</td><td data-th='" + cols[2] + "'>" + esc(r[2]) + "</td><td data-th='" + cols[3] + "'>" + esc(r[3]) + "</td></tr>"; }).join("") + "</tbody></table></div>";
  }

  /* ---------- 1 e 2 · os fluxos do trabalho do time; embaixo, o fluxo escolhido por dentro, no Azure ---------- */
  function flowsTab(tab, M, arg, title, lead) {
    var list = []; M.groups.forEach(function (g) { g.ids.forEach(function (x) { var one = typeof x === "string", f = U.byId(FLOWS, one ? x : x[0]); list.push(one ? f : Object.assign({}, f, { short: x[1] })); }); });
    view.innerHTML = U.head(title, lead) + U.flows("fl", M.groups, FLOWS, "Fluxos") +
      "<div class='part' id='tec'>" + U.sect("Técnico", "Por dentro: o mesmo fluxo no Azure",
        "Uma linha por etapa, uma coluna por participante. Dentro da zona tracejada está o que roda no Azure. Passe o cursor, ou toque, em um participante para ver o papel dele.") +
      "<div class='work solo'>" + U.stage("play", U.legend(N.seqLegend)) + "</div></div>" +
      "<div class='below'>" + U.sect(null, "O que muda no trabalho do time", "Uma linha por etapa. A capacidade liberada é remanejada conforme os indicadores, não pelo calendário.") + changes(tab, M.changes) +
      (M.areas ? U.sect(null, "Para quem atende RH, TI e sistemas", "As mesmas peças servem às três frentes. O que muda é o que cada uma ganha, e quando.") +
        "<div class='cols'>" + M.areas.map(function (a) { return "<div class='col'><h3>" + esc(a[0]) + "</h3><ul>" + a[1].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>"; }).join("") + "</div>" : "") + "</div>";
    var part = document.getElementById("tec"), tec = U.Player(part, { scenarios: list.map(inside), start: arg, lib: N, tag: function (s) { return s.tag; } });
    U.Flows("fl", M.groups, FLOWS, { start: arg, primary: true,
      each: function (s) { return { down: "Ver por dentro ↓", more: N.board[s.id] ? ["exemplos", N.board[s.id], "Ver o que o time recebe →"] : null }; },
      onPick: function (id) { U.hash(tab, id); tec.load(id); } });
    document.getElementById("fl").addEventListener("click", function (ev) { if (ev.target.closest(".js-down")) down(part); });
  }
  function operacao(arg) {
    flowsTab("operacao", N.run, arg, "O time decide. O que se repete sai da fila.",
      "O dia a dia de um time que atende RH, TI e sistemas, fluxo por fluxo: o que a plataforma assume em cada fase e o que continua com as pessoas.");
  }
  function desenvolvimento(arg) {
    flowsTab("desenvolvimento", N.dev, arg, "Desenvolver no ServiceNow: menos montagem, mais revisão",
      "Da demanda à promoção, fluxo por fluxo: o que deixa de ser montado à mão em cada fase. Quem decide e promove continua sendo o time.");
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

  /* ---------- 3 · Exemplos: o que o time recebe, cartão por cartão; cada exemplo leva ao fluxo que conta a história ---------- */
  function exemplos(arg) {
    var items = N.exGroups.map(function (g) { return { name: g.name, items: g.ids.map(function (id) { return [id, U.byId(N.examples, id).short]; }) }; });
    var list = []; N.exGroups.forEach(function (g) { g.ids.forEach(function (id) { var e = U.byId(N.examples, id); list.push(Object.assign({}, e, { more: [e.flow[0], e.flow[1], "Ver o fluxo →"] })); }); });
    view.innerHTML = U.head(N.examples.length + " exemplos do que o time recebe pronto",
        "Oferta, formulário, flow, contrato de SLA e artigo de conhecimento, entre outros. Em todos, o time revisa e decide.") +
      "<div class='part' id='ex'>" + U.seg(items, "Exemplos") +
      "<div class='work'>" + U.stage("play", U.legend([["act", "Passo atual"]]) + "<span class='js-fl'><b class='rq'>*</b>obrigatório</span><span class='js-fl'><b class='ar'>→</b>para onde o valor vai</span>", "board") + "<aside class='side'>" + U.steps() + "</aside></div></div>";
    var ex = document.getElementById("ex");
    /* a legenda dos campos só aparece nos exemplos que têm formulário */
    function legend(id) {
      var has = U.byId(N.examples, id).cards.some(function (c) { return c.fields; });
      Array.prototype.forEach.call(ex.querySelectorAll(".js-fl"), function (e) { e.hidden = !has; });
    }
    var board = U.Player(ex, {
      scenarios: list, start: arg, primary: true, card: card, unit: "exemplo",
      tag: function (c) { return c.tag; }, onPick: function (id) { U.hash("exemplos", id); legend(id); }
    });
    legend(board.current());
  }

  /* ---------- 4 · Agentes: o fluxo inteiro de cada um; embaixo, quem o time encontra e o catálogo dos trabalhos ---------- */
  function agentes(arg) {
    var F = T.functions.filter(function (f) { return f[11]; });
    var agents = F.filter(function (f) { return f[5] === "agente"; }).length, plan = F.filter(function (f) { return !f[10]; }).length;
    var tema = arg === "funcoes" ? "" : arg && N.temas.some(function (t) { return t[0] === arg; }) ? arg : null;   /* um tema no endereço abre o catálogo já filtrado */
    view.innerHTML = U.head("Sete agentes, do gatilho à decisão de uma pessoa",
        "O fluxo inteiro de cada um: o que o aciona, o que ele lê no ServiceNow e no Hub, o que entrega no DevOps ou no ticket e quem decide.") +
      U.flows("fl", AGENTS, D.scenarios, "Agentes") +
      "<div class='below'>" + U.sect(null, "Quem o time vai encontrar na Fase 4", "Cada um entrega algo que uma pessoa revisa. Nenhum promove, publica, reatribui ou fecha sozinho.") +
      U.table(["Quem", "O que é", "Entrega", "Limite"], N.named, ["nb", "nb", "", ""]) +
      U.sect(null, F.length + " trabalhos de hoje que a plataforma assume ou acelera. Só " + agents + " pedem um agente.",
        plan + " estão no plano de fases. Os outros " + (F.length - plan) + " são propostas, para o time escolher.", "catalogo") +
      "<details class='fold' id='cat'" + (tema != null ? " open" : "") + "><summary>Ver os " + F.length + " trabalhos, por tema</summary>" +
      "<div class='part' id='fn'>" + U.functions(F, N.temas, true, 11) + "</div>" +
      "<p class='aside'><b>Ferramenta nova.</b> " + esc(N.tools) + "</p></details>" +
      U.sect(null, "A menor solução que resolve", "Código antes de modelo, modelo antes de agente. É por isso que a maior parte da lista não é agente.") +
      "<div class='ladder'>" + T.ladder.map(function (l, i) { return "<div><small>" + (i + 1) + (l[2] ? " · " + esc(l[2]) : "") + "</small><b>" + esc(l[0]) + "</b><span>" + esc(l[1]) + "</span></div>"; }).join("") + "</div>" +
      U.sect(null, "O que todo agente tem") + U.cols(T.controls) +
      "<p class='aside'><b>Por dentro.</b> O desenho técnico de uma execução de agente no Azure está na página da <a href='../#plataforma/ag'>plataforma</a>.</p></div>";
    U.Functions(document.getElementById("fn"), tema || "");
    U.Flows("fl", AGENTS, D.scenarios, { start: tema != null ? null : arg, primary: true, onPick: function (id) { U.hash("agentes", id); } });
    if (tema != null) U.aim(document.getElementById("catalogo"));
  }

  /* ---------- 5 · Garantias ---------- */
  function garantias() {
    view.innerHTML = U.head("O time continua no controle da instância", "Três cores decidem o que cada ferramenta pode fazer. A regra é aplicada no servidor, não no agente.") +
      "<div class='sem'>" + N.lights.map(function (l) { return "<div class='c-" + l[0] + "'><small>" + esc(l[1]) + "</small><b>" + esc(l[2]) + "</b><span>" + esc(l[3]) + "</span></div>"; }).join("") + "</div>" +
      "<div class='below'>" + U.sect(null, "O que não acontece") + U.cols(N.never) + "</div>" +
      "<div class='part' id='inside'>" + U.sect("Técnico", "Por dentro: o que entra na instância",
        "Poucas peças, as mesmas para todas as integrações. O que tem a marca amarela é novo; o resto é a instância de hoje.") +
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
