/* Conteúdo da página da plataforma. Um mapa executivo (nodes + edges): pieces, links, scenarios e phases apontam para ele.
   tech traz os desenhos técnicos, cada um com o próprio mapa.
   c, r: coluna e linha na grade. h: altura em linhas. p: fase em que nasce (-1 = já existe hoje). */
window.DW = Object.assign(window.DW || {}, {
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
    { id: "client", t: "Stellar",            s: "chat interno, para todos",  c: 3, r: 2, k: "ext", p: -1 },
    { id: "ide",    t: "IDE do time",        s: "o time, pelas ferramentas", c: 4, r: 2, k: "ext", p: 2 },
    { id: "ci",     t: "DevOps",             s: "pull request e esteira",    c: 3, r: -1, k: "ext", p: 0 },
    { id: "team",   t: "Time DW",            s: "revisa, aprova, decide",    c: 4, r: -1, k: "person", p: -1 }
  ],
  zone: { c0: 2, c1: 3, r0: 0, r1: 1, label: "PLATAFORMA" },

  /* a -> b é o sentido natural. bi: a conversa acontece nos dois sentidos. p: fase em que a ligação passa a funcionar.
     step [de, até]: desce em degrau até o nó da linha de baixo, na coluna ao lado. */
  edges: [
    { id: "user-now",   a: "user",   b: "now",    bi: true, p: -1 },
    { id: "now-eh",     a: "now",    b: "eh",     p: 2 },
    { id: "now-hub",    a: "now",    b: "hub",    bi: true, p: 1 },
    { id: "eh-hub",     a: "eh",     b: "hub",    bi: true, p: 2 },
    { id: "eh-ag",      a: "eh",     b: "ag",     p: 2 },
    { id: "ag-mcp",     a: "ag",     b: "mcp",    p: 2 },
    { id: "mcp-hub",    a: "mcp",    b: "hub",    p: 2 },
    { id: "ag-hub",     a: "ag",     b: "hub",    step: [0.18, 0.82], p: 3 },
    { id: "ag-llm",     a: "ag",     b: "llm",    p: 2 },
    { id: "mcp-nowapi", a: "mcp",    b: "nowapi", bi: true, p: 2 },
    { id: "hub-target", a: "hub",    b: "target", p: 1 },
    { id: "client-mcp", a: "client", b: "mcp",    bi: true, at: 0.3, p: 4 },
    { id: "ide-mcp",    a: "ide",    b: "mcp",    bi: true, elbow: 0.2, p: 2 },
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
  /* o que está em volta da plataforma no mapa executivo */
  outside: {
    user: "Quem pede. Nada muda para ele: o pedido continua entrando pelo catálogo do ServiceNow.",
    now: "A origem dos pedidos e dos eventos. Chama o Hub por uma ação de Flow e publica os eventos selecionados.",
    nowapi: "O mesmo ServiceNow, visto como sistema: as ferramentas leem com as ACLs do usuário e configuram só em sub-produção.",
    llm: "O gateway corporativo de modelos. Único caminho dos agentes para um modelo de linguagem.",
    target: "Onde a automação age: Entra ID, SAP e os demais sistemas com API.",
    client: "O chat interno, para todos os funcionários. Hoje atende mais temas de RH, e TI está entrando. Na Fase 4, passa a usar as ferramentas.",
    ide: "As ferramentas de desenvolvimento do próprio time, como clientes do MCP desde a Fase 2.",
    ci: "Repositório, testes e deploy: a esteira de entrega. O pull request de um agente passa pelos mesmos gates de um pull request humano.",
    team: "As pessoas do Digital Workplace nos pontos de decisão: priorizar, revisar, aprovar e promover."
  },
  links: [
    { edges: ["user-now"],         name: "Funcionário ↔ ServiceNow",      text: "O pedido entra pelo catálogo e o aviso volta pela notificação de sempre. Nada muda para quem pede." },
    { edges: ["now-hub"],          name: "ServiceNow ↔ Automation Hub",   text: "Uma ação de Flow única: qualquer oferta chama qualquer automação do catálogo. O desfecho volta por callback e fecha o item." },
    { edges: ["now-eh"],           name: "ServiceNow → Now Event Hub",    text: "Uma regra publicadora envia os eventos selecionados, só com identificadores. Evento novo é uma linha no registro." },
    { edges: ["eh-hub"],           name: "Now Event Hub ↔ Automation Hub", text: "Uma assinatura liga um evento a uma automação, sem código novo. O Hub também publica o desfecho de cada execução." },
    { edges: ["eh-ag"],            name: "Now Event Hub → Agentes",       text: "Agentes são acionados por evento: demanda criada, incidente aberto, prazo perto de estourar." },
    { edges: ["ag-mcp"],           name: "Agentes → ServiceNow MCP",      text: "Agentes leem e escrevem no ServiceNow só pelas ferramentas, dentro do semáforo de governança." },
    { edges: ["mcp-hub"],          name: "ServiceNow MCP → Automation Hub", text: "O catálogo do Hub aparece como ferramentas: listar automações, executar uma, acompanhar a execução." },
    { edges: ["ag-hub"],           name: "Agentes → Automation Hub",      text: "Os agentes de entrega e de operação leem o catálogo e as execuções direto do Hub. Executar, só em non-prod: nenhum agente reprocessa em produção." },
    { edges: ["mcp-nowapi"],       name: "ServiceNow MCP ↔ ServiceNow",   text: "Leitura com as ACLs do próprio usuário. Configuração só em sub-produção, com change request e revisão humana." },
    { edges: ["hub-target"],       name: "Automation Hub → Sistemas alvo", text: "A automação age no sistema com a credencial do próprio domínio, guardada em cofre." },
    { edges: ["ag-llm"],           name: "Agentes → Asimov",              text: "Toda chamada de modelo passa pelo gateway corporativo. Nenhuma chamada direta a provedor." },
    { edges: ["client-mcp"],       name: "Stellar ↔ ServiceNow MCP",      text: "O chat interno consulta o ServiceNow e aciona automações pelas mesmas ferramentas dos agentes, com a identidade de quem conversa." },
    { edges: ["ide-mcp"],          name: "IDE do time ↔ ServiceNow MCP",  text: "O próprio time consulta o ServiceNow e o catálogo do Hub pela IDE, cada um com as próprias permissões." },
    { edges: ["ag-ci", "ci-team", "ag-team"], name: "Agentes → Time DW",  text: "Agentes entregam pull request, rascunho ou diagnóstico. Uma pessoa revisa, aprova e decide." }
  ],
  rules: [
    ["Determinístico primeiro", "Código para regra fixa. Uma chamada de modelo para um passo só. Agente só quando há ferramentas, estado e passos que mudam."],
    ["Menor privilégio", "Cada serviço tem a própria identidade. As ferramentas agem com as permissões de quem pede."],
    ["Um gateway de modelos", "Toda chamada de modelo passa pelo Asimov, com limite de custo, de tempo e de iterações."],
    ["Pessoa no controle", "Toda entrega de agente termina em uma revisão humana."]
  ],

  /* para onde seguir, a partir da visão geral: [endereço, para quem, nome, o que tem] */
  site: [
    ["#autoatendimento", "Para quem decide", "Plataforma", "Esta página: o autoatendimento que prova a ideia, o fluxo de cada agente e as fases."],
    ["automacoes/", "Para quem constrói", "Automações", "A jornada do time, a base passo a passo, os recursos, os times parceiros e os agentes."],
    ["servicenow/", "Para o time da instância", "ServiceNow", "Os fluxos de operação e de desenvolvimento, os exemplos, os agentes e as garantias."]
  ],

  /* ---------- 2 · Autoatendimento no ServiceNow (POC) ---------- */
  poc: [
    ["Escopo", ["As 10 primeiras automações do catálogo, com API e baixo risco", "Uma ação de Flow para todas as ofertas", "Os três primeiros tipos de evento publicados", "Ferramentas de leitura do MCP para o próprio time"]],
    ["O que medimos", ["Taxa de sucesso por automação", "Triggers ponto a ponto no ServiceNow", "Automações publicadas no catálogo", "Uso do MCP por consumidor"]],
    ["O que a POC prova", ["Oferta nova com automação é configuração do Flow, não integração", "Evento novo é uma linha no registro, não um trigger", "Outros times se servem sem depender de um desenvolvedor do ServiceNow"]]
  ],

  /* ---------- 3 · Agentes ---------- */
  agents: [
    ["Intake", "Demanda estruturada e classificada", "2 (piloto)"],
    ["ROI", "Caso de negócio, com a origem de cada número", "2 (piloto)"],
    ["Arquitetura", "Proposta, riscos e desvios de padrão", "3"],
    ["Pré-código", "Pull request com automação, manifesto e testes", "3"],
    ["QA", "Casos executados e evidências no pull request", "3"],
    ["Now Dev", "Rascunho em sub-produção, com change request", "4"],
    ["Operação", "Causa provável e correção sugerida", "4"]
  ],
  roles: [
    ["Analista de intake e de negócio", "Montar triagem e planilha", "Validar o que o agente trouxe e decidir"],
    ["Desenvolvedor de automação", "Começar do zero", "Revisar pull requests e resolver o que o agente não resolve"],
    ["Analista de QA", "Escrever e rodar casos repetitivos", "Definir critério de aceite e cuidar dos conjuntos de avaliação"],
    ["Arquiteto", "Conferir padrão caso a caso", "Manter os padrões que o agente aplica e decidir os desvios"],
    ["Desenvolvedor ServiceNow", "Configurar item a item e criar trigger por integração", "Revisar rascunhos e manter flows e a regra publicadora"],
    ["Plantão e suporte", "Garimpar log", "Receber o diagnóstico pronto e decidir a correção"]
  ],
  notAgent: "Executar a automação e calcular o retorno são código, com teste. Aprovar pull request, promover para produção e conceder acesso são sempre de uma pessoa.",

  /* ---------- fluxos: path percorre ligações do mapa; sub troca a segunda linha de um nó (no fluxo inteiro ou só naquele passo).
     Nas telas, o mapa aparece inteiro: o que o fluxo não usa fica apagado, e o caminho acende passo a passo. ---------- */
  acts: {
    autoatendimento: [{ name: null, ids: ["s-pedido", "s-evento", "s-mcp"] }],
    agentes: [
      { name: null, ids: ["s-demanda"] },
      { name: "Cada agente", ids: ["a-intake", "a-roi", "a-arch", "a-precode", "a-qa", "a-nowdev", "a-ops"] },
      { name: "Sem agente", ids: ["s-triagem", "s-chat"] }
    ]
  },
  scenarios: [
    { id: "s-pedido", short: "Pedido sem toque", phase: 1, title: "Um pedido resolvido sem ninguém no caminho",
      today: "Cada oferta tem a própria integração, e muitas terminam em tarefa manual.",
      steps: [
        { path: ["user", "now"], t: "Ana pede acesso a um grupo", d: "Pelo catálogo do ServiceNow, como hoje. Nada muda para quem pede." },
        { path: ["now", "hub"], t: "A oferta chama o Hub", d: "Uma ação de Flow única serve a todas as ofertas. Muda só qual automação chamar e com quais parâmetros." },
        { path: ["hub"], t: "O Hub enfileira e executa", d: "Fila, repetição em caso de falha, log e monitoramento vêm da plataforma. A automação só contém a regra de negócio." },
        { path: ["hub", "target"], t: "A automação inclui Ana no grupo", d: "Uma função Python age no Entra ID, com a credencial do próprio domínio." },
        { path: ["hub", "now"], t: "O ServiceNow fecha o item", d: "O desfecho volta por callback. Se a automação falhar, o item vai para o grupo solucionador." },
        { path: ["now", "user"], t: "Ana é avisada", d: "Pela notificação de sempre. Ninguém do time tocou no pedido." }
      ] },
    { id: "s-evento", short: "Evento dispara", phase: 2, title: "Um evento dispara a automação, sem trigger novo",
      today: "Cada integração nova pede um trigger novo e uma chamada nova no ServiceNow.",
      steps: [
        { path: ["now"], t: "Um item é aprovado no ServiceNow", d: "A mudança acontece no registro, como sempre." },
        { path: ["now", "eh"], t: "O ServiceNow publica o evento", d: "Uma regra publicadora envia o evento uma única vez, só com identificadores." },
        { path: ["eh", "hub"], t: "Uma assinatura liga o evento à automação", d: "É configuração feita pelo dono da automação. Não há código novo nem trigger novo." },
        { path: ["hub", "target"], t: "A automação executa", d: "Pelo mesmo caminho de qualquer chamada: fila, worker, sistema alvo." },
        { path: ["hub", "eh"], t: "O desfecho também vira evento", d: "Quem quiser acompanhar assina. Um assinante novo não muda nada no ServiceNow." },
        { path: ["hub", "now"], t: "O item é atualizado", d: "O callback fecha o ciclo no próprio registro." }
      ] },
    { id: "s-mcp", short: "Time se serve", phase: 2, title: "O time se serve pelas ferramentas",
      today: "Quem precisa de um dado do ServiceNow pede a alguém do time ou ganha uma integração própria.",
      steps: [
        { path: ["ide", "mcp"], t: "Um engenheiro pergunta pela IDE", d: "Quantos pedidos esta oferta recebe por mês, e quanto tempo levam? A pergunta vira uma chamada de ferramenta." },
        { path: ["mcp"], t: "O MCP confere o escopo e o semáforo", d: "Leitura é verde. A ferramenta só aceita o que o token do usuário permite." },
        { path: ["mcp", "nowapi"], t: "O ServiceNow responde com as ACLs do usuário", d: "Ele só vê o que já poderia ver no portal. Não há conta de serviço com acesso amplo." },
        { path: ["mcp", "ide"], t: "A resposta volta, e a chamada fica auditada", d: "Quem pediu, qual ferramenta, quando e com qual resultado." },
        { path: ["ide", "mcp", "hub"], t: "O catálogo do Hub também é ferramenta", d: "Pela mesma porta ele lista as automações e executa uma em non-prod, sem integração nova." }
      ] },

    /* a jornada inteira: os cinco agentes de entrega, em sequência, com as duas decisões de uma pessoa */
    { id: "s-demanda", short: "Demanda vira automação", phase: 3, title: "Uma demanda vira automação",
      today: "Alguém do time faz triagem, caso de negócio, desenho, primeira versão do código e testes à mão.",
      steps: [
        { path: ["now", "eh"], t: "A operação abre uma demanda", d: "Pelo mesmo ticket que já existe. O evento de demanda criada aciona os agentes." },
        { path: ["eh", "ag"], sub: { ag: "Agente Intake" }, t: "O agente Intake entende e classifica", d: "Prepara as perguntas de esclarecimento e diz se o caso pede código, RPA, uma chamada de modelo ou um agente." },
        { path: ["ag", "mcp", "hub"], sub: { ag: "Agente Intake" }, t: "Procura o que já existe", d: "Consulta o catálogo do Hub. Se uma automação já resolve, a resposta é reaproveitar." },
        { path: ["ag", "mcp", "nowapi"], sub: { ag: "Agente ROI" }, t: "O agente ROI monta o caso de negócio", d: "Volume de tickets e tempo de atendimento vêm do ServiceNow. A conta é feita em código, não pelo modelo." },
        { path: ["ag", "team"], sub: { ag: "Agente ROI" }, t: "Decisão 1: uma pessoa prioriza", d: "O dono do produto decide se a demanda entra. Se a resposta for não, o pedido volta com a justificativa." },
        { path: ["ag", "llm"], sub: { ag: "Agente Arquitetura" }, t: "O agente de Arquitetura propõe a solução", d: "Desenho, riscos e desvios dos padrões da companhia, com as fontes citadas." },
        { path: ["ag", "ci"], sub: { ag: "Agente Pré-código" }, t: "O agente de Pré-código abre o pull request", d: "Com a automação, o manifesto, os testes e a documentação." },
        { path: ["ag", "hub"], sub: { ag: "Agente QA" }, t: "O agente de QA testa em non-prod", d: "Casos gerados do critério de aceite, executados no ambiente de teste, com as evidências no pull request." },
        { path: ["ci", "team"], t: "Decisão 2: um engenheiro aprova", d: "Revisa com proposta, código, testes e evidências em mãos." },
        { path: ["hub"], t: "A automação entra no catálogo", d: "Fica disponível para o ServiceNow e para os agentes e, na Fase 4, para o Stellar." }
      ] },

    /* cada agente, do que o aciona ao que uma pessoa decide */
    { id: "a-intake", short: "Intake", phase: 2, title: "Intake: a demanda chega estruturada", sub: { ag: "Agente Intake" },
      today: "Alguém lê o ticket, pede esclarecimento e classifica a demanda à mão.",
      steps: [
        { path: ["now", "eh"], t: "A operação abre uma demanda de automação", d: "Pelo ticket de sempre. O ServiceNow publica o evento de demanda criada, só com identificadores." },
        { path: ["eh", "ag"], t: "O evento abre uma execução do Intake", d: "Com limite de iterações, de tempo e de custo. Uma pessoa pode pausar ou cancelar a qualquer momento." },
        { path: ["ag", "mcp", "nowapi"], t: "Lê o ticket e procura pedidos parecidos", d: "Pelas ferramentas de leitura, com identidade própria. O texto do ticket é tratado como dado, nunca como instrução." },
        { path: ["ag", "mcp", "hub"], t: "Confere o que o catálogo já resolve", d: "Se uma automação já existe, a resposta é reaproveitar. O agente só cita o que veio do catálogo." },
        { path: ["ag", "llm"], t: "Estrutura e classifica a demanda", d: "Objetivo, sistemas e critérios de aceite. E a abordagem: código, RPA, chamada de modelo, busca em fontes ou agente." },
        { path: ["ag", "mcp", "nowapi"], t: "Deixa a demanda estruturada no ticket", d: "Como nota de trabalho, com as perguntas para quem pediu, a partir da Fase 3. No piloto da Fase 2, o resultado fica na execução do agente, para o time comparar." },
        { path: ["ag", "team"], t: "O analista confere e decide se a demanda entra", d: "Sem pergunta em aberto, a demanda já segue para o agente ROI." }
      ] },
    { id: "a-roi", short: "ROI", phase: 2, title: "ROI: o caso de negócio, com a origem de cada número", sub: { ag: "Agente ROI" },
      today: "O caso de negócio é uma planilha montada à mão.",
      steps: [
        { path: ["ag"], t: "Recebe a demanda estruturada do Intake", d: "Um agente passa o trabalho ao outro por dentro da plataforma, sem evento novo." },
        { path: ["ag", "mcp", "nowapi"], t: "Busca volume e tempo no ServiceNow", d: "Pedidos da oferta e tempo de atendimento do grupo nos últimos 90 dias. A busca é fixa, em código: o modelo não escolhe ferramenta." },
        { path: ["ag", "llm"], t: "O modelo extrai só as premissas", d: "Minutos de trabalho por pedido, parte automatizável e tamanho da construção, a partir do texto da demanda. Cada uma sai marcada como informada ou estimada." },
        { path: ["ag"], t: "A conta é feita em código", d: "Horas economizadas por mês, horas de construção e em quantos meses o esforço se paga. Sem volume medido, o agente diz o que falta em vez de estimar." },
        { path: ["ag", "mcp", "nowapi"], t: "O caso de negócio vai para o ticket", d: "Como nota de trabalho, a partir da Fase 3, com a origem de cada número e a prioridade sugerida." },
        { path: ["ag", "team"], t: "Decisão: uma pessoa valida e prioriza", d: "O dono do produto confere as premissas e decide se a demanda entra. O agente sugere; não decide." }
      ] },
    { id: "a-arch", short: "Arquitetura", phase: 3, title: "Arquitetura: a proposta, com as fontes citadas", sub: { ag: "Agente Arquitetura" },
      today: "Um engenheiro sênior desenha do zero e confere os padrões caso a caso.",
      steps: [
        { path: ["team", "ag"], t: "O time inicia com a demanda priorizada", d: "Depois da decisão de prioridade. O agente recebe a demanda e o caso de negócio." },
        { path: ["ag"], t: "Busca os trechos nas fontes aprovadas", d: "Padrões de engenharia e catálogo do Hub, indexados. Uma fonte entra por decisão de uma pessoa, nunca do modelo." },
        { path: ["ag", "llm"], t: "Redige a proposta a partir dos trechos", d: "Abordagem, passos, fila, risco e o que reaproveitar do catálogo." },
        { path: ["ag"], t: "Cada citação é conferida em código", d: "Citar trecho que não veio na busca é recusado. Desvio de padrão sai apontado, com a fonte. O que não tem fonte vira suposição." },
        { path: ["ag", "mcp", "nowapi"], t: "A proposta vai para o ticket", d: "Como nota de trabalho, com as fontes e a versão de cada uma." },
        { path: ["ag", "team"], t: "O engenheiro revisa; desvio vai ao arquiteto", d: "Sem pergunta em aberto, a proposta já segue para o agente de Pré-código." }
      ] },
    { id: "a-precode", short: "Pré-código", phase: 3, title: "Pré-código: o pull request nasce com testes", sub: { ag: "Agente Pré-código" },
      today: "O desenvolvedor cria a estrutura e a primeira versão do zero.",
      steps: [
        { path: ["ag"], t: "Recebe a proposta do agente de Arquitetura", d: "Chave, domínio, passos, sistemas, fila e risco. O texto da proposta é dado, não instrução." },
        { path: ["ag", "ci"], t: "Parte de uma cópia do repositório", d: "Uma área de trabalho só desta execução. A automação nasce do modelo do time: função, manifesto e teste." },
        { path: ["ag", "hub"], t: "Consulta o contrato do que vai reaproveitar", d: "Parâmetros e resultado da automação do catálogo que a proposta manda reaproveitar." },
        { path: ["ag", "llm"], t: "Escreve a regra de negócio e os testes", d: "Caminho feliz, erro de negócio, falha passageira e simulação. Fila, repetição e cofre não são escritos: vêm da plataforma." },
        { path: ["ag"], t: "Valida antes de abrir: manifesto, lint e testes", d: "Se falhar, lê a saída, corrige e roda de novo. Se não passar dentro dos limites, para e relata o que falta." },
        { path: ["ag", "ci"], t: "Abre o pull request, como rascunho", d: "Com o que foi feito e o que ficou em aberto. A esteira roda os mesmos gates de um pull request humano." },
        { path: ["ci", "team"], t: "Um engenheiro revisa e aprova", d: "O agente não aprova nem faz merge. Enquanto a revisão acontece, o agente de QA já testa." }
      ] },
    { id: "a-qa", short: "QA", phase: 3, title: "QA: casos executados e evidência no pull request", sub: { ag: "Agente QA" },
      today: "Os casos de teste são escritos e rodados à mão.",
      steps: [
        { path: ["ag", "ci"], t: "Lê o pull request e o critério de aceite", d: "O agente de Pré-código passa o número do pull request. O teste parte do critério de aceite da demanda, não do código." },
        { path: ["ag", "hub"], t: "Lê o contrato da automação no catálogo", d: "Parâmetros, resultado e o exemplo do manifesto." },
        { path: ["ag", "llm"], t: "Monta os casos de teste", d: "Quatro obrigatórios: caminho feliz, erro de negócio, falha passageira e chamada repetida. Mais um para cada critério que eles não cobrem." },
        { path: ["ag", "hub", "target"], sub: { target: "ambiente de teste" }, t: "Executa cada caso no Hub de non-prod", d: "Só fora de produção: a regra é conferida em código. Com dados de teste, nunca um usuário ou registro real." },
        { path: ["ag", "hub"], t: "Confere o desfecho de cada execução", d: "O agente diz o que espera antes de olhar. Quem decide se o caso passou é o código, contra o estado real da execução." },
        { path: ["ag", "ci"], t: "Publica as evidências no pull request", d: "Uma linha por caso: esperado, observado e a execução. O que não deu para testar sai como risco residual." },
        { path: ["ci", "team"], t: "Um engenheiro aceita o risco e aprova", d: "Com proposta, código, testes e evidências em mãos." },
        { path: ["hub"], t: "A automação entra no catálogo", d: "Depois do merge, a esteira publica a versão. Fica disponível para o ServiceNow e para os agentes e, na Fase 4, para o Stellar." }
      ] },
    { id: "a-nowdev", short: "Now Dev", phase: 4, title: "Now Dev: a oferta chega pronta para revisar", sub: { ag: "Agente Now Dev" },
      today: "Ofertas, formulários, flows e regras são configurados à mão, um a um, a partir do ticket.",
      steps: [
        { path: ["now", "eh"], t: "Chega uma demanda de configuração", d: "Uma oferta nova, por exemplo. O ticket vira o evento de demanda criada." },
        { path: ["eh", "ag"], t: "O evento abre uma execução do Now Dev", d: "Com limite de iterações, de tempo e de custo. No começo, em modo sombra: só registra o que criaria." },
        { path: ["ag", "mcp", "nowapi"], t: "Lê a demanda e o que já existe", d: "A oferta mais parecida, as variáveis dela e os eventos que a instância já publica." },
        { path: ["ag", "mcp", "hub"], t: "Busca a automação no catálogo", d: "As variáveis do formulário saem do contrato da automação." },
        { path: ["ag", "llm"], t: "Monta a configuração", d: "Item, formulário, flow e regra de atribuição. O texto da demanda é dado, nunca instrução." },
        { path: ["ag", "mcp", "nowapi"], t: "Abre a change request e cria os rascunhos", d: "Ferramentas amarelas: só em sub-produção, e todo rascunho ligado à change request desta execução." },
        { path: ["ag", "hub"], t: "Deixa o gatilho pronto, desligado", d: "Se o pedido inclui reagir a um evento ou rodar em horário marcado, a assinatura ou a agenda nasce desligada. Uma pessoa revisa e liga." },
        { path: ["ag", "team"], sub: { team: "time do ServiceNow" }, t: "Um desenvolvedor do ServiceNow revisa e promove", d: "A nota no ticket lista o que foi criado, o que conferir e o que não foi feito. A promoção segue o processo normal de mudança." }
      ] },
    { id: "a-ops", short: "Operação", phase: 4, title: "Operação: a falha chega com o diagnóstico", sub: { ag: "Agente Operação" },
      today: "A falha é descoberta depois, e o plantão garimpa log para entender.",
      steps: [
        { path: ["hub", "target"], t: "O sistema alvo está fora do ar", d: "A automação repete com espera. Esgotadas as tentativas, a execução fica separada, com todo o contexto." },
        { path: ["hub", "now"], t: "O pedido não fica sem atendimento", d: "O callback manda o item ao grupo solucionador, com o motivo." },
        { path: ["hub", "eh", "ag"], t: "A falha vira evento e abre o agente", d: "O Hub publica o desfecho da execução. O evento abre uma execução do agente de Operação." },
        { path: ["ag", "hub"], t: "Lê a execução, as tentativas e o histórico", d: "Direto do Hub, só leitura. Se o mesmo desfecho se repete nas execuções recentes, o problema não é deste pedido." },
        { path: ["ag", "llm"], t: "Regra primeiro; modelo só na exceção", d: "Parâmetro inválido, tempo esgotado, credencial recusada e alvo fora do ar saem por regra, sem custo de modelo. Só o que sobra vai ao modelo, com o erro mascarado." },
        { path: ["ag", "mcp", "nowapi"], t: "O diagnóstico vai para o ticket", d: "Nota de trabalho com a causa provável, a recomendação e o grau de confiança." },
        { path: ["ag", "team"], t: "O plantão decide", d: "Corrigir a automação, esperar o sistema voltar ou descartar. O agente recomenda; não reprocessa." },
        { path: ["hub"], t: "Com o sistema de volta, uma pessoa reprocessa", d: "É a mesma execução: nada é criado em duplicidade." }
      ] },

    /* com as mesmas peças, sem agente */
    { id: "s-triagem", short: "Triagem", phase: 4, title: "Tickets classificados na criação", sub: { ag: "Chamada de modelo" },
      today: "A triagem é manual até o ticket chegar ao grupo certo.",
      steps: [
        { path: ["now", "eh"], t: "Um incidente é aberto", d: "O ServiceNow publica o evento de incidente criado." },
        { path: ["eh", "ag"], t: "Uma chamada de modelo, não um agente", d: "Classificar é tarefa de um passo só. Uma chamada direta ao modelo resolve, com custo e risco menores." },
        { path: ["ag", "llm"], t: "O modelo sugere o grupo solucionador", d: "Com o grau de confiança da sugestão." },
        { path: ["ag", "mcp", "nowapi"], t: "A sugestão é gravada no ticket", d: "Por uma ferramenta verde, com auditoria." },
        { path: ["ag", "team"], t: "Quem tria confirma a sugestão", d: "O incerto fica com o time. Aplicar sem ninguém confirmar, só depois de medir o acerto." }
      ] },
    { id: "s-chat", short: "Stellar", phase: 4, title: "O Stellar resolve com as mesmas automações",
      today: "Sem a plataforma, cada integração do chat com o ServiceNow ou com uma automação é construída à parte.",
      steps: [
        { path: ["client", "mcp"], t: "O funcionário pede no Stellar", d: "No chat interno, em linguagem natural, sem saber qual oferta ou qual automação existe." },
        { path: ["mcp", "nowapi"], t: "O Stellar consulta com as permissões de quem pede", d: "Chamados, catálogo e conhecimento, com as ACLs do próprio usuário." },
        { path: ["mcp", "hub"], t: "Aciona uma automação do catálogo", d: "Cada automação publicada aparece como ferramenta. O time do Stellar não constrói a integração." },
        { path: ["hub", "target"], t: "A automação executa", d: "A mesma fila, o mesmo worker, o mesmo sistema alvo. Nada foi construído para o chat." },
        { path: ["mcp", "client"], t: "A resposta volta na conversa", d: "E o Stellar avisa do desfecho quando a execução termina." }
      ] }
  ],

  /* ---------- Por dentro: como cada peça fica no Azure. Só tipo de serviço e papel: nomes e tamanhos ficam no repositório de infraestrutura. ----------
     k: core = serviço da plataforma (roda no Kubernetes), az = serviço do Azure, ext = de outro time ou fora da plataforma.
     passo com path anda pelas ligações; passo com on acende um conjunto de nós. */
  techLegend: [["act", "Passo atual"], ["seen", "Já percorrido"], ["core", "Serviço da plataforma"], ["az", "Serviço do Azure"], ["ext", "Fora da plataforma"]],
  tech: [
    { id: "all", label: "Plataforma inteira", tag: "Visão geral", focus: true,
      title: "A plataforma inteira, por camada",
      lead: "De cima para baixo: quem chama, a borda, os serviços no Kubernetes, os dados e o que fica fora da plataforma. Avance para ver o que cada peça usa.",
      map: {
        geo: { rp: 124, py: 42, px: 30 },
        nodes: [
          { id: "now",     t: "ServiceNow",       s: "ofertas, flows, eventos",    c: 0, r: 0, k: "ext" },
          { id: "client",  t: "Stellar",          s: "chat interno, para todos",   c: 1, r: 0, k: "ext" },
          { id: "ide",     t: "IDE do time",      s: "o time, pelo MCP",           c: 2, r: 0, k: "ext" },
          { id: "other",   t: "Outros produtos",  s: "API, eventos ou MCP",        c: 3, r: 0, k: "ext" },
          { id: "team",    t: "Time DW",          s: "opera e aprova",             c: 4, r: 0, k: "person" },
          { id: "apim",    t: "API Management",   s: "token, cota, rastreio",      c: 0.5, r: 1, k: "az" },
          { id: "entra",   t: "Entra ID",         s: "identidade de quem chama",   c: 1.5, r: 1, k: "az" },
          { id: "ids",     t: "Identidades",      s: "uma por serviço, sem senha", c: 2.5, r: 1, k: "az" },
          { id: "net",     t: "Rede virtual",     s: "banco sem IP público",       c: 3.5, r: 1, k: "az" },
          { id: "hubapi",  t: "Hub API",          s: "catálogo e execuções",       c: 0, r: 2, k: "core" },
          { id: "workers", t: "Workers",          s: "um conjunto por domínio",    c: 1, r: 2, k: "core" },
          { id: "ing",     t: "Ingestão",         s: "eventos do ServiceNow",      c: 2, r: 2, k: "core" },
          { id: "mcp",     t: "ServiceNow MCP",   s: "ferramentas governadas",     c: 3, r: 2, k: "core" },
          { id: "ag",      t: "Agentes",          s: "um worker por agente",       c: 4, r: 2, k: "core agent" },
          { id: "pg",      t: "PostgreSQL",       s: "execuções e auditoria",      c: 0, r: 3, k: "az" },
          { id: "sb",      t: "Service Bus",      s: "filas por domínio",          c: 1, r: 3, k: "az" },
          { id: "eh",      t: "Event Hubs",       s: "eventos assináveis",         c: 2, r: 3, k: "az" },
          { id: "kv",      t: "Key Vault",        s: "credenciais por domínio",    c: 3, r: 3, k: "az" },
          { id: "blob",    t: "Blob Storage",     s: "arquivos das execuções",     c: 4, r: 3, k: "az" },
          { id: "target",  t: "Sistemas alvo",    s: "Entra ID, SAP, outros",      c: 0, r: 4, k: "ext" },
          { id: "llm",     t: "Asimov",           s: "gateway de modelos",         c: 1, r: 4, k: "ext" },
          { id: "gh",      t: "Repositório",      s: "código e esteira",           c: 2, r: 4, k: "ext" },
          { id: "dd",      t: "Observabilidade",  s: "log, rastro e métrica",      c: 3, r: 4, k: "ext" },
          { id: "vm",      t: "Máquinas de tela", s: "automações de interface",    c: 4, r: 4, k: "ext" }
        ],
        zones: [
          { c0: 0, c1: 4, r0: 0, r1: 0, label: "QUEM CHAMA" },
          { c0: 0, c1: 4, r0: 1, r1: 1, label: "BORDA E IDENTIDADE" },
          { c0: 0, c1: 4, r0: 2, r1: 2, label: "KUBERNETES · UM CLUSTER PEQUENO" },
          { c0: 0, c1: 4, r0: 3, r1: 3, label: "DADOS E MENSAGENS · SERVIÇOS GERENCIADOS" },
          { c0: 0, c1: 4, r0: 4, r1: 4, label: "FORA DA PLATAFORMA" }
        ],
        edges: []
      },
      steps: [
        { on: ["now", "client", "ide", "other", "team", "apim", "entra"], t: "Tudo entra pelo gateway, com identidade",
          d: "ServiceNow, Stellar, IDE e outros produtos chegam pela mesma borda: token do Entra ID, cota e rastreio por consumidor." },
        { on: ["hubapi", "workers", "ing", "mcp", "ag", "ids", "net"], t: "Um cluster pequeno roda as quatro peças",
          d: "Cada serviço tem a própria identidade e só alcança o que precisa. O banco não tem endereço público, e o que entra passa pelo gateway." },
        { on: ["apim", "entra", "hubapi", "workers", "pg", "sb", "kv", "blob", "target", "vm"], t: "O que o Automation Hub usa",
          d: "Execuções no PostgreSQL, filas por domínio no Service Bus, credenciais no cofre e arquivos no Blob. Na Fase 4, automações de tela em máquinas dedicadas." },
        { on: ["now", "apim", "ing", "pg", "eh"], t: "O que o Now Event Hub usa",
          d: "A ingestão valida e deduplica cada evento do ServiceNow. O Event Hubs entrega a cada assinante, no ritmo dele." },
        { on: ["client", "ide", "apim", "entra", "mcp", "pg", "kv", "now"], t: "O que o ServiceNow MCP usa",
          d: "Não guarda sessão: cada chamada traz o token de quem pede. O MCP troca o token, aplica o semáforo e audita." },
        { on: ["eh", "ag", "pg", "kv", "mcp", "hubapi", "llm", "gh"], t: "O que os agentes usam",
          d: "São acionados por evento. O modelo vem do Asimov; as ferramentas, do MCP e do Hub; a entrega é um pull request." },
        { on: ["gh", "dd", "team"], t: "Tudo observado, tudo entregue por esteira",
          d: "Log, rastro e métrica por automação e por agente. O que roda no cluster é o que está no repositório." }
      ] },

    { id: "hub", label: "Automation Hub", tag: "Automation Hub",
      title: "Uma execução, por dentro",
      lead: "Do pedido do ServiceNow ao callback: a API registra, a fila entrega, o worker do domínio executa.",
      map: {
        nodes: [
          { id: "entra",    t: "Entra ID",          s: "identidade do chamador",   c: 1, r: -1, k: "az" },
          { id: "now",      t: "ServiceNow",        s: "ação de Flow",             c: 0, r: 0, k: "ext" },
          { id: "apim",     t: "API Management",    s: "token, cota, rastreio",    c: 1, r: 0, k: "az" },
          { id: "api",      t: "Hub API",           s: "catálogo e execuções",     c: 2, r: 0, k: "core" },
          { id: "pg",       t: "PostgreSQL",        s: "execução e mensagens",     c: 3, r: 0, h: 2, k: "az" },
          { id: "relay",    t: "Relay",             s: "do banco para a fila",     c: 4, r: 0, k: "core" },
          { id: "notifier", t: "Notifier",          s: "callback e eventos",       c: 1, r: 1, k: "core" },
          { id: "sb",       t: "Service Bus",       s: "filas por domínio",        c: 4, r: 1, k: "az" },
          { id: "eh",       t: "Event Hubs",        s: "desfecho das execuções",   c: 1, r: 2, k: "az" },
          { id: "target",   t: "Sistema alvo",      s: "Entra ID, SAP, outros",    c: 2, r: 2, k: "ext" },
          { id: "worker",   t: "Worker do domínio", s: "roda a automação",         c: 3, r: 2, k: "core" },
          { id: "kv",       t: "Key Vault",         s: "credenciais do domínio",   c: 3, r: 3, k: "az" }
        ],
        edges: [
          { id: "now-apim",     a: "now",      b: "apim" },
          { id: "apim-entra",   a: "apim",     b: "entra" },
          { id: "apim-api",     a: "apim",     b: "api" },
          { id: "api-pg",       a: "api",      b: "pg" },
          { id: "pg-relay",     a: "pg",       b: "relay" },
          { id: "relay-sb",     a: "relay",    b: "sb" },
          { id: "sb-worker",    a: "sb",       b: "worker", bend: "vh" },
          { id: "worker-pg",    a: "worker",   b: "pg", bi: true },
          { id: "worker-kv",    a: "worker",   b: "kv" },
          { id: "worker-target", a: "worker",  b: "target" },
          { id: "pg-notifier",  a: "pg",       b: "notifier" },
          { id: "notifier-now", a: "notifier", b: "now", bend: "hv" },
          { id: "notifier-eh",  a: "notifier", b: "eh" }
        ]
      },
      steps: [
        { path: ["now", "apim"], t: "O ServiceNow chama pelo gateway", d: "Uma rota só para todas as ofertas, com cota e rastreio por consumidor." },
        { path: ["apim", "entra"], t: "O token é conferido", d: "Cada chamador tem a própria identidade e só executa as automações liberadas para ele." },
        { path: ["apim", "api", "pg"], t: "A API registra a execução e responde na hora", d: "Execução e mensagem são gravadas na mesma transação. A mesma chave de idempotência devolve a mesma execução." },
        { path: ["pg", "relay", "sb"], t: "O relay leva a mensagem para a fila", d: "Filas separadas por domínio. O que foi registrado no banco nunca fica sem envio." },
        { path: ["sb", "worker"], t: "O worker do domínio assume", d: "Cada domínio tem os próprios workers, com a própria identidade. Mais carga, mais réplicas." },
        { path: ["worker", "kv"], t: "A credencial vem do cofre", d: "O worker só lê os segredos do próprio domínio." },
        { path: ["worker", "target"], t: "A automação age no sistema alvo", d: "Falha passageira repete com espera. Esgotadas as tentativas, a execução fica separada, com todo o contexto." },
        { path: ["worker", "pg"], t: "O desfecho é gravado", d: "Tentativa, duração e resultado. O monitoramento recebe um registro e um rastro por tentativa, sem código na automação." },
        { path: ["pg", "notifier", "now"], t: "O notifier avisa o ServiceNow", d: "O callback fecha o item ou o encaminha ao grupo solucionador, com o motivo." },
        { path: ["notifier", "eh"], t: "O desfecho também vira evento", d: "Quem quiser acompanhar assina. Nada muda no Hub para um assinante novo." }
      ] },

    { id: "eh", label: "Now Event Hub", tag: "Now Event Hub",
      title: "Um evento, por dentro",
      lead: "Do registro que muda no ServiceNow ao assinante: publicado uma vez, entregue a quem assina.",
      map: {
        nodes: [
          { id: "mcp",    t: "ServiceNow MCP",      s: "detalhe com permissão",    c: 4, r: -1, k: "core" },
          { id: "now",    t: "ServiceNow",          s: "regra publicadora",        c: 0, r: 0, k: "ext" },
          { id: "apim",   t: "API Management",      s: "token, cota, rastreio",    c: 1, r: 0, k: "az" },
          { id: "ing",    t: "Ingestão",            s: "valida e deduplica",       c: 2, r: 0, k: "core" },
          { id: "eh",     t: "Event Hubs",          s: "ordem por registro",       c: 3, r: 0, h: 3, k: "az",
            ports: [{ r: 0, t: "Hub" }, { r: 1, t: "agentes" }, { r: 2, t: "outros" }] },
          { id: "router", t: "Router do Hub",       s: "assinatura vira execução", c: 4, r: 0, k: "core" },
          { id: "reg",    t: "Registro de eventos", s: "uma linha por tipo",       c: 0, r: 1, k: "ext" },
          { id: "pg",     t: "PostgreSQL",          s: "eventos já aceitos",       c: 2, r: 1, k: "az" },
          { id: "ag",     t: "Agentes",             s: "acionados por evento",     c: 4, r: 1, k: "core agent" },
          { id: "others", t: "Stellar e outros",    s: "cada um no seu ritmo",     c: 4, r: 2, k: "ext" }
        ],
        edges: [
          { id: "now-reg",    a: "now",    b: "reg" },
          { id: "now-apim",   a: "now",    b: "apim" },
          { id: "apim-ing",   a: "apim",   b: "ing" },
          { id: "ing-pg",     a: "ing",    b: "pg" },
          { id: "ing-eh",     a: "ing",    b: "eh" },
          { id: "eh-router",  a: "eh",     b: "router" },
          { id: "eh-ag",      a: "eh",     b: "ag" },
          { id: "eh-others",  a: "eh",     b: "others" },
          { id: "router-mcp", a: "router", b: "mcp" }
        ]
      },
      steps: [
        { path: ["now"], t: "Um registro muda no ServiceNow", d: "Criado, aprovado, atribuído: a mudança acontece como sempre." },
        { path: ["now", "reg"], t: "A regra publicadora consulta o registro", d: "Só sai o que está no registro de eventos. Evento novo é uma linha, não uma regra nova." },
        { path: ["now", "apim", "ing"], t: "O evento sai uma vez, só com identificadores", d: "Envelope padrão, pelo gateway. Nenhum dado pessoal sai do ServiceNow." },
        { path: ["ing", "pg"], t: "A ingestão valida e deduplica", d: "Evento fora do contrato é recusado. Reenvio do mesmo evento não duplica." },
        { path: ["ing", "eh"], t: "Publica com ordem por registro", d: "Tudo o que acontece com o mesmo ticket chega na ordem em que aconteceu." },
        { path: ["eh", "router"], t: "O Hub é o primeiro assinante", d: "Uma assinatura liga o tipo de evento a uma automação e cria a execução." },
        { path: ["router", "mcp"], t: "O detalhe vem pelas ferramentas", d: "Quem precisa de mais que o identificador busca pelo MCP, com a própria permissão." },
        { path: ["eh", "ag"], t: "Os agentes leem o mesmo evento", d: "Cada assinante tem o próprio ponto de leitura: um não atrasa o outro." },
        { path: ["eh", "others"], t: "Assinante novo não muda nada no ServiceNow", d: "E pode pedir o reenvio de uma janela de tempo, só para ele." }
      ] },

    { id: "mcp", label: "ServiceNow MCP", tag: "ServiceNow MCP",
      title: "Uma chamada de ferramenta, por dentro",
      lead: "Do cliente ao ServiceNow: a identidade de quem pede vai junto até o fim.",
      map: {
        nodes: [
          { id: "entra",  t: "Entra ID",         s: "troca o token",           c: 2, r: -1, k: "az" },
          { id: "client", t: "Clientes MCP",     s: "Stellar e IDE do time",   c: 0, r: 0, k: "ext" },
          { id: "apim",   t: "API Management",   s: "token, cota, rastreio",   c: 1, r: 0, k: "az" },
          { id: "mcp",    t: "ServiceNow MCP",   s: "semáforo e auditoria",    c: 2, r: 0, h: 3, k: "core",
            ports: [{ r: 0, t: "leitura" }, { r: 1, t: "escrita" }, { r: 2, t: "automações" }] },
          { id: "nowr",   t: "ServiceNow",       s: "ACLs de quem pede",       c: 3, r: 0, k: "ext" },
          { id: "srest",  t: "Scripted REST",    s: "entrada única",           c: 3, r: 1, k: "ext" },
          { id: "sub",    t: "Subflows do time", s: "um por ferramenta",       c: 4, r: 1, k: "ext" },
          { id: "hub",    t: "Automation Hub",   s: "catálogo e execuções",    c: 3, r: 2, k: "core" },
          { id: "pg",     t: "PostgreSQL",       s: "auditoria, só inserção",  c: 2, r: 3, k: "az" }
        ],
        edges: [
          { id: "client-apim", a: "client", b: "apim" },
          { id: "apim-mcp",    a: "apim",   b: "mcp" },
          { id: "mcp-entra",   a: "mcp",    b: "entra" },
          { id: "mcp-nowr",    a: "mcp",    b: "nowr" },
          { id: "mcp-srest",   a: "mcp",    b: "srest" },
          { id: "srest-sub",   a: "srest",  b: "sub" },
          { id: "mcp-hub",     a: "mcp",    b: "hub" },
          { id: "mcp-pg",      a: "mcp",    b: "pg" }
        ]
      },
      steps: [
        { path: ["client", "apim", "mcp"], t: "A chamada chega com o token de quem pede", d: "O gateway aplica cota e rastreio. O servidor não guarda sessão: cada chamada traz a própria identidade." },
        { path: ["mcp", "entra"], t: "O token é trocado por um do ServiceNow", d: "Para a mesma pessoa. Um agente não tem usuário: chama por dentro do cluster, com a identidade de serviço dele." },
        { path: ["mcp"], t: "O semáforo decide antes de qualquer chamada", d: "Verde segue. Amarelo exige sub-produção e change request. Vermelho só abre pedido de aprovação." },
        { path: ["mcp", "nowr"], t: "Leitura com as ACLs do usuário", d: "Ele só vê o que já veria no portal. Não há conta de serviço com acesso amplo." },
        { path: ["mcp", "srest", "sub"], t: "Escrita só por subflow", d: "A Scripted REST aciona um subflow mantido pelo time do ServiceNow. O MCP não grava em tabela." },
        { path: ["mcp", "hub"], t: "O catálogo do Hub pela mesma porta", d: "Listar automações, executar uma e acompanhar a execução." },
        { path: ["mcp", "pg"], t: "Cada chamada fica auditada", d: "Quem pediu, qual ferramenta, a cor e o desfecho, em tabela que só aceita inserção." }
      ] },

    { id: "ag", label: "Agentes", tag: "Agentes",
      title: "Uma execução de agente, por dentro",
      lead: "Do evento ao pull request: limites conferidos a cada passo e uma pessoa que pode parar tudo.",
      map: {
        geo: { rp: 92, nw: 198 },
        nodes: [
          { id: "eh",     t: "Event Hubs",       s: "demanda, falha, prazo",    c: 0, r: 0, k: "az" },
          { id: "ctl",    t: "Controle",         s: "cria, pausa e cancela",    c: 1, r: 0, k: "core" },
          { id: "team",   t: "Time DW",          s: "pausa e aprova",           c: 1, r: 1, k: "person" },
          { id: "pg",     t: "PostgreSQL",       s: "fila, passos e consumo",   c: 2, r: 0, k: "az" },
          { id: "dd",     t: "Observabilidade",  s: "modelo, consumo e erro",   c: 2, r: 1, k: "ext" },
          { id: "worker", t: "Worker do agente", s: "um por agente",            c: 3, r: 0, h: 4, k: "core agent",
            ports: [{ r: 0, t: "modelo" }, { r: 1, t: "ferramentas" }, { r: 2, t: "execuções" }, { r: 3, t: "entrega" }] },
          { id: "llm",    t: "Asimov",           s: "gateway de modelos",       c: 4, r: 0, k: "ext" },
          { id: "mcp",    t: "ServiceNow MCP",   s: "lista fechada por agente", c: 4, r: 1, k: "core" },
          { id: "hub",    t: "Automation Hub",   s: "non-prod e leitura",       c: 4, r: 2, k: "core" },
          { id: "gh",     t: "Repositório",      s: "pull request",             c: 4, r: 3, k: "ext" }
        ],
        edges: [
          { id: "eh-ctl",     a: "eh",     b: "ctl" },
          { id: "team-ctl",   a: "team",   b: "ctl" },
          { id: "ctl-pg",     a: "ctl",    b: "pg" },
          { id: "pg-worker",  a: "pg",     b: "worker", bi: true },
          { id: "worker-dd",  a: "worker", b: "dd" },
          { id: "worker-llm", a: "worker", b: "llm" },
          { id: "worker-mcp", a: "worker", b: "mcp" },
          { id: "worker-hub", a: "worker", b: "hub" },
          { id: "worker-gh",  a: "worker", b: "gh" }
        ]
      },
      steps: [
        { path: ["eh", "ctl"], t: "Um evento abre a execução", d: "Demanda criada, execução que falhou, prazo perto de estourar. Também dá para iniciar sob demanda." },
        { path: ["ctl", "pg"], t: "A execução entra na fila do agente", d: "Com os limites de tempo, de custo e de iterações daquele agente." },
        { path: ["pg", "worker"], t: "O worker do agente assume", d: "Um por agente, cada um com a própria identidade e a própria lista de ferramentas." },
        { path: ["worker", "llm"], t: "O modelo vem do Asimov", d: "Antes de cada chamada, o worker confere a parada e os limites." },
        { path: ["worker", "mcp"], t: "As ferramentas vêm do ServiceNow MCP", d: "Lista fechada por agente: o que não está na lista não existe para o modelo." },
        { path: ["worker", "hub"], t: "E do catálogo do Hub", d: "O agente de QA executa em non-prod. O de Operação só lê as execuções." },
        { path: ["worker", "gh"], t: "A entrega é escrita por ferramenta", d: "Pull request, comentário ou rascunho. Em modo sombra, a escrita fica só registrada." },
        { path: ["worker", "dd"], t: "Cada passo deixa rastro", d: "Modelo, consumo e erro. O texto do pedido e a resposta do modelo não saem do processo." },
        { path: ["team", "ctl"], t: "Uma pessoa pausa ou cancela a qualquer momento", d: "Vale já na próxima chamada de modelo ou de ferramenta." }
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
      gate: "MCP de leitura e eventos em produção, com o Hub como primeiro assinante", news: { eh: "primeiros eventos", mcp: "ferramentas de leitura", ag: "piloto: Intake e ROI", ide: "leitura, pelas ferramentas", hub: "agenda e assinaturas" }, works: ["s-evento", "s-mcp", "a-intake", "a-roi"] },
    { n: "Fase 3", name: "Agentes de entrega", when: "jun–ago 2027", goal: "Agentes entregando proposta, pull request e testes, com escrita governada no ServiceNow.",
      items: ["Intake e ROI no fluxo real de demandas", "Agentes de Arquitetura, Pré-código e QA", "MCP de escrita com semáforo verde, amarelo e vermelho", "Automações com aprovação antes de executar"],
      gate: "5 agentes avaliados e usados no fluxo real de demandas", news: { ag: "agentes de entrega", mcp: "escrita com semáforo", hub: "com aprovação prévia", eh: "eventos de aprovação" }, works: ["s-demanda", "a-arch", "a-precode", "a-qa"] },
    { n: "Fase 4", name: "Conectar e escalar", when: "set 2027 em diante", goal: "Stellar, time do ServiceNow e zonas usando a plataforma; legado desligado.",
      items: ["Stellar no MCP e no catálogo", "Agentes Now Dev e Operação", "Expansão para todas as zonas", "Migração e desligamento do RPA legado"],
      gate: "Legado desligado e custo por execução acompanhado", news: { ag: "Now Dev e Operação", client: "usa o MCP e o catálogo", eh: "incidente, tarefa e prazo", hub: "todas as zonas" }, works: ["a-nowdev", "a-ops", "s-triagem", "s-chat"] }
  ]
});
