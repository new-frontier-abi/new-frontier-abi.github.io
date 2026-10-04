/* Conteúdo da página do time de automações: os mapas da jornada, do ambiente e dos times, e listas curtas.
   p: passo da jornada em que o nó ou a ligação passa a existir. until: último passo em que a ligação aparece. */
window.TEAM = {
  /* ---------- 1 · Jornada ---------- */
  journey: {
    geo: { rp: 94, py: 40, maxW: 900 },
    nodes: [
      { id: "legacy",  t: "Automações de hoje", s: "RPAs, scripts e jobs",     c: 0, r: 0,  k: "ext", p: 0 },
      { id: "target",  t: "Sistemas alvo",      s: "Entra ID, SAP, outros",    c: 0, r: 2,  k: "ext", p: 0 },
      { id: "ag",      t: "Agentes",            s: "constroem e operam",       c: 1, r: -1, k: "core agent", p: 2 },
      { id: "hub",     t: "Automation Hub",     s: "catálogo e execução",      c: 1, r: 0,  h: 3, k: "core", p: 1 },
      { id: "eh",      t: "Now Event Hub",      s: "eventos assináveis",       c: 2, r: 0,  k: "core", p: 3 },
      { id: "mcp",     t: "ServiceNow MCP",     s: "ferramentas governadas",   c: 2, r: 2,  k: "core", p: 3 },
      { id: "now",     t: "ServiceNow",         s: "catálogo, tickets, flows", c: 3, r: 0,  h: 3, k: "ext", p: 1,
        ports: [{ r: 0, t: "eventos", side: "l" }, { r: 1, t: "ação de Flow", side: "l" }, { r: 2, t: "ferramentas", side: "l" }] },
      { id: "other",   t: "Outros produtos",    s: "API, eventos ou MCP",      c: 1, r: 3,  k: "ext", p: 5 },
      { id: "stellar", t: "Stellar",            s: "chat interno, para todos", c: 2, r: 3,  k: "ext", p: 4 }
    ],
    zone: { c0: 1, c1: 2, r0: -1, r1: 2, label: "O QUE O TIME CONSTRÓI E OPERA" },
    edges: [
      { id: "legacy-target", a: "legacy",  b: "target", p: 0, until: 0 },
      { id: "legacy-hub",    a: "legacy",  b: "hub",    p: 1, until: 4 },
      { id: "hub-target",    a: "hub",     b: "target", p: 1 },
      { id: "now-hub",       a: "now",     b: "hub",    bi: true, p: 1 },
      { id: "ag-hub",        a: "ag",      b: "hub",    bi: true, p: 2 },
      { id: "now-eh",        a: "now",     b: "eh",     p: 3 },
      { id: "eh-hub",        a: "eh",      b: "hub",    bi: true, p: 3 },
      { id: "mcp-now",       a: "mcp",     b: "now",    bi: true, p: 3 },
      { id: "mcp-hub",       a: "mcp",     b: "hub",    p: 3 },
      { id: "stellar-mcp",   a: "stellar", b: "mcp",    bi: true, p: 4 },
      { id: "other-hub",     a: "other",   b: "hub",    bi: true, p: 5 }
    ],
    steps: [
      { b: "Hoje", name: "Ponto de partida", when: "",
        title: "Hoje: cada automação por conta própria",
        text: "Cada automação tem o próprio disparo, o próprio log e a própria integração.",
        items: ["Uma integração nova a cada automação", "Falha descoberta por quem pediu", "Sem catálogo: difícil saber o que já existe"],
        gate: null },
      { b: "Passo 1", name: "Migrar", when: "Fase 1",
        title: "As automações vão para o Hub",
        text: "Um catálogo e uma forma de executar. Fila, repetição, log e monitoramento vêm da plataforma; a automação fica só com a regra de negócio.",
        items: ["Cada automação vira uma função Python com manifesto", "O ServiceNow chama todas por uma única ação de Flow", "Migração por ondas, começando por 10 automações com API e baixo risco"],
        gate: "10 automações em produção pelo Hub",
        subs: { legacy: "migram por ondas" } },
      { b: "Passo 2", name: "Agentes", when: "Fases 2 a 4",
        title: "Agentes entram no trabalho do time",
        text: "Com catálogo e esteira de pé, agentes assumem o trabalho repetitivo de entrega e de operação. Uma pessoa aprova no fim.",
        items: ["Intake e ROI: a demanda chega estruturada, com os números", "Pré-código e QA: pull request com automação, manifesto e testes", "Operação: a falha chega com o diagnóstico"],
        gate: "Agentes avaliados e usados no fluxo real de demandas",
        subs: { legacy: "migram por ondas" } },
      { b: "Passo 3", name: "ServiceNow", when: "Fases 2 e 3",
        title: "MCP e Event Hub ligam o ServiceNow",
        text: "O ServiceNow publica eventos uma única vez e vira ferramentas governadas. Evento novo é uma linha no registro; integração nova é configuração.",
        items: ["Event Hub: um evento dispara uma automação, sem trigger novo", "MCP: ferramentas com a identidade e as permissões de quem pede", "O catálogo do Hub também aparece como ferramenta"],
        gate: "MCP de leitura e eventos em produção, com o Hub como primeiro assinante",
        subs: { legacy: "migram por ondas" } },
      { b: "Passo 4", name: "Stellar", when: "Fase 4",
        title: "O Stellar usa as mesmas ferramentas",
        text: "O chat consulta o ServiceNow e executa automações do catálogo pelo MCP, com a identidade de quem conversa. Nada é construído só para o chat.",
        items: ["Cada automação publicada aparece como ferramenta", "O desfecho da execução volta por evento"],
        gate: "Um caso de uso novo entra sem integração nova",
        subs: { legacy: "últimas ondas" } },
      { b: "Passo 5", name: "Outros produtos", when: "Fase 4 em diante",
        title: "Qualquer produto usa as nossas automações",
        text: "Três portas, as mesmas para todos: API para executar, eventos para assinar, MCP para usar como ferramenta.",
        items: ["Permissão por automação e por zona", "Sucesso e custo medidos por automação", "O legado é desligado quando as ondas terminam"],
        gate: "Legado desligado e custo por execução acompanhado",
        ghost: ["legacy"], subs: { legacy: "desligadas" } }
    ]
  },

  /* ---------- 1 · Por dentro: o ambiente de dev, a esteira e um domínio de automações. Só tipo de serviço e papel. ---------- */
  envLegend: [["act", "Passo atual"], ["new", "Já percorrido"], ["core", "Serviço da plataforma"], ["az", "Serviço do Azure"], ["ext", "Código e entrega"], ["person", "Pessoa"]],
  env: {
    id: "env", label: "Ambiente e esteira", tag: "Ambiente e esteira",
    title: "Do pull request ao cluster de dev",
    lead: "Código e ambiente entram pelo mesmo caminho: repositório, revisão e esteira. Nada é criado à mão.",
    map: {
      nodes: [
        { id: "eng",  t: "Engenheiro",         s: "revisa e aprova",          c: 0, r: 0, k: "person" },
        { id: "ag",   t: "Agente",             s: "abre pull request",        c: 0, r: 1, k: "core agent" },
        { id: "repo", t: "Repositórios",       s: "um por peça",              c: 1, r: 0, h: 2, k: "ext",
          ports: [{ r: 0, t: "serviços" }, { r: 1, t: "ambiente" }] },
        { id: "ci",   t: "Esteira",            s: "testa, analisa, publica",  c: 2, r: 0, k: "ext" },
        { id: "tf",   t: "Infra como código",  s: "descreve o ambiente",      c: 2, r: 1, k: "ext" },
        { id: "cd",   t: "Deploy declarativo", s: "lê do repositório",        c: 3, r: 0, k: "ext" },
        { id: "az",   t: "Recursos Azure",     s: "banco, filas, cofre",      c: 3, r: 1, k: "az" },
        { id: "k8s",  t: "Cluster de dev",     s: "pequeno, um por ambiente", c: 4, r: 0, h: 2, k: "az",
          ports: [{ r: 0, t: "serviços", side: "l" }, { r: 1, t: "identidades", side: "l" }] }
      ],
      edges: [
        { id: "eng-repo", a: "eng",  b: "repo" },
        { id: "ag-repo",  a: "ag",   b: "repo" },
        { id: "repo-ci",  a: "repo", b: "ci" },
        { id: "ci-cd",    a: "ci",   b: "cd" },
        { id: "cd-k8s",   a: "cd",   b: "k8s" },
        { id: "repo-tf",  a: "repo", b: "tf" },
        { id: "tf-az",    a: "tf",   b: "az" },
        { id: "az-k8s",   a: "az",   b: "k8s" }
      ]
    },
    steps: [
      { path: ["eng", "repo"], t: "Toda mudança entra por pull request", d: "Automação, serviço ou ambiente: tudo passa por revisão no repositório." },
      { path: ["ag", "repo"], t: "O agente passa pelos mesmos gates", d: "Testes, análise de código e aprovação de uma pessoa. Agente não aprova nem faz merge." },
      { path: ["repo", "ci"], t: "A esteira testa, analisa e publica", d: "Uma imagem por serviço e por domínio de automação. O catálogo é publicado a cada versão." },
      { path: ["ci", "cd", "k8s"], t: "O deploy lê do repositório", d: "O que está no repositório é o que roda. Voltar atrás é reverter o commit." },
      { path: ["repo", "tf", "az"], t: "O ambiente também é código", d: "Um comando recria o dev do zero: cluster pequeno, banco, filas, cofre e identidades." },
      { path: ["az", "k8s"], t: "Cada serviço recebe só o que precisa", d: "Identidade própria, a fila do próprio domínio e os segredos do próprio cofre." }
    ]
  },
  domain: {
    id: "dom", label: "Um domínio, por dentro", tag: "Um domínio de automações",
    title: "Cada domínio no seu espaço",
    lead: "Imagem, filas, workers, identidade e segredos por domínio. Uma automação de um domínio não alcança o que é de outro.",
    map: {
      geo: { px: 30, py: 44, maxW: 940 },
      nodes: [
        { id: "code",    t: "Pasta do domínio",   s: "funções, manifestos, testes", c: 0, r: 0, k: "ext" },
        { id: "catalog", t: "Catálogo do Hub",    s: "versões e contratos",         c: 0, r: 1, k: "core" },
        { id: "image",   t: "Imagem do domínio",  s: "as automações juntas",        c: 1, r: 0, k: "ext" },
        { id: "queue",   t: "Filas do domínio",   s: "rápida e longa",              c: 1, r: 1, k: "az" },
        { id: "workers", t: "Workers do domínio", s: "identidade própria",          c: 2, r: 0, h: 2, k: "core",
          ports: [{ r: 0, t: "código", side: "l" }, { r: 1, t: "execuções", side: "l" }] },
        { id: "target",  t: "Sistema alvo",       s: "Entra ID, SAP, outros",       c: 3, r: 0, k: "ext" },
        { id: "kv",      t: "Key Vault",          s: "segredos do domínio",         c: 3, r: 1, k: "az" }
      ],
      zones: [{ c0: 1, c1: 2, r0: 0, r1: 1, label: "UM DOMÍNIO: IDENTIDADE, WORKPLACE, SAP" }],
      edges: [
        { id: "code-image",     a: "code",    b: "image" },
        { id: "image-workers",  a: "image",   b: "workers" },
        { id: "code-catalog",   a: "code",    b: "catalog" },
        { id: "catalog-queue",  a: "catalog", b: "queue" },
        { id: "queue-workers",  a: "queue",   b: "workers" },
        { id: "workers-target", a: "workers", b: "target" },
        { id: "workers-kv",     a: "workers", b: "kv" }
      ]
    },
    steps: [
      { path: ["code", "image"], t: "Uma pasta por domínio vira uma imagem", d: "Cada automação é uma função Python com manifesto e testes. As do mesmo domínio viajam juntas." },
      { path: ["image", "workers"], t: "A imagem roda nos workers do domínio", d: "Cada domínio tem o próprio espaço no cluster e a própria identidade." },
      { path: ["code", "catalog"], t: "O manifesto vai para o catálogo", d: "A esteira publica cada versão: contrato de parâmetros, fila, limite de tempo e quem pode chamar." },
      { path: ["catalog", "queue"], t: "Cada execução entra na fila do domínio", d: "Uma fila para o que é rápido, outra para o que demora. Um domínio lento não segura os outros." },
      { path: ["queue", "workers"], t: "Só os workers do domínio leem essa fila", d: "Mais mensagens na fila, mais réplicas. Em dev, uma réplica basta." },
      { path: ["workers", "kv"], t: "Os segredos são do domínio", d: "O worker lê só as credenciais do próprio domínio, pela identidade dele. Nada de senha em código." },
      { path: ["workers", "target"], t: "A automação age no sistema alvo", d: "Com a credencial do domínio. O que acontece fica no log e no rastro, sem código na automação." }
    ]
  },

  /* ---------- 2 · Base ---------- */
  repos: [
    ["dw-platform-infra", "Ambiente como código, deploy e a lista do que pedir"],
    ["dw-automation-platform", "Hub: API, fila, workers, SDK e CLI"],
    ["dw-automations", "As automações, uma pasta por domínio"],
    ["dw-now-integration", "MCP, eventos e artefatos do ServiceNow"],
    ["dw-agents", "Runtime, agentes e avaliação"],
    ["dw-kairos", "Automações de interface, na Fase 4"]
  ],
  /* [passo, pronto quando, repositório, já está em código (1)]. Em código: escrito e testado fora do ambiente; falta rodar nele. */
  base: [
    { phase: "Fase 0 · Base", when: "out–nov 2026", steps: [
      ["Repositórios e esteira", "Um serviço de exemplo vai do pull request ao ambiente de dev sozinho", "todos", 1],
      ["Ambiente de dev, pequeno, como código", "Um comando reproduz o ambiente do zero", "dw-platform-infra", 1],
      ["Identidade e gateway", "Uma chamada com token válido chega à API pelo gateway", "dw-platform-infra"]
    ] },
    { phase: "Fase 1 · Automation Hub", when: "dez 2026–fev 2027", steps: [
      ["SDK e modelo de dados", "Uma automação de exemplo roda local, com sistemas simulados", "dw-automation-platform", 1],
      ["Catálogo", "Publicar registra uma versão, e a API a devolve com o contrato", "dw-automation-platform", 1],
      ["Execução", "Duas chamadas com a mesma chave devolvem a mesma execução", "dw-automation-platform", 1],
      ["Confiabilidade", "Sistema alvo fora do ar termina em dead-letter, com histórico", "dw-automation-platform", 1],
      ["O ServiceNow chama o Hub", "Uma oferta de sub-produção executa uma automação e recebe o desfecho", "dw-now-integration"],
      ["Primeiras 10 automações", "Em produção pelo Hub, com o legado delas desligado", "dw-automations"]
    ] },
    { phase: "Fase 2 · MCP e Event Hub", when: "mar–mai 2027", steps: [
      ["MCP de leitura", "Dois usuários com permissões diferentes veem resultados diferentes", "dw-now-integration", 1],
      ["Eventos", "Um evento vira execução sem código novo; reenvio não duplica", "dw-now-integration", 1],
      ["Piloto de agentes", "Intake e ROI medidos em demandas reais, só com leitura", "dw-agents", 1]
    ] }
  ],

  /* ---------- 3 · Recursos: [item, quando] ---------- */
  resources: [
    ["Azure · dev, pequeno", [
      ["Kubernetes pequeno: 2 a 3 nós", "agora"],
      ["PostgreSQL 16, camada básica", "agora"],
      ["Service Bus, camada Standard", "agora"],
      ["Cofre de segredos e armazenamento de arquivos", "agora"],
      ["Uma identidade gerenciada por serviço", "agora"],
      ["Event Hubs, 1 unidade", "Fase 2"]
    ]],
    ["Identidade", [
      ["Registros de aplicativo: Hub, MCP e eventos", "agora"],
      ["ServiceNow como chamador do Hub", "agora"],
      ["Token em nome do usuário até o ServiceNow", "agora"]
    ]],
    ["Gateway e rede", [
      ["Produto do Hub no gateway interno de APIs", "agora"],
      ["Rota do gateway até o cluster", "agora"],
      ["Caminho do ServiceNow até o gateway", "agora"],
      ["Produtos do MCP e dos eventos", "Fase 2"]
    ]],
    ["Esteira e qualidade", [
      ["Repositórios e pipelines", "pronto"],
      ["Registro de imagens e de pacotes", "agora"],
      ["Análise de código e de dependências", "agora"],
      ["Deploy declarativo", "agora"]
    ]],
    ["Observabilidade e modelos", [
      ["Trace, log, métrica e monitor por automação", "agora"],
      ["Acesso ao gateway de modelos, por ambiente", "agora"],
      ["Observabilidade de modelos, por agente", "Fase 2"]
    ]],
    ["ServiceNow", [
      ["Instância de sub-produção para os testes", "agora"],
      ["Um desenvolvedor, em tempo parcial", "Fases 1 a 4"]
    ]]
  ],
  people: [
    ["Dono do produto e da arquitetura", "Todas as fases"],
    ["Engenheiro backend Python", "Desde a Fase 0"],
    ["Engenheiro de plataforma", "Desde a Fase 0"],
    ["Engenheiro revisor", "Desde a Fase 1"],
    ["Desenvolvedor ServiceNow, parcial", "Fases 1 a 4"],
    ["Engenheiro de agentes", "Desde a Fase 2"]
  ],

  /* ---------- 4 · Times ---------- */
  teams: {
    geo: { cp: 300, maxW: 900 },
    nodes: [
      { id: "now",     t: "Squad ServiceNow",    s: "ofertas, flows, eventos",   c: 0, r: 0, k: "person", p: 0 },
      { id: "idp",     t: "Identidade",          s: "aplicativos e tokens",      c: 0, r: 1, k: "person", p: 0 },
      { id: "net",     t: "Gateway e rede",      s: "APIs e rotas",              c: 0, r: 2, k: "person", p: 0 },
      { id: "us",      t: "Time de automações",  s: "Hub, MCP, eventos, agentes", c: 1, r: 0, h: 3, k: "core", p: 0 },
      { id: "stellar", t: "Squad Stellar",       s: "o chat interno",            c: 2, r: 0, k: "person", p: 0 },
      { id: "llm",     t: "Time do Asimov",      s: "gateway de modelos",        c: 2, r: 1, k: "person", p: 0 },
      { id: "zones",   t: "Operações",           s: "zonas e donos de negócio",  c: 2, r: 2, k: "person", p: 0 }
    ],
    edges: [
      { id: "now-us",     a: "now",     b: "us", bi: true, p: 0 },
      { id: "idp-us",     a: "idp",     b: "us", bi: true, p: 0 },
      { id: "net-us",     a: "net",     b: "us", bi: true, p: 0 },
      { id: "stellar-us", a: "us", b: "stellar", bi: true, p: 0 },
      { id: "llm-us",     a: "us", b: "llm",     bi: true, p: 0 },
      { id: "zones-us",   a: "us", b: "zones",   bi: true, p: 0 }
    ],
    /* [nó, quando, pedimos, entregamos] */
    list: [
      ["now", "Fases 1 a 4", "Ação de Flow e callback. Depois, a regra publicadora de eventos e os subflows de escrita.", "Oferta com automação vira configuração. Eventos sem trigger novo. Rascunhos de configuração prontos para revisar."],
      ["idp", "Fase 0", "Registros de aplicativo, papéis e o token em nome do usuário até o ServiceNow. É o pedido de maior prazo.", "Menor privilégio por serviço, por automação e por usuário, com auditoria."],
      ["net", "Fase 0", "Produtos no gateway interno de APIs, a rota até o cluster e o caminho do ServiceNow até o gateway.", "APIs no padrão da companhia, com cota e rastreio por consumidor."],
      ["stellar", "Fase 4", "Cliente MCP no chat, com o token de quem conversa, e a lista de casos de uso.", "ServiceNow e catálogo de automações como ferramentas, sem integração caso a caso."],
      ["llm", "Fase 0", "Acesso por ambiente, modelos aprovados e cota.", "Todo uso de modelo pelo gateway, com custo e limite por agente."],
      ["zones", "Fase 0 em diante", "Lista priorizada de automações e um dono de negócio por automação.", "Catálogo, status e taxa de sucesso de cada automação."]
    ]
  },

  /* ---------- 5 · Agentes ---------- */
  ladder: [
    ["Código", "Regra fixa, com teste", "primeira escolha"],
    ["Chamada de modelo", "Um passo só: classificar, resumir, extrair", ""],
    ["Busca em fontes aprovadas", "A resposta depende de documento ou catálogo", ""],
    ["Pipeline híbrido", "Regra primeiro; o modelo entra no que sobra", ""],
    ["Agente", "Ferramentas, estado e passos que mudam a cada caso", "última escolha"]
  ],
  /* [área, função, hoje, com a plataforma, abordagem, grupo do filtro, nível, continua com pessoas, fase, agente, proposta, tema]
     tema: só nas funções do ServiceNow e do Stellar; é o filtro da página do time do ServiceNow */
  functions: [
    ["Demanda", "Triagem e intake de demandas", "Alguém lê o ticket, pede esclarecimento e classifica", "Estrutura a demanda, prepara as perguntas e diz se o caso pede código, RPA, chamada de modelo ou agente", "Agente", "agente", "Substitui", "Decidir se a demanda entra", "2", "Intake", 0],
    ["Demanda", "Busca de solução existente", "Depende da memória de quem atende", "Consulta o catálogo e responde com a automação que já resolve", "Busca em fontes", "busca", "Substitui", "Confirmar o reaproveitamento", "2", "", 0],
    ["Demanda", "Retorno e caso de negócio", "Planilha montada à mão", "Busca volume e tempo no ServiceNow; a conta é feita em código", "Chamada de modelo + código", "modelo", "Substitui", "Validar premissas e aprovar o investimento", "2", "ROI", 0],
    ["Demanda", "Priorização do backlog", "Reunião com base em percepção", "Lista ordenada por retorno, esforço e risco, com a origem de cada número", "Código + chamada de modelo", "modelo", "Assiste", "A decisão de prioridade", "2", "", 0],
    ["Desenho", "Sugestão de arquitetura", "Engenheiro sênior desenha do zero e confere os padrões", "Propõe a solução e aponta desvios de padrão, com citação", "Busca em fontes", "busca", "Acelera", "Decidir desvios e casos novos", "3", "Arquitetura", 0],
    ["Desenho", "Análise de impacto de mudança", "Perguntar a quem lembra quais automações usam o sistema", "Consulta ao catálogo e aos manifestos: o que toca o sistema, quem chama, com que volume", "Código + busca", "busca", "Substitui", "Decidir a janela e a comunicação", "3", "", 0],
    ["Construção", "Primeira versão da automação", "Desenvolvedor cria estrutura e primeira versão", "Gera função, manifesto e testes pelo modelo do time e abre o pull request", "Agente", "agente", "Substitui", "Revisar e aprovar o pull request", "3", "Pré-código", 0],
    ["Construção", "Revisão de código, primeira passada", "Revisor humano lê tudo", "Aponta desvio de padrão, segredo exposto e falta de teste", "Chamada de modelo", "modelo", "Acelera", "Aprovação final", "3", "", 0],
    ["Construção", "Documentação e runbook", "Escrita no fim, quando sobra tempo", "Gerada do manifesto, do código e da proposta, a cada versão", "Chamada de modelo", "modelo", "Substitui", "Revisão rápida", "3", "", 0],
    ["Qualidade", "Testes: casos, execução e evidências", "Casos escritos e rodados à mão", "Deriva casos do critério de aceite, executa em non-prod e anexa as evidências", "Agente", "agente", "Substitui", "Aceitar o risco residual", "3", "QA", 0],
    ["Qualidade", "Dados e sistemas simulados", "Montados à mão por automação", "Gerados do contrato de parâmetros e do exemplo do manifesto", "Código + chamada de modelo", "modelo", "Substitui", "Nenhuma decisão relevante", "3", "", 0],
    ["Operação", "Triagem de falha", "Plantão abre log e procura a causa", "Cruza erro, tentativas e mudanças recentes e entrega a causa provável", "Pipeline híbrido", "hibrido", "Acelera", "Corrigir e decidir o reprocessamento", "4", "Operação", 0],
    ["Operação", "Dúvidas sobre automações", "Alguém responde no chat ou por e-mail", "Responde a partir do catálogo e das execuções: existe, qual o status, quem é o dono", "Busca em fontes", "busca", "Substitui", "Casos fora do catálogo", "4", "", 0],
    ["Operação", "Relatório de status e indicadores", "Montado à mão todo mês", "Rascunho gerado dos dados do Hub: volume, sucesso, entregas", "Código + chamada de modelo", "modelo", "Substitui", "A mensagem para a liderança", "4", "", 0],
    ["Operação", "Inventário e desligamento do legado", "Levantamento manual do que ainda roda", "Uso real por automação, candidatas a aposentar e plano sugerido", "Código + chamada de modelo", "modelo", "Acelera", "Decidir o que desliga e quando", "4", "", 0],
    ["ServiceNow", "Atendimento de oferta sem tarefa manual", "A oferta termina em tarefa manual para o grupo solucionador", "A ação de Flow chama a automação do catálogo, e o callback fecha o item", "Plataforma", "plataforma", "Substitui", "Atender o que a automação devolveu", "1", "", 0, "operacao"],
    ["ServiceNow", "Integração de um time com o ServiceNow", "Trigger novo e chamada nova", "O time assina o evento ou usa uma ferramenta do MCP", "Plataforma", "plataforma", "Autoatendimento", "Aprovar um tipo novo de evento", "2", "", 0, "dev"],
    ["ServiceNow", "Reuso: o que já existe", "Achar oferta, formulário ou automação parecida depende de quem lembra", "Pela IDE, as ferramentas listam ofertas, variáveis, eventos e automações", "Plataforma", "plataforma", "Autoatendimento", "Decidir reaproveitar ou criar", "2", "", 0, "dev"],
    ["ServiceNow", "Membros de grupos sem papel", "Pedido feito à mão", "Ferramenta verde do MCP, com auditoria", "Plataforma", "plataforma", "Autoatendimento", "Nenhuma, dentro do semáforo", "3", "", 0, "operacao"],
    ["ServiceNow", "Criação de ofertas", "Item, categoria, flow e regra de atribuição configurados à mão, a partir do ticket", "Rascunho da oferta em sub-produção, com change request, a partir da oferta mais parecida", "Agente", "agente", "Acelera", "Revisar e promover", "4", "Now Dev", 0, "catalogo"],
    ["ServiceNow", "Formulários de ofertas", "Variáveis, tipos, opções e obrigatoriedade criados um a um", "O formulário nasce com o rascunho, com as variáveis ligadas aos parâmetros da automação", "Agente", "agente", "Acelera", "Revisar a experiência de quem pede", "4", "Now Dev", 0, "catalogo"],
    ["ServiceNow", "Flows de ofertas, no Flow Designer", "Flow montado passo a passo, com script para cada integração", "O flow padrão nasce com o rascunho: aprovação, ação de automação e desfecho", "Agente", "agente", "Acelera", "Revisar a lógica e publicar", "4", "Now Dev", 0, "catalogo"],
    ["ServiceNow", "Classificação e roteamento de tickets", "Triagem manual até o grupo certo", "Uma chamada de modelo classifica e sugere o grupo", "Chamada de modelo", "modelo", "Acelera", "Confirmar a sugestão e tratar o incerto", "4", "", 0, "operacao"],
    ["ServiceNow", "Diagnóstico de prazo em risco", "Quando o prazo aperta, alguém abre o ticket para descobrir onde parou", "O aviso de prazo vira evento, e o diagnóstico chega como nota no ticket", "Pipeline híbrido", "hibrido", "Acelera", "Decidir a ação: cobrar, reatribuir ou escalar", "4", "Operação", 0, "operacao"],
    ["ServiceNow", "Artigos de conhecimento", "Escritos à mão, quando alguém lembra", "Rascunho a partir dos tickets resolvidos sobre o mesmo tema", "Busca em fontes", "busca", "Acelera", "Revisar e publicar", "4", "", 0, "conhecimento"],
    ["ServiceNow", "Teste de regressão de ofertas", "Conferir cada oferta depois de uma mudança toma tempo", "Pede as ofertas em sub-produção e confere o resultado", "Agente", "agente", "Acelera", "Aceitar a mudança", "4", "QA", 0, "dev"],
    ["Stellar", "Pedidos e consultas pelo Stellar", "Sem ferramentas comuns, cada caso de uso novo no chat pede a própria integração", "O Stellar usa o ServiceNow e o catálogo de automações como ferramentas, com a identidade de quem conversa", "Plataforma", "plataforma", "Autoatendimento", "Desenhar a conversa", "4", "", 0, "chat"],
    ["ServiceNow", "Contrato de SLA e de OLA", "Definição montada à mão: condições, calendário e duração", "Rascunho da definição a partir do combinado e de um SLA parecido, com uma ferramenta nova", "Agente", "agente", "Acelera", "Negociar o prazo e aprovar", "", "Now Dev", 1, "catalogo"],
    ["ServiceNow", "Regras de tela e conjuntos de variáveis", "Configurados à mão em cada oferta", "O rascunho reaproveita os conjuntos do time e propõe as regras de tela, com uma ferramenta nova", "Agente", "agente", "Acelera", "Revisar a experiência do formulário", "", "Now Dev", 1, "catalogo"],
    ["ServiceNow", "Flows fora do padrão", "Montados do zero no Flow Designer", "Rascunho a partir dos modelos de flow do time, com as entradas preenchidas", "Agente", "agente", "Acelera", "Revisar a lógica e publicar", "", "Now Dev", 1, "catalogo"],
    ["ServiceNow", "Higiene do catálogo", "Ofertas sem uso ou duplicadas ficam no ar", "Relatório periódico; um modelo agrupa as ofertas parecidas", "Código + chamada de modelo", "modelo", "Assiste", "Decidir o que aposentar", "", "", 1, "catalogo"],
    ["ServiceNow", "Refinamento de demandas", "Alguém entende o pedido, pergunta e escreve a história", "História com critérios de aceite e perguntas de esclarecimento, em rascunho", "Chamada de modelo", "modelo", "Acelera", "Priorizar e decidir o que entra", "", "", 1, "dev"],
    ["ServiceNow", "Desenho conferido contra os padrões do time", "O arquiteto confere caso a caso", "Aponta os desvios dos padrões do time, com citação", "Busca em fontes", "busca", "Acelera", "Decidir os desvios", "", "", 1, "dev"],
    ["ServiceNow", "Impacto de uma mudança no ServiceNow", "Perguntar a quem lembra onde o item é usado", "Lista flows, regras, ofertas e integrações que usam o item", "Código + busca", "busca", "Substitui", "Decidir a janela e a comunicação", "", "", 1, "dev"],
    ["ServiceNow", "Revisão de scripts e de update sets", "Revisor humano lê tudo antes de promover", "Aponta desvios das boas práticas do time antes da promoção", "Chamada de modelo", "modelo", "Acelera", "Aprovar a promoção", "", "", 1, "dev"],
    ["ServiceNow", "Testes automatizados de ofertas e flows", "Escritos à mão, quando sobra tempo", "Rascunho do teste a partir das variáveis e do flow da oferta", "Agente", "agente", "Acelera", "Revisar e manter a suíte", "", "", 1, "dev"],
    ["ServiceNow", "Documentação de ofertas e flows", "Depende de quem construiu", "Descrição gerada da própria configuração", "Chamada de modelo", "modelo", "Substitui", "Revisão rápida", "", "", 1, "dev"],
    ["ServiceNow", "Notas de release", "Escritas à mão a cada release", "Resumo gerado das mudanças do release", "Chamada de modelo", "modelo", "Substitui", "Revisar e publicar", "", "", 1, "dev"],
    ["ServiceNow", "Triagem de upgrade e de patch", "Registros pulados revisados um a um", "Compara a versão customizada com a nova e sugere manter, reverter ou mesclar", "Chamada de modelo + código", "modelo", "Acelera", "Decidir cada registro", "", "", 1, "dev"],
    ["ServiceNow", "Resumo da daily e status do time", "Cada um relata de memória, e o status é montado à mão", "Rascunho do que mudou desde ontem, por item de trabalho, com os bloqueios", "Chamada de modelo", "modelo", "Assiste", "A conversa e as decisões", "", "", 1, "dev"],
    ["ServiceNow", "Triagem de casos de RH", "Triagem manual, com dado pessoal no texto", "A mesma classificação, em outra tabela, depois da avaliação de privacidade", "Chamada de modelo", "modelo", "Acelera", "Tratar o incerto; o RH define as permissões", "", "", 1, "operacao"],
    ["ServiceNow", "Diagnóstico de falha de flow e de integração", "Garimpar o log de execução do flow", "Cruza o erro do flow, o log da integração e as mudanças recentes", "Pipeline híbrido", "hibrido", "Acelera", "Decidir a correção", "", "", 1, "operacao"],
    ["ServiceNow", "Candidatos a problema", "Incidentes repetidos percebidos só por quem atende", "Agrupa incidentes parecidos e sugere abrir um problema, com a evidência", "Chamada de modelo + código", "modelo", "Assiste", "Abrir e conduzir o problema", "", "", 1, "operacao"],
    ["ServiceNow", "Saúde de grupos e de regras de atribuição", "Descoberto quando um ticket fica parado", "Checagem agendada: grupo sem membro, regra que aponta para grupo inativo", "Código", "plataforma", "Substitui", "Corrigir o cadastro", "", "", 1, "operacao"],
    ["ServiceNow", "Relatório do serviço", "Alguém cruza volume e tempo para escrever o relatório", "Volume por oferta e tempo por grupo vêm das ferramentas; um modelo redige o texto", "Código + chamada de modelo", "modelo", "Substitui", "A mensagem para quem pede", "", "", 1, "operacao"],
    ["ServiceNow", "Lacunas e revisão da base de conhecimento", "Artigo vencido ou em falta só aparece quando alguém reclama", "Lista periódica: temas com muitos tickets e sem artigo, e artigos vencidos ou duplicados", "Código + chamada de modelo", "modelo", "Assiste", "Decidir o que escrever e o que aposentar", "", "", 1, "conhecimento"]
  ],
  groups: [["", "Todas"], ["agente", "Agente"], ["modelo", "Chamada de modelo"], ["busca", "Busca em fontes"], ["hibrido", "Pipeline híbrido"], ["plataforma", "Plataforma ou código"]],
  build: [
    ["Decisão", "Por que um agente, e não código ou uma chamada de modelo"],
    ["Contrato", "Entrada e saída com formato fixo"],
    ["Ferramentas", "Lista fechada, menor privilégio, primeiro só leitura"],
    ["Avaliação", "Casos reais com resultado esperado, antes do primeiro prompt"],
    ["Runtime", "Modelo do time: gateway de modelos, limites, validação de saída, trace"],
    ["Sombra", "Roda ao lado da pessoa, sem agir; compara-se o resultado"],
    ["Uso com aprovação", "A saída vira comentário, pull request ou rascunho"],
    ["Medição", "Aceitação, custo e tempo; regressão bloqueia a mudança"]
  ],
  controls: [
    ["Limites", "Iterações, tempo e custo por execução"],
    ["Permissões", "Lista fechada de ferramentas; produção nunca é direta"],
    ["Parada", "Uma pessoa ou uma regra interrompe a execução"],
    ["Pessoa no fim", "Toda entrega passa por revisão humana"]
  ]
};
