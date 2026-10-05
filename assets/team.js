/* Página do time de automações: 1 jornada (e o ambiente por dentro), 2 base, 3 recursos, 4 times, 5 agentes.
   O conteúdo vem de assets/team-data.js; os fluxos dos agentes e o mapa deles, de assets/data.js; as peças das telas, de assets/ui.js. */
(function () {
  "use strict";
  var T = window.TEAM, D = window.DW, U = D.ui, esc = U.esc, view = U.view;

  /* ---------- 1 · Jornada: o mapa cresce a cada passo, e cada peça só aparece quando chega a vez dela; embaixo, o ambiente e a esteira ---------- */
  function jornada(arg) {
    var J = T.journey, TECH = [T.env, T.domain];
    view.innerHTML = U.head("Um catálogo no centro. Todo o resto se conecta a ele.",
        "Primeiro as automações migram para o Hub. Depois entram os agentes, o ServiceNow, o Stellar e qualquer outro produto.") +
      "<div class='part' id='jr'>" + U.timeline(J.steps.map(function (s) { return { b: s.b, name: s.name, when: s.when }; })) +
      "<div class='work'>" + U.stage("play", U.legend([["new", "Entra neste passo"], ["core", "Construído pelo time"], ["ext", "Já existe"], ["ghost", "Desligado"]])) +
      "<aside class='side'><div class='panel'><h2>O que muda</h2><div class='pbody' id='st-items'></div></div>" +
      "<div class='panel'><h2>Pronto quando</h2><div class='pbody' id='st-gate'></div></div></aside></div></div>" +
      "<div class='part' id='env'>" + U.sect("Técnico", "Por dentro: o ambiente de dev e as automações no Azure",
        "Um ambiente pequeno, descrito em código, para validar de ponta a ponta antes de crescer.") +
      U.seg([{ items: TECH.map(function (t) { return [t.id, t.label]; }) }], "Desenhos técnicos") +
      "<div class='work'>" + U.stage("play", U.legend(T.envLegend)) + "<aside class='side'>" + U.steps() + "</aside></div></div>";
    function apply(k, map) {
      var S = J.steps[k];
      for (var n in map.nodes) {   /* o que ainda não chegou não aparece; o que foi desligado fica só no contorno */
        var d = map.nodes[n].def, later = d.p > k, gone = S.ghost && S.ghost.indexOf(n) >= 0, sub = S.subs && S.subs[n];
        map.sub(n, sub || null);
        map.node(n, later ? "hid" : gone ? "ghost" : d.p === k ? "new" : "", sub && !later && !gone ? "swap" : "");
      }
      for (var e in map.edges) {
        var x = map.edges[e].def, off = x.p > k || (x.until != null && k > x.until);
        map.edge(e, off ? "hid" : x.p === k ? "new" : "seen", off ? 0 : map.natural(e));
      }
      document.getElementById("st-items").innerHTML = "<ul>" + S.items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
      document.getElementById("st-gate").innerHTML = S.gate ? "<div class='gate'>" + esc(S.gate) + "</div>" : "<p class='mut'>É o ponto de partida.</p>";
      return { title: S.title, sub: S.text };
    }
    U.Phased(document.getElementById("jr"), {
      data: J, steps: J.steps, apply: apply, subOf: function (k) { return J.steps[k].text; }, primary: true,
      aria: "Jornada: das automações de hoje ao catálogo usado pelo ServiceNow, pelo Stellar e por outros produtos"
    });
    U.Player(document.getElementById("env"), {
      scenarios: TECH, start: arg, unit: "desenho", tag: function (s) { return s.tag; }, onPick: function (id) { U.hash("jornada", id); }
    });
    if (arg && U.byId(TECH, arg)) document.getElementById("env").scrollIntoView();
  }

  /* ---------- 2 · Base ---------- */
  function base() {
    var n = 0;
    view.innerHTML = U.head("A base, passo a passo",
        "Cada passo termina com algo que roda. Os marcados já estão em código, com teste: falta rodar no ambiente.") +
      "<div class='rail'><div class='rhead'><span></span><span>Passo</span><span>Pronto quando</span><span>Onde</span></div>" + T.base.map(function (g) {
        return "<section class='rsec'><header><b>" + esc(g.phase) + "</b><small>" + esc(g.when) + "</small></header>" + g.steps.map(function (s) {
          return "<div class='rstep'><span class='n'>" + U.pad(++n) + "</span><b>" + esc(s[0]) + "</b><p>" + esc(s[1]) + "</p><span class='tagc'>" + esc(s[2]) + (s[3] ? "<i>em código</i>" : "") + "</span></div>"; }).join("") + "</section>"; }).join("") + "</div>" +
      "<div class='below'>" + U.sect(null, "Seis repositórios", "Cada peça no seu lugar. O pull request de um agente passa pelos mesmos gates de um pull request humano.") +
      "<div class='cols n6'>" + T.repos.map(function (r) { return "<div class='col'><h3 class='mono'>" + esc(r[0]) + "</h3><p>" + esc(r[1]) + "</p></div>"; }).join("") + "</div></div>";
  }

  /* ---------- 3 · Recursos ---------- */
  function recursos() {
    function when(w) { return "<small class='" + (w === "agora" ? "w-now" : w === "pronto" ? "w-done" : "") + "'>" + esc(w) + "</small>"; }
    view.innerHTML = U.head("O que pedir para começar",
        "Um ambiente de dev, pequeno, para validar de ponta a ponta. Produção entra depois do primeiro fluxo completo.") +
      "<div class='cards'>" + T.resources.map(function (g) {
        return "<div class='card'><h3>" + esc(g[0]) + "</h3><ul>" + g[1].map(function (i) { return "<li><span>" + esc(i[0]) + "</span>" + when(i[1]) + "</li>"; }).join("") + "</ul></div>"; }).join("") + "</div>" +
      "<div class='below'>" + U.sect(null, "Quem", "A capacidade que os agentes liberam é remanejada conforme os indicadores, não pelo calendário.") +
      U.cols(T.people, "n6") +
      "<p class='aside'>A lista completa, com tamanhos e nomes, fica no repositório <span class='mono'>dw-platform-infra</span>.</p></div>";
  }

  /* ---------- 4 · Times: passar o cursor mostra o combinado com cada time ---------- */
  function times() {
    var X = T.teams, nodes = { us: null }, links = [];
    X.list.forEach(function (l) {
      var name = X.nodes.filter(function (n) { return n.id === l[0]; })[0].t;
      nodes[l[0]] = { k: l[1], html: "<span class='two'><span><b>Pedimos</b>" + esc(l[2]) + "</span><span><b>Entregamos</b>" + esc(l[3]) + "</span></span>" };
      links.push({ edges: X.edges.filter(function (e) { return e.a === l[0] || e.b === l[0]; }).map(function (e) { return e.id; }), k: l[1], name: name, html: nodes[l[0]].html });   /* a ligação mostra o mesmo combinado */
    });
    view.innerHTML = U.head("Seis times, um combinado com cada um", "O que pedimos, o que cada time recebe e quando. Os pedidos de maior prazo saem na Fase 0.") +
      "<div class='work solo' id='tm'>" + U.stage("hover", U.legend([["core", "Time de automações"], ["person", "Time parceiro"]])) + "</div>";
    document.querySelector("#tm .stage").classList.add("wide");   /* o combinado ocupa duas colunas */
    U.Hover(document.getElementById("tm"), {
      data: X, title: "Quem entra, e quando", hint: "Passe o cursor, ou toque, em um time para ver o combinado com ele.",
      aria: "O time de automações e os seis times parceiros", nodes: nodes, links: links
    });
  }

  /* ---------- 5 · Agentes: o fluxo de cada um, sobre o mapa da plataforma; embaixo, a regra, as funções e como construir ---------- */
  var AGENTS = [{ name: "Jornada", ids: ["s-demanda"] }, { name: "Entrega", ids: ["a-intake", "a-roi", "a-arch", "a-precode", "a-qa"] },
    { name: "Operação", ids: ["a-ops"] }, { name: "ServiceNow", ids: ["a-nowdev"] }];
  function agentes(arg) {
    var F = T.functions, agents = F.filter(function (f) { return f[5] === "agente"; }).length;
    view.innerHTML = U.head("Sete agentes no trabalho do time. Em todos, uma pessoa decide.",
        "Cada agente tem um fluxo, do que o aciona ao que uma pessoa decide, passando pelo ServiceNow, pelo Hub e pelo DevOps.") +
      U.flows("fl", AGENTS, D.scenarios, "Agentes") +
      "<div class='below'>" + U.sect(null, F.length + " funções mapeadas. Só " + agents + " pedem um agente.", "A regra é a menor arquitetura que resolve: código antes de modelo, modelo antes de agente.") +
      "<div class='ladder'>" + T.ladder.map(function (l, i) { return "<div><small>" + (i + 1) + (l[2] ? " · " + esc(l[2]) : "") + "</small><b>" + esc(l[0]) + "</b><span>" + esc(l[1]) + "</span></div>"; }).join("") + "</div>" +
      U.sect(null, "Todas as funções", "Toque em uma função para ver o antes, o depois e o que continua com pessoas. As marcadas como proposta ainda não estão no plano de fases.", "funcoes") +
      "<div class='part' id='fn'>" + U.functions(F, T.groups) + "</div>" +
      U.sect(null, "Como implementar um agente", "Oito passos, os mesmos para todos. Sem conjunto de avaliação, o agente não vai para uso real.") +
      "<ol class='stepper'>" + T.build.map(function (b, i) { return "<li><small>" + U.pad(i + 1) + "</small><b>" + esc(b[0]) + "</b><span>" + esc(b[1]) + "</span></li>"; }).join("") + "</ol>" +
      U.sect(null, "O que todo agente tem") + U.cols(T.controls) + "</div>";
    U.Functions(document.getElementById("fn"), "agente");
    U.Flows("fl", AGENTS, D.scenarios, { start: arg, primary: true, onPick: function (id) { U.hash("agentes", id); } });
    if (arg === "funcoes") document.getElementById("funcoes").scrollIntoView();   /* #agentes/funcoes abre direto na lista das funções */
  }

  U.shell({
    page: "automacoes", base: "../",
    tabs: [["jornada", "Jornada"], ["base", "Base"], ["recursos", "Recursos"], ["times", "Times"], ["agentes", "Agentes"]],
    views: { jornada: jornada, base: base, recursos: recursos, times: times, agentes: agentes }
  });
})();
