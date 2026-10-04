/* Página do time do ServiceNow: 1 casos de uso (e a instância por dentro), 2 funções, 3 garantias.
   O conteúdo vem de assets/now-data.js e, para as funções, de assets/team-data.js; as peças das telas, de assets/ui.js. */
(function () {
  "use strict";
  var N = window.NOW, T = window.TEAM, U = window.DW.ui, esc = U.esc, view = U.view;

  /* ---------- cartão do quadro: um artefato do ServiceNow ou da plataforma ---------- */
  function chip(st) { return "<i class='st" + (st[0] ? " st-" + st[0] : "") + "'>" + esc(st[1]) + "</i>"; }
  function card(c) {
    var cls = "ac" + (c.wide ? " wide" : ""), body = "";
    if (c.fields) body += "<ul class='fld'>" + c.fields.map(function (f) {
      return "<li><b>" + esc(f.l) + (f.req ? "<em title='obrigatório'>*</em>" : "") + "</b><span class='ty'>" + esc(f.ty) +
        (f.opts ? "<span class='opts'>" + f.opts.map(function (o) { return "<i>" + esc(o) + "</i>"; }).join("") + "</span>" : "") + "</span>" +
        (f.to ? "<span class='to'>→ " + esc(f.to) + "</span>" : "") + "</li>"; }).join("") + "</ul>";
    if (c.steps) body += "<ol class='flow'>" + c.steps.map(function (s) {
      return "<li" + (s.hl ? " class='hl'" : "") + "><small>" + esc(s.k) + "</small>" + (s.t ? "<span>" + esc(s.t) + "</span>" : "") +
        (s.ends ? "<span class='ends'>" + s.ends.map(function (e) { return chip(e); }).join("") + "</span>" : "") + "</li>"; }).join("") + "</ol>";
    if (c.code) body += "<pre class='code'>" + esc(c.code) + "</pre>";
    if (c.rows) body += "<dl class='kv'>" + c.rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>";
    if (c.bar) body += "<div class='slabar' role='img' aria-label='" + esc(c.bar.label) + "'><i style='width:" + c.bar.at + "%'></i><span style='left:" + c.bar.at + "%'>" + esc(c.bar.label) + "</span></div>";
    if (c.items) body += "<ul class='rows'>" + c.items.map(function (i) {
      return "<li" + (i.nw ? " class='new'" : "") + "><span>" + esc(i.t) + (i.s ? "<small>" + esc(i.s) + "</small>" : "") + "</span>" + (i.st ? chip(i.st) : "") + "</li>"; }).join("") + "</ul>";
    if (c.q) body += "<blockquote class='q'>" + esc(c.q) + "</blockquote>";
    return "<article class='" + cls + "' data-id='" + c.id + "' data-base='" + cls + "'><header><small>" + esc(c.k) + "</small><b>" + esc(c.t) + "</b>" + (c.st ? chip(c.st) : "") + "</header>" +
      "<div class='ac-b'>" + body + "</div>" + (c.by ? "<footer>" + esc(c.by) + "</footer>" : "") + "</article>";
  }

  /* ---------- 1 · Casos de uso: o que é entregue em cada um; embaixo, a instância por dentro ---------- */
  function casos(arg) {
    var items = N.groups.map(function (g) { return { name: g.name, items: g.ids.map(function (id) { return [id, U.byId(N.cases, id).short]; }) }; });
    view.innerHTML = U.head("O que muda no dia a dia do time do ServiceNow",
        "Nove casos, cada um com o que é entregue: formulário, flow, regra, evento e SLA. Em todos, o time revisa e decide.") +
      "<div class='part' id='uc'>" + U.seg(items, "Casos de uso") +
      "<div class='work'>" + U.stage("play", U.legend([["new", "Passo atual"]]) + "<span><b class='rq'>*</b>obrigatório</span><span><b class='ar'>→</b>para onde o valor vai</span>", "board") + "<aside class='side'>" + U.steps() + "</aside></div></div>" +
      "<div class='part' id='inside'>" + U.sect("Técnico", "Por dentro: o que entra na instância",
        "Poucas peças, as mesmas para todas as integrações. O que está em dourado é novo; o resto é a instância de hoje.") +
      "<div class='work'>" + U.stage("play", U.legend(N.insideLegend)) + "<aside class='side'>" + U.steps() + "</aside></div></div>";
    U.Player(document.getElementById("uc"), {
      scenarios: N.cases, start: arg, primary: true, card: card,
      tag: function (c) { return c.tag; }, onPick: function (id) { U.hash("casos", id); }
    });
    U.Player(document.getElementById("inside"), { scenarios: [N.inside], tag: function (s) { return s.tag; } });
  }

  /* ---------- 2 · Funções: o que sai da mão do time ---------- */
  function funcoes() {
    var F = T.functions.filter(function (f) { return f[0] === "ServiceNow"; });
    var agents = F.filter(function (f) { return f[5] === "agente"; }).length;
    view.innerHTML = U.head(F.length + " funções do time mapeadas. Só " + agents + " pedem um agente.",
        "O resto vira configuração, código ou uma chamada de modelo. As marcadas como proposta ainda não estão no plano de fases.") +
      "<div class='part' id='fn'>" + U.functions(F, T.groups, true) + "</div>";
    U.Functions(document.getElementById("fn"), "");
  }

  /* ---------- 3 · Garantias ---------- */
  function garantias() {
    view.innerHTML = U.head("O time continua no controle da instância", "Três cores decidem o que cada ferramenta pode fazer. A regra é aplicada no servidor, não no agente.") +
      "<div class='sem'>" + N.lights.map(function (l) { return "<div class='c-" + l[0] + "'><small>" + esc(l[1]) + "</small><b>" + esc(l[2]) + "</b><span>" + esc(l[3]) + "</span></div>"; }).join("") + "</div>" +
      "<div class='below'>" + U.sect(null, "O que não acontece") + U.cols(N.never) +
      U.sect(null, "O que entra na instância, e quando", "Quem constrói e mantém é o time do ServiceNow. O que a plataforma entrega é a fonte de cada artefato, para revisão.") +
      U.table(["Fase", "O time constrói", "Passa a funcionar"], N.asks, ["nb", "", ""]) +
      "<p class='aside'>" + esc(N.owner) + "</p></div>";
  }

  U.shell({
    page: "servicenow", base: "../",
    tabs: [["casos", "Casos de uso"], ["funcoes", "Funções"], ["garantias", "Garantias"]],
    views: { casos: casos, funcoes: funcoes, garantias: garantias }
  });
})();
