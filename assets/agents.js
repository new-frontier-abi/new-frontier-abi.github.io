/* Página Agentes, a entrada do site: 1 visão geral (a fábrica), 2 criar pela IDE, 3 os agentes do DW, 4 governança, 5 decisão.
   O conteúdo vem de assets/agents-data.js; os fluxos dos agentes do DW, as fases e o desenho técnico, de assets/data.js;
   as funções, a escada e os passos de construção, de assets/team-data.js; as peças das telas, de assets/ui.js. */
(function () {
  "use strict";
  var A = window.AG, T = window.TEAM, D = window.DW, U = D.ui, esc = U.esc, view = U.view;
  var KINDS = [["core", "Peça da plataforma"], ["ext", "Já existe hoje"], ["person", "Pessoa"]];
  var WALK = [["act", "Passo atual"], ["seen", "Já percorrido"]];

  /* ---------- blocos desta página ---------- */
  function jumps(list) {
    return "<div class='jumps'>" + list.map(function (j) { return "<a class='jump' href='" + j[0] + "'><small>" + esc(j[1]) + "</small><b>" + esc(j[2]) + "</b><span>" + esc(j[3]) + "</span></a>"; }).join("") + "</div>";
  }
  function stepper(list) { return "<ol class='stepper'>" + list.map(function (b, i) { return "<li><small>" + U.pad(i + 1) + "</small><b>" + esc(b[0]) + "</b><span>" + esc(b[1]) + "</span></li>"; }).join("") + "</ol>"; }
  function ladder(list) { return "<div class='ladder'>" + list.map(function (l, i) { return "<div><small>" + (i + 1) + (l[2] ? " · " + esc(l[2]) : "") + "</small><b>" + esc(l[0]) + "</b><span>" + esc(l[1]) + "</span></div>"; }).join("") + "</div>"; }
  function sem(list) { return "<div class='sem'>" + list.map(function (l) { return "<div class='c-" + l[0] + "'><small>" + esc(l[1]) + "</small><b>" + esc(l[2]) + "</b><span>" + esc(l[3]) + "</span></div>"; }).join("") + "</div>"; }
  function cards(list) {
    function when(w) { return "<small class='" + (w === "agora" ? "w-now" : "") + "'>" + esc(w) + "</small>"; }
    return "<div class='cards n2'>" + list.map(function (g) {
      return "<div class='card'><h3>" + esc(g[0]) + "</h3><ul>" + g[1].map(function (i) { return "<li><span>" + esc(i[0]) + "</span>" + when(i[1]) + "</li>"; }).join("") + "</ul></div>"; }).join("") + "</div>";
  }
  /* retorno em cima, esforço à direita: a ordem dos quadrantes é a da leitura */
  function matrix(list) {
    return "<div class='mx' role='group' aria-label='Retorno e esforço: o que construir'><span class='mx-y' aria-hidden='true'>Retorno ↑</span><div class='mx-g'>" + list.map(function (q) {
      return "<div class='mx-q q-" + q[0] + "'><small>" + esc(q[1]) + "</small><b>" + esc(q[2]) + "</b><span>" + esc(q[3]) + "</span></div>"; }).join("") +
      "</div><span class='mx-x' aria-hidden='true'>Esforço →</span></div>";
  }
  function order(phases) {
    return "<ol class='order'>" + phases.map(function (p) {
      return "<li><small>" + esc(p.n) + " · " + esc(p.when) + "</small><b>" + esc(p.name) + "</b><span>" + esc(p.goal) + "</span><em>Sai quando</em><span>" + esc(p.gate) + "</span></li>"; }).join("") + "</ol>";
  }

  /* ---------- 1 · Visão geral: a fábrica de agentes; passar o cursor mostra o que cada peça faz ---------- */
  function visao() {
    view.innerHTML = U.head("Agentes em todas as operações, criados por quem conhece a operação",
        "Qualquer dev autorizado, de qualquer operação, cria agentes e integrações pela própria IDE. A plataforma dá a estrutura, o Asimov dá o modelo, e os gates são os mesmos para todos.") +
      "<div class='work solo' id='fab'>" + U.stage("hover", U.legend(KINDS)) + "</div>" +
      "<div class='below'>" + U.cols(A.pillars) +
      "<p class='aside'><b>Fase 2.</b> " + esc(A.now) + " <button class='link' type='button' data-go='criar'>Ver como se cria →</button></p>" +
      U.sect(null, "Quatro páginas, uma plataforma", "Os agentes são o centro. A plataforma, o time de automações e o time do ServiceNow são o que eles usam.") + jumps(A.site) + "</div>";
    U.Hover(document.getElementById("fab"), {
      data: A.factory, title: "Como um agente nasce, em qualquer operação",
      hint: "Passe o cursor, ou toque, em uma peça ou em uma ligação para ver o que passa por ali.",
      aria: "Mapa da criação de agentes: a IDE do dev, a revisão, a plataforma e quem aprova", nodes: A.factoryNodes, links: A.factoryLinks
    });
  }

  /* ---------- 2 · Criar: os fluxos da fábrica; embaixo, o que a IDE encontra, os oito passos e a execução por dentro ---------- */
  function criar(arg) {
    view.innerHTML = U.head("Criar um agente, ou uma integração, pela IDE",
        "Do pedido na IDE ao agente em uso: o que o dev faz, o que a plataforma confere e quem decide em cada ponto.") +
      U.flows("fl", A.make, A.flows, "Fluxos") +
      "<div class='below'>" + U.sect(null, "O que a IDE encontra na plataforma", "A IDE entende a estrutura antes de escrever uma linha. É por isso que qualquer operação consegue criar.") + U.cols(A.finds) +
      U.sect(null, "Como implementar um agente", "Oito passos, os mesmos para qualquer operação. Sem conjunto de avaliação, o agente não vai para uso real.") + stepper(T.build) + "</div>" +
      "<div class='part' id='tech'>" + U.sect("Técnico", "Por dentro: uma execução de agente no Azure",
        "Do evento à entrega, com os limites conferidos a cada passo. Vale para o agente de qualquer operação.") +
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

  /* ---------- 4 · Governança: casos que descem pelas camadas; embaixo, as cores, os controles e o que fica registrado ---------- */
  function governanca(arg) {
    view.innerHTML = U.head("Cinco camadas entre o pedido e a execução",
        "Valem para todo agente, do time ou de qualquer operação. A regra é aplicada pela plataforma, no servidor, e não pelo agente.") +
      U.flows("gv", A.govMenu, A.gov, "Casos") +
      "<div class='below'>" + U.sect(null, "A decisão na execução: três cores", "Cada ferramenta tem uma cor. O que um agente pode fazer depende da cor, não do que o texto de entrada pede.") + sem(A.lights) +
      U.sect(null, "O que todo agente tem") + U.cols(T.controls) +
      U.sect(null, "O que nenhum agente faz", "Nem o do time, nem o de outra operação. Essas decisões são sempre de uma pessoa.") + U.cols(A.never) +
      U.sect(null, "O que fica registrado") + U.cols(A.records) +
      "<p class='aside'><b>Quem pode criar.</b> " + esc(A.who) + "</p></div>";
    U.Flows("gv", A.govMenu, A.gov, { start: arg, primary: true, onPick: function (id) { U.hash("governanca", id); } });
  }

  /* ---------- 5 · Decisão: o caminho de uma demanda até a fila; embaixo, o que construir, em que ordem e quem decide ---------- */
  function decisao(arg) {
    view.innerHTML = U.head("O que construir, em que ordem e quem decide",
        "Toda demanda faz o mesmo caminho até a fila: o que já existe, a menor solução, o retorno medido e a decisão de uma pessoa.") +
      "<div class='part' id='dq'><div class='work'>" + U.stage("play", U.legend(WALK.concat(KINDS))) + "<aside class='side'>" + U.steps() + "</aside></div></div>" +
      "<div class='below'>" + U.sect(null, "O que construir: retorno e esforço", "Critério proposto, para a liderança validar. Retorno e esforço saem do caso de negócio; o risco decide o caminho, não o quadrante.", "construir") + matrix(A.matrix) +
      "<p class='aside'><b>Risco.</b> " + esc(A.risk) + "</p>" +
      U.sect(null, "A menor solução que resolve", "Código antes de modelo, modelo antes de agente. É por isso que a maior parte das funções mapeadas não é agente.") + ladder(T.ladder) +
      U.sect(null, "Em que ordem: cinco fases", "Cada fase termina com um critério de saída. O mapa do que existe em cada uma está na página da plataforma.", "ordem") + order(D.phases) +
      "<p class='aside'><a href='plataforma/#fases'>Ver as fases no mapa da plataforma →</a></p>" +
      U.sect(null, "Quem decide o quê", "Uma linha por decisão. O agente sugere; em nenhuma delas ele decide.", "quem") +
      U.table(["Decisão", "Quem decide", "Com o quê"], A.deciders, ["", "", ""]) +
      U.sect(null, "O que a liderança decide agora", "O que destrava cada fase. Os pedidos de maior prazo saem primeiro.", "lideranca") + cards(A.asks) + "</div>";
    U.Player(document.getElementById("dq"), { scenarios: [A.queueFlow], primary: true, tag: function (s) { return U.phase(s) + " · " + s.short; } });
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
