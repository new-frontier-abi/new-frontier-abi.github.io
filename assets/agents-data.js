/* Conteúdo da página Agentes, a entrada do site: como qualquer área da companhia cria agentes e integrações pela IDE, a governança e as decisões.
   Três mapas próprios: a fábrica (por onde um agente novo passa), as camadas de governança e o caminho de uma demanda até a fila.
   Os fluxos dos agentes do DW, as funções e o desenho técnico vêm de assets/data.js e de assets/team-data.js.
   c, r: coluna e linha na grade. Os fluxos andam pelas ligações (path) ou acendem um conjunto de nós (on), como nas outras páginas. */
window.AG = (function () {
  /* ---------- a fábrica: o dev, a IDE, a plataforma e quem decide ---------- */
  var factory = {
    geo: { px: 30 },
    nodes: [
      { id: "rev",    t: "Revisão",         s: "área e plataforma",       c: 2, r: -1, k: "person" },
      { id: "appr",   t: "Quem aprova",     s: "cada entrega do agente",  c: 0, r: 0,  k: "person" },
      { id: "nag",    t: "Agente novo",     s: "pull request e esteira",  c: 1, r: 0,  k: "ext" },
      { id: "ide",    t: "Qualquer IDE",    s: "Claude Code, Codex",      c: 2, r: 0,  k: "ext" },
      { id: "nint",   t: "Integração nova", s: "pull request e esteira",  c: 3, r: 0,  k: "ext" },
      { id: "eh",     t: "Now Event Hub",   s: "gatilhos dos agentes",    c: 0, r: 1,  k: "core" },
      { id: "ag",     t: "Agentes",         s: "um runtime para todos",   c: 1, r: 1,  k: "core agent" },
      { id: "mcp",    t: "ServiceNow MCP",  s: "estrutura e ferramentas", c: 2, r: 1,  k: "core" },
      { id: "hub",    t: "Automation Hub",  s: "integrações em catálogo", c: 3, r: 1,  k: "core" },
      { id: "llm",    t: "Asimov",          s: "gateway de modelos",      c: 1, r: 2,  k: "ext" },
      { id: "nowapi", t: "ServiceNow",      s: "dados e configuração",    c: 2, r: 2,  k: "ext" },
      { id: "sys",    t: "Sistemas alvo",   s: "SAP, Entra ID, outros",   c: 3, r: 2,  k: "ext" }
    ],
    zones: [{ c0: 0, c1: 3, r0: 1, r1: 1, label: "PLATAFORMA" }],
    /* elbow sobe pelo corredor de cima até o nó da linha de cima */
    edges: [
      { id: "ide-mcp",    a: "ide",  b: "mcp",    bi: true },
      { id: "ide-nag",    a: "ide",  b: "nag" },
      { id: "ide-nint",   a: "ide",  b: "nint" },
      { id: "nag-rev",    a: "nag",  b: "rev",    elbow: 0.8 },
      { id: "nint-rev",   a: "nint", b: "rev",    elbow: 0.2 },
      { id: "nag-ag",     a: "nag",  b: "ag" },
      { id: "nint-hub",   a: "nint", b: "hub" },
      { id: "eh-ag",      a: "eh",   b: "ag" },
      { id: "ag-mcp",     a: "ag",   b: "mcp",    bi: true },
      { id: "mcp-hub",    a: "mcp",  b: "hub" },
      { id: "ag-llm",     a: "ag",   b: "llm" },
      { id: "mcp-nowapi", a: "mcp",  b: "nowapi", bi: true },
      { id: "hub-sys",    a: "hub",  b: "sys" },
      { id: "ag-appr",    a: "ag",   b: "appr",   elbow: 0.2 }
    ]
  };

  return {
    factory: factory,

    /* ---------- 1 · Visão geral: o que cada peça da fábrica faz, ao passar o cursor ---------- */
    factoryNodes: {
      rev:    { k: "Pessoas · Fase 2", title: "Revisão", text: "Duas chaves no pull request: o dono da área responde pelo que o agente faz, e a plataforma confere ferramentas, permissões e limites." },
      appr:   { k: "Pessoa", title: "Quem aprova", text: "Uma pessoa da área aprova cada entrega. O agente não aprova, não faz merge, não promove e não concede acesso." },
      nag:    { k: "Fase 2", title: "Agente novo", text: "Quatro arquivos no modelo do time: manifesto, prompt, código e avaliação. No manifesto, a decisão: por que um agente, e não código ou uma chamada de modelo." },
      ide:    { k: "Fase 2", title: "Qualquer IDE", text: "Claude Code, Codex ou outra IDE com cliente MCP. Um dev de qualquer área autorizada se conecta à plataforma e entende a estrutura sem pedir a ninguém." },
      nint:   { k: "Fase 2", title: "Integração nova", text: "Quando falta uma ferramenta, a integração nasce como automação do catálogo e passa a servir a todos os agentes e às IDEs." },
      eh:     { k: "Fase 2", title: "Now Event Hub", text: "Os gatilhos dos agentes. O ServiceNow publica cada evento uma vez, e cada agente assina o que precisa." },
      ag:     { k: "Fase 2", title: "Agentes", text: "Um runtime para os agentes de todas as áreas. Limites, parada, modo sombra, rastro e avaliação já vêm prontos: o agente só traz o trabalho dele." },
      mcp:    { k: "Fase 2", title: "ServiceNow MCP", text: "A estrutura do ServiceNow e o catálogo do Hub como ferramentas. A IDE usa para entender; o agente, para agir, dentro do semáforo." },
      hub:    { k: "Fase 1", title: "Automation Hub", text: "O catálogo de integrações. Fila, repetição, cofre e log vêm da plataforma: a automação só contém a regra de negócio." },
      llm:    { k: "Já existe hoje", title: "Asimov", text: "O gateway corporativo de modelos. Único caminho de um agente para um modelo de linguagem." },
      nowapi: { k: "Já existe hoje", title: "ServiceNow", text: "Leitura com as permissões de quem pede. Configuração só em sub-produção, com change request e revisão do time do ServiceNow." },
      sys:    { k: "Já existe hoje", title: "Sistemas alvo", text: "Onde as integrações agem: SAP, Entra ID e os demais sistemas com API de cada área." }
    },
    factoryLinks: [
      { edges: ["ide-mcp"],             name: "IDE ↔ ServiceNow MCP",         text: "A IDE lê a estrutura pelas ferramentas, com as permissões de quem pergunta: ofertas, variáveis, eventos publicados e o catálogo de automações." },
      { edges: ["ide-nag"],             name: "IDE → agente novo",            text: "O agente nasce no modelo do time e é testado na máquina do dev, contra um mundo simulado." },
      { edges: ["ide-nint"],            name: "IDE → integração nova",        text: "Quando falta uma ferramenta, a integração nasce como automação: função, manifesto e teste, pela CLI do Hub." },
      { edges: ["nag-rev", "nint-rev"], name: "Pull request → revisão",       text: "Os mesmos gates para todos: manifesto, lint, testes e avaliação. Sem as duas aprovações, não entra." },
      { edges: ["nag-ag"],              name: "Agente novo → runtime",        text: "Depois do merge, o agente entra no runtime com identidade própria e em sombra: lê de verdade e só registra o que escreveria." },
      { edges: ["nint-hub"],            name: "Integração nova → catálogo",   text: "Depois do merge, a esteira publica a versão no catálogo do Hub." },
      { edges: ["eh-ag"],               name: "Now Event Hub → agentes",      text: "Um evento aciona o agente: demanda criada, execução que falhou, prazo perto de estourar. Também dá para iniciar sob demanda." },
      { edges: ["ag-mcp"],              name: "Agentes ↔ ServiceNow MCP",     text: "Só as ferramentas da lista do agente. Cada uma tem uma cor, e o servidor aplica a regra." },
      { edges: ["mcp-hub"],             name: "ServiceNow MCP → Automation Hub", text: "Cada automação do catálogo vira ferramenta: listar, executar e acompanhar." },
      { edges: ["ag-llm"],              name: "Agentes → Asimov",             text: "Todo modelo vem do gateway corporativo, com limite de iterações, de tempo e de custo por execução." },
      { edges: ["mcp-nowapi"],          name: "ServiceNow MCP ↔ ServiceNow",  text: "Leitura com as permissões de quem pede. Configuração só em sub-produção, com change request." },
      { edges: ["hub-sys"],             name: "Automation Hub → sistemas alvo", text: "A automação age no sistema com a credencial do próprio domínio, guardada em cofre." },
      { edges: ["ag-appr"],             name: "Agentes → quem aprova",        text: "Cada entrega é um comentário, um pull request ou um rascunho. Uma pessoa aprova." }
    ],
    pillars: [
      ["Qualquer IDE", "Claude Code, Codex ou outra, com cliente MCP. O dev trabalha na ferramenta que já usa."],
      ["Um modelo de agente", "Quatro arquivos, oito passos e uma CLI que testa e avalia. Limites, parada e rastro vêm do runtime."],
      ["Integração vira ferramenta", "O que falta vira automação do catálogo e passa a servir a todos os agentes e às IDEs."],
      ["Os mesmos gates", "Revisão, avaliação, sombra e aprovação valem para o agente do time e para o de qualquer área."]
    ],
    now: "A criação pela IDE entra na Fase 2, com o MCP e o piloto. O modelo de agente, a CLI, o mundo de teste e os controles já estão em código; a Fase 2 abre a criação para todas as áreas da companhia, com permissão.",
    /* para onde seguir: [endereço, para quem, nome, o que tem] */
    site: [
      ["plataforma/", "Para quem decide", "Plataforma", "As quatro peças, o autoatendimento que prova a ideia e as cinco fases."],
      ["automacoes/", "Para quem constrói", "Automações", "A jornada do time, a base passo a passo, os recursos e os times parceiros."],
      ["servicenow/", "Para o time da instância", "ServiceNow", "Um complemento: os fluxos de operação e de desenvolvimento, os exemplos, os agentes da instância e as garantias."]
    ],

    /* ---------- 2 · Criar: os dois fluxos da fábrica ---------- */
    make: [{ name: null, ids: ["c-agente", "c-integracao"] }],
    flows: [
      { id: "c-agente", short: "Agente novo", phase: 2, map: factory, title: "Um dev de qualquer área cria um agente pela IDE",
        today: "Cada agente novo depende do time da plataforma para ser construído.",
        steps: [
          { path: ["ide"], t: "O dev descreve o agente na IDE", d: "Claude Code, Codex ou outra IDE com cliente MCP. O que aciona o agente, o que ele lê, o que entrega e quem aprova." },
          { path: ["ide", "mcp"], t: "A IDE lê a estrutura pelo MCP", d: "Ofertas, variáveis, eventos publicados e automações do catálogo, com as permissões do próprio dev. Ninguém precisa explicar a instância." },
          { path: ["ide"], t: "Monta o agente no modelo do time", d: "Quatro arquivos: manifesto, prompt, código e avaliação. No manifesto, a decisão: por que um agente, e não código ou uma chamada de modelo." },
          { path: ["ide"], t: "Testa sem tocar em nada", d: "A CLI roda o agente contra um mundo simulado: ServiceNow, Hub, repositório e modelo de teste. O código que roda é o de produção." },
          { path: ["ide", "nag"], t: "Abre o pull request", d: "Os mesmos gates de qualquer agente: manifesto, lint, testes e avaliação. Abaixo da taxa mínima, não passa." },
          { path: ["nag", "rev"], t: "Duas revisões: área e plataforma", d: "O dono da área responde pelo que o agente faz. A plataforma confere ferramentas, permissões e limites." },
          { path: ["nag", "ag"], t: "Entra no runtime, em sombra", d: "Com identidade própria, que só recebe os papéis das ferramentas da lista. Lê de verdade; toda escrita fica só registrada." },
          { path: ["eh", "ag", "llm"], t: "Um evento aciona; o modelo vem do Asimov", d: "Demanda criada, execução que falhou ou prazo perto de estourar. Os limites de iterações, tempo e custo valem a cada chamada." },
          { path: ["ag", "mcp", "nowapi"], t: "Só as ferramentas da lista, cada uma com a cor", d: "Verde segue. Amarelo só em sub-produção, com change request. Vermelho só abre o pedido." },
          { path: ["ag", "appr"], t: "Uma pessoa liga o uso com aprovação", d: "Quando a aceitação em sombra convencer. Daí em diante, cada entrega é um comentário, um pull request ou um rascunho que alguém da área aprova." }
        ] },
      { id: "c-integracao", short: "Integração nova", phase: 2, map: factory, title: "Falta uma ferramenta: a integração vira automação",
        today: "Cada integração nova é construída à parte, para um consumidor só.",
        steps: [
          { path: ["ide"], t: "O agente precisa de algo que não existe", d: "Ler um pedido no SAP, por exemplo. O dev pergunta pela IDE antes de construir." },
          { path: ["ide", "mcp", "hub"], t: "Primeiro, o catálogo", d: "Se uma automação já faz, ela já é ferramenta. Reaproveitar vem antes de construir." },
          { path: ["ide", "nint"], t: "A integração nasce como automação", d: "Pelo modelo do time: função, manifesto e teste, criados pela CLI do Hub. Fila, repetição e cofre vêm da plataforma." },
          { path: ["nint", "rev"], t: "Revisão com o risco e quem pode chamar", d: "O manifesto diz o risco e a lista de quem chama. Um agente só entra na lista se o dono da automação aceitar." },
          { path: ["nint", "hub"], t: "Entra no catálogo", d: "Depois do merge, a esteira publica a versão." },
          { path: ["hub", "mcp"], t: "Vira ferramenta para todos", d: "Pelo MCP, para os agentes e as IDEs e, na Fase 4, para o Stellar. Ninguém constrói a mesma integração duas vezes." },
          { path: ["ag", "mcp", "hub", "sys"], t: "O agente usa a integração", d: "Com a identidade dele, se a ferramenta está na lista do agente e o agente, na lista de quem chama. A automação age com a credencial do domínio." }
        ] }
    ],
    finds: [
      ["A estrutura do ServiceNow", "Ofertas, variáveis e eventos publicados, pelas ferramentas de leitura do MCP, com as permissões de quem pergunta."],
      ["O catálogo de automações", "O que já existe e os parâmetros de cada uma: reaproveitar vem antes de construir."],
      ["O modelo de agente", "Quatro arquivos e um guia de oito passos. A CLI roda o agente, lista as permissões dele e o avalia."],
      ["Um mundo de teste", "ServiceNow, Hub, repositório e modelo simulados. O código que roda no teste é o de produção."]
    ],

    /* ---------- 4 · Governança: um painel só, em camadas, da intenção à evidência ---------- */
    gov: {
      title: "Camadas de governança da plataforma",
      kicker: "Da intenção à prestação de contas",
      lead: "Valem para toda automação e todo agente, de qualquer área da companhia. A regra é aplicada pela plataforma, no servidor, e não por quem executa.",
      intent: { t: "Intenção do dono", d: "O que a automação ou o agente resolve, o risco aceito e quem para. Fica no manifesto, antes de rodar.", note: "O que a área quer" },
      controls: { t: "Controles de governança", d: "Regras, limites e permissões que a plataforma aplica a cada automação e a cada agente.", note: "Define os limites",
        groups: [
          ["id", "Identidade e autorização", ["Uma identidade por serviço, por domínio e por agente", "As ferramentas agem com as permissões de quem pede", "Quem cria agentes: um grupo por área (Fase 2)"]],
          ["rule", "Políticas e condições", ["Risco no manifesto: verde, amarelo ou vermelho", "Agente sem decisão registrada e sem avaliação não entra", "Limites de iterações, tempo e custo por execução"]],
          ["tool", "Ferramentas e capacidades", ["Lista fechada por agente, começando por leitura", "Cada ferramenta tem uma cor, conferida no servidor", "Quem chama cada automação: lista aceita pelo dono"]]
        ] },
      runtime: "Decisão na execução",
      /* [classe, cor, decisão, o que acontece] */
      chips: [
        ["go", "Verde", "Segue", "Dentro da regra, com auditoria"],
        ["stop", "Vermelho", "Bloqueia", "Recusa; acesso só por pedido"],
        ["esc", "Amarelo", "Escala", "Espera aprovação ou revisão"]
      ],
      people: { t: "Supervisão humana", items: ["Aprova entregas e execuções em espera", "Pausa agentes e cancela execuções", "Promove e concede acesso: sempre uma pessoa"], note: "Pessoas no controle" },
      exec: { t: "Execução na plataforma", parts: ["Runtime dos agentes", "Sistemas de cada área", "Automation Hub", "ServiceNow"], d: "O Automation Hub e o ServiceNow entram como complementos. Agente novo roda primeiro em sombra.", note: "Executa com os controles" },
      proof: { t: "Evidência verificável", parts: ["Cada execução", "Cada chamada de ferramenta", "Quem pediu", "Cor", "Desfecho", "Custo"], end: "Auditoria e rastreabilidade", note: "Prova do que aconteceu" }
    },

    /* ---------- 5 · Decisão: um painel só, do contexto à escala ---------- */
    plan: {
      title: "Como escolhemos e escalamos agentes em todas as áreas",
      kicker: "O que construir, em que ordem e quem decide",
      /* o ponto de partida: [número, o quê, de onde vem]. Contagens do próprio site, nenhuma de ganho */
      stats: [
        ["46", "funções mapeadas no DW", "o primeiro mapa; cada área faz o seu"],
        ["11", "pedem um agente", "o resto é código, chamada de modelo ou busca"],
        ["7", "agentes do DW", "nas Fases 2 a 4, sempre com uma pessoa no fim"],
        ["10", "primeiras automações", "na Fase 1, com API e baixo risco"]
      ],
      base: "Nenhum número de ganho: a linha de base é medida na Fase 0, e as metas saem dela.",
      /* passo 1: [título, o que é, marcas] */
      sources: [
        ["Trabalho repetitivo", "Oferta que termina em tarefa manual, triagem e conferência feitas à mão.", ["Pedidos", "Triagem", "Testes"]],
        ["Saber que mora em poucas pessoas", "Achar o que já existe, o impacto de uma mudança e o padrão certo depende de quem lembra.", ["Reuso", "Impacto", "Padrões"]],
        ["Ideias das áreas", "Qualquer área abre a demanda pelo ticket de sempre. O Intake estrutura e classifica.", ["Intake", "ROI", "IDE"]]
      ],
      /* passo 2: o grupo do catálogo de funções que conta cada degrau da escada (TEAM.ladder) */
      rungs: ["plataforma", "modelo", "busca", "hibrido", "agente"],
      extra: ["Integração nova", "Faltou ferramenta: vira automação do catálogo e passa a servir a todos os agentes e às IDEs."],
      flow: ["Demanda", "Intake", "ROI", "Fila", "Dono decide"],
      flowNote: "O retorno é medido com dados reais (hoje, volume e tempo do ServiceNow), e a conta é feita em código. Se já existe automação, a resposta é reaproveitar.",
      cycleNote: "Os mesmos oito passos em qualquer área. Sem avaliação, o agente não vai para uso real."
    },

    /* retorno × esforço: [classe, posição, nome, regra, chamada] */
    matrix: [
      ["now", "Retorno alto · esforço baixo", "Agora", "Entra na próxima onda. Na Fase 1, é o critério das 10 primeiras automações: API e baixo risco.", "Prioridade imediata"],
      ["plan", "Retorno alto · esforço alto", "Projeto", "Vira plano, com a proposta de arquitetura, marcos e um dono.", "Transformação planejada"],
      ["own", "Retorno baixo · esforço baixo", "Com a própria área", "Um dev da área cria pela IDE, a partir da Fase 2, com os mesmos gates.", "Autoatendimento"],
      ["wait", "Retorno baixo · esforço alto", "Não agora", "Fica registrado, com o motivo, e volta à fila se os números mudarem.", "Despriorizar"]
    ],
    risk: "Todo agente começa em sombra. Ferramenta amarela só em sub-produção, com change request; vermelha nunca age direto.",
    /* [decisão, quem decide, com o quê] */
    deciders: [
      ["Uma demanda entra, e em que ordem", "Dono do produto, com o dono da área", "O caso de negócio, com a origem de cada número"],
      ["Código, chamada de modelo ou agente", "Quem constrói; desvio de padrão vai ao arquiteto", "A decisão registrada no manifesto"],
      ["Quem pode criar agentes em uma área", "Liderança, área por área", "Um grupo de quem pode criar, por área (Fase 2)"],
      ["Uma fonte entra na busca", "Uma pessoa, nunca o modelo", "A lista de fontes aprovadas"],
      ["Um pull request entra", "Revisor da plataforma; na Fase 2, também o dono da área", "Os gates da esteira: manifesto, testes e avaliação"],
      ["Um agente pode chamar uma automação", "O dono da automação", "A lista de quem chama, no manifesto da automação"],
      ["Um agente sai da sombra", "O dono do agente", "A aceitação medida em sombra"],
      ["Configuração em produção no ServiceNow", "O time do ServiceNow", "O processo de mudança de hoje"],
      ["Um acesso sensível", "O dono do recurso", "A aprovação no ServiceNow"],
      ["Reprocessar uma execução", "O plantão", "O diagnóstico do agente de Operação"],
      ["Parar um agente", "Quem tem o papel de operar os agentes", "A pausa, que vale na próxima chamada"],
      ["Passar de fase", "A liderança", "O critério de saída de cada fase"]
    ],
    /* o que a liderança decide agora: [quando, [[decisão, marca]]] */
    asks: [
      ["Agora, na Fase 0", [
        ["Aprovar o ambiente de dev, pequeno e descrito em código", "agora"],
        ["Liberar os pedidos de identidade e de gateway, os de maior prazo", "agora"],
        ["Acesso ao Asimov por ambiente, com modelos aprovados e cota", "agora"],
        ["Uma instância de sub-produção do ServiceNow para os testes", "agora"]
      ]],
      ["Para a Fase 1", [
        ["A lista priorizada de automações, com um dono de negócio por automação", "Fase 0 em diante"],
        ["Um desenvolvedor do ServiceNow, em tempo parcial", "Fases 1 a 4"]
      ]],
      ["Para a Fase 2", [
        ["Quais áreas começam a criar agentes", "Fase 2"],
        ["Um dono em cada área, que responde pelos agentes dela", "Fase 2"],
        ["Quem pode criar agentes em cada área: um grupo por área", "Fase 2"]
      ]],
      ["A cada fase", [
        ["Passar de fase quando o critério de saída for atingido", "cada fase"],
        ["Remanejar a capacidade liberada pelos indicadores, não pelo calendário", "cada fase"]
      ]]
    ]
  };
})();
