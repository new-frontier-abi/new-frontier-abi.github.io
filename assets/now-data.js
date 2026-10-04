/* Conteúdo da página do time do ServiceNow: os dois modelos (operação e desenvolvimento), os desenhos em raias, os exemplos e as garantias.
   Tudo o que não está no plano de fases aparece como proposta (p: 5 nos modelos, tag "Proposta" nos exemplos e nas raias).
   Tickets, ofertas, grupos e pessoas dos exemplos são fictícios. */
window.NOW = {
  /* ---------- raias: quem pode participar de um processo, e em que camada fica ----------
     k: core = serviço da plataforma (roda no Kubernetes), az = serviço do Azure, ext = já existe ou é de outro time, person = pessoa.
     g: a camada. As camadas com az ficam dentro da zona do Azure. "|" quebra o título em duas linhas. d: o papel, em uma frase. */
  groups: [
    { id: "p" },
    { id: "s" },
    { id: "b", az: 1, label: "BORDA E IDENTIDADE", short: "BORDA" },
    { id: "k", az: 1, label: "KUBERNETES", short: "CLUSTER" },
    { id: "d", az: 1, label: "DADOS E MENSAGENS", short: "DADOS" },
    { id: "x" }
  ],
  parts: {
    emp:     { t: "Funcionário",        k: "person", g: "p", d: "Quem pede: funcionários de RH, de TI e das áreas de negócio." },
    req:     { t: "RH, TI ou|sistemas", k: "person", g: "p", d: "A área que pede uma oferta nova ou uma mudança." },
    dev:     { t: "Time do|ServiceNow", k: "person", g: "p", d: "Revisa, ajusta e promove. Nada vai para produção sem o time." },
    sol:     { t: "Grupo|solucionador", k: "person", g: "p", d: "Atende o que a automação não resolve e decide o que fazer." },
    own:     { t: "Dono da|base",       k: "person", g: "p", d: "Quem cuida da base de conhecimento: revisa e publica." },
    stellar: { t: "Stellar",            k: "ext",    g: "s", d: "O chat interno, para todos os funcionários. Hoje atende mais temas de RH, e TI está entrando." },
    ide:     { t: "IDE do time",        k: "ext",    g: "s", d: "As ferramentas de desenvolvimento do time, como clientes do MCP." },
    now:     { t: "ServiceNow",         k: "ext",    g: "s", d: "Catálogo, tickets e flows. A instância continua do time do ServiceNow." },
    entra:   { t: "Entra ID",           k: "az",     g: "b", d: "A identidade de cada chamador e a troca do token do usuário." },
    apim:    { t: "API|Management",     k: "az",     g: "b", d: "A porta de entrada: token, cota e rastreio de toda chamada que vem de fora do cluster." },
    ing:     { t: "Ingestão|de eventos", k: "core",  g: "k", d: "A entrada do Now Event Hub: recebe os eventos do ServiceNow, valida o contrato e deduplica." },
    agent:   { t: "Agente",             k: "core agent", g: "k", d: "Roda no cluster, com identidade própria, limites e uma lista fechada de ferramentas." },
    mcp:     { t: "ServiceNow|MCP",     k: "core",   g: "k", d: "O ServiceNow como ferramentas, com semáforo e auditoria. Não guarda sessão." },
    hub:     { t: "Automation|Hub",     k: "core",   g: "k", d: "Catálogo, execuções, assinaturas, agenda e callback." },
    worker:  { t: "Worker do|domínio",  k: "core",   g: "k", d: "Do Automation Hub: executa as automações de um domínio, com identidade e fila próprias." },
    pg:      { t: "PostgreSQL",         k: "az",     g: "d", d: "Execuções, eventos já aceitos, auditoria das ferramentas e estado dos agentes." },
    sb:      { t: "Service Bus",        k: "az",     g: "d", d: "As filas do Automation Hub, separadas por domínio de automação." },
    eh:      { t: "Event Hubs",         k: "az",     g: "d", d: "O barramento do Now Event Hub: cada assinante lê os eventos no próprio ritmo." },
    kv:      { t: "Key Vault",          k: "az",     g: "d", d: "As credenciais de cada domínio. Nada de senha em código." },
    llm:     { t: "Asimov",             k: "ext",    g: "x", d: "O gateway corporativo de modelos. Único caminho para um modelo de linguagem." },
    target:  { t: "Sistema alvo",       k: "ext",    g: "x", d: "Onde a automação age: Entra ID, SAP e os demais sistemas com API." },
    others:  { t: "Outros|assinantes",  k: "ext",    g: "x", d: "Agentes, Stellar e outros times: cada um assina o que precisa." }
  },
  seqLegend: [["act", "Etapa atual"], ["new", "Já percorrido"], ["core", "Serviço da plataforma"], ["az", "Serviço do Azure"], ["ext", "Já existe, ou é de outro time"], ["person", "Pessoa"]],

  /* Cada processo: quem participa (seq.parts, "id" ou "id:Título") e as etapas. hops: os trechos da etapa, [de, para, rótulo]; de igual a para é trabalho interno.
     ph: a fase, para o menu. ex: o exemplo que mostra o que este processo entrega. */
  seqs: [
    { id: "q-pedido", short: "Pedido com automação", ph: "Fase 1", tag: "Fase 1 · Atendimento", ex: "e-flow",
      title: "Um pedido resolvido sem tarefa manual",
      lead: "Do catálogo ao item fechado. O ServiceNow chama uma vez; a plataforma cuida do resto e devolve o desfecho.",
      seq: { parts: ["emp", "now", "entra", "apim", "hub", "worker", "pg", "sb", "kv", "target"] },
      steps: [
        { t: "Ana pede acesso a um grupo", hops: [["emp", "now"]], d: "Pelo catálogo, como hoje. O flow da oferta chega à ação DW Hub · Run Automation." },
        { t: "O ServiceNow se identifica", hops: [["now", "entra", "token"]], d: "A instância pede um token ao Entra ID. Cada chamador só executa as automações liberadas para ele." },
        { t: "A ação de Flow chama o Hub pelo gateway", hops: [["now", "apim"], ["apim", "hub"]], d: "Uma rota para todas as ofertas, com cota e rastreio. O número do ticket é a chave de idempotência." },
        { t: "O Hub registra e responde na hora", hops: [["hub", "pg", "execução"]], d: "Execução e mensagem gravadas na mesma transação. O flow não fica esperando." },
        { t: "A fila entrega ao worker do domínio", hops: [["hub", "sb", "mensagem"], ["sb", "worker"]], d: "Filas separadas por domínio. Mais carga, mais réplicas do worker." },
        { t: "A credencial vem do cofre", hops: [["worker", "kv", "segredo"]], d: "O worker lê só os segredos do próprio domínio, pela identidade dele." },
        { t: "A automação inclui Ana no grupo", hops: [["worker", "target"]], d: "Falha passageira repete com espera. Esgotadas as tentativas, a execução fica separada, com o contexto." },
        { t: "O desfecho é gravado", hops: [["worker", "pg", "resultado"]], d: "Tentativa, duração e resultado, com log e rastro por tentativa." },
        { t: "O callback fecha o item, e Ana é avisada", hops: [["pg", "hub"], ["hub", "now", "callback"], ["now", "emp"]], d: "O subflow de callback fecha o item ou o encaminha ao grupo solucionador, com o motivo." }
      ] },

    { id: "q-chat", short: "Pedido pelo Stellar", ph: "Fase 4", tag: "Fase 4 · Entrada",
      title: "Um pedido feito no Stellar",
      lead: "O chat interno usa o ServiceNow como ferramenta, com a identidade de quem conversa. Nada é construído só para o chat.",
      seq: { parts: ["emp", "stellar", "now", "entra", "apim", "mcp", "ing", "hub", "pg", "eh"] },
      steps: [
        { t: "Ana pede no Stellar", hops: [["emp", "stellar"]], d: "Em linguagem natural, sem procurar a oferta no portal." },
        { t: "O Stellar chama uma ferramenta", hops: [["stellar", "apim"], ["apim", "mcp"]], d: "Pelo gateway, com o token de quem conversa. O MCP não guarda sessão." },
        { t: "O token vira um token do ServiceNow", hops: [["mcp", "entra", "troca"]], d: "Para a mesma pessoa. Valem as ACLs de Ana, não as de uma conta de serviço." },
        { t: "Procura a oferta e o que ela pede", hops: [["mcp", "now", "leitura"]], d: "Catálogo e variáveis da oferta, lidos com a permissão de Ana." },
        { t: "Pede a oferta em nome de Ana", hops: [["mcp", "now", "subflow"]], d: "A escrita passa por um subflow do time. O flow da oferta roda como em um pedido do portal." },
        { t: "A chamada fica auditada", hops: [["mcp", "pg", "auditoria"]], d: "Quem pediu, qual ferramenta, a cor do semáforo e o desfecho." },
        { t: "O flow da oferta chama a automação", hops: [["now", "apim"], ["apim", "hub"]], d: "Daqui em diante é o caminho do pedido pelo portal: fila, worker e sistema alvo." },
        { t: "O desfecho volta para a conversa", hops: [["now", "apim"], ["apim", "ing"], ["ing", "eh", "evento"], ["eh", "stellar"]], d: "O item muda de estado, o evento sai uma vez, e o Stellar, que assina, avisa Ana." }
      ] },

    { id: "q-triagem", short: "Triagem", ph: "Fase 4", tag: "Fase 4 · Triagem", ex: "e-triagem",
      title: "Um incidente classificado na criação",
      lead: "O evento de incidente criado aciona uma chamada de modelo. A sugestão entra no ticket, e uma pessoa confirma.",
      seq: { parts: ["emp", "sol", "now", "apim", "ing", "agent:Classificação", "mcp", "pg", "eh", "llm"] },
      steps: [
        { t: "Um incidente é aberto", hops: [["emp", "now"]], d: "Pelo portal, pelo chat ou por e-mail. Categoria e grupo em branco." },
        { t: "A regra publicadora envia o evento", hops: [["now", "apim"], ["apim", "ing"]], d: "Só com identificadores. O texto do incidente não sai do ServiceNow." },
        { t: "A ingestão valida, deduplica e publica", hops: [["ing", "pg"], ["ing", "eh", "evento"]], d: "Reenvio do mesmo evento não duplica, e a ordem por registro é mantida." },
        { t: "A classificação lê o evento", hops: [["eh", "agent"]], d: "Uma chamada de modelo, não um agente: classificar é um passo só." },
        { t: "Busca o incidente pelas ferramentas", hops: [["agent", "mcp"], ["mcp", "now", "leitura"]], d: "Por dentro do cluster, com identidade de serviço própria e uma lista fechada de ferramentas." },
        { t: "O modelo sugere categoria e grupo", hops: [["agent", "llm", "modelo"]], d: "Pelo gateway de modelos, com o grau de confiança e limite de custo por execução." },
        { t: "A sugestão vai para o ticket", hops: [["agent", "mcp"], ["mcp", "now", "subflow"], ["mcp", "pg", "auditoria"]], d: "Como nota de trabalho, por ferramenta verde, com auditoria." },
        { t: "Quem tria confirma; o incerto fica com o time", hops: [["now", "sol"]], d: "Aplicar categoria e grupo sem ninguém confirmar fica para depois de medir o acerto, e pede um subflow novo do time." }
      ] },

    { id: "q-prazo", short: "Prazo em risco", ph: "Fase 4", tag: "Fase 4 · Prazos", ex: "e-prazo",
      title: "Um prazo em risco, com o diagnóstico pronto",
      lead: "O aviso de 75% vira evento. O agente de Operação junta o contexto e deixa o diagnóstico no ticket.",
      seq: { parts: ["sol", "now", "apim", "ing", "agent:Agente de|Operação", "mcp", "hub", "pg", "eh", "llm"] },
      steps: [
        { t: "O prazo de um item passa de 75%", hops: [["now", "now"]], d: "O SLA é o de hoje: meta, calendário e pausas não mudam." },
        { t: "O aviso vira evento", hops: [["now", "apim"], ["apim", "ing"]], d: "Mais uma linha no registro de eventos. Nenhuma regra nova na instância." },
        { t: "A ingestão publica para quem assina", hops: [["ing", "pg"], ["ing", "eh", "evento"]], d: "Validado e sem duplicidade. O agente de Operação é um dos assinantes." },
        { t: "O agente de Operação assume", hops: [["eh", "agent"], ["agent", "pg", "execução"]], d: "O evento abre uma execução, com limite de tempo e de custo." },
        { t: "Lê onde o item parou", hops: [["agent", "mcp"], ["mcp", "now", "leitura"]], d: "Estado, aprovações e tarefas do item, pelas ferramentas de leitura." },
        { t: "Confere o que a automação fez", hops: [["agent", "hub", "execução"]], d: "A execução, as tentativas e o erro, direto do Hub." },
        { t: "Regra primeiro; modelo só na exceção", hops: [["agent", "llm", "modelo"]], d: "Os casos conhecidos saem por regra, sem custo de modelo. O que sobra vai ao Asimov." },
        { t: "O diagnóstico chega no ticket", hops: [["agent", "mcp"], ["mcp", "now", "subflow"], ["now", "sol"]], d: "Nota de trabalho com o que parou e a sugestão. O agente não reatribui nem fecha nada." }
      ] },

    { id: "q-kb", short: "Artigo de conhecimento", ph: "Fase 4", tag: "Fase 4 · Conhecimento", ex: "e-kb",
      title: "Um artigo que nasce dos tickets resolvidos",
      lead: "Quem cuida da base escolhe o tema. O rascunho sai dos tickets resolvidos, e uma pessoa revisa e publica.",
      seq: { parts: ["own", "now", "agent:Rascunho|de artigo", "mcp", "pg", "llm"] },
      steps: [
        { t: "Quem cuida da base escolhe um tema", hops: [["own", "agent"], ["agent", "pg", "execução"]], d: "Por exemplo, impressão. O pedido abre uma execução, com limite de tempo e de custo." },
        { t: "Busca os tickets resolvidos do tema", hops: [["agent", "mcp"], ["mcp", "now", "leitura"]], d: "Pelas ferramentas de leitura. O que se repete com a mesma solução é candidato a artigo." },
        { t: "Confere o que a base já tem", hops: [["agent", "mcp"], ["mcp", "now", "leitura"]], d: "Se o artigo já existe, a sugestão é atualizar, não duplicar." },
        { t: "O modelo redige o rascunho", hops: [["agent", "llm", "modelo"]], d: "Sintoma, causa e solução, no modelo de artigo do time. Cada trecho aponta para o ticket de origem." },
        { t: "O rascunho volta para quem pediu", hops: [["agent", "own"]], d: "Gravar direto na base, como rascunho, pede um subflow novo do time: fica como proposta." },
        { t: "Uma pessoa revisa e publica", hops: [["own", "now"]], d: "Pelo fluxo de publicação da base, como hoje. Depois, o artigo serve o portal, o Stellar e a triagem." }
      ] },

    { id: "q-reuso", short: "O que já existe", ph: "Fase 2", tag: "Fase 2 · Demanda e arquitetura", ex: "e-reuso",
      title: "O que já existe, antes de construir",
      lead: "Pela IDE, o desenvolvedor pergunta ao catálogo do ServiceNow e ao da plataforma o que dá para reaproveitar.",
      seq: { parts: ["dev", "ide", "now", "entra", "apim", "mcp", "hub", "pg"] },
      steps: [
        { t: "O desenvolvedor pergunta pela IDE", hops: [["dev", "ide"]], d: "Já existe oferta parecida? Quais variáveis ela usa? Há automação para isso?" },
        { t: "A IDE chama as ferramentas pelo gateway", hops: [["ide", "apim"], ["apim", "mcp"]], d: "Com o token do próprio desenvolvedor, cota e rastreio." },
        { t: "O token vira um token do ServiceNow", hops: [["mcp", "entra", "troca"]], d: "Para a mesma pessoa: valem as ACLs dela." },
        { t: "Ofertas e formulários, do catálogo", hops: [["mcp", "now", "leitura"]], d: "As ofertas parecidas e as variáveis de cada uma." },
        { t: "Automações, do catálogo do Hub", hops: [["mcp", "hub", "leitura"]], d: "Com os parâmetros que cada automação pede. O registro de eventos diz o que a instância já publica." },
        { t: "A chamada fica auditada", hops: [["mcp", "pg", "auditoria"]], d: "Quem perguntou, qual ferramenta e o desfecho." },
        { t: "A resposta diz o que reaproveitar", hops: [["mcp", "ide"], ["ide", "dev"]], d: "A oferta mais parecida, as variáveis que servem e a automação que já resolve. A decisão é do desenvolvedor." }
      ] },

    { id: "q-rascunho", short: "Demanda vira rascunho", ph: "Fase 4", tag: "Fase 4 · Construção", ex: "e-oferta",
      title: "Da demanda ao rascunho em sub-produção",
      lead: "A demanda aciona o agente Now Dev. Ele monta a configuração, sempre em sub-produção e com change request, e o time revisa.",
      seq: { parts: ["req", "dev", "now", "apim", "ing", "agent:Agente|Now Dev", "mcp", "pg", "eh", "llm"] },
      steps: [
        { t: "RH, TI ou sistemas abre a demanda", hops: [["req", "now"]], d: "Pelo ticket de sempre: o que quer, para quem e com qual regra." },
        { t: "A demanda vira evento", hops: [["now", "apim"], ["apim", "ing"], ["ing", "eh", "evento"]], d: "Demanda criada, só com identificadores. A ingestão valida e deduplica." },
        { t: "O agente Now Dev assume", hops: [["eh", "agent"], ["agent", "pg", "execução"]], d: "Com limite de iterações, de tempo e de custo. Uma pessoa pode pausar a qualquer momento." },
        { t: "Procura o que já existe", hops: [["agent", "mcp"], ["mcp", "now", "leitura"]], d: "A oferta mais parecida, as variáveis dela e as automações do catálogo." },
        { t: "Monta a configuração", hops: [["agent", "llm", "modelo"]], d: "Pelo gateway de modelos. O texto da demanda é tratado como dado, nunca como instrução." },
        { t: "Abre a change request", hops: [["agent", "mcp"], ["mcp", "now", "subflow"]], d: "Ferramenta amarela: só em sub-produção. Sem change aberta, nada é criado." },
        { t: "Cria os rascunhos, um por ferramenta", hops: [["agent", "mcp"], ["mcp", "now", "subflow"], ["mcp", "pg", "auditoria"]], d: "Oferta com formulário e flow, regra de atribuição e evento. No começo, em modo sombra: só registra o que criaria." },
        { t: "O time do ServiceNow revisa e promove", hops: [["now", "dev"]], d: "Ajustes voltam como comentário. A promoção segue o processo normal de mudança." }
      ] },

    { id: "q-evento", short: "Evento sem trigger", ph: "Fase 2", tag: "Fase 2 · Construção", ex: "e-evento",
      title: "Um time quer reagir a um registro",
      lead: "O time registra o evento uma vez. Daí em diante, quem quiser reagir assina, sem pedir nada ao ServiceNow.",
      seq: { parts: ["dev", "now", "apim", "ing", "mcp", "hub", "pg", "eh", "others"] },
      steps: [
        { t: "O time registra o evento, uma vez", hops: [["dev", "now"]], d: "Uma linha no registro: tabela, operação, condição e quais identificadores saem. A regra publicadora já existe." },
        { t: "Um item é aprovado, e o evento sai", hops: [["now", "apim"], ["apim", "ing"]], d: "Fora da transação do usuário, só com identificadores." },
        { t: "A ingestão valida, deduplica e publica", hops: [["ing", "pg"], ["ing", "eh", "evento"]], d: "Fora do contrato, é recusado. O que acontece com o mesmo ticket chega em ordem." },
        { t: "Uma assinatura liga o evento à automação", hops: [["eh", "hub"]], d: "Configuração do dono da automação: tipo de evento, filtro e de onde vem cada parâmetro." },
        { t: "O detalhe vem pelas ferramentas", hops: [["hub", "mcp"], ["mcp", "now", "leitura"]], d: "As variáveis do item, lidas com permissão própria." },
        { t: "A execução nasce como qualquer outra", hops: [["hub", "pg", "execução"]], d: "Fila, worker e sistema alvo: o mesmo caminho do pedido pelo catálogo." },
        { t: "Mais um assinante, nada muda na instância", hops: [["eh", "others"]], d: "Agentes e, na Fase 4, o Stellar leem o mesmo evento, cada um no seu ritmo, e podem pedir o reenvio de uma janela." }
      ] },

    { id: "q-regressao", short: "Regressão", ph: "Fase 4", tag: "Fase 4 · QA", ex: "e-regressao",
      title: "As ofertas testadas antes de promover",
      lead: "O agente de QA pede cada oferta em sub-produção, confere o desfecho e entrega a evidência. Decidir é do time.",
      seq: { parts: ["dev", "now", "apim", "agent:Agente|de QA", "mcp", "hub", "pg", "llm"] },
      steps: [
        { t: "O time pede a regressão antes de promover", hops: [["dev", "agent"], ["agent", "pg", "execução"]], d: "Com a lista de ofertas e os usuários de teste. Tudo em sub-produção." },
        { t: "O agente pede cada oferta", hops: [["agent", "mcp"], ["mcp", "now", "subflow"]], d: "Pela mesma ferramenta que o chat usa, com um usuário de teste." },
        { t: "O flow da oferta roda de verdade", hops: [["now", "apim"], ["apim", "hub"]], d: "A ação chama o Hub de non-prod. Nada toca produção." },
        { t: "A execução devolve o desfecho", hops: [["hub", "pg", "resultado"], ["hub", "now", "callback"]], d: "Fila, worker e callback, como em produção, contra os sistemas de teste." },
        { t: "Confere o item e a execução de cada oferta", hops: [["agent", "mcp"], ["mcp", "now", "leitura"], ["mcp", "hub", "leitura"]], d: "Execução concluída e item fechado: passou. O aprovado é conferido em código, não pelo modelo." },
        { t: "O modelo resume a evidência da falha", hops: [["agent", "llm", "modelo"]], d: "O que parou, onde e o que mudou desde o último teste." },
        { t: "O resultado vai para a change request", hops: [["agent", "mcp"], ["mcp", "now", "subflow"], ["now", "dev"]], d: "Como comentário. Promover ou corrigir é decisão do time." }
      ] },

    { id: "q-revisao", short: "Revisão de código", ph: "Proposta", tag: "Proposta · Revisão de código", ex: "e-revisao",
      title: "A primeira passada da revisão",
      lead: "Um update set concluído aciona uma chamada de modelo, que aponta os desvios antes da revisão humana.",
      note: "Pede um tipo de evento novo e uma ferramenta nova de leitura de update set, com subflow do time. Nenhum recurso novo no Azure. Regra fixa continua com a checagem da própria instância.",
      seq: { parts: ["dev", "now", "apim", "ing", "agent:Revisão|de código", "mcp", "pg", "eh", "llm"] },
      steps: [
        { t: "Um update set é concluído", hops: [["dev", "now"]], d: "O desenvolvedor marca como concluído, como hoje." },
        { t: "Uma linha nova no registro publica o evento", hops: [["now", "apim"], ["apim", "ing"], ["ing", "eh", "evento"]], d: "Um tipo de evento a mais. Nenhuma regra nova na instância." },
        { t: "A revisão lê o evento", hops: [["eh", "agent"], ["agent", "pg", "execução"]], d: "Uma chamada de modelo, não um agente: ler e apontar é um passo só." },
        { t: "Lê o que mudou no update set", hops: [["agent", "mcp"], ["mcp", "now", "leitura"]], d: "É a ferramenta nova: leitura do conteúdo do update set, por um subflow do time." },
        { t: "Compara com as boas práticas do time", hops: [["agent", "llm", "modelo"]], d: "Os padrões do time entram como fonte. Cada apontamento cita a regra." },
        { t: "Os apontamentos chegam antes do revisor", hops: [["agent", "mcp"], ["mcp", "now", "subflow"], ["now", "dev"]], d: "Como comentário na change request. Aprovar a promoção continua com o revisor." }
      ] },

    { id: "q-daily", short: "Resumo da daily", ph: "Proposta", tag: "Proposta · Daily e rotina", ex: "e-daily",
      title: "O resumo pronto antes da daily",
      lead: "Uma agenda dispara a rotina, que lê o que mudou desde ontem e redige o resumo do time.",
      note: "Depende de onde o time registra o trabalho e de por onde quer receber o resumo. Nenhum recurso novo no Azure.",
      seq: { parts: ["dev", "now", "agent:Resumo|da daily", "mcp", "hub", "pg", "llm"] },
      steps: [
        { t: "Toda manhã, a agenda do Hub inicia a rotina", hops: [["hub", "agent"], ["agent", "pg", "execução"]], d: "Agenda é configuração do Hub: quando rodar e com quais parâmetros." },
        { t: "Lê o que mudou desde ontem", hops: [["agent", "mcp"], ["mcp", "now", "leitura"]], d: "Demandas, change requests e incidentes do time, pelas ferramentas de leitura." },
        { t: "O modelo redige o resumo", hops: [["agent", "llm", "modelo"]], d: "Por item de trabalho, não por pessoa, com os bloqueios primeiro." },
        { t: "O resumo chega antes da daily", hops: [["agent", "mcp"], ["mcp", "now", "subflow"], ["now", "dev"]], d: "Como comentário no ServiceNow, ou no canal que o time preferir. Decidir continua com o time." }
      ] }
  ],

  /* ---------- os dois modelos: etapas em colunas; em cada etapa, o que o time faz e o que a plataforma assume ----------
     Linha do tempo: 0 hoje, 1 a 4 as fases, 5 além do plano (propostas). cap.p: quando a capacidade entra.
     cap.seq: o desenho em raias que mostra por dentro. cap.go: [aba, filtro] para onde a proposta leva. */
  pieces: [
    { t: "Automation Hub", p: 1, to: "hub" },
    { t: "Now Event Hub", p: 2, to: "eh" },
    { t: "ServiceNow MCP", p: 2, to: "mcp" },
    { t: "Agentes", p: 4, to: "ag" },
    { t: "Stellar", p: 4, tip: "O chat interno já existe. Passa a usar as ferramentas na Fase 4." }
  ],
  run: {
    aria: "Modelo operacional do time do ServiceNow: seis etapas, da entrada à melhoria, fase por fase",
    who: ["RH", "TI", "Sistemas"],
    /* o que muda para cada área que o time atende; cada linha diz a fase, ou que é proposta */
    areas: [
      ["RH", ["Ofertas e formulários de RH chegam como rascunho, e o mesmo formulário serve ao Stellar (Fase 4).",
        "O Stellar, hoje mais usado em temas de RH, passa a pedir ofertas e a buscar conhecimento pelas ferramentas (Fase 4).",
        "Triagem de casos de RH: proposta, só depois da avaliação de privacidade."]],
      ["TI", ["Pedidos de acesso e de dispositivo fecham por automação, sem tarefa manual (Fase 1).",
        "Incidentes chegam com sugestão de grupo, e o prazo em risco, com diagnóstico (Fase 4).",
        "A base de conhecimento de TI fica pronta para o Stellar, onde TI está entrando (Fase 4)."]],
      ["Sistemas", ["Acesso a sistema liberado por grupo. O que é sensível só executa depois da aprovação (Fases 1 e 3).",
        "Outro time quer reagir a um registro: assina o evento, sem pedir trigger (Fase 2).",
        "Automação nova para um sistema entra no catálogo e vale para qualquer oferta (Fase 3)."]]
    ],
    /* o que medir: só o indicador. A linha de base e a meta vêm da medição, não deste desenho. */
    measures: [
      ["Pedidos sem tarefa manual", "A parte dos itens que a automação fecha, por oferta."],
      ["Tempo até o grupo certo", "Do ticket aberto ao grupo que resolve."],
      ["Prazos estourados", "Quantos estouram, e quantos foram avisados antes."],
      ["Conhecimento em uso", "Artigos publicados a partir de rascunho, e tickets que citam um artigo."]
    ],
    stages: [
      { id: "entrada", name: "Entrada",
        today: "O funcionário procura a oferta no portal, e a dúvida vira ticket.",
        keeps: "Cuida do catálogo e do conhecimento que o portal e o chat usam.",
        caps: [{ p: 4, t: "O Stellar consulta chamados, pede ofertas e busca conhecimento pelas ferramentas", pieces: ["Stellar", "MCP"], seq: "q-chat" }] },
      { id: "triagem", name: "Triagem",
        today: "Alguém lê cada ticket, classifica e encaminha ao grupo certo.",
        keeps: "Confirma a sugestão e trata o que o modelo marcou como incerto.",
        caps: [{ p: 4, t: "Uma chamada de modelo sugere categoria e grupo na criação do ticket", pieces: ["Event Hub", "MCP", "Asimov"], seq: "q-triagem" },
          { p: 5, t: "Casos de RH, depois da avaliação de privacidade", go: ["agentes", "operacao"] }] },
      { id: "atendimento", name: "Atendimento",
        today: "A oferta termina em tarefa manual para o grupo solucionador.",
        keeps: "Atende o que não tem automação e o que a automação devolveu.",
        caps: [{ p: 1, t: "A oferta chama a automação, e o item fecha sozinho", pieces: ["Hub"], seq: "q-pedido" },
          { p: 2, t: "Um evento dispara a automação, sem trigger novo", pieces: ["Event Hub", "Hub"], seq: "q-evento" },
          { p: 3, t: "Acesso sensível só executa depois da aprovação", pieces: ["Hub"] }] },
      { id: "prazos", name: "Prazos",
        today: "Quando o prazo aperta, alguém abre o ticket para descobrir onde parou.",
        keeps: "Decide a ação: cobrar, reatribuir ou escalar.",
        caps: [{ p: 4, t: "O aviso de prazo chega com o diagnóstico: onde o item parou e o que a automação fez", pieces: ["Event Hub", "Agente", "MCP"], seq: "q-prazo" }] },
      { id: "conhecimento", name: "Conhecimento",
        today: "O artigo é escrito à mão, quando sobra tempo.",
        keeps: "Revisa, publica e aposenta os artigos.",
        caps: [{ p: 4, t: "Rascunho de artigo a partir dos tickets resolvidos do tema", pieces: ["MCP", "Asimov"], seq: "q-kb" },
          { p: 5, t: "Lacunas da base e artigos vencidos, em lista periódica", go: ["agentes", "conhecimento"] }] },
      { id: "melhoria", name: "Melhoria",
        today: "Achar o que melhorar depende de alguém cruzar relatórios e tickets.",
        keeps: "Decide o que vira problema, o que sai do catálogo e o que muda.",
        caps: [{ p: 2, t: "Volume por oferta e tempo por grupo, pelas ferramentas de leitura", pieces: ["MCP"] },
          { p: 5, t: "Candidatos a problema, higiene do catálogo e saúde dos grupos", go: ["agentes", "operacao"] }] }
    ],
    steps: [
      { b: "Hoje", name: "Ponto de partida", when: "a base sai na Fase 0",
        title: "Hoje: cada etapa passa por alguém do time",
        text: "Pedidos de RH, de TI e de sistemas entram, são triados e atendidos à mão. O dia do time vai para o que se repete." },
      { b: "Fase 1", name: "Automation Hub", when: "dez 2026–fev 2027",
        title: "Fase 1: o pedido que se repete se resolve sozinho",
        text: "A oferta chama uma automação do catálogo, e o item fecha sem tarefa manual. Se a automação falhar, vira tarefa para o grupo, com o motivo." },
      { b: "Fase 2", name: "MCP e Event Hub", when: "mar–mai 2027",
        title: "Fase 2: eventos e leitura, sem integração nova",
        text: "Um evento dispara a automação sem trigger novo, e o time consulta volume e tempo pelas ferramentas." },
      { b: "Fase 3", name: "Agentes de entrega", when: "jun–ago 2027",
        title: "Fase 3: acesso sensível passa por aprovação",
        text: "Automações de risco só executam depois da aprovação, e as ferramentas passam a escrever dentro do semáforo." },
      { b: "Fase 4", name: "Conectar e escalar", when: "set 2027 em diante",
        title: "Fase 4: triagem, prazo, conhecimento e Stellar",
        text: "Uma chamada de modelo sugere a triagem, o agente de Operação diagnostica o prazo em risco, o conhecimento nasce dos tickets e o Stellar usa as mesmas ferramentas." },
      { b: "Além", name: "Propostas", when: "fora do plano",
        title: "Além do plano: propostas para o time escolher",
        text: "Ideias que usam as mesmas peças, sem recurso novo no Azure. Só entram no plano se o time quiser." }
    ]
  },
  dev: {
    aria: "Modelo de desenvolvimento no ServiceNow: seis etapas, da demanda à rotina, fase por fase",
    who: ["RH", "TI", "Sistemas"],
    measures: [
      ["Tempo de entrega", "Da demanda à oferta em produção."],
      ["Reuso", "Quantas ofertas novas partem de uma que já existe."],
      ["Ajustes na revisão", "O que o time muda em cada rascunho antes de promover."],
      ["Falhas pegas antes", "O que a regressão encontra antes da promoção."]
    ],
    stages: [
      { id: "demanda", name: "Demanda e arquitetura",
        today: "O pedido chega em texto livre, e achar algo parecido depende de quem lembra.",
        keeps: "Prioriza, decide reaproveitar ou criar e aprova os desvios de padrão.",
        caps: [{ p: 2, t: "Pela IDE, as ferramentas mostram o que já existe: ofertas, variáveis, eventos e automações", pieces: ["MCP"], seq: "q-reuso" },
          { p: 4, t: "A demanda aciona o agente, que parte da oferta mais parecida", pieces: ["Event Hub", "Agente"], seq: "q-rascunho" },
          { p: 5, t: "História com critérios de aceite, impacto da mudança e padrões do time", go: ["agentes", "dev"] }] },
      { id: "construcao", name: "Construção",
        today: "Item, formulário, flow e regra são montados à mão. Cada integração pede um trigger novo.",
        keeps: "Revisa o rascunho e constrói o que foge do padrão.",
        caps: [{ p: 1, t: "Oferta com automação: uma ação de Flow, sem script de integração", pieces: ["Hub"], seq: "q-pedido" },
          { p: 2, t: "Evento novo: uma linha no registro, sem trigger", pieces: ["Event Hub"], seq: "q-evento" },
          { p: 4, t: "Oferta, formulário, flow e regra chegam como rascunho", pieces: ["Agente", "MCP"], seq: "q-rascunho" },
          { p: 5, t: "Contrato de SLA, regras de tela e flows fora do padrão", go: ["agentes", "catalogo"] }] },
      { id: "revisao", name: "Revisão de código",
        today: "O revisor lê script e update set inteiros antes de promover.",
        keeps: "Aprova a promoção.",
        caps: [{ p: 5, t: "A primeira passada aponta desvios das boas práticas do time", pieces: ["Event Hub", "MCP", "Asimov"], seq: "q-revisao" }] },
      { id: "qa", name: "QA",
        today: "Conferir cada oferta depois de uma mudança toma tempo, e nem tudo tem teste automatizado.",
        keeps: "Aceita o risco e decide se a mudança segue.",
        caps: [{ p: 4, t: "Regressão das ofertas em sub-produção, com a evidência da falha", pieces: ["Agente", "MCP", "Hub"], seq: "q-regressao" },
          { p: 5, t: "Rascunho de testes automatizados de ofertas e flows", go: ["agentes", "dev"] }] },
      { id: "devops", name: "DevOps",
        today: "Empacotar a mudança, abrir a change request e escrever as notas de release.",
        keeps: "Promove pelo processo de mudança, como hoje.",
        caps: [{ p: 3, t: "Todo rascunho nasce com change request, só em sub-produção", pieces: ["MCP"] },
          { p: 5, t: "Notas de release, documentação e triagem de upgrade", go: ["agentes", "dev"] }] },
      { id: "rotina", name: "Daily e rotina",
        today: "O status do time é montado a partir do que cada um lembra.",
        keeps: "A conversa e as decisões da daily.",
        caps: [{ p: 5, t: "Resumo do que mudou desde ontem, com os bloqueios primeiro", pieces: ["Hub", "MCP", "Asimov"], seq: "q-daily" }] }
    ],
    steps: [
      { b: "Hoje", name: "Ponto de partida", when: "a base sai na Fase 0",
        title: "Hoje: da demanda à promoção, tudo montado à mão",
        text: "Cada oferta, formulário, flow e integração é configurado item a item, e revisado e testado à mão." },
      { b: "Fase 1", name: "Automation Hub", when: "dez 2026–fev 2027",
        title: "Fase 1: automação vira configuração do flow",
        text: "Uma ação de Flow serve a todas as ofertas. Ligar uma oferta a uma automação deixa de ser integração." },
      { b: "Fase 2", name: "MCP e Event Hub", when: "mar–mai 2027",
        title: "Fase 2: reuso à vista e evento sem trigger",
        text: "Pela IDE, o time vê o que já existe antes de construir. Evento novo é uma linha no registro." },
      { b: "Fase 3", name: "Agentes de entrega", when: "jun–ago 2027",
        title: "Fase 3: configuração só com change request",
        text: "As ferramentas de configuração entram: só em sub-produção, sempre ligadas a uma change request." },
      { b: "Fase 4", name: "Conectar e escalar", when: "set 2027 em diante",
        title: "Fase 4: o rascunho chega pronto para revisar",
        text: "O agente Now Dev monta oferta, formulário, flow e regra. O agente de QA roda a regressão antes da promoção." },
      { b: "Além", name: "Propostas", when: "fora do plano",
        title: "Além do plano: revisão, testes, release e daily",
        text: "Propostas que usam as mesmas peças. Algumas pedem uma ferramenta nova, com subflow do time." }
    ]
  },

  /* ---------- exemplos: o que o time recebe. Cada um é um quadro de cartões e os passos que acendem esses cartões. ----------
     Cartão: k (tipo), t (título), st [cor, texto], wide, by (rodapé) e o corpo: rows (pares), fields (formulário), steps (flow), items (lista),
     form (prévia do formulário), doc (artigo), code, bar, q. seq: o desenho em raias do exemplo; tech: o que muda nele, quando é proposta. */
  exGroups: [
    { name: "Catálogo e serviço", ids: ["e-oferta", "e-form", "e-flow", "e-sla", "e-kb"] },
    { name: "Desenvolvimento", ids: ["e-reuso", "e-evento", "e-revisao", "e-regressao", "e-daily"] },
    { name: "Operação", ids: ["e-triagem", "e-prazo"] }
  ],
  examples: [
    { id: "e-oferta", short: "Oferta", tag: "Fase 4 · agente Now Dev", seq: "q-rascunho",
      title: "Uma oferta nova chega pronta para revisar",
      today: "Item, formulário, flow e regra de atribuição são configurados à mão, a partir do ticket.",
      cards: [
        { id: "dem", k: "Demanda", t: "DMND0001234 · Nova oferta: acesso a grupo do Entra ID", st: ["wait", "Nova"],
          rows: [["Pedido por", "Operações de TI"], ["Quer", "Pedido aprovado inclui a pessoa no grupo, sem tarefa manual"]] },
        { id: "reuse", k: "O que já existe", t: "O agente parte do que o time já tem",
          items: [
            { t: "Acesso a lista de distribuição", s: "oferta parecida: mesmo formulário", st: ["", "oferta"] },
            { t: "entra-group-add-member", s: "automação do catálogo", st: ["ok", "automação"] },
            { t: "Identidade N2", s: "grupo que já atende a categoria", st: ["", "grupo"] }
          ] },
        { id: "chg", k: "Change request", t: "CHG0031245 · Oferta nova em sub-produção", st: ["wait", "Aguardando revisão"],
          rows: [["Contém", "1 item, 4 variáveis, 1 flow, 1 regra"], ["Revisa", "Desenvolvedor ServiceNow"], ["Promoção", "Processo normal de mudança"]] },
        { id: "item", wide: true, k: "Item de catálogo · rascunho", t: "Acesso a grupo do Entra ID", st: ["wait", "Sub-produção"],
          fields: [
            { l: "Categoria", ty: "A da oferta parecida", to: "Acessos" },
            { l: "Formulário", ty: "4 variáveis, 3 obrigatórias", to: "parâmetros da automação" },
            { l: "Flow", ty: "Aprovação do gestor e a ação de automação", to: "DW Hub · Run Automation" },
            { l: "Automação", ty: "Do catálogo do Hub", to: "entra-group-add-member" }
          ] },
        { id: "rule", k: "Regra de atribuição", t: "Para o que a automação não resolver",
          rows: [["Tabela", "Tarefa de catálogo"], ["Quando", "Item = Acesso a grupo do Entra ID"], ["Grupo", "Identidade N2"]] }
      ],
      steps: [
        { on: ["dem"], t: "O pedido de oferta chega como demanda", d: "O ticket vira o evento de demanda criada, que aciona o agente Now Dev." },
        { on: ["reuse", "dem"], t: "O agente procura o que já existe", d: "A oferta mais parecida, a automação do catálogo e o grupo que já atende a categoria." },
        { on: ["item"], t: "Monta o item, com formulário e flow", d: "As variáveis saem do contrato da automação. O flow já nasce chamando a ação DW Hub · Run Automation." },
        { on: ["rule"], t: "Cria a regra de atribuição", d: "Se a automação falhar, a tarefa já cai no grupo certo." },
        { on: ["chg"], t: "Tudo nasce em sub-produção, com change request", d: "As ferramentas de configuração recusam produção e exigem uma change aberta." },
        { on: ["chg", "item", "rule"], t: "O time revisa e promove", d: "Ajustes voltam ao agente como comentário. A promoção segue o processo normal de mudança." }
      ] },

    { id: "e-form", short: "Formulário", tag: "Fase 4 · agente Now Dev", seq: "q-rascunho",
      title: "O formulário da oferta, campo por campo",
      today: "Variáveis, tipos, opções e obrigatoriedade são criados um a um, e cada oferta sai de um jeito.",
      cards: [
        { id: "ask", k: "Demanda", t: "DMND0001260 · Nova oferta de RH: declaração de vínculo", st: ["wait", "Nova"],
          rows: [["Pedido por", "RH"], ["Quer", "Pedir a declaração pelo portal e pelo chat"], ["Atende", "Administração de pessoal"]] },
        { id: "view", k: "Como o funcionário vê", t: "No portal",
          form: [
            { l: "Para quem", req: 1, ty: "ref", v: "Ana Souza" },
            { l: "Finalidade", req: 1, ty: "choice", v: "Banco" },
            { l: "Idioma", req: 1, ty: "choice", v: "Português" },
            { l: "Incluir cargo e data de admissão", ty: "check", v: 1 },
            { l: "Precisa até", ty: "date", v: "dd/mm/aaaa", ph: 1 }
          ] },
        { id: "chat", k: "No Stellar", t: "O mesmo formulário, em conversa",
          q: "Para qual finalidade é a declaração? Banco, aluguel, visto ou outra.",
          by: "O chat lê as variáveis da oferta pelas ferramentas" },
        { id: "form", wide: true, k: "Formulário · rascunho", t: "Declaração de vínculo", st: ["wait", "Sub-produção"],
          fields: [
            { l: "Para quem", req: 1, ty: "Referência · usuário; começa com quem pede" },
            { l: "Finalidade", req: 1, ty: "Opções", opts: ["Banco", "Aluguel", "Visto", "Outra"] },
            { l: "Idioma", req: 1, ty: "Opções", opts: ["Português", "Inglês", "Espanhol"] },
            { l: "Incluir cargo e data de admissão", ty: "Caixa de seleção" },
            { l: "Precisa até", ty: "Data" },
            { l: "Observações", ty: "Texto" }
          ], by: "Nomes e tipos no padrão do time" },
        { id: "rules", k: "Regras de tela", t: "O campo certo, na hora certa", st: ["", "Proposta"],
          items: [
            { t: "Finalidade = Outra", s: "Observações passa a ser obrigatória" },
            { t: "Conjunto de variáveis", s: "Para quem vem do conjunto que o time já usa" }
          ], by: "Pede uma ferramenta nova, com subflow do time" }
      ],
      steps: [
        { on: ["ask"], t: "O RH pede uma oferta nova", d: "A demanda diz o que a pessoa precisa informar e quem atende." },
        { on: ["form"], t: "O agente monta o formulário inteiro", d: "Variáveis, tipos, opções e obrigatoriedade, com os nomes no padrão do time." },
        { on: ["view"], t: "O time confere como o funcionário vai ver", d: "O rascunho abre em sub-produção, como qualquer oferta." },
        { on: ["rules"], t: "Regras de tela ficam como proposta", d: "Tornar um campo obrigatório conforme outro e reaproveitar conjuntos de variáveis pedem uma ferramenta nova." },
        { on: ["chat", "form"], t: "O mesmo formulário serve ao Stellar", d: "O chat lê as variáveis da oferta e pergunta só o que falta. Nada é construído à parte." }
      ] },

    { id: "e-flow", short: "Flow", tag: "Fase 1 · ação de Flow", seq: "q-pedido",
      title: "Um flow no Flow Designer, sem script de integração",
      today: "Muitas ofertas terminam em tarefa manual, e cada integração pede script no flow.",
      cards: [
        { id: "old", k: "Flow · hoje", t: "Termina em tarefa manual",
          steps: [
            { k: "Gatilho", t: "Item pedido no catálogo" },
            { k: "Aprovação", t: "Gestor de quem recebe o acesso" },
            { k: "Tarefa manual", t: "Alguém do grupo inclui a pessoa" },
            { k: "Fim", t: "A pessoa fecha a tarefa e o item" }
          ] },
        { id: "new", k: "Flow · com a ação", t: "Acesso a grupo do Entra ID",
          steps: [
            { k: "Gatilho", t: "Item pedido no catálogo" },
            { k: "Variáveis", t: "Lê as variáveis do item" },
            { k: "Aprovação", t: "Gestor de quem recebe o acesso" },
            { k: "Ação", t: "DW Hub · Run Automation", hl: 1 },
            { k: "Fim", t: "O flow termina aqui. O desfecho chega depois, pelo callback" }
          ] },
        { id: "who", k: "Quem monta", t: "Do Flow Designer ao rascunho",
          items: [
            { t: "Fase 1", s: "O time troca a tarefa manual pela ação" },
            { t: "Fase 4", s: "O flow padrão já nasce com o rascunho da oferta" },
            { t: "Proposta", s: "Flows fora do padrão, a partir dos modelos do time" }
          ] },
        { id: "act", wide: true, k: "Ação de Flow · entradas", t: "DW Hub · Run Automation",
          fields: [
            { l: "Automação", req: 1, ty: "Texto · a chave no catálogo", to: "entra-group-add-member" },
            { l: "Parâmetros", req: 1, ty: "JSON · das variáveis Para quem e Grupo", to: "userPrincipalName, groupId" },
            { l: "Ticket", req: 1, ty: "Referência · o item pedido", to: "chave de idempotência" }
          ], by: "A mesma ação serve a todas as ofertas" },
        { id: "back", k: "Subflow de callback", t: "O que volta do Hub",
          items: [
            { t: "Concluída", s: "nota de trabalho e item fechado", st: ["ok", "fecha"] },
            { t: "Falhou", s: "nota com o motivo e tarefa para o grupo", st: ["ko", "tarefa"] },
            { t: "Repetida", s: "a segunda chamada não muda nada" }
          ] }
      ],
      steps: [
        { on: ["old"], t: "Hoje o flow termina em uma tarefa", d: "Depois da aprovação, alguém do grupo solucionador inclui a pessoa à mão." },
        { on: ["new"], t: "A tarefa dá lugar a uma ação", d: "DW Hub · Run Automation entra no lugar da tarefa manual. O resto do flow fica igual." },
        { on: ["act"], t: "Três campos para preencher", d: "Qual automação, de onde vem cada parâmetro e o ticket. Nenhum script de integração." },
        { on: ["back", "new"], t: "O flow não fica esperando", d: "O Hub devolve o desfecho por callback. O número do ticket impede execução em duplicidade." },
        { on: ["who"], t: "Na Fase 4, o flow padrão já vem no rascunho", d: "O time revisa. Flows fora do padrão continuam com o time, com apoio como proposta." }
      ] },

    { id: "e-sla", short: "Contrato de SLA", tag: "Proposta · ferramenta nova", seq: "q-rascunho",
      title: "O contrato de SLA sai como rascunho, pronto para negociar",
      today: "A definição é montada à mão: condições de início, de pausa e de parada, calendário e duração.",
      note: "Pede uma ferramenta nova de configuração, com subflow do time. O aviso de prazo, na Fase 4, já está no plano.",
      tech: "O mesmo caminho da oferta. A definição de SLA pede uma ferramenta nova, com subflow do time.",
      cards: [
        { id: "ask", k: "Demanda", t: "DMND0001288 · Prazo para a declaração de vínculo", st: ["wait", "Nova"],
          rows: [["Pedido por", "RH"], ["Combinado", "Entregar em até 2 dias úteis"], ["Não conta", "O tempo esperando o solicitante"]] },
        { id: "ola", k: "OLA do grupo · rascunho", t: "Administração de pessoal",
          rows: [["Tabela", "Tarefa de catálogo"], ["Duração", "1 dia útil"], ["Começa", "Tarefa atribuída ao grupo"]] },
        { id: "warn", k: "Aviso", t: "Antes de estourar",
          rows: [["Evento", "Prazo em 75%"], ["Recebe", "O grupo, com o diagnóstico no ticket"]], bar: { at: 75, label: "aviso em 75%" },
          by: "Fase 4, já no plano" },
        { id: "sla", wide: true, k: "Definição de SLA · rascunho", t: "Declaração de vínculo · entrega", st: ["wait", "Sub-produção"],
          fields: [
            { l: "Tipo", req: 1, ty: "SLA, OLA ou contrato de apoio", to: "SLA" },
            { l: "Tabela", req: 1, ty: "Onde o prazo corre", to: "Item pedido" },
            { l: "Duração", req: 1, ty: "Com o calendário", to: "2 dias úteis, das 8h às 18h" },
            { l: "Começa", req: 1, ty: "Condição de início", to: "Item aprovado" },
            { l: "Pausa", ty: "Condição de pausa", to: "Aguardando o solicitante" },
            { l: "Termina", req: 1, ty: "Condição de parada", to: "Item fechado" }
          ] },
        { id: "chg", k: "Change request", t: "CHG0031311 · SLA da declaração de vínculo", st: ["wait", "Aguardando revisão"],
          rows: [["Contém", "1 SLA e 1 OLA"], ["Aprova", "O dono do serviço e o time"]] }
      ],
      steps: [
        { on: ["ask"], t: "O combinado chega em texto", d: "O prazo, o que conta e o que não conta, na linguagem de quem pede." },
        { on: ["sla", "ask"], t: "O rascunho traduz para a definição", d: "Tipo, tabela, duração com calendário e as condições de início, de pausa e de parada, a partir de um SLA parecido." },
        { on: ["ola"], t: "O OLA do grupo acompanha", d: "O prazo do grupo solucionador cabe dentro do prazo combinado com quem pede." },
        { on: ["warn"], t: "O aviso usa o que já está no plano", d: "Na Fase 4, o prazo em 75% vira evento, e o diagnóstico chega no ticket." },
        { on: ["chg"], t: "O time negocia e aprova", d: "O prazo é decisão de negócio. O rascunho só poupa a montagem." }
      ] },

    { id: "e-kb", short: "Conhecimento", tag: "Fase 4 · rascunho de artigo", seq: "q-kb",
      title: "Um artigo que nasce dos tickets resolvidos",
      today: "Artigos são escritos à mão, quando sobra tempo, e a mesma dúvida é respondida várias vezes.",
      cards: [
        { id: "src", k: "Tickets resolvidos do tema", t: "Impressão: o que mais se repete",
          items: [
            { t: "Fila de impressão travada", s: "vários incidentes, a mesma solução", nw: 1 },
            { t: "Impressora offline depois de mudar de andar", s: "resolvido reinstalando a impressora" },
            { t: "Crachá não libera a impressão", s: "resolvido com recadastro" }
          ] },
        { id: "has", k: "O que a base já tem", t: "Para não duplicar",
          items: [
            { t: "Impressora offline: primeiros passos", st: ["ok", "publicado"] },
            { t: "Fila de impressão travada", st: ["ko", "falta"], nw: 1 }
          ] },
        { id: "flow", k: "Publicação", t: "Pelo fluxo da base, como hoje",
          steps: [
            { k: "Rascunho", t: "Gerado dos tickets resolvidos", hl: 1 },
            { k: "Revisão", t: "O dono da base confere e ajusta" },
            { k: "Publicado", t: "Com data para revisar de novo" }
          ] },
        { id: "art", wide: true, k: "Artigo · rascunho", t: "Fila de impressão travada: como destravar", st: ["wait", "Rascunho"],
          doc: [
            ["Sintoma", "O documento fica na fila e não imprime."],
            ["Causa", "O serviço de impressão do computador parou de responder."],
            ["Solução", "Reiniciar o serviço de impressão e reenviar o documento."]
          ], by: "Cada trecho aponta para o ticket de origem. Sem nome de pessoa nem dado do caso" },
        { id: "use", k: "Quem usa", t: "Um artigo, três lugares",
          items: [
            { t: "Portal", s: "a busca de quem pede" },
            { t: "Stellar", s: "a resposta no chat, pelas ferramentas" },
            { t: "Triagem", s: "o artigo certo, junto do ticket" }
          ] }
      ],
      steps: [
        { on: ["src"], t: "O rascunho parte dos tickets resolvidos", d: "Pelas ferramentas de leitura. O que se repete com a mesma solução é candidato a artigo." },
        { on: ["has"], t: "Confere o que a base já tem", d: "Se o artigo existe, a sugestão é atualizar. Aqui falta um." },
        { on: ["art"], t: "Redige no modelo de artigo do time", d: "Sintoma, causa e solução. O texto descreve o procedimento, não o caso de ninguém." },
        { on: ["flow"], t: "Uma pessoa revisa e publica", d: "Pelo fluxo de publicação da base. Gravar o rascunho direto na base pede um subflow novo do time." },
        { on: ["use"], t: "O artigo passa a servir o portal e o Stellar", d: "Com TI entrando no Stellar, uma base de TI em dia vale também para o chat." }
      ] },

    { id: "e-reuso", short: "Reuso", tag: "Fase 2 · ferramentas de leitura", seq: "q-reuso",
      title: "Antes de construir, o que já existe",
      today: "Achar uma oferta, um formulário ou uma automação parecida depende de quem lembra.",
      cards: [
        { id: "ask", k: "Pergunta pela IDE", t: "Preciso de uma oferta de acesso ao sistema de viagens",
          q: "Já existe algo parecido? O que dá para reaproveitar?" },
        { id: "offers", k: "Ofertas parecidas", t: "Do catálogo do ServiceNow",
          items: [
            { t: "Acesso a grupo do Entra ID", s: "para quem, grupo e motivo", st: ["ok", "serve"] },
            { t: "Acesso a lista de distribuição", s: "flow com aprovação do gestor" }
          ] },
        { id: "autos", k: "Automações", t: "Do catálogo do Hub",
          items: [
            { t: "entra-group-add-member", s: "userPrincipalName, groupId", st: ["ok", "serve"] },
            { t: "entra-restricted-group-add-member", s: "com aprovação do dono do grupo" }
          ] },
        { id: "out", wide: true, k: "Resposta", t: "O que reaproveitar",
          rows: [["Formulário", "O de Acesso a grupo do Entra ID, com o grupo já escolhido"], ["Automação", "entra-group-add-member: o sistema libera o acesso por grupo"], ["Novo", "Só o item e a categoria"]],
          by: "Quem decide reaproveitar ou criar é o desenvolvedor" },
        { id: "events", k: "Eventos publicados", t: "Do registro de eventos",
          items: [
            { t: "Item pedido", s: "now.request-item.created" },
            { t: "Item aprovado", s: "now.request-item.approved" }
          ] }
      ],
      steps: [
        { on: ["ask"], t: "O desenvolvedor pergunta pela IDE", d: "Em texto, antes de abrir o Flow Designer." },
        { on: ["offers"], t: "As ferramentas listam as ofertas parecidas", d: "Com as variáveis de cada uma, lidas com as permissões de quem pergunta." },
        { on: ["autos"], t: "E as automações que já resolvem", d: "O catálogo do Hub aparece pela mesma porta, com os parâmetros de cada automação." },
        { on: ["events"], t: "E os eventos que a instância já publica", d: "Se o evento existe, não há trigger para criar." },
        { on: ["out"], t: "A resposta diz o que reaproveitar", d: "Construir do zero vira exceção. A decisão continua com o time." }
      ] },

    { id: "e-evento", short: "Evento sem trigger", tag: "Fase 2 · Now Event Hub", seq: "q-evento",
      title: "Um time quer reagir a um registro: uma linha, sem trigger novo",
      today: "Cada integração pede uma business rule nova e uma chamada REST nova.",
      cards: [
        { id: "reg", wide: true, k: "Registro de eventos · linha nova", t: "now.request-item.approved", st: ["wait", "Sub-produção"],
          fields: [
            { l: "Tabela", req: 1, ty: "Nome da tabela", to: "Item pedido" },
            { l: "Operação", req: 1, ty: "Opções", opts: ["insert", "update", "both"], to: "update" },
            { l: "Campo que mudou", ty: "Só publica quando este campo muda", to: "approval" },
            { l: "Condição", ty: "Filtro do registro", to: "approval = approved" },
            { l: "Dados", req: 1, ty: "Só identificadores", to: "número e sys_id do item" }
          ], by: "A regra publicadora já existe e serve a todos os eventos" },
        { id: "evt", k: "Evento publicado", t: "Uma vez, só com identificadores",
          code: "{\n  \"type\": \"now.request-item.approved.v1\",\n  \"source\": \"/servicenow\",\n  \"subject\": \"RITM0012345\",\n  \"data\": {\n    \"requestItemNumber\": \"RITM0012345\",\n    \"catalogItemId\": \"…\",\n    \"requestedForId\": \"…\"\n  }\n}" },
        { id: "sub", wide: true, k: "Gatilho no Hub · assinatura", t: "O evento vira execução", st: ["ok", "Ligado"],
          fields: [
            { l: "Evento", req: 1, ty: "Tipo assinado", to: "now.request-item.approved" },
            { l: "Filtro", ty: "Só a oferta certa", to: "catalogItemId" },
            { l: "Detalhe", ty: "Busca as variáveis pelo MCP", to: "get_ticket" },
            { l: "Parâmetros", req: 1, ty: "Das variáveis do item", to: "userPrincipalName, groupId" },
            { l: "Automação", req: 1, ty: "Do catálogo", to: "entra-group-add-member" }
          ], by: "Configuração do dono da automação. Nada muda no ServiceNow" },
        { id: "who", k: "Quem assina", t: "O mesmo evento, vários leitores",
          items: [
            { t: "Automation Hub", s: "dispara a automação" },
            { t: "Agentes", s: "acionam o agente certo" },
            { t: "Stellar e outros", s: "cada um no seu ritmo" }
          ] }
      ],
      steps: [
        { on: ["reg"], t: "Uma linha no registro de eventos", d: "Tabela, operação, condição e quais identificadores saem. A regra publicadora é uma só." },
        { on: ["evt"], t: "O evento sai uma vez", d: "Só com identificadores. Quem precisa do detalhe busca pelas ferramentas, com a própria permissão." },
        { on: ["sub"], t: "Quem quer reagir cria um gatilho", d: "A assinatura liga o evento a uma automação e diz de onde vem cada parâmetro." },
        { on: ["who"], t: "Mais um assinante, nenhuma mudança", d: "Hub, agentes e Stellar leem o mesmo evento. Reenvio não duplica." }
      ] },

    { id: "e-revisao", short: "Revisão de código", tag: "Proposta · chamada de modelo", seq: "q-revisao",
      title: "A primeira passada da revisão chega antes do revisor",
      today: "O revisor lê script e update set inteiros antes de promover.",
      note: "Pede um tipo de evento novo e uma ferramenta nova de leitura de update set, com subflow do time. Regra fixa continua com a checagem da própria instância.",
      cards: [
        { id: "us", k: "Update set", t: "Ajuste de atribuição em itens pedidos", st: ["wait", "Concluído"],
          rows: [["Contém", "1 regra de negócio, 1 flow, 2 variáveis"], ["Change", "CHG0031302"]] },
        { id: "find", k: "Apontamentos", t: "Cada um com a regra do time",
          items: [
            { t: "sys_id fixo no código", s: "use uma propriedade do sistema", st: ["ko", "corrigir"] },
            { t: "current.update() em regra before", s: "a regra já grava; o update roda as regras de novo", st: ["ko", "corrigir"] },
            { t: "Regra sem condição", s: "roda em todo item pedido", st: ["wait", "avaliar"] }
          ] },
        { id: "std", k: "Fonte", t: "As boas práticas do time",
          items: [{ t: "Padrões de script" }, { t: "Guia de nomes e de escopo" }], by: "O time mantém; sem fonte, o apontamento não sai" },
        { id: "code", wide: true, k: "Regra de negócio · before", t: "O trecho que chama atenção",
          code: "(function executeRule(current, previous) {\n  var gr = new GlideRecord('sys_user_group');\n  gr.get('3f2a9c1e0b7d4e6f8a1b2c3d4e5f6a7b');\n  current.assignment_group = gr.sys_id;\n  current.update();\n})(current, previous);" },
        { id: "chg", k: "Change request", t: "CHG0031302 · comentário",
          q: "Dois pontos a corrigir e um a avaliar antes da promoção.", by: "Aprovar continua com o revisor" }
      ],
      steps: [
        { on: ["us"], t: "Um update set é concluído", d: "O desenvolvedor marca como concluído, como hoje." },
        { on: ["code"], t: "A revisão lê o que mudou", d: "Uma chamada de modelo, não um agente: ler e apontar é um passo só." },
        { on: ["find", "std"], t: "Cada apontamento cita a regra do time", d: "As boas práticas do time entram como fonte. Sem fonte, o apontamento não sai." },
        { on: ["chg"], t: "O comentário chega antes da revisão humana", d: "O revisor começa pelo que importa. Aprovar a promoção continua com ele." }
      ] },

    { id: "e-regressao", short: "Regressão", tag: "Fase 4 · agente de QA", seq: "q-regressao",
      title: "Antes de uma mudança, as ofertas são testadas sozinhas",
      today: "Conferir cada oferta depois de um upgrade ou de uma mudança de flow toma tempo.",
      cards: [
        { id: "plan", k: "Plano de teste", t: "Ofertas automatizadas, em sub-produção",
          rows: [["Quando", "Antes de promover uma mudança"], ["Como", "Pede cada oferta com um usuário de teste"], ["Confere", "Desfecho da execução e estado do item"]] },
        { id: "res", k: "Resultado", t: "Quatro ofertas pedidas",
          items: [
            { t: "Acesso a grupo do Entra ID", st: ["ok", "passou"] },
            { t: "Sincronizar dispositivo no Intune", st: ["ok", "passou"] },
            { t: "Acesso a grupo restrito", st: ["ko", "falhou"], nw: 1 },
            { t: "Exportar membros de grupos", st: ["ok", "passou"] }
          ] },
        { id: "ev", k: "Evidência da falha", t: "RITM0012391 · Acesso a grupo restrito",
          rows: [["Onde parou", "A aprovação do dono do grupo não foi criada"], ["O que mudou", "O flow da oferta, no último update set"], ["Execução", "Não chegou a ser chamada"]] },
        { id: "chg", wide: true, k: "Change request", t: "CHG0031302 · Ajuste de flows", st: ["wait", "Aguardando decisão"],
          rows: [["Regressão", "1 de 4 ofertas falhou"], ["Decide", "Desenvolvedor ServiceNow"]] }
      ],
      steps: [
        { on: ["plan"], t: "O agente pede cada oferta em sub-produção", d: "Com usuários de teste, pelas mesmas ferramentas que o chat usa." },
        { on: ["res"], t: "Confere o desfecho de cada uma", d: "Execução concluída e item fechado: passou." },
        { on: ["ev"], t: "A falha chega com a evidência", d: "O que parou, onde e o que mudou desde o último teste." },
        { on: ["chg"], t: "O time decide se a mudança segue", d: "O agente aponta. Promover ou corrigir é decisão do time." }
      ] },

    { id: "e-daily", short: "Daily", tag: "Proposta · chamada de modelo", seq: "q-daily",
      title: "A daily começa com o resumo pronto",
      today: "O status do time é montado a partir do que cada um lembra.",
      note: "Depende de onde o time registra o trabalho. O exemplo usa demandas, change requests e incidentes do ServiceNow.",
      cards: [
        { id: "src", k: "Fontes", t: "O que mudou desde ontem",
          items: [
            { t: "Demandas", s: "estado e responsável" },
            { t: "Change requests", s: "abertas, em revisão e promovidas" },
            { t: "Incidentes do time", s: "novos e resolvidos" }
          ], by: "Pelas ferramentas de leitura" },
        { id: "sum", wide: true, k: "Resumo da daily · rascunho", t: "Time do ServiceNow",
          doc: [
            ["Concluído", "Oferta de acesso a grupo promovida. A regressão passou."],
            ["Em andamento", "Declaração de vínculo em revisão. Ajuste de flows aguardando correção."],
            ["Bloqueio", "Uma change request parada há dois dias, esperando aprovação."]
          ], by: "Por item de trabalho, não por pessoa" },
        { id: "blk", k: "Bloqueio em destaque", t: "CHG0031302 · Ajuste de flows", st: ["ko", "Parada"],
          rows: [["Parada em", "Aguardando aprovação"], ["Desde", "Dois dias"], ["Sugestão", "Tratar na daily de hoje"]] },
        { id: "out", k: "Entrega", t: "Antes da daily, onde o time preferir",
          items: [{ t: "Comentário no ServiceNow", s: "pelas ferramentas, com auditoria" }, { t: "Outro canal", s: "a combinar com o time" }] },
        { id: "lim", k: "Limites", t: "O que o resumo não faz",
          items: [{ t: "Não avalia pessoas" }, { t: "Não muda o estado de nada" }, { t: "Não substitui a conversa" }] }
      ],
      steps: [
        { on: ["src"], t: "Toda manhã, a rotina lê o que mudou", d: "Uma agenda dispara. As fontes são as que o time já usa." },
        { on: ["sum"], t: "O resumo sai por item de trabalho", d: "Uma chamada de modelo redige a partir dos registros. Não é avaliação de ninguém." },
        { on: ["blk", "sum"], t: "Os bloqueios vêm primeiro", d: "A conversa começa pelo que está parado." },
        { on: ["out", "lim"], t: "O time recebe antes da daily", d: "Onde o resumo chega é escolha do time. Decidir continua com ele." }
      ] },

    { id: "e-triagem", short: "Triagem", tag: "Fase 4 · chamada de modelo", seq: "q-triagem",
      title: "O ticket chega com a sugestão de grupo",
      today: "A triagem é manual até o ticket chegar ao grupo certo.",
      cards: [
        { id: "inc", k: "Incidente", t: "INC0078901 · Não consigo imprimir no 3º andar", st: ["wait", "Novo"],
          rows: [["Aberto por", "Funcionário, pelo portal"], ["Categoria", "Em branco"], ["Grupo", "Em branco"]] },
        { id: "sug", k: "Sugestão do modelo", t: "Uma chamada, não um agente",
          rows: [["Categoria", "Impressão"], ["Grupo", "Workplace N2"], ["Confiança", "Alta"], ["Parecidos", "Outros incidentes do mesmo andar nesta semana"]] },
        { id: "thr", k: "Regra de uso", t: "A pessoa confirma; o incerto fica com o time",
          items: [
            { t: "Confiança alta", s: "nota com a sugestão; quem tria confirma" },
            { t: "Confiança baixa", s: "segue para a triagem humana" },
            { t: "Amostra semanal", s: "o time confere os acertos" }
          ] },
        { id: "kb", k: "Conhecimento", t: "O artigo certo, junto",
          items: [{ t: "Impressora offline: primeiros passos" }, { t: "Fila de impressão travada: como destravar" }], by: "Pelas ferramentas de conhecimento" },
        { id: "note", wide: true, k: "Nota de trabalho no ticket", t: "Quem tria recebe pronto",
          q: "Sugestão: categoria Impressão, grupo Workplace N2, confiança alta. Artigo relacionado: Fila de impressão travada: como destravar.",
          by: "Ferramenta verde, com auditoria" }
      ],
      steps: [
        { on: ["inc"], t: "Um incidente é aberto", d: "O ServiceNow publica o evento de incidente criado." },
        { on: ["sug"], t: "Uma chamada de modelo classifica", d: "Classificar é um passo só. Custa menos e tem menos onde errar que um agente." },
        { on: ["kb"], t: "O artigo certo vem junto", d: "A busca na base de conhecimento usa o mesmo texto do incidente." },
        { on: ["note", "inc"], t: "A sugestão e o artigo ficam no ticket", d: "Como nota de trabalho, por ferramenta verde, com auditoria." },
        { on: ["thr"], t: "Quem tria confirma a sugestão", d: "Aplicar categoria e grupo sem ninguém confirmar fica para depois de medir o acerto, e pede um subflow novo do time." }
      ] },

    { id: "e-prazo", short: "Prazo", tag: "Fase 4 · agente de Operação", seq: "q-prazo",
      title: "O aviso de prazo chega com o diagnóstico",
      today: "Quando o prazo aperta, alguém abre o ticket para descobrir onde parou.",
      cards: [
        { id: "sla", k: "Definição de SLA", t: "Acesso a grupo · atendimento",
          rows: [["Meta", "8 horas úteis"], ["Começa", "Item aprovado"], ["Pausa", "Aguardando o solicitante"], ["Termina", "Item fechado"]], bar: { at: 75, label: "aviso em 75%" },
          by: "A definição é a de hoje" },
        { id: "reg", k: "Registro de eventos · linha", t: "now.sla.breach-warning",
          rows: [["Tabela", "SLA da tarefa"], ["Operação", "Atualização"], ["Campo", "Percentual do prazo"], ["Condição", "75% ou mais, ainda sem estouro"], ["Dados", "Ticket, SLA, percentual e prazo final"]] },
        { id: "diag", k: "Agente de Operação · diagnóstico", t: "RITM0012345 parado na aprovação",
          rows: [["Onde parou", "Aguardando o aprovador"], ["Automação", "Ainda não foi chamada"], ["Sugestão", "Acionar o aprovador substituto"]] },
        { id: "note", wide: true, k: "Nota de trabalho no ticket", t: "O grupo recebe pronto",
          q: "Prazo em 75%. O item aguarda aprovação e a automação ainda não foi chamada. Sugestão: acionar o aprovador substituto.",
          by: "Ferramenta verde, com auditoria" }
      ],
      steps: [
        { on: ["sla"], t: "O SLA é o de hoje", d: "Meta, calendário e pausas não mudam." },
        { on: ["reg"], t: "O aviso de 75% vira evento", d: "Mais uma linha no registro de eventos. Nenhuma regra nova." },
        { on: ["diag"], t: "O agente de Operação junta o contexto", d: "Onde o item parou, o que a automação fez e o que mudou." },
        { on: ["note"], t: "A sugestão chega no próprio ticket", d: "Uma pessoa decide. O agente não reatribui nem fecha nada." }
      ] }
  ],

  /* ---------- agentes: os temas do catálogo de funções e quem o time vai encontrar ---------- */
  temas: [["", "Todas"], ["catalogo", "Catálogo"], ["dev", "Desenvolvimento"], ["operacao", "Operação"], ["conhecimento", "Conhecimento"], ["chat", "Stellar"]],
  /* [quem, o que é, entrega, limite] */
  named: [
    ["Now Dev", "Agente", "Oferta com formulário, flow, regra e evento, como rascunho", "Só em sub-produção, com change request. Não promove"],
    ["QA", "Agente", "Regressão das ofertas, com a evidência da falha", "Só em non-prod. Não decide a mudança"],
    ["Operação", "Pipeline híbrido", "Diagnóstico de falha e de prazo em risco, no ticket", "Lê execuções e tickets. Não reatribui nem fecha"],
    ["Classificação", "Chamada de modelo", "Categoria e grupo sugeridos, com a confiança", "Escreve uma nota. Não encaminha sem alguém confirmar"],
    ["Rascunho de artigo", "Busca em fontes", "Artigo no modelo do time, com o ticket de origem", "Lê tickets e a base. Não publica"]
  ],
  tools: "As propostas marcadas com ferramenta nova pedem um subflow do time para cada uma: definição de SLA, regra de tela, modelo de flow, artigo gravado como rascunho e leitura de update set. Sem o subflow, a proposta não existe.",

  /* ---------- Por dentro: o que entra na instância e como conversa com a plataforma ---------- */
  inside: {
    id: "inside", tag: "Na instância",
    title: "O que entra na instância",
    lead: "Uma ação de Flow, uma regra publicadora, uma entrada de escrita e um provedor de identidade. Nenhuma peça por integração, e tudo mantido pelo time do ServiceNow.",
    map: {
      geo: { px: 30, py: 44, rp: 104, maxW: 940 },
      nodes: [
        { id: "rec",   t: "Registros",         s: "itens, incidentes, demandas", c: 0, r: 0, k: "ext" },
        { id: "pub",   t: "Regra publicadora", s: "lê o registro de eventos",    c: 1, r: 0, k: "core" },
        { id: "apim",  t: "API Management",    s: "token, cota, rastreio",       c: 2, r: 0, h: 2, k: "az" },
        { id: "ing",   t: "Ingestão",          s: "valida e deduplica",          c: 3, r: 0, k: "core" },
        { id: "offer", t: "Oferta e flow",     s: "como hoje",                   c: 0, r: 1, k: "ext" },
        { id: "act",   t: "Ação de Flow",      s: "uma, para todas as ofertas",  c: 1, r: 1, k: "core" },
        { id: "hub",   t: "Automation Hub",    s: "catálogo e execução",         c: 3, r: 1, k: "core" },
        { id: "sub",   t: "Subflows do time",  s: "callback e escritas",         c: 0, r: 2, k: "core" },
        { id: "srest", t: "Scripted REST",     s: "entrada única de escrita",    c: 1, r: 2, k: "core" },
        { id: "acl",   t: "ACLs do usuário",   s: "como hoje",                   c: 0, r: 3, k: "ext" },
        { id: "oidc",  t: "Provedor OIDC",     s: "confia no Entra ID",          c: 1, r: 3, k: "core" },
        { id: "mcp",   t: "ServiceNow MCP",    s: "ferramentas governadas",      c: 3, r: 3, k: "core" }
      ],
      zones: [
        { c0: 0, c1: 1, r0: 0, r1: 3, label: "INSTÂNCIA DO SERVICENOW" },
        { c0: 3, c1: 3, r0: 0, r1: 3, label: "PLATAFORMA" }
      ],
      edges: [
        { id: "rec-pub",    a: "rec",   b: "pub" },
        { id: "pub-apim",   a: "pub",   b: "apim" },
        { id: "apim-ing",   a: "apim",  b: "ing" },
        { id: "offer-act",  a: "offer", b: "act" },
        { id: "act-apim",   a: "act",   b: "apim" },
        { id: "apim-hub",   a: "apim",  b: "hub" },
        { id: "hub-srest",  a: "hub",   b: "srest", bend: "vh" },
        { id: "mcp-srest",  a: "mcp",   b: "srest", bend: "vh" },
        { id: "srest-sub",  a: "srest", b: "sub" },
        { id: "mcp-oidc",   a: "mcp",   b: "oidc" },
        { id: "oidc-acl",   a: "oidc",  b: "acl" }
      ]
    },
    steps: [
      { path: ["offer", "act", "apim", "hub"], t: "Uma ação de Flow serve a todas as ofertas", d: "Chama o Hub pelo gateway, com o número do ticket como chave de idempotência." },
      { path: ["hub", "srest", "sub"], t: "O desfecho volta por uma entrada única", d: "A Scripted REST aciona o subflow de callback, mantido pelo time." },
      { path: ["rec", "pub", "apim", "ing"], t: "Uma regra publica todos os eventos", d: "Ela lê o registro de eventos. Evento novo é uma linha, não uma regra nova." },
      { path: ["mcp", "oidc", "acl"], t: "As ferramentas leem como o usuário", d: "O token do Entra ID vira um token do ServiceNow para a mesma pessoa. Valem as ACLs dela." },
      { path: ["mcp", "srest", "sub"], t: "Toda escrita passa pelos subflows do time", d: "O MCP não grava em tabela. Amarelo recusa produção; vermelho só abre pedido." }
    ]
  },
  insideLegend: [["act", "Passo atual"], ["new", "Já percorrido"], ["core", "Novo, com a plataforma"], ["ext", "Já existe na instância"], ["az", "Gateway de APIs"]],

  /* ---------- Garantias ---------- */
  lights: [
    ["verde", "Verde", "Leitura, tickets e pedidos, membros de grupo sem papel", "Autoatendimento, com as ACLs de quem pede e com auditoria."],
    ["amarelo", "Amarelo", "Ofertas, regras de atribuição, registro de eventos", "Só em sub-produção, com change request e revisão do time."],
    ["vermelho", "Vermelho", "ACL, papel e grupo que carrega papel", "Nunca direto: a ferramenta só abre o pedido de aprovação."]
  ],
  never: [
    ["Escrita direta em tabela", "Toda escrita passa por um subflow mantido pelo time."],
    ["Configuração direto em produção", "Os subflows amarelos recusam produção e exigem change aberta."],
    ["Acesso concedido por agente", "Os subflows vermelhos não têm passo de concessão."],
    ["Conta de serviço com acesso amplo", "As ferramentas agem com a identidade e as ACLs de quem pede."]
  ],
  /* [fase, o que o time constrói na instância, o que passa a funcionar] */
  asks: [
    ["Fase 1", "Ação de Flow, subflow de callback, Scripted REST e a chamada autenticada à plataforma", "Oferta com automação vira configuração do flow"],
    ["Fase 2", "Tabela do registro de eventos, regra publicadora e provedor OIDC", "Eventos sem trigger novo. Leitura pelas ferramentas, com as ACLs do usuário"],
    ["Fase 3", "Subflows de escrita, um por ferramenta, começando pelos verdes", "Escrita governada em tickets, pedidos e rascunhos de configuração"],
    ["Fase 4", "Revisão dos rascunhos e das sugestões dos agentes", "Oferta nova, triagem, diagnóstico de prazo, artigo de conhecimento e regressão"],
    ["Propostas", "Um subflow para cada ferramenta nova que o time aceitar", "Contrato de SLA, regras de tela, artigo gravado como rascunho, revisão de update set"]
  ],
  owner: "A instância continua do time. Os artefatos ficam em repositório, como código, para revisão. O pedido é um desenvolvedor do ServiceNow, em tempo parcial, das Fases 1 a 4."
};
