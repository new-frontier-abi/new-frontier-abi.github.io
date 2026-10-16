/* Página Agentes, a entrada do site: 1 visão geral (a fábrica), 2 criar pela IDE, 3 os agentes do DW, 4 governança e 5 decisão (um painel só cada uma, sem passos).
   O conteúdo vem de assets/agents-data.js; os fluxos dos agentes do DW, as fases e o desenho técnico, de assets/data.js;
   as funções, a escada e os passos de construção, de assets/team-data.js; as peças das telas, de assets/ui.js. */
(function () {
  "use strict";
  var A = window.AG, T = window.TEAM, D = window.DW, U = D.ui, esc = U.esc, view = U.view;
  var KINDS = [["core", "Peça da plataforma"], ["ext", "Já existe hoje"], ["person", "Pessoa"]];

  /* ---------- blocos desta página ---------- */
  function jumps(list) {
    return "<div class='jumps'>" + list.map(function (j) { return "<a class='jump' href='" + j[0] + "'><small>" + esc(j[1]) + "</small><b>" + esc(j[2]) + "</b><span>" + esc(j[3]) + "</span></a>"; }).join("") + "</div>";
  }
  function stepper(list) { return "<ol class='stepper'>" + list.map(function (b, i) { return "<li><small>" + U.pad(i + 1) + "</small><b>" + esc(b[0]) + "</b><span>" + esc(b[1]) + "</span></li>"; }).join("") + "</ol>"; }
  /* ícones dos painéis: traço simples, na cor do texto */
  var IC = {
    target: "<circle cx='12' cy='12' r='8.5'/><circle cx='12' cy='12' r='4.8'/><circle cx='12' cy='12' r='1.4'/>",
    shield: "<path d='M12 3l7 3v5.6c0 4.4-2.9 7.6-7 9.4-4.1-1.8-7-5-7-9.4V6z'/><path d='M8.6 12.1l2.4 2.4 4.5-4.9'/>",
    users: "<circle cx='9' cy='8.5' r='3'/><path d='M3.5 19c0-3.2 2.4-5.4 5.5-5.4s5.5 2.2 5.5 5.4'/><circle cx='16.8' cy='9.3' r='2.3'/><path d='M15.6 14.1c2.7.3 4.9 2.2 4.9 4.9'/>",
    rule: "<path d='M7 3.5h7l4 4V20.5H7z'/><path d='M14 3.5v4h4M10 12h5M10 15.5h5'/>",
    tool: "<path d='M14.7 4.2a4.4 4.4 0 0 0-4.2 5.8L4.6 15.9a2.1 2.1 0 0 0 3 3l5.9-5.9a4.4 4.4 0 0 0 5.8-4.2l-2.6 2.6-2.4-.6-.6-2.4z'/>",
    go: "<path d='M6.5 12.5l3.8 3.8 7.2-8'/>",
    stop: "<path d='M7.5 7.5l9 9M16.5 7.5l-9 9'/>",
    esc: "<path d='M12 6.5v7.5M12 17.5v.4'/>",
    person: "<circle cx='12' cy='8.3' r='3.6'/><path d='M5 20c0-4 3.1-6.6 7-6.6s7 2.6 7 6.6'/>",
    gear: "<circle cx='12' cy='12' r='3.2'/><path d='M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M5.5 18.5l1.9-1.9M16.6 7.4l1.9-1.9'/>",
    proof: "<path d='M14.5 3.5H6.5v17h6'/><path d='M14.5 3.5l4 4v4.5M14.5 3.5v4h4'/><circle cx='16.5' cy='16.5' r='3'/><path d='M18.7 18.7l2.3 2.3'/>"
  };
  function ico(name) { return "<svg viewBox='0 0 24 24' aria-hidden='true'>" + IC[name] + "</svg>"; }
  function note(text, side) { return text ? "<em class='gv-note n-" + side + "'>" + esc(text) + "</em>" : ""; }
  function dots(list) { return list.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("<i aria-hidden='true'>·</i>"); }

  /* ---------- 1 · Visão geral: a fábrica de agentes; passar o cursor mostra o que cada peça faz ---------- */
  function visao() {
    view.innerHTML = U.head("Agentes em todas as áreas da companhia, criados por quem conhece o trabalho",
        "Tech transformation: qualquer dev autorizado, de qualquer área, cria agentes e integrações pela própria IDE. A plataforma dá a estrutura, o Asimov dá o modelo, e os gates são os mesmos para todos. O Automation Hub e o ServiceNow são complementos.") +
      "<div class='work solo' id='fab'>" + U.stage("hover", U.legend(KINDS)) + "</div>" +
      "<div class='below'>" + U.cols(A.pillars) +
      "<p class='aside'><b>Fase 2.</b> " + esc(A.now) + " <button class='link' type='button' data-go='criar'>Ver como se cria →</button></p>" +
      U.sect(null, "Quatro páginas, uma plataforma", "Os agentes são o centro. A plataforma, o Automation Hub e o ServiceNow são complementos que eles usam.") + jumps(A.site) + "</div>";
    U.Hover(document.getElementById("fab"), {
      data: A.factory, title: "Como um agente nasce, em qualquer área",
      hint: "Passe o cursor, ou toque, em uma peça ou em uma ligação para ver o que passa por ali.",
      aria: "Mapa da criação de agentes: a IDE do dev, a revisão, a plataforma e quem aprova", nodes: A.factoryNodes, links: A.factoryLinks
    });
  }

  /* ---------- 2 · Criar: os fluxos da fábrica; embaixo, o que a IDE encontra, os oito passos e a execução por dentro ---------- */
  function criar(arg) {
    view.innerHTML = U.head("Criar um agente, ou uma integração, pela IDE",
        "Do pedido na IDE ao agente em uso: o que o dev faz, o que a plataforma confere e quem decide em cada ponto.") +
      U.flows("fl", A.make, A.flows, "Fluxos") +
      "<div class='below'>" + U.sect(null, "O que a IDE encontra na plataforma", "A IDE entende a estrutura antes de escrever uma linha. É por isso que qualquer área consegue criar.") + U.cols(A.finds) +
      U.sect(null, "Como implementar um agente", "Oito passos, os mesmos para qualquer área. Sem conjunto de avaliação, o agente não vai para uso real.") + stepper(T.build) + "</div>" +
      "<div class='part' id='tech'>" + U.sect("Técnico", "Por dentro: uma execução de agente no Azure",
        "Do evento à entrega, com os limites conferidos a cada passo. Vale para o agente de qualquer área.") +
      "<div class='work'>" + U.stage("play", U.legend(D.techLegend)) + "<aside class='side'>" + U.steps() + "</aside></div></div>";
    U.Flows("fl", A.make, A.flows, { start: arg, primary: true, onPick: function (id) { U.hash("criar", id); } });
    U.Player(document.getElementById("tech"), { scenarios: [U.byId(D.tech, "ag")], tag: function (t) { return t.tag; } });
  }

  /* ---------- 3 · Agentes do DW: o fluxo de cada um, sobre o mapa da plataforma; embaixo, os papéis, a tabela e as funções ---------- */
  function dw(arg) {
    var F = T.functions, agents = F.filter(function (f) { return f[5] === "agente"; }).length;
    view.innerHTML = U.head("Sete agentes no trabalho do Digital Workplace. Em todos, uma pessoa decide.",
        "Os primeiros agentes da plataforma, construídos pelo time de automações. Cada um tem um fluxo, do que o aciona ao que uma pessoa decide.") +
      U.flows("fl", D.acts.agentes, D.scenarios, "Agentes") +
      "<div class='below'>" + U.sect(null, "O que muda no trabalho de cada papel", "A capacidade liberada é remanejada conforme os indicadores de lead time e de qualidade, não pelo calendário.") +
      U.table(["Papel", "Deixa de", "Passa a"], D.roles, ["nb", "was", ""]) +
      U.sect(null, "Os sete agentes", "Cada um recebe uma entrada estruturada e devolve algo que uma pessoa aprova.") +
      U.table(["Agente", "Entrega", "Fase"], D.agents, ["nb", "", "nb"]) +
      "<p class='aside'><b>Onde um agente não entra.</b> " + esc(D.notAgent) + "</p>" +
      U.sect(null, F.length + " funções mapeadas. Só " + agents + " pedem um agente.",
        "A regra é a menor solução que resolve: código antes de modelo, modelo antes de agente. Toque em uma função para ver o antes, o depois e o que continua com pessoas. As marcadas como proposta ainda não estão no plano de fases.", "funcoes") +
      "<div class='part' id='fn'>" + U.functions(F, T.groups) + "</div>" +
      "<p class='aside'><b>Para o time do ServiceNow.</b> Os cinco que o time vai encontrar na instância, com o fluxo de cada um, estão na página <a href='servicenow/#agentes'>ServiceNow</a>.</p></div>";
    U.Functions(document.getElementById("fn"), arg === "funcoes" ? "" : "agente");   /* #dw/funcoes abre direto na lista inteira das funções */
    U.Flows("fl", D.acts.agentes, D.scenarios, { start: arg, primary: true, onPick: function (id) { U.hash("dw", id); } });
    if (arg === "funcoes") U.aim(document.getElementById("funcoes"));
  }

  /* ---------- 4 · Governança: um painel só, em camadas, da intenção à evidência. Tudo à vista, sem passos ---------- */
  function governanca() {
    var G = A.gov, row = function (l, m, r, cls) { return "<div class='gv-l'>" + (l || "") + "</div><div class='gv-m" + (cls ? " " + cls : "") + "'>" + m + "</div><div class='gv-r'>" + (r || "") + "</div>"; };
    var link = row("", "<i class='gv-v' aria-hidden='true'></i>", "");
    view.innerHTML = "<article class='op gov' aria-label='" + esc(G.title) + "'>" +
      "<header class='op-h'><h1>" + esc(G.title) + "</h1><p class='op-k'>" + esc(G.kicker) + "</p><p class='op-lead'>" + esc(G.lead) + "</p></header>" +
      "<div class='gv'>" +
        row("", "<div class='gv-card c-intent'><span class='gv-ico'>" + ico("target") + "</span><div><b>" + esc(G.intent.t) + "</b><span>" + esc(G.intent.d) + "</span></div></div>", note(G.intent.note, "r")) +
        link +
        row(note(G.controls.note, "l"), "<div class='gv-card c-controls'><div class='gv-ch'><span class='gv-ico big'>" + ico("shield") + "</span><div><b>" + esc(G.controls.t) + "</b><span>" + esc(G.controls.d) + "</span></div></div>" +
          "<div class='gv-3'>" + G.controls.groups.map(function (g) {
            return "<div class='gv-g'><p><span class='gv-ico'>" + ico(g[0] === "id" ? "users" : g[0]) + "</span><b>" + esc(g[1]) + "</b></p><ul>" + g[2].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>"; }).join("") + "</div></div>", "") +
        row("", "<p class='gv-lab'>" + esc(G.runtime) + "</p><div class='gv-chips'>" + G.chips.map(function (c) {
            return "<div class='gv-chip c-" + c[0] + "'><span class='gv-dot'>" + ico(c[0]) + "</span><div><small>" + esc(c[1]) + "</small><b>" + esc(c[2]) + "</b><span>" + esc(c[3]) + "</span></div></div>"; }).join("") + "</div>",
          note(G.people.note, "d") + "<div class='gv-card c-people'><p><span class='gv-ico'>" + ico("person") + "</span><b>" + esc(G.people.t) + "</b></p><ul>" + G.people.items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>", "m-run") +
        row(note(G.exec.note, "l"), "<div class='gv-card c-exec'><span class='gv-ico big'>" + ico("gear") + "</span><div><b>" + esc(G.exec.t) + "</b><p class='gv-dots'>" + dots(G.exec.parts) + "</p><span>" + esc(G.exec.d) + "</span></div></div>", "") +
        link +
        row("", "<div class='gv-card c-proof'><span class='gv-ico big'>" + ico("proof") + "</span><div><b>" + esc(G.proof.t) + "</b><p class='gv-dots'>" + dots(G.proof.parts) + "</p><strong>→ " + esc(G.proof.end) + "</strong></div></div>", note(G.proof.note, "r")) +
      "</div></article>";
  }

  /* ---------- 5 · Decisão: um painel só, do ponto de partida à escala: o que construir, em que ordem e quem decide ---------- */
  function decisao(arg) {
    var P = A.plan, F = T.functions, n = function (g) { return F.filter(function (f) { return f[5] === g; }).length; };
    var rungs = T.ladder.map(function (l, i) { return [i + 1, l[0], l[1], l[2], n(P.rungs[i]) + " de " + F.length + " funções"]; }).concat([["+", P.extra[0], P.extra[1], "", "vira ferramenta"]]);
    function when(w) { return "<small class='" + (w === "agora" ? "w-now" : "") + "'>" + esc(w) + "</small>"; }
    view.innerHTML = "<article class='op plan' aria-label='" + esc(P.title) + "'>" +
      "<header class='op-h left'><h1>" + esc(P.title) + "</h1><p class='op-k'>" + esc(P.kicker) + "</p></header>" +
      "<div class='bp'>" +
        "<div class='bp-col'>" +
          "<section class='bp-p'><h2>O ponto de partida</h2><div class='bp-stats'>" + P.stats.map(function (x) {
            return "<div><b>" + esc(x[0]) + "</b><span><strong>" + esc(x[1]) + "</strong>" + esc(x[2]) + "</span></div>"; }).join("") + "</div><p class='bp-note'>" + esc(P.base) + "</p></section>" +
          "<section class='bp-p'><h2>Passo 1 · De onde vêm as demandas</h2><div class='bp-3'>" + P.sources.map(function (c) {
            return "<div class='bp-c'><b>" + esc(c[0]) + "</b><span>" + esc(c[1]) + "</span><p class='bp-tags'>" + c[2].map(function (t) { return "<i>" + esc(t) + "</i>"; }).join("") + "</p></div>"; }).join("") + "</div></section>" +
          "<section class='bp-p'><h2>Passo 2 · A menor solução que resolve</h2><div class='bp-6'>" + rungs.map(function (r, i) {
            return "<div class='bp-c" + (i === 4 ? " last" : "") + "'><p class='bp-n'><i>" + esc(r[0]) + "</i>" + (r[3] ? "<small>" + esc(r[3]) + "</small>" : "") + "</p><b>" + esc(r[1]) + "</b><span>" + esc(r[2]) + "</span><em>" + esc(r[4]) + "</em></div>"; }).join("") + "</div></section>" +
        "</div>" +
        "<div class='bp-col'>" +
          "<section class='bp-p' id='construir'><h2>Passo 3 · Priorização: retorno × esforço</h2><div class='bp-mx'>" +
            "<p class='bp-ax y'><span>Baixo</span><b>Retorno</b><span>Alto</span></p><div class='bp-q'>" + A.matrix.map(function (q) {
              return "<div class='q-" + q[0] + "'><small>" + esc(q[4]) + "</small><b>" + esc(q[2]) + "</b><span>" + esc(q[3]) + "</span><em>" + esc(q[1]) + "</em></div>"; }).join("") + "</div>" +
            "<p class='bp-ax x'><span>Baixo</span><b>Esforço</b><span>Alto</span></p></div>" +
            "<p class='bp-note'><b>Critério proposto, para a liderança validar.</b> " + esc(A.risk) + "</p></section>" +
          "<section class='bp-p'><h2>Escalar com governança</h2><div class='bp-2'>" +
            "<div class='bp-sub'><b>Da demanda à fila</b><ol class='bp-flow'>" + P.flow.map(function (x, i) { return "<li" + (i === P.flow.length - 1 ? " class='end'" : "") + ">" + esc(x) + "</li>"; }).join("") + "</ol><span>" + esc(P.flowNote) + "</span></div>" +
            "<div class='bp-sub'><b>Um ciclo repetível para cada agente</b><ol class='bp-cycle'>" + T.build.map(function (x, i) { return "<li><i>" + (i + 1) + "</i><span>" + esc(x[0]) + "</span></li>"; }).join("") + "</ol><span>" + esc(P.cycleNote) + "</span></div>" +
          "</div></section>" +
        "</div>" +
        "<section class='bp-p bp-wide' id='ordem'><h2>Passo 4 · Em que ordem: cinco fases, cada uma com critério de saída</h2><ol class='order'>" + D.phases.map(function (p) {
          return "<li><small>" + esc(p.n) + " · " + esc(p.when) + "</small><b>" + esc(p.name) + "</b><span>" + esc(p.goal) + "</span><em>Sai quando</em><span>" + esc(p.gate) + "</span></li>"; }).join("") + "</ol></section>" +
        "<section class='bp-p bp-wide' id='quem'><h2>Quem decide o quê</h2><div class='bp-who'>" + A.deciders.map(function (r) {
          return "<div><b>" + esc(r[0]) + "</b><span>" + esc(r[1]) + "</span><small>" + esc(r[2]) + "</small></div>"; }).join("") + "</div></section>" +
        "<section class='bp-p bp-wide' id='lideranca'><h2>O que a liderança decide agora</h2><div class='bp-asks'>" + A.asks.map(function (g) {
          return "<div class='card'><h3>" + esc(g[0]) + "</h3><ul>" + g[1].map(function (i) { return "<li><span>" + esc(i[0]) + "</span>" + when(i[1]) + "</li>"; }).join("") + "</ul></div>"; }).join("") + "</div></section>" +
      "</div></article>";
    var to = arg && document.getElementById(arg);
    if (to && /^(construir|ordem|quem|lideranca)$/.test(arg)) U.aim(to);   /* #decisao/quem abre direto na tabela */
  }

  U.shell({
    page: "agentes", base: "",
    tabs: [["visao", "Visão geral"], ["criar", "Criar"], ["dw", "Agentes do DW"], ["governanca", "Governança"], ["decisao", "Decisão"]],
    views: { visao: visao, criar: criar, dw: dw, governanca: governanca, decisao: decisao },
    /* endereços de antes, quando esta era a página da plataforma */
    moved: function (tab, arg) {
      if (tab === "plataforma" || tab === "autoatendimento" || tab === "fases") return "plataforma/#" + tab + (arg ? "/" + arg : "");
      if (tab === "agentes") return "#dw" + (arg ? "/" + arg : "");
      return null;
    }
  });
})();
