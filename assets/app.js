/* Página da plataforma: 1 plataforma (executivo e técnico), 2 autoatendimento, 3 agentes, 4 fases.
   O conteúdo vem de assets/data.js; as peças das telas, de assets/ui.js. */
(function () {
  "use strict";
  var D = window.DW, U = D.ui, esc = U.esc, view = U.view;
  var LEG = [["core", "Peça da plataforma"], ["ext", "Já existe hoje"], ["person", "Pessoa"]];
  var WALK = [["act", "Passo atual"], ["new", "Já percorrido"]];

  /* ---------- 1 · Plataforma: o mapa executivo em cima, o desenho técnico embaixo ---------- */
  function plataforma(arg) {
    view.innerHTML = U.head("Quatro peças que conversam entre si",
        "O Automation Hub executa automações. O Now Event Hub distribui os eventos do ServiceNow. O ServiceNow MCP abre o ServiceNow como ferramentas. Os agentes usam as três.") +
      "<div class='work solo' id='exec'>" + U.stage("hover", U.legend(LEG)) + "</div>" +
      "<div class='part' id='tech'>" + U.sect("Técnico", "Por dentro: como fica no Azure",
        "A plataforma inteira e cada peça, com o caminho de uma chamada. Aqui aparecem só o tipo de serviço e o papel de cada um.") +
      U.seg([{ items: D.tech.map(function (t) { return [t.id, t.label]; }) }], "Desenhos técnicos") +
      "<div class='work'>" + U.stage("play", U.legend(D.techLegend)) + "<aside class='side'>" + U.steps() + "</aside></div></div>" +
      "<div class='below'>" + U.sect(null, "Regras do desenho") + U.cols(D.rules) + "</div>";

    var nodes = {};
    D.nodes.forEach(function (n) { nodes[n.id] = { k: "Fora da plataforma", text: D.outside[n.id] }; });
    D.pieces.forEach(function (p) { nodes[p.id] = { k: p.phase, title: p.name, text: p.text, more: [p.id, "Ver por dentro ↓"] }; });
    U.Hover(document.getElementById("exec"), {
      title: "A estrutura final", hint: "Passe o cursor, ou toque, em uma peça ou em uma ligação para ver o que passa por ali.",
      aria: "Mapa da plataforma: ServiceNow, Automation Hub, Now Event Hub, ServiceNow MCP e agentes", nodes: nodes, links: D.links
    });
    var tech = document.getElementById("tech");
    var player = U.Player(tech, {
      scenarios: D.tech, start: arg, primary: true, tag: function (t) { return t.tag; },
      onPick: function (id) { U.hash("plataforma", id); }
    });
    document.getElementById("exec").addEventListener("click", function (ev) {
      var b = ev.target.closest(".js-more"); if (!b) return;
      player.load(b.getAttribute("data-more")); U.hash("plataforma", b.getAttribute("data-more"));
      tech.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    if (arg && U.byId(D.tech, arg)) tech.scrollIntoView();
  }

  /* ---------- 2 e 3 · exemplos que andam sobre o mapa executivo ---------- */
  function examples(tab, groups, arg, title, lead, below) {
    var items = groups.map(function (g) { return { name: g.name, items: g.ids.map(function (id) { return [id, U.byId(D.scenarios, id).short]; }) }; });
    var list = []; groups.forEach(function (g) { g.ids.forEach(function (id) { list.push(U.byId(D.scenarios, id)); }); });
    view.innerHTML = U.head(title, lead) + "<div class='part' id='ex'>" + U.seg(items) +
      "<div class='work'>" + U.stage("play", U.legend(WALK.concat(LEG))) + "<aside class='side'>" + U.steps() + "</aside></div></div>" +
      "<div class='below'>" + below + "</div>";
    U.Player(document.getElementById("ex"), {
      scenarios: list, start: arg, primary: true,
      tag: function (s) { return "Fase " + s.phase + " · " + s.short; },
      onPick: function (id) { U.hash(tab, id); }
    });
  }
  function autoatendimento(arg) {
    examples("autoatendimento", D.acts.autoatendimento, arg, "A POC: o Digital Workplace se serve primeiro",
      "Antes de qualquer agente, a plataforma atende pedidos reais do nosso próprio ServiceNow.",
      U.sect(null, "A POC em uma página", "A linha de base é medida antes de começar. As metas numéricas são definidas depois dela.") +
      "<div class='cols'>" + D.poc.map(function (c) { return "<div class='col'><h3>" + esc(c[0]) + "</h3><ul>" + c[1].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>"; }).join("") + "</div>");
  }
  function agentes(arg) {
    examples("agentes", D.acts.agentes, arg, "Agentes no trabalho repetitivo, pessoas nas decisões",
      "Com a plataforma de pé, os agentes entram em três frentes. Cada um entrega algo que uma pessoa revisa.",
      U.sect(null, "O que muda no trabalho de cada papel", "A capacidade liberada é remanejada conforme os indicadores de lead time e de qualidade, não pelo calendário.") +
      U.table(["Papel", "Deixa de", "Passa a"], D.roles, ["nb", "was", ""]) +
      U.sect(null, "Os sete agentes", "Cada um recebe uma entrada estruturada e devolve algo que uma pessoa aprova.") +
      U.table(["Agente", "Entrega", "Fase"], D.agents, ["nb", "", "nb"]) +
      "<p class='aside'><b>Onde um agente não entra.</b> " + esc(D.notAgent) + "</p>" +
      "<p class='aside'><b>Para o time do ServiceNow.</b> O formulário, o flow, a regra e o evento que cada caso entrega estão na página <a href='servicenow/'>ServiceNow</a>.</p>");
  }

  /* ---------- 4 · Fases: o mapa mostra o que existe em cada fase ---------- */
  function fases() {
    var P = D.phases;
    view.innerHTML = U.head("Cinco fases: primeiro a fundação, depois os agentes",
        "A fundação são as Fases 0 a 2: base, Automation Hub, MCP e Event Hub.") +
      "<div class='part' id='ph'>" + U.timeline(P.map(function (p) { return { b: p.n, name: p.name, when: p.when }; })) +
      "<div class='work'>" + U.stage("play", U.legend([["new", "Entra nesta fase"], ["core", "Construído antes"], ["ext", "Já existe hoje"], ["ghost", "Ainda não existe"]])) +
      "<aside class='side'><div class='panel'><h2>O que entra</h2><div class='pbody' id='ph-items'></div></div>" +
      "<div class='panel'><h2>Critério de saída</h2><div class='pbody' id='ph-gate'></div></div></aside></div></div>";
    function apply(k, map) {
      var F = P[k];
      for (var n in map.nodes) {
        var d = map.nodes[n].def, last = null;
        for (var j = 0; j <= k; j++) if (P[j].news && P[j].news[n]) last = P[j].news[n];
        map.sub(n, d.p > k ? null : last);
        map.node(n, d.p > k ? "ghost" : F.news && F.news[n] ? "new" : "");
      }
      for (var e in map.edges) { var p = map.edges[e].def.p; map.edge(e, p > k ? "ghost" : p === k ? "new" : "seen", p > k ? 0 : map.natural(e)); }
      document.getElementById("ph-items").innerHTML = "<ul>" + F.items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
      document.getElementById("ph-gate").innerHTML = "<div class='gate'>" + esc(F.gate) + "</div>" + (F.works.length ? "<p class='lab'>Passa a funcionar</p><div class='goes'>" + F.works.map(function (id) {
        var s = U.byId(D.scenarios, id), tab = D.acts.autoatendimento[0].ids.indexOf(id) >= 0 ? "autoatendimento" : "agentes";
        return "<button class='seg-b' type='button' data-go='" + tab + "' data-arg='" + id + "' title='" + esc(s.title) + "'>" + esc(s.short) + " →</button>"; }).join("") + "</div>" : "");
      return { title: F.n + " · " + F.name, sub: F.goal };
    }
    U.Phased(document.getElementById("ph"), {
      steps: P, apply: apply, subOf: function (k) { return P[k].goal; }, primary: true, aria: "Mapa da plataforma por fase"
    });
  }

  U.shell({
    page: "plataforma", base: "",
    tabs: [["plataforma", "Plataforma"], ["autoatendimento", "Autoatendimento"], ["agentes", "Agentes"], ["fases", "Fases"]],
    views: { plataforma: plataforma, autoatendimento: autoatendimento, agentes: agentes, fases: fases }
  });
})();
