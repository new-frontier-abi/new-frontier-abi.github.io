/* Página da plataforma, em /plataforma/: 1 plataforma (executivo e técnico), 2 autoatendimento (fluxos sobre o mapa), 3 fases.
   Os fluxos dos agentes ficam na página Agentes, a entrada do site. O conteúdo vem de assets/data.js; as peças das telas, de assets/ui.js. */
(function () {
  "use strict";
  var D = window.DW, U = D.ui, esc = U.esc, view = U.view;
  var LEG = [["core", "Peça da plataforma"], ["ext", "Já existe hoje"], ["person", "Pessoa"]];

  /* ---------- 1 · Plataforma: o mapa executivo em cima, o desenho técnico embaixo ---------- */
  function plataforma(arg) {
    view.innerHTML = U.head("Quatro peças que conversam entre si",
        "O Automation Hub executa automações. O Now Event Hub distribui os eventos do ServiceNow. O ServiceNow MCP abre o ServiceNow como ferramentas. Os agentes usam as três.") +
      "<div class='work solo' id='exec'>" + U.stage("hover", U.legend(LEG)) + "</div>" +
      "<div class='part' id='tech'>" + U.sect("Técnico", "Por dentro: como fica no Azure",
        "A plataforma inteira e cada peça, com o caminho de uma chamada. Aqui aparecem só o tipo de serviço e o papel de cada um.") +
      U.seg([{ items: D.tech.map(function (t) { return [t.id, t.label]; }) }], "Desenhos técnicos") +
      "<div class='work'>" + U.stage("play", U.legend(D.techLegend)) + "<aside class='side'>" + U.steps() + "</aside></div></div>" +
      "<div class='below'>" + U.sect(null, "Regras do desenho") + U.cols(D.rules) +
      U.sect(null, "Quatro páginas, uma plataforma", "O mesmo desenho, visto pelas operações que criam agentes, por quem constrói e por quem cuida do ServiceNow.") +
      "<div class='jumps'>" + D.site.map(function (j) {
        return "<a class='jump' href='" + j[0] + "'" + (j[0].charAt(0) === "#" ? " data-go='" + j[0].slice(1) + "'" : "") + "><small>" + esc(j[1]) + "</small><b>" + esc(j[2]) + "</b><span>" + esc(j[3]) + "</span></a>"; }).join("") + "</div></div>";

    var nodes = {};
    D.nodes.forEach(function (n) { nodes[n.id] = { k: "Fora da plataforma", text: D.outside[n.id] }; });
    D.pieces.forEach(function (p) { nodes[p.id] = { k: p.phase, title: p.name, text: p.text, more: [p.id, "Ver por dentro ↓"] }; });
    U.Hover(document.getElementById("exec"), {
      title: "A estrutura final", hint: "Passe o cursor, ou toque, em uma peça ou em uma ligação para ver o que passa por ali.",
      aria: "Mapa da plataforma: ServiceNow, Automation Hub, Now Event Hub, ServiceNow MCP e agentes", nodes: nodes, links: D.links
    });
    var tech = document.getElementById("tech");
    var player = U.Player(tech, {
      scenarios: D.tech, start: arg, primary: true, unit: "desenho", tag: function (t) { return t.tag; },
      onPick: function (id) { U.hash("plataforma", id); }
    });
    document.getElementById("exec").addEventListener("click", function (ev) {
      var b = ev.target.closest(".js-more"); if (!b) return;
      player.load(b.getAttribute("data-more")); U.hash("plataforma", b.getAttribute("data-more"));
      tech.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    if (arg && U.byId(D.tech, arg)) U.aim(tech);
  }

  /* ---------- 2 · fluxos sobre o mapa executivo: o mapa inteiro fica à vista, e o fluxo acende o caminho ---------- */
  function flows(tab, groups, arg, title, lead, below) {
    view.innerHTML = U.head(title, lead) + U.flows("fl", groups, D.scenarios) + "<div class='below'>" + below + "</div>";
    U.Flows("fl", groups, D.scenarios, { start: arg, primary: true, onPick: function (id) { U.hash(tab, id); } });
  }
  function autoatendimento(arg) {
    flows("autoatendimento", D.acts.autoatendimento, arg, "A POC: o Digital Workplace se serve primeiro",
      "Antes de qualquer agente, a plataforma atende pedidos reais do nosso próprio ServiceNow.",
      U.sect(null, "A POC em uma página", "A linha de base é medida antes de começar. As metas numéricas são definidas depois dela.") +
      "<div class='cols'>" + D.poc.map(function (c) { return "<div class='col'><h3>" + esc(c[0]) + "</h3><ul>" + c[1].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>"; }).join("") + "</div>" +
      "<p class='aside'><b>Agentes.</b> O fluxo de cada agente, como qualquer operação cria um pela IDE, a governança e as decisões estão na página <a href='../'>Agentes</a>.</p>");
  }

  /* ---------- 4 · Fases: o mapa mostra o que existe em cada fase; o que ainda não existe fica só no contorno ---------- */
  function fases() {
    var P = D.phases;
    view.innerHTML = U.head("Cinco fases: primeiro a fundação, depois os agentes",
        "A fundação são as Fases 0 a 2: base, Automation Hub, MCP e Event Hub. Na Fase 2, as operações também começam a criar agentes pela IDE.") +
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
        var s = U.byId(D.scenarios, id);
        if (D.acts.autoatendimento[0].ids.indexOf(id) >= 0) return "<button class='seg-b' type='button' data-go='autoatendimento' data-arg='" + id + "' title='" + esc(s.title) + "'>" + esc(s.short) + " →</button>";
        var x = D.away[id] || ["dw", s.short, s.title];   /* os fluxos dos agentes estão na página Agentes */
        return "<a class='seg-b' href='../#" + x[0] + "/" + id + "' title='" + esc(x[2]) + "'>" + esc(x[1]) + " →</a>"; }).join("") + "</div>" : "");
      return { title: F.n + " · " + F.name, sub: F.goal };
    }
    U.Phased(document.getElementById("ph"), {
      steps: P, apply: apply, subOf: function (k) { return P[k].goal; }, primary: true, aria: "Mapa da plataforma por fase"
    });
  }

  U.shell({
    page: "plataforma", base: "../",
    tabs: [["plataforma", "Visão geral"], ["autoatendimento", "Autoatendimento"], ["fases", "Fases"]],
    views: { plataforma: plataforma, autoatendimento: autoatendimento, fases: fases },
    moved: function (tab, arg) { return tab === "agentes" ? "../#dw" + (arg ? "/" + arg : "") : null; }   /* os agentes foram para a página de entrada */
  });
})();
