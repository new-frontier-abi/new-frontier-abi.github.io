/* Conteúdo da página do time de automações. Três mapas pequenos (jornada, times) e listas curtas.
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
      { id: "stellar", t: "Stellar",            s: "chat dos funcionários",    c: 2, r: 3,  k: "ext", p: 4 }
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
      ["Registros de aplicativo: Hub, MCP, eventos, console", "agora"],
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
      { id: "stellar", t: "Squad Stellar",       s: "chat dos funcionários",     c: 2, r: 0, k: "person", p: 0 },
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
  /* [área, função, hoje, com a plataforma, abordagem, grupo do filtro, nível, continua com pessoas, fase, agente, proposta] */
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
    ["ServiceNow", "Integração de um time com o ServiceNow", "Trigger novo e chamada nova", "O time assina o evento ou usa uma ferramenta do MCP", "Plataforma", "plataforma", "Autoatendimento", "Aprovar um tipo novo de evento", "2", "", 0],
    ["ServiceNow", "Membros de grupos sem papel", "Pedido feito à mão", "Ferramenta verde do MCP, com auditoria", "Plataforma", "plataforma", "Autoatendimento", "Nenhuma, dentro do semáforo", "3", "", 0],
    ["ServiceNow", "Configuração de ofertas e catálogo", "Desenvolvedor configura item, variáveis e fluxo", "Cria o rascunho em sub-produção, com change request", "Agente", "agente", "Acelera", "Revisar e promover", "4", "Now Dev", 0],
    ["ServiceNow", "Classificação e roteamento de tickets", "Triagem manual até o grupo certo", "Uma chamada de modelo classifica e sugere o grupo", "Chamada de modelo", "modelo", "Substitui", "Tratar o que o modelo marcou como incerto", "4", "", 0],
    ["ServiceNow", "Artigos de conhecimento", "Escritos à mão, quando alguém lembra", "Rascunho a partir dos tickets resolvidos sobre o mesmo tema", "Busca em fontes", "busca", "Acelera", "Revisar e publicar", "4", "", 0],
    ["ServiceNow", "Teste de regressão de ofertas", "Teste manual a cada mudança", "Pede as ofertas em sub-produção e confere o resultado", "Agente", "agente", "Acelera", "Aceitar a mudança", "4", "QA", 0],
    ["Stellar", "Novo caso de uso no chat", "Integração construída caso a caso", "Configuração de ferramentas do MCP no chat", "Plataforma", "plataforma", "Autoatendimento", "Desenhar a conversa", "4", "", 0],
    ["Stellar", "Avaliação das respostas do chat", "Revisão manual por amostragem", "Conjunto de avaliação, com um modelo como juiz e amostra humana", "Chamada de modelo", "modelo", "Acelera", "Definir o que é uma boa resposta", "4", "", 0],
    ["ServiceNow", "Revisão de scripts e de update sets", "Revisor humano lê tudo antes de promover", "Aponta desvios das boas práticas do time antes da promoção", "Chamada de modelo", "modelo", "Acelera", "Aprovar a promoção", "", "", 1],
    ["ServiceNow", "Testes automatizados de ofertas e flows", "Escritos à mão, quando sobra tempo", "Rascunho do teste a partir das variáveis e do flow da oferta", "Agente", "agente", "Acelera", "Revisar e manter a suíte", "", "", 1],
    ["ServiceNow", "Triagem de upgrade e de patch", "Registros pulados revisados um a um", "Compara a versão customizada com a nova e sugere manter, reverter ou mesclar", "Chamada de modelo + código", "modelo", "Acelera", "Decidir cada registro", "", "", 1],
    ["ServiceNow", "Documentação de ofertas e flows", "Depende de quem construiu", "Descrição gerada da própria configuração", "Chamada de modelo", "modelo", "Substitui", "Revisão rápida", "", "", 1],
    ["ServiceNow", "Impacto de uma mudança no ServiceNow", "Perguntar a quem lembra onde o item é usado", "Lista flows, regras, ofertas e integrações que usam o item", "Código + busca", "busca", "Substitui", "Decidir a janela e a comunicação", "", "", 1],
    ["ServiceNow", "Higiene do catálogo", "Ofertas sem uso ou duplicadas ficam no ar", "Relatório periódico; um modelo agrupa as ofertas parecidas", "Código + chamada de modelo", "modelo", "Assiste", "Decidir o que aposentar", "", "", 1],
    ["ServiceNow", "Saúde de grupos e de regras de atribuição", "Descoberto quando um ticket fica parado", "Checagem agendada: grupo sem membro, regra que aponta para grupo inativo", "Código", "plataforma", "Substitui", "Corrigir o cadastro", "", "", 1],
    ["ServiceNow", "Candidatos a problema", "Incidentes repetidos percebidos só por quem atende", "Agrupa incidentes parecidos e sugere abrir um problema, com a evidência", "Chamada de modelo + código", "modelo", "Assiste", "Abrir e conduzir o problema", "", "", 1],
    ["ServiceNow", "Notas de release", "Escritas à mão a cada release", "Resumo gerado das mudanças do release", "Chamada de modelo", "modelo", "Substitui", "Revisar e publicar", "", "", 1],
    ["ServiceNow", "Diagnóstico de falha de flow e de integração", "Garimpar o log de execução do flow", "Cruza o erro do flow, o log da integração e as mudanças recentes", "Pipeline híbrido", "hibrido", "Acelera", "Decidir a correção", "", "", 1]
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
