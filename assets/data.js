/* Conteúdo do site. Um só mapa (nodes + edges); pieces, links, scenarios e phases apontam para ele.
   c, r: coluna e linha na grade. h: altura em linhas. p: fase em que nasce (-1 = já existe hoje). */
window.DW = {
  nodes: [
    { id: "user",   t: "Funcionário",        s: "pede no catálogo",          c: 0, r: 0.5, k: "person", p: -1 },
    { id: "now",    t: "ServiceNow",         s: "catálogo, tickets, flows",  c: 1, r: 0, h: 2, k: "ext", p: -1,
      ports: [{ r: 0, t: "eventos" }, { r: 1, t: "ação de Flow" }] },
    { id: "eh",     t: "Now Event Hub",      s: "eventos assináveis",        c: 2, r: 0, k: "core", p: 2 },
    { id: "hub",    t: "Automation Hub",     s: "catálogo, fila, execução",  c: 2, r: 1, k: "core", p: 1 },
    { id: "ag",     t: "Agentes",            s: "entrega e operação",        c: 3, r: 0, k: "core agent", p: 2 },
    { id: "mcp",    t: "ServiceNow MCP",     s: "ferramentas governadas",    c: 3, r: 1, k: "core", p: 2 },
    { id: "llm",    t: "Asimov",             s: "gateway de modelos",        c: 4, r: 0, k: "ext", p: -1 },
    { id: "nowapi", t: "ServiceNow",         s: "dados e configuração",      c: 4, r: 1, k: "ext", p: -1 },
    { id: "target", t: "Sistemas alvo",      s: "Entra ID, SAP, outros",     c: 2, r: 2, k: "ext", p: -1 },
    { id: "client", t: "Stellar e IDE",      s: "chat e time, pelo MCP",     c: 3, r: 2, k: "ext", p: 2 },
    { id: "ci",     t: "Esteira de entrega", s: "pull request e pipeline",   c: 3, r: -1, k: "ext", p: 0 },
    { id: "team",   t: "Time DW",            s: "revisa, aprova, decide",    c: 4, r: -1, k: "person", p: -1 }
  ],
  zone: { c0: 2, c1: 3, r0: 0, r1: 1, label: "PLATAFORMA" },

  /* a -> b é o sentido natural. bi: a conversa acontece nos dois sentidos. p: fase em que a ligação passa a funcionar. */
  edges: [
    { id: "user-now",   a: "user",   b: "now",    bi: true, p: -1 },
    { id: "now-eh",     a: "now",    b: "eh",     p: 2 },
    { id: "now-hub",    a: "now",    b: "hub",    bi: true, p: 1 },
    { id: "eh-hub",     a: "eh",     b: "hub",    bi: true, p: 2 },
    { id: "eh-ag",      a: "eh",     b: "ag",     p: 2 },
    { id: "ag-mcp",     a: "ag",     b: "mcp",    p: 2 },
    { id: "mcp-hub",    a: "mcp",    b: "hub",    p: 2 },
    { id: "ag-llm",     a: "ag",     b: "llm",    p: 2 },
    { id: "mcp-nowapi", a: "mcp",    b: "nowapi", bi: true, p: 2 },
    { id: "hub-target", a: "hub",    b: "target", p: 1 },
    { id: "client-mcp", a: "client", b: "mcp",    bi: true, p: 2 },
    { id: "ag-ci",      a: "ag",     b: "ci",     at: 0.34, p: 3 },
    { id: "ci-team",    a: "ci",     b: "team",   p: 0 },
    { id: "ag-team",    a: "ag",     b: "team",   elbow: 0.8, p: 2 }
  ],

  /* ---------- 1 · A plataforma ---------- */
  pieces: [
    { id: "hub", name: "Automation Hub", phase: "Fase 1", text: "Catálogo e runtime de automações em Python. Fila, repetição, log e monitoramento vêm da plataforma: a automação só contém a regra de negócio." },
    { id: "eh",  name: "Now Event Hub", phase: "Fase 2", text: "O ServiceNow publica eventos selecionados uma única vez. Cada time assina o que precisa, sem trigger novo." },
    { id: "mcp", name: "ServiceNow MCP", phase: "Fases 2 e 3", text: "O ServiceNow como ferramentas de negócio, com a identidade e as permissões de quem pede. Leitura primeiro; escrita governada depois." },
    { id: "ag",  name: "Agentes", phase: "Fases 2 a 4", text: "Assumem o trabalho repetitivo de entrega e de operação, usando as outras três peças. Pessoas decidem nos pontos de aprovação." }
  ],
  links: [
    { edges: ["now-hub"],          name: "ServiceNow ↔ Automation Hub",   text: "Uma ação de Flow única: qualquer oferta chama qualquer automação do catálogo. O desfecho volta por callback e fecha o item." },
    { edges: ["now-eh"],           name: "ServiceNow → Now Event Hub",    text: "Uma regra publicadora envia os eventos selecionados, só com identificadores. Evento novo é uma linha no registro." },
    { edges: ["eh-hub"],           name: "Now Event Hub ↔ Automation Hub", text: "Uma assinatura liga um evento a uma automação, sem código novo. O Hub também publica o desfecho de cada execução." },
    { edges: ["eh-ag"],            name: "Now Event Hub → Agentes",       text: "Agentes são acionados por evento: demanda criada, incidente aberto, prazo perto de estourar." },
    { edges: ["ag-mcp"],           name: "Agentes → ServiceNow MCP",      text: "Agentes leem e escrevem no ServiceNow só pelas ferramentas, dentro do semáforo de governança." },
    { edges: ["mcp-hub"],          name: "ServiceNow MCP → Automation Hub", text: "O catálogo do Hub aparece como ferramentas: listar automações, executar uma, acompanhar a execução." },
    { edges: ["mcp-nowapi"],       name: "ServiceNow MCP ↔ ServiceNow",   text: "Leitura com as ACLs do próprio usuário. Configuração só em sub-produção, com change request e revisão humana." },
    { edges: ["hub-target"],       name: "Automation Hub → Sistemas alvo", text: "A automação age no sistema com a credencial do próprio domínio, guardada em cofre." },
    { edges: ["ag-llm"],           name: "Agentes → Asimov",              text: "Toda chamada de modelo passa pelo gateway corporativo. Nenhuma chamada direta a provedor." },
    { edges: ["client-mcp"],       name: "Stellar e IDE ↔ ServiceNow MCP", text: "O chat dos funcionários e o próprio time usam as mesmas ferramentas que os agentes." },
    { edges: ["ag-ci", "ci-team", "ag-team"], name: "Agentes → Time DW",  text: "Agentes entregam pull request, rascunho ou diagnóstico. Uma pessoa revisa, aprova e decide." }
  ],
  rules: [
    ["Determinístico primeiro", "Código para regra fixa. Uma chamada de modelo para um passo só. Agente apenas quando há ferramentas, estado e passos adaptativos."],
    ["Menor privilégio", "As ferramentas agem com a identidade de quem pede. Verde é autoatendimento; amarelo só escreve em sub-produção; vermelho vira pedido de aprovação."],
    ["Um gateway de modelos", "Toda chamada de modelo passa pelo Asimov, com limite de custo, de tempo e de iterações por execução."],
    ["Pessoa no controle", "Toda entrega de agente termina em uma revisão humana: pull request, rascunho em sub-produção ou diagnóstico."]
  ],

  /* ---------- 2 · Autoatendimento no ServiceNow (POC) ---------- */
  poc: [
    ["Escopo", ["As 10 primeiras automações do catálogo, com API e baixo risco", "Uma ação de Flow para todas as ofertas", "Os três primeiros tipos de evento publicados", "Ferramentas de leitura do MCP para o próprio time"]],
    ["O que medimos", ["Taxa de sucesso por automação", "Triggers ponto a ponto no ServiceNow", "Automações publicadas no catálogo", "Uso do MCP por consumidor"]],
    ["O que a POC prova", ["Oferta nova com automação é configuração do Flow, não integração", "Evento novo é uma linha no registro, não um trigger", "Outros times se servem sem depender de um desenvolvedor do ServiceNow"]]
  ],

  /* ---------- 3 · Agentes ---------- */
  agents: [
    ["Intake", "Triagem e refinamento do pedido", "Demanda estruturada e classificada", "2 (piloto)"],
    ["ROI", "Planilha de caso de negócio", "Volume, horas economizadas e prioridade sugerida", "2 (piloto)"],
    ["Arquitetura", "Desenho inicial e checagem de padrão", "Proposta, riscos e desvios de padrão", "3"],
    ["Pré-código", "Primeira versão da automação", "Pull request com automação, manifesto e testes", "3"],
    ["QA", "Escrita e execução de testes", "Casos executados e evidências no pull request", "3"],
    ["Now Dev", "Configuração repetitiva no ServiceNow", "Rascunho em sub-produção, com change request", "4"],
    ["Operação", "Análise de falha e de prazo", "Causa provável e correção sugerida", "4"]
  ],
  roles: [
    ["Analista de intake e de negócio", "Montar triagem e planilha", "Validar o que o agente trouxe e decidir"],
    ["Desenvolvedor de automação", "Começar do zero", "Revisar pull requests e resolver o que o agente não resolve"],
    ["Analista de QA", "Escrever e rodar casos repetitivos", "Definir critério de aceite e cuidar dos conjuntos de avaliação"],
    ["Arquiteto", "Conferir padrão caso a caso", "Manter os padrões que o agente aplica e decidir os desvios"],
    ["Desenvolvedor ServiceNow", "Configurar item a item e criar trigger por integração", "Revisar rascunhos e manter flows e a regra publicadora"],
    ["Plantão e suporte", "Garimpar log", "Receber o diagnóstico pronto e decidir a correção"]
  ],
  notAgent: [
    ["Executar a automação", "É regra fixa: código, com teste."],
    ["Calcular o retorno", "É conta: código. O modelo interpreta o pedido, não faz a aritmética."],
    ["Aprovar pull request e produção", "Responsabilidade de uma pessoa, sempre."],
    ["Conceder acesso ou papel", "Nunca direto: processo de aprovação do ServiceNow."]
  ],

  /* ---------- exemplos: path percorre ligações do mapa; sub troca a segunda linha de um nó naquele passo ---------- */
  acts: {
    autoatendimento: [{ name: null, ids: ["s-pedido", "s-evento", "s-mcp"] }],
    agentes: [
      { name: "Operação do ServiceNow", ids: ["s-nowdev", "s-triagem"] },
      { name: "Time de automações", ids: ["s-demanda", "s-falha"] },
      { name: "Operações", ids: ["s-chat"] }
    ]
  },
  scenarios: [
    { id: "s-pedido", phase: 1, title: "Um pedido resolvido sem ninguém no caminho",
      today: "Cada oferta tem a própria integração, e muitas terminam em tarefa manual.",
      steps: [
        { path: ["user", "now"], t: "Ana pede acesso a um grupo", d: "Pelo catálogo do ServiceNow, como hoje. Nada muda para quem pede." },
        { path: ["now", "hub"], t: "A oferta chama o Hub", d: "Uma ação de Flow única serve a todas as ofertas. Muda só qual automação chamar e com quais parâmetros." },
        { path: ["hub"], t: "O Hub enfileira e executa", d: "Fila, repetição em caso de falha, log e monitoramento vêm da plataforma. A automação só contém a regra de negócio." },
        { path: ["hub", "target"], t: "A automação inclui Ana no grupo", d: "Uma função Python age no Entra ID, com a credencial do próprio domínio." },
        { path: ["hub", "now"], t: "O ServiceNow fecha o item", d: "O desfecho volta por callback. Se a automação falhar, o item vai para o grupo solucionador." },
        { path: ["now", "user"], t: "Ana é avisada", d: "Pela notificação de sempre. Ninguém do time tocou no pedido." }
      ] },
    { id: "s-evento", phase: 2, title: "Um evento dispara a automação, sem trigger novo",
      today: "Cada integração nova pede um trigger novo e uma chamada nova no ServiceNow.",
      steps: [
        { path: ["now"], t: "Um item é aprovado no ServiceNow", d: "A mudança acontece no registro, como sempre." },
        { path: ["now", "eh"], t: "O ServiceNow publica o evento", d: "Uma regra publicadora envia o evento uma única vez, só com identificadores." },
        { path: ["eh", "hub"], t: "Uma assinatura liga o evento à automação", d: "É configuração feita pelo dono da automação. Não há código novo nem trigger novo." },
        { path: ["hub", "target"], t: "A automação executa", d: "Pelo mesmo caminho de qualquer chamada: fila, worker, sistema alvo." },
        { path: ["hub", "eh"], t: "O desfecho também vira evento", d: "Quem quiser acompanhar assina. Um assinante novo não muda nada no ServiceNow." },
        { path: ["hub", "now"], t: "O item é atualizado", d: "O callback fecha o ciclo no próprio registro." }
      ] },
    { id: "s-mcp", phase: 2, title: "O time se serve pelas ferramentas", sub: { client: "IDE do time" },
      today: "Quem precisa de um dado do ServiceNow pede a alguém do time ou ganha uma integração própria.",
      steps: [
        { path: ["client", "mcp"], t: "Um engenheiro pergunta pela IDE", d: "Quantos pedidos esta oferta recebe por mês, e quanto tempo levam? A pergunta vira uma chamada de ferramenta." },
        { path: ["mcp"], t: "O MCP confere o escopo e o semáforo", d: "Leitura é verde. A ferramenta só aceita o que o token do usuário permite." },
        { path: ["mcp", "nowapi"], t: "O ServiceNow responde com as ACLs do usuário", d: "Ele só vê o que já poderia ver no portal. Não há conta de serviço com acesso amplo." },
        { path: ["mcp", "client"], t: "A resposta volta, e a chamada fica auditada", d: "Quem pediu, qual ferramenta, quando e com qual resultado." },
        { path: ["client", "mcp", "hub"], t: "O catálogo do Hub também é ferramenta", d: "Pela mesma porta ele lista as automações e executa uma em non-prod, sem integração nova." }
      ] },
    { id: "s-nowdev", phase: 4, title: "O agente configura, o time do ServiceNow revisa", sub: { ag: "Agente Now Dev" },
      today: "Ofertas, grupos e regras são configurados à mão, um a um, a partir do ticket.",
      steps: [
        { path: ["now", "eh"], t: "Chega um pedido de oferta nova", d: "O ticket de intake vira um evento de demanda criada." },
        { path: ["eh", "ag"], t: "O agente Now Dev assume", d: "Recebe o pedido estruturado e procura a oferta parecida mais próxima." },
        { path: ["ag", "llm"], t: "Monta a configuração", d: "Item de catálogo, variáveis e regra de atribuição. Toda chamada de modelo passa pelo gateway." },
        { path: ["ag", "mcp"], t: "Usa ferramentas amarelas", d: "Ferramentas de configuração só escrevem em sub-produção, sempre com change request aberta." },
        { path: ["mcp", "nowapi"], t: "O rascunho nasce em sub-produção", d: "Pelos subflows mantidos pelo time do ServiceNow. Concessão de acesso nunca é direta: vira pedido de aprovação." },
        { path: ["ag", "team"], t: "Um desenvolvedor do ServiceNow revisa", d: "O trabalho manual vira revisão. Ajustes voltam ao agente como comentário." },
        { path: ["team"], t: "A oferta é promovida", d: "Pelo processo normal de mudança do ServiceNow." }
      ] },
    { id: "s-triagem", phase: 4, title: "Tickets classificados na criação", sub: { ag: "Chamada de modelo" },
      today: "A triagem é manual até o ticket chegar ao grupo certo.",
      steps: [
        { path: ["now", "eh"], t: "Um incidente é aberto", d: "O ServiceNow publica o evento de incidente criado." },
        { path: ["eh", "ag"], t: "Uma chamada de modelo, não um agente", d: "Classificar é tarefa de um passo só. Uma chamada direta ao modelo resolve, com custo e risco menores." },
        { path: ["ag", "llm"], t: "O modelo sugere o grupo solucionador", d: "Com o grau de confiança da sugestão." },
        { path: ["ag", "mcp", "nowapi"], t: "A sugestão é gravada no ticket", d: "Por uma ferramenta verde, com auditoria." },
        { path: ["ag", "team"], t: "O incerto vai para uma pessoa", d: "O time trata o que o modelo marcou como incerto e revisa o restante por amostragem." }
      ] },
    { id: "s-demanda", phase: 3, title: "Uma demanda vira automação",
      today: "Alguém do time faz triagem, caso de negócio, desenho, primeira versão do código e testes à mão.",
      steps: [
        { path: ["now", "eh"], t: "A operação abre uma demanda", d: "Pelo mesmo ticket que já existe. O evento de demanda criada aciona os agentes." },
        { path: ["eh", "ag"], sub: { ag: "Agente Intake" }, t: "O agente Intake entende e classifica", d: "Prepara as perguntas de esclarecimento e diz se o caso pede código, RPA, uma chamada de modelo ou um agente." },
        { path: ["ag", "mcp", "hub"], sub: { ag: "Agente Intake" }, t: "Procura o que já existe", d: "Consulta o catálogo do Hub. Se uma automação já resolve, a resposta é reaproveitar." },
        { path: ["ag", "mcp", "nowapi"], sub: { ag: "Agente ROI" }, t: "O agente ROI monta o caso de negócio", d: "Volume de tickets e tempo de atendimento vêm do ServiceNow. A conta é feita em código, não pelo modelo." },
        { path: ["ag", "team"], sub: { ag: "Agente ROI" }, t: "Decisão 1: uma pessoa prioriza", d: "O dono do produto decide se a demanda entra. Se a resposta for não, o pedido volta com a justificativa." },
        { path: ["ag", "llm"], sub: { ag: "Agente Arquitetura" }, t: "O agente de Arquitetura propõe a solução", d: "Desenho, riscos e desvios dos padrões da companhia, com as fontes citadas." },
        { path: ["ag", "ci"], sub: { ag: "Agente Pré-código" }, t: "O agente de Pré-código abre o pull request", d: "Com a automação, o manifesto, os testes e a documentação." },
        { path: ["ag", "mcp", "hub"], sub: { ag: "Agente QA" }, t: "O agente de QA testa em non-prod", d: "Casos gerados do critério de aceite, executados no ambiente de teste, com as evidências anexadas." },
        { path: ["ci", "team"], t: "Decisão 2: um engenheiro aprova", d: "Revisa com proposta, código, testes e evidências em mãos." },
        { path: ["hub"], t: "A automação entra no catálogo", d: "Fica disponível para o ServiceNow e para os agentes e, na Fase 4, para o chat." }
      ] },
    { id: "s-falha", phase: 4, title: "Uma falha chega com o diagnóstico pronto", sub: { ag: "Agente Operação" },
      today: "A falha é descoberta depois, e o plantão garimpa log para entender.",
      steps: [
        { path: ["hub", "target"], t: "O sistema alvo está fora do ar", d: "A automação repete com espera. Esgotadas as tentativas, a execução fica separada, com todo o contexto." },
        { path: ["hub", "now"], t: "O pedido não fica sem atendimento", d: "O item segue para o grupo solucionador, com o motivo." },
        { path: ["hub", "eh"], t: "A falha vira evento", d: "O Hub publica o desfecho da execução no barramento." },
        { path: ["eh", "ag"], t: "O agente de Operação monta o diagnóstico", d: "Cruza o erro, as tentativas e as mudanças recentes." },
        { path: ["ag", "llm"], t: "Sugere a causa provável e a correção", d: "Com as evidências que sustentam a hipótese." },
        { path: ["ag", "team"], t: "O plantão recebe o diagnóstico pronto", d: "Uma pessoa decide: corrigir a automação, esperar o sistema voltar ou descartar." },
        { path: ["hub"], t: "Com o sistema de volta, uma pessoa reprocessa", d: "É a mesma execução: nada é criado em duplicidade." }
      ] },
    { id: "s-chat", phase: 4, title: "O chat resolve com as mesmas automações", sub: { client: "Stellar" },
      today: "Cada integração do chat com o ServiceNow ou com uma automação é construída caso a caso.",
      steps: [
        { path: ["client", "mcp"], t: "O funcionário pede no chat", d: "Em linguagem natural, sem saber qual oferta ou qual automação existe." },
        { path: ["mcp", "nowapi"], t: "O chat consulta com as permissões de quem pede", d: "Chamados, catálogo e conhecimento, com as ACLs do próprio usuário." },
        { path: ["mcp", "hub"], t: "Aciona uma automação do catálogo", d: "Cada automação publicada aparece como ferramenta. O time do Stellar não constrói a integração." },
        { path: ["hub", "target"], t: "A automação executa", d: "A mesma fila, o mesmo worker, o mesmo sistema alvo. Nada foi construído para o chat." },
        { path: ["mcp", "client"], t: "A resposta volta na conversa", d: "E o chat avisa do desfecho quando a execução termina." }
      ] }
  ],

  /* ---------- Fases. news: o que entra em cada peça na fase (vira a segunda linha do nó). ---------- */
  phases: [
    { n: "Fase 0", name: "Base", when: "out–nov 2026", goal: "Ambientes, identidade e esteira prontos para o primeiro deploy.",
      items: ["Ambientes de dev e produção como código", "Identidade e gateway pedidos aos times parceiros", "Esteira de entrega e padrão de log", "Linha de base de lead time e esforço por demanda"],
      gate: "Ambientes de dev funcionando e identidade aprovada", news: { ci: "esteira pronta" }, works: [] },
    { n: "Fase 1", name: "Automation Hub", when: "dez 2026–fev 2027", goal: "Catálogo e runtime em produção, com as primeiras automações chamadas pelo ServiceNow.",
      items: ["SDK Python e template de automação", "Catálogo, execuções e idempotência", "Filas, repetição, dead-letter e callback", "Ação de Flow única no ServiceNow", "Primeiras 10 automações migradas"],
      gate: "10 automações em produção pelo Hub, com meta de sucesso definida e medida por automação", news: { hub: "catálogo, fila, execução" }, works: ["s-pedido"] },
    { n: "Fase 2", name: "MCP e Event Hub", when: "mar–mai 2027", goal: "O ServiceNow aberto por ferramentas de leitura e por eventos, já ligados ao Hub.",
      items: ["MCP com a identidade do usuário e ferramentas de leitura", "Catálogo do Hub exposto como ferramentas", "Regra publicadora, ingestão e primeiros eventos", "Assinaturas que disparam automações", "Piloto dos agentes Intake e ROI, só com leitura"],
      gate: "MCP de leitura e eventos em produção, com o Hub como primeiro assinante", news: { eh: "primeiros eventos", mcp: "ferramentas de leitura", ag: "piloto: Intake e ROI", client: "IDE do time", hub: "agenda e assinaturas" }, works: ["s-evento", "s-mcp"] },
    { n: "Fase 3", name: "Agentes de entrega", when: "jun–ago 2027", goal: "Agentes entregando proposta, pull request e testes, com escrita governada no ServiceNow.",
      items: ["Intake e ROI no fluxo real de demandas", "Agentes de Arquitetura, Pré-código e QA", "MCP de escrita com semáforo verde, amarelo e vermelho", "Automações com aprovação antes de executar"],
      gate: "5 agentes avaliados e usados no fluxo real de demandas", news: { ag: "agentes de entrega", mcp: "escrita com semáforo", hub: "execução com aprovação", eh: "eventos de aprovação" }, works: ["s-demanda"] },
    { n: "Fase 4", name: "Conectar e escalar", when: "set 2027 em diante", goal: "Stellar, time do ServiceNow e zonas usando a plataforma; legado desligado.",
      items: ["Stellar no MCP e no catálogo", "Agentes Now Dev e Operação", "Expansão para todas as zonas", "Migração e desligamento do RPA legado"],
      gate: "Legado desligado e custo por execução acompanhado", news: { ag: "Now Dev e Operação", client: "Stellar conectado", eh: "incidente, tarefa e prazo", hub: "todas as zonas" }, works: ["s-nowdev", "s-triagem", "s-falha", "s-chat"] }
  ]
};
