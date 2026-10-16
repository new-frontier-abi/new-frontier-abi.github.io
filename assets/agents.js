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
  /* ícones dos dois one pagers: traço simples, na cor do texto */
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
    proof: "<path d='M14.5 3.5H6.5v17h6'/><path d='M14.5 3.5l4 4v4.5M14.5 3.5v4h4'/><circle cx='16.5' cy='16.5' r='3'/><path d='M18.7 18.7l2.3 2.3'/>",
    repeat: "<path d='M4.5 11a7.5 7.5 0 0 1 13-4.7L19.5 8.5M19.5 4v4.5H15M19.5 13a7.5 7.5 0 0 1-13 4.7L4.5 15.5M4.5 20v-4.5H9'/>",
    key: "<circle cx='8' cy='12' r='4'/><path d='M12 12h9M18 12v3M21 12v2.2'/>",
    bulb: "<path d='M9.5 17.5h5M10.5 20.5h3M12 3.5a5.8 5.8 0 0 0-3.4 10.5c.7.5 1 1.2 1 2v.5h4.8V16c0-.8.4-1.5 1-2A5.8 5.8 0 0 0 12 3.5z'/>",
    code: "<path d='M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5M13.4 5.5l-2.8 13'/>",
    chat: "<path d='M4.5 5.5h15v10.5H10l-5.5 4z'/><path d='M8.5 10.5h7'/>",
    search: "<circle cx='10.5' cy='10.5' r='6'/><path d='M15 15l5.5 5.5'/>",
    branch: "<circle cx='6.5' cy='6' r='2.3'/><circle cx='6.5' cy='18' r='2.3'/><circle cx='17.5' cy='12' r='2.3'/><path d='M6.5 8.3v7.4M8.7 6.9c3.7.6 5.9 2.3 7.1 3.6M8.7 17.1c3.7-.6 5.9-2.3 7.1-3.6'/>",
    spark: "<path d='M12 3.5l2.1 6.4 6.4 2.1-6.4 2.1-2.1 6.4-2.1-6.4L3.5 12l6.4-2.1z'/>",
    plug: "<path d='M9 3.5v4.5M15 3.5v4.5M6.5 8h11v3.2a5.5 5.5 0 0 1-11 0zM12 16.7v3.8'/>",
    inbox: "<path d='M4 13.5l2.4-8h11.2l2.4 8V19H4z'/><path d='M4 13.5h4.6l1.2 2.3h4.4l1.2-2.3H20'/>",
    clip: "<path d='M8.5 4h7v3h-7z'/><path d='M7 5.5H5.5v15h13v-15H17M8.5 12h7M8.5 15.5h4.5'/>",
    chart: "<path d='M4 20h16M7.5 16.5v-5M12 16.5V7M16.5 16.5v-8'/>",
    list: "<path d='M9.5 6.5h10M9.5 12h10M9.5 17.5h10M5 6.5h.5M5 12h.5M5 17.5h.5'/>"
  };
  function ico(name) { return "<svg viewBox='0 0 24 24' aria-hidden='true'>" + IC[name] + "</svg>"; }
  /* anotação à mão, com a seta curva apontando para o bloco: r à direita do bloco, l à esquerda, d em cima */
  var ARW = {
    r: "<path d='M56 15C42 5 24 4 8 11'/><path d='M15 5.5L7.5 11.5l8 4'/>",
    l: "<path d='M4 9c14 10 32 11 48 4'/><path d='M45 7.5l7.5 5.5-8 4'/>",
    d: "<path d='M14 3c-6 7-7 14-2 20'/><path d='M6.5 17.5l5.5 6 4.5-7'/>"
  };
  function note(text, side) {
    var arw = "<svg class='gv-arw a-" + side + "' viewBox='0 0 " + (side === "d" ? "24 26" : "60 24") + "' aria-hidden='true'>" + ARW[side] + "</svg>";
    return text ? "<p class='gv-note n-" + side + "'>" + (side === "r" ? arw : "") + "<span>" + esc(text) + "</span>" + (side === "r" ? "" : arw) + "</p>" : "";
  }
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

  /* ---------- 4 · Governança: um one pager em camadas, da intenção à evidência. Tudo à vista, sem passos ---------- */
  function governanca() {
    var G = A.gov, row = function (l, m, r, cls) { return "<div class='gv-l'>" + (l || "") + "</div><div class='gv-m" + (cls ? " " + cls : "") + "'>" + m + "</div><div class='gv-r'>" + (r || "") + "</div>"; };
    var link = row("", "<i class='gv-v' aria-hidden='true'></i>", "");
    function head(icon, t, d, big) { return "<span class='gv-ico" + (big ? " big" : "") + "'>" + ico(icon) + "</span><div><b>" + esc(t) + "</b>" + (d ? "<span>" + esc(d) + "</span>" : "") + "</div>"; }
    view.innerHTML = "<article class='op gov' aria-label='" + esc(G.title) + "'>" +
      "<header class='op-h'><h1>" + esc(G.title) + "</h1><p class='op-k'>" + esc(G.kicker) + "</p></header>" +
      "<div class='gv'>" +
        row("", "<div class='gv-card c-intent'>" + head("target", G.intent.t, G.intent.d, true) + "</div>", note(G.intent.note, "r")) +
        link +
        row(note(G.controls.note, "l"), "<div class='gv-card c-controls'><div class='gv-ch'>" + head("shield", G.controls.t, G.controls.d, true) + "</div>" +
          "<div class='gv-3'>" + G.controls.groups.map(function (g) {
            return "<div class='gv-g'><p><span class='gv-ico'>" + ico(g[0] === "id" ? "users" : g[0]) + "</span><b>" + esc(g[1]) + "</b></p><ul>" + g[2].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>"; }).join("") + "</div>" +
          "<p class='gv-pins' aria-hidden='true'><i class='p-go'></i><i class='p-stop'></i><i class='p-esc'></i></p></div>", "") +
        row("", "<p class='gv-lab'>" + esc(G.runtime) + "</p><div class='gv-chips'>" + G.chips.map(function (c) {
            return "<div class='gv-chip c-" + c[0] + "'><span class='gv-dot'>" + ico(c[0]) + "</span><div><b>" + esc(c[1]) + "</b><span>" + esc(c[2]) + "</span></div></div>"; }).join("") + "</div>",
          note(G.people.note, "d") + "<div class='gv-card c-people'><p><span class='gv-ico'>" + ico("person") + "</span><b>" + esc(G.people.t) + "</b></p><ul>" + G.people.items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>", "m-run") +
        row(note(G.exec.note, "l"), "<div class='gv-card c-exec'><span class='gv-ico big'>" + ico("gear") + "</span><div><b>" + esc(G.exec.t) + "</b><p class='gv-dots'>" + dots(G.exec.parts) + "</p></div></div>", "") +
        link +
        row("", "<div class='gv-card c-proof'><span class='gv-ico big'>" + ico("proof") + "</span><div><b>" + esc(G.proof.t) + "</b><p class='gv-dots'>" + dots(G.proof.parts) + "</p><strong>→ " + esc(G.proof.end) + "</strong></div></div>", note(G.proof.note, "r")) +
      "</div></article>";
  }

  /* ---------- 5 · Decisão: um one pager no modelo de um blueprint. Contexto, passos 1 a 3 e escala; embaixo, ordem, quem decide e o que a liderança decide ---------- */
  function decisao(arg) {
    var P = A.plan, F = T.functions, n = function (g) { return F.filter(function (f) { return f[5] === g; }).length; };
    var agents = n("agente"), share = agents / F.length, R = 26, C = 2 * Math.PI * R;
    function panel(id, title, body) {   /* "Passo 1 · De onde vêm os casos": o passo vira um selo antes do título */
      var t = title.split(" · ");
      return "<section class='bx'" + (id ? " id='" + id + "'" : "") + "><h2>" + (t[1] ? "<span class='bx-n'>" + esc(t[0]) + "</span>" + esc(t[1]) : esc(title)) + "</h2>" + body + "</section>"; }
    var ring = "<div class='bx-ring'><svg viewBox='0 0 64 64' role='img' aria-label='" + agents + " de " + F.length + " funções pedem agente'><circle cx='32' cy='32' r='" + R + "' class='r0'/>" +
      "<circle cx='32' cy='32' r='" + R + "' class='r1' stroke-dasharray='" + (C * share).toFixed(1) + " " + C.toFixed(1) + "' transform='rotate(-90 32 32)'/>" +
      "<text x='32' y='36' text-anchor='middle'>" + Math.round(share * 100) + "%</text></svg><span>" + esc(P.ring) + "</span></div>";
    view.innerHTML = "<article class='op plan' aria-label='" + esc(P.title) + "'><div class='bpx'>" +
      "<header class='bpx-h'><h1>" + esc(P.title).replace(/^([^:]+:)/, "<em>$1</em>") + "</h1></header>" +
      "<div class='bpx-g'><div class='bpx-col'>" +
        panel("", "O ponto de partida", "<div class='bx-ctx'>" + P.stats.map(function (x) {
          return "<div class='bx-st'><b>" + esc(x[0]) + "</b><span><strong>" + esc(x[1]) + "</strong>" + esc(x[2]) + "</span></div>"; }).join("") + ring + "</div>") +
        panel("", "Passo 1 · De onde vêm os casos", "<div class='bx-3'>" + P.sources.map(function (c) {
          return "<div class='bxc'><p class='bxc-h'><span class='bx-ic'>" + ico(c[0]) + "</span><b>" + esc(c[1]) + "</b></p><p class='bx-tags'>" + c[2].map(function (t) { return "<i>" + esc(t) + "</i>"; }).join("") + "</p><span>" + esc(c[3]) + "</span></div>"; }).join("") + "</div>") +
        panel("", "Passo 2 · A menor solução que resolve", "<div class='bx-6'>" + P.rungs.map(function (r, i) {
          return "<div class='bxr" + (r[3] === "agente" ? " hot" : "") + "'><span class='bx-sq'>" + ico(r[0]) + "</span><div><b>" + esc(r[1]) + "</b><span>" + esc(r[2]) + "</span><em>" + (r[3] ? n(r[3]) + " de " + F.length + " funções" : "para todos") + "</em></div></div>"; }).join("") + "</div>") +
      "</div><div class='bpx-col'>" +
        panel("construir", "Passo 3 · Priorização: retorno × esforço", "<div class='bx-mx'><p class='bx-ax y'><span>Baixo</span><b>Retorno</b><span>Alto</span></p><div class='bx-q'>" + A.matrix.map(function (q) {
            return "<div class='q-" + q[0] + "'><b>" + esc(q[2]) + "</b><small>" + esc(q[4]) + "</small><span>" + esc(q[3]) + "</span></div>"; }).join("") + "</div>" +
          "<p class='bx-ax x'><span>Baixo</span><b>Esforço</b><span>Alto</span></p></div><p class='bx-note'>" + esc(A.risk) + "</p>") +
        panel("", "Escalar com governança", "<div class='bx-2'>" +
          "<div class='bxs'><b>Da demanda à fila</b><ol class='bx-flow'>" + P.flow.map(function (x) { return "<li><span class='bx-sq'>" + ico(x[0]) + "</span><small>" + esc(x[1]) + "</small></li>"; }).join("") + "</ol><span>" + esc(P.flowNote) + "</span></div>" +
          "<div class='bxs'><b>Um ciclo repetível</b><ol class='bx-cycle'>" + P.cycle.map(function (x, i) { return "<li><i>" + (i + 1) + "</i><small>" + esc(x) + "</small></li>"; }).join("") + "</ol><span>" + esc(P.cycleNote) + "</span></div>" +
        "</div>") +
      "</div></div>" +
      "<div class='bpx-row'>" +
        panel("ordem", "Em que ordem", "<ol class='bx-ph'>" + D.phases.map(function (p, k) { return "<li" + (k === 2 ? " class='now'" : "") + "><i>F" + k + "</i><b>" + esc(p.name) + "</b><small>" + esc(p.when) + "</small>" + (k === 2 ? "<em>" + esc(P.ide) + "</em>" : "") + "</li>"; }).join("") + "</ol>") +
        panel("quem", "Quem decide", "<ul class='bx-kv'>" + P.who.map(function (r) { return "<li><span>" + esc(r[0]) + "</span><b>" + esc(r[1]) + "</b></li>"; }).join("") + "</ul>") +
        panel("lideranca", "A liderança decide agora", "<ul class='bx-kv asks'>" + P.asks.map(function (r) { return "<li><span>" + esc(r[0]) + "</span><b>" + esc(r[1]) + "</b></li>"; }).join("") + "</ul>") +
      "</div></div></article>";
    var to = arg && document.getElementById(arg);
    if (to && /^(construir|ordem|quem|lideranca)$/.test(arg)) U.aim(to);   /* #decisao/quem abre direto no bloco */
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
