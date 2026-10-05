/* Conteúdo da página do time do ServiceNow: os fluxos de operação e de desenvolvimento (sobre o mapa de assets/data.js),
   os desenhos em raias de cada fluxo, os exemplos do que o time recebe e as garantias.
   Tudo o que não está no plano de fases aparece como proposta (phase: 5 nos fluxos, tag "Proposta" nos exemplos e nas raias).
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
    appr:    { t: "Dono do|grupo",      k: "person", g: "p", d: "Quem aprova o acesso. A regra de quem aprova continua no ServiceNow." },
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
  seqLegend: [["act", "Etapa atual"], ["seen", "Já percorrido"], ["core", "Serviço da plataforma"], ["az", "Serviço do Azure"], ["ext", "Já existe, ou é de outro time"], ["person", "Pessoa"]],

  /* Cada processo: quem participa (seq.parts, "id" ou "id:Título") e as etapas. hops: os trechos da etapa, [de, para, rótulo]; de igual a para é trabalho interno.
     ph: a fase. Cada fluxo das telas aponta para o processo que o mostra por dentro (tech, mais abaixo). */
  seqs: [
    { id: "q-pedido", short: "Pedido com automação", ph: "Fase 1", tag: "Fase 1 · Atendimento",
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

    { id: "q-aprova", short: "Acesso com aprovação", ph: "Fase 3", tag: "Fase 3 · Atendimento",
      title: "Um acesso sensível, só depois da aprovação",
      lead: "O risco está no manifesto da automação. Amarelo só executa depois que o dono do recurso aprova, no próprio ServiceNow.",
      seq: { parts: ["emp", "appr", "now", "apim", "ing", "hub", "worker", "sb", "eh", "target"] },
      steps: [
        { t: "Ana pede acesso a um grupo restrito", hops: [["emp", "now"]], d: "Pelo catálogo, como hoje. O flow da oferta chega à ação DW Hub · Run Automation." },
        { t: "A ação de Flow chama o Hub pelo gateway", hops: [["now", "apim"], ["apim", "hub"]], d: "A mesma ação de qualquer oferta. O risco não está no flow: está no manifesto da automação." },
        { t: "Risco amarelo: a execução nasce em espera", hops: [["hub", "hub"]], d: "Nada é enfileirado ainda. Automação de risco vermelho é recusada na hora." },
        { t: "O Hub abre o pedido de aprovação", hops: [["hub", "now", "pedido"]], d: "Pela entrada única de escrita, um subflow do time cria a aprovação para o dono do recurso." },
        { t: "O dono do grupo decide", hops: [["now", "appr"], ["appr", "now", "decisão"]], d: "No ServiceNow, como qualquer aprovação. Quem aprova é regra da instância, não da plataforma." },
        { t: "A decisão volta como evento", hops: [["now", "apim"], ["apim", "ing"], ["ing", "eh", "evento"]], d: "Aprovada ou rejeitada, sai uma vez, só com identificadores." },
        { t: "Aprovada, a execução entra na fila", hops: [["eh", "hub"], ["hub", "sb", "mensagem"]], d: "Rejeitada, a execução é encerrada, e o item volta com o motivo." },
        { t: "A automação inclui Ana no grupo", hops: [["sb", "worker"], ["worker", "target"]], d: "Worker e credencial do domínio, como em qualquer execução." },
        { t: "O callback fecha o item, e Ana é avisada", hops: [["hub", "now", "callback"], ["now", "emp"]], d: "Fica registrado quem aprovou e o que foi executado." }
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

    { id: "q-triagem", short: "Triagem", ph: "Fase 4", tag: "Fase 4 · Triagem",
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

    { id: "q-prazo", short: "Prazo em risco", ph: "Fase 4", tag: "Fase 4 · Prazos",
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

    { id: "q-kb", short: "Artigo de conhecimento", ph: "Fase 4", tag: "Fase 4 · Conhecimento",
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

    { id: "q-reuso", short: "O que já existe", ph: "Fase 2", tag: "Fase 2 · Demanda e arquitetura",
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

    { id: "q-rascunho", short: "Demanda vira rascunho", ph: "Fase 4", tag: "Fase 4 · Construção",
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

    { id: "q-evento", short: "Evento sem trigger", ph: "Fase 2", tag: "Fase 2 · Construção",
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

    { id: "q-regressao", short: "Regressão", ph: "Fase 4", tag: "Fase 4 · QA",
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

    { id: "q-revisao", short: "Revisão de código", ph: "Proposta", tag: "Proposta · Revisão de código",
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

    { id: "q-daily", short: "Resumo da daily", ph: "Proposta", tag: "Proposta · Daily e rotina",
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

  /* ---------- fluxos: o trabalho do time, passo a passo, sobre o mapa da plataforma (os nós e as ligações de assets/data.js) ----------
     O mesmo formato dos fluxos da plataforma: path anda pelas ligações; sub troca a segunda linha de um nó. phase: 1 a 4, ou 5 para proposta (com note). */
  flows: [
    { id: "f-aprova", short: "Acesso com aprovação", phase: 3, title: "Acesso sensível: só executa depois da aprovação",
      today: "Depois da aprovação, alguém do grupo solucionador concede o acesso à mão.",
      steps: [
        { path: ["user", "now"], t: "Ana pede acesso a um grupo restrito", d: "Pelo catálogo, como hoje." },
        { path: ["now", "hub"], t: "A oferta chama o Hub", d: "A mesma ação de Flow de qualquer oferta. O risco não está no flow: está no manifesto da automação." },
        { path: ["hub"], t: "Risco amarelo: a execução nasce em espera", d: "Nada é executado ainda. Automação de risco vermelho é recusada na hora." },
        { path: ["hub", "now"], t: "O Hub abre o pedido de aprovação", d: "Um subflow do time cria a aprovação para o dono do recurso. Quem aprova é regra do ServiceNow." },
        { path: ["now"], sub: { now: "o dono do grupo decide" }, t: "O dono do grupo aprova no ServiceNow", d: "Como qualquer aprovação de hoje. Se rejeitar, a execução é encerrada, e o item volta com o motivo." },
        { path: ["now", "eh", "hub"], t: "A decisão volta como evento", d: "Aprovação concluída é um evento como os outros. Ele libera a execução que estava em espera." },
        { path: ["hub", "target"], t: "A automação inclui Ana no grupo", d: "Fila, worker e credencial do domínio, como em qualquer execução." },
        { path: ["hub", "now", "user"], t: "O item fecha, e Ana é avisada", d: "O desfecho volta por callback. Fica registrado quem aprovou e o que foi executado." }
      ] },
    { id: "f-prazo", short: "Prazo em risco", phase: 4, title: "Um prazo em risco, com o diagnóstico pronto", sub: { ag: "Agente Operação" },
      today: "Quando o prazo aperta, alguém abre o ticket para descobrir onde parou.",
      steps: [
        { path: ["now"], t: "O prazo de um item passa de 75%", d: "O SLA é o de hoje: meta, calendário e pausas não mudam." },
        { path: ["now", "eh"], t: "O aviso vira evento", d: "Mais uma linha no registro de eventos. Nenhuma regra nova na instância." },
        { path: ["eh", "ag"], t: "O agente de Operação assume", d: "O evento abre uma execução, com limite de tempo e de custo." },
        { path: ["ag", "mcp", "nowapi"], t: "Lê onde o item parou", d: "Estado, aprovações e tarefas do item, pelas ferramentas de leitura." },
        { path: ["ag", "hub"], t: "Confere o que a automação fez", d: "A execução, as tentativas e o erro, direto do Hub." },
        { path: ["ag", "llm"], t: "Regra primeiro; modelo só na exceção", d: "Os casos conhecidos saem por regra, sem custo de modelo. O que sobra vai ao Asimov." },
        { path: ["ag", "mcp", "nowapi"], t: "O diagnóstico chega no ticket", d: "Nota de trabalho com o que parou e a sugestão. O agente não reatribui nem fecha nada." },
        { path: ["now"], sub: { now: "o grupo decide a ação" }, t: "O grupo solucionador decide", d: "Cobrar, reatribuir ou escalar continua com as pessoas." }
      ] },
    { id: "f-kb", short: "Conhecimento", phase: 4, title: "Um artigo que nasce dos tickets resolvidos", sub: { ag: "Rascunho de artigo", team: "dono da base" },
      today: "Artigos são escritos à mão, quando sobra tempo, e a mesma dúvida é respondida várias vezes.",
      steps: [
        { path: ["team", "ag"], t: "Quem cuida da base escolhe um tema", d: "Por exemplo, impressão. O pedido abre uma execução, com limite de tempo e de custo." },
        { path: ["ag", "mcp", "nowapi"], t: "Busca os tickets resolvidos e confere a base", d: "O que se repete com a mesma solução é candidato a artigo. Se o artigo já existe, a sugestão é atualizar, não duplicar." },
        { path: ["ag", "llm"], t: "O modelo redige o rascunho", d: "Sintoma, causa e solução, no modelo de artigo do time. Cada trecho aponta para o ticket de origem." },
        { path: ["ag", "team"], t: "O rascunho volta para quem pediu", d: "Gravar direto na base, como rascunho, pede um subflow novo do time: fica como proposta." },
        { path: ["nowapi"], sub: { nowapi: "base de conhecimento" }, t: "Uma pessoa revisa e publica", d: "Pelo fluxo de publicação da base, como hoje. Depois, o artigo serve o portal, o Stellar e a triagem." }
      ] },
    { id: "f-chat", short: "Pedido pelo Stellar", phase: 4, title: "Um pedido feito no Stellar",
      today: "Sem ferramentas comuns, cada caso de uso novo no chat pede a própria integração.",
      steps: [
        { path: ["client", "mcp"], t: "Ana pede no Stellar", d: "Em linguagem natural, sem procurar a oferta no portal. O chat chama uma ferramenta, com o token de quem conversa." },
        { path: ["mcp", "nowapi"], t: "Acha a oferta e pede em nome de Ana", d: "Catálogo e variáveis lidos com as permissões de Ana. A escrita passa por um subflow do time." },
        { path: ["now", "hub"], t: "O flow da oferta chama a automação", d: "Como em um pedido do portal: aprovação, ação de Flow e automação. Nada é construído só para o chat." },
        { path: ["hub", "target"], t: "A automação executa", d: "A mesma fila, o mesmo worker, o mesmo sistema alvo." },
        { path: ["hub", "now"], t: "O callback fecha o item", d: "O desfecho fica no ticket, como em qualquer pedido." },
        { path: ["now", "eh"], sub: { client: "assina o evento e avisa" }, t: "O desfecho volta para a conversa", d: "O item muda de estado, o evento sai uma vez, e o Stellar, que assina, avisa Ana." }
      ] },

    { id: "f-flow", short: "Flow sem script", phase: 1, title: "Um flow no Flow Designer, sem script de integração",
      today: "Muitas ofertas terminam em tarefa manual, e cada integração pede script no flow.",
      steps: [
        { path: ["now"], sub: { now: "Flow Designer" }, t: "A tarefa manual dá lugar a uma ação", d: "No flow da oferta, DW Hub · Run Automation entra no lugar da tarefa. O resto do flow fica igual." },
        { path: ["now", "hub"], t: "Três campos, nenhum script", d: "Qual automação, de onde vem cada parâmetro e o ticket, que impede execução em duplicidade." },
        { path: ["hub", "target"], t: "A automação faz o que a tarefa fazia", d: "Fila, repetição, log e monitoramento vêm da plataforma." },
        { path: ["hub", "now"], t: "O subflow de callback fecha o item", d: "O flow não fica esperando. Concluída: nota e item fechado. Falhou: nota com o motivo e tarefa para o grupo." },
        { path: ["now"], t: "Oferta com automação vira configuração", d: "A mesma ação serve a todas as ofertas. Na Fase 4, o flow padrão já nasce com o rascunho da oferta." }
      ] },
    { id: "f-reuso", short: "O que já existe", phase: 2, title: "O que já existe, antes de construir",
      today: "Achar uma oferta, um formulário ou uma automação parecida depende de quem lembra.",
      steps: [
        { path: ["ide", "mcp"], t: "O desenvolvedor pergunta pela IDE", d: "Já existe oferta parecida? Quais variáveis ela usa? Há automação para isso?" },
        { path: ["mcp", "nowapi"], t: "Ofertas e formulários, do catálogo", d: "As ofertas parecidas e as variáveis de cada uma, lidas com as permissões de quem pergunta." },
        { path: ["mcp", "hub"], t: "Automações, do catálogo do Hub", d: "Pela mesma porta, com os parâmetros que cada automação pede." },
        { path: ["mcp", "ide"], t: "A resposta diz o que reaproveitar", d: "A oferta mais parecida, as variáveis que servem e a automação que já resolve. A decisão é do desenvolvedor, e a chamada fica auditada." }
      ] },
    { id: "f-evento", short: "Evento sem trigger", phase: 2, title: "Um time quer reagir a um registro, sem trigger novo",
      today: "Cada integração pede uma business rule nova e uma chamada REST nova.",
      steps: [
        { path: ["now"], sub: { now: "registro de eventos" }, t: "O time registra o evento, uma vez", d: "Uma linha no registro: tabela, operação, condição e quais identificadores saem. A regra publicadora já existe." },
        { path: ["now", "eh"], t: "Um item é aprovado, e o evento sai", d: "Uma vez, fora da transação do usuário, só com identificadores." },
        { path: ["eh", "hub"], t: "Uma assinatura liga o evento à automação", d: "Configuração do dono da automação: tipo de evento, filtro e de onde vem cada parâmetro." },
        { path: ["hub", "mcp", "nowapi"], t: "O detalhe vem pelas ferramentas", d: "As variáveis do item, lidas com permissão própria." },
        { path: ["hub", "target"], t: "A execução nasce como qualquer outra", d: "Fila, worker e sistema alvo: o mesmo caminho do pedido pelo catálogo." },
        { path: ["eh", "ag"], t: "Mais um assinante, nada muda na instância", d: "Agentes e, na Fase 4, o Stellar leem o mesmo evento, cada um no seu ritmo." }
      ] },
    { id: "f-form", short: "Formulário", phase: 4, title: "O formulário da oferta, campo por campo", sub: { ag: "Agente Now Dev", team: "time do ServiceNow" },
      today: "Variáveis, tipos, opções e obrigatoriedade são criados um a um, e cada oferta sai de um jeito.",
      steps: [
        { path: ["now", "eh", "ag"], t: "O RH pede uma oferta nova", d: "A demanda diz o que a pessoa precisa informar e quem atende. O evento aciona o agente Now Dev." },
        { path: ["ag", "mcp", "hub"], t: "As variáveis saem do contrato da automação", d: "Quando a oferta chama uma automação, os campos já nascem ligados aos parâmetros dela." },
        { path: ["ag", "llm"], t: "Monta o formulário inteiro", d: "Variáveis, tipos, opções e obrigatoriedade, com os nomes no padrão do time." },
        { path: ["ag", "mcp", "nowapi"], t: "O rascunho nasce em sub-produção", d: "Com change request. O time confere como o funcionário vai ver, como em qualquer oferta." },
        { path: ["ag", "team"], t: "O time revisa a experiência de quem pede", d: "Regras de tela, como tornar um campo obrigatório conforme outro, ficam como proposta: pedem uma ferramenta nova." },
        { path: ["client", "mcp", "nowapi"], t: "O mesmo formulário serve ao Stellar", d: "O chat lê as variáveis da oferta e pergunta só o que falta. Nada é construído à parte." }
      ] },
    { id: "f-qa", short: "Regressão", phase: 4, title: "As ofertas testadas antes de promover", sub: { ag: "Agente QA", team: "time do ServiceNow" },
      today: "Conferir cada oferta depois de uma mudança toma tempo, e nem tudo tem teste automatizado.",
      steps: [
        { path: ["team", "ag"], t: "O time pede a regressão antes de promover", d: "Com a lista de ofertas e os usuários de teste. Tudo em sub-produção." },
        { path: ["ag", "mcp", "nowapi"], t: "O agente pede cada oferta", d: "Pela mesma ferramenta que o chat usa, com um usuário de teste." },
        { path: ["now", "hub", "target"], sub: { target: "sistemas de teste" }, t: "O flow da oferta roda de verdade", d: "A ação chama o Hub de non-prod. Nada toca produção." },
        { path: ["hub", "now"], t: "A execução devolve o desfecho", d: "Fila, worker e callback, como em produção." },
        { path: ["ag", "mcp", "hub"], t: "Confere o item e a execução de cada oferta", d: "Execução concluída e item fechado: passou. O aprovado é conferido em código, não pelo modelo." },
        { path: ["ag", "llm"], t: "O modelo resume a evidência da falha", d: "O que parou, onde e o que mudou desde o último teste." },
        { path: ["ag", "team"], t: "O resultado vai para a change request", d: "Como comentário. Promover ou corrigir é decisão do time." }
      ] },

    { id: "f-sla", short: "Contrato de SLA", phase: 5, title: "O contrato de SLA sai como rascunho", sub: { ag: "Agente Now Dev", team: "time do ServiceNow" },
      today: "A definição é montada à mão: condições de início, de pausa e de parada, calendário e duração.",
      note: "Pede uma ferramenta nova de configuração, com subflow do time. O aviso de prazo, na Fase 4, já está no plano.",
      steps: [
        { path: ["now", "eh", "ag"], t: "O combinado chega em texto", d: "O prazo, o que conta e o que não conta, na linguagem de quem pede." },
        { path: ["ag", "mcp", "nowapi"], t: "Parte de um SLA parecido", d: "É a ferramenta nova: ler e rascunhar definições de SLA, por um subflow do time." },
        { path: ["ag", "llm"], t: "Traduz o combinado para a definição", d: "Tipo, tabela, duração com calendário e as condições de início, de pausa e de parada. O OLA do grupo acompanha." },
        { path: ["ag", "mcp", "nowapi"], t: "O rascunho nasce em sub-produção", d: "Com change request, como as ofertas." },
        { path: ["ag", "team"], t: "O time negocia e aprova", d: "O prazo é decisão de negócio. O rascunho só poupa a montagem." }
      ] },
    { id: "f-revisao", short: "Revisão de código", phase: 5, title: "A primeira passada da revisão de código", sub: { ag: "Chamada de modelo", team: "revisor" },
      today: "O revisor lê script e update set inteiros antes de promover.",
      note: "Pede um tipo de evento novo e uma ferramenta nova de leitura de update set, com subflow do time. Regra fixa continua com a checagem da própria instância.",
      steps: [
        { path: ["now", "eh"], t: "Um update set é concluído, e o evento sai", d: "O desenvolvedor marca como concluído, como hoje. Um tipo de evento a mais: uma linha no registro." },
        { path: ["eh", "ag"], t: "A revisão lê o evento", d: "Uma chamada de modelo, não um agente: ler e apontar é um passo só." },
        { path: ["ag", "mcp", "nowapi"], t: "Lê o que mudou no update set", d: "É a ferramenta nova: leitura do conteúdo do update set, por um subflow do time." },
        { path: ["ag", "llm"], t: "Compara com as boas práticas do time", d: "Os padrões do time entram como fonte. Cada apontamento cita a regra." },
        { path: ["ag", "team"], t: "Os apontamentos chegam antes do revisor", d: "Como comentário na change request. Aprovar a promoção continua com ele." }
      ] },
    { id: "f-daily", short: "Daily", phase: 5, title: "O resumo pronto antes da daily", sub: { ag: "Resumo da daily", team: "time do ServiceNow" },
      today: "O status do time é montado a partir do que cada um lembra.",
      note: "Depende de onde o time registra o trabalho e de por onde quer receber o resumo.",
      steps: [
        { path: ["hub", "ag"], t: "Toda manhã, uma agenda inicia a rotina", d: "Agenda é configuração do Hub: quando rodar e com quais parâmetros." },
        { path: ["ag", "mcp", "nowapi"], t: "Lê o que mudou desde ontem", d: "Demandas, change requests e incidentes do time, pelas ferramentas de leitura." },
        { path: ["ag", "llm"], t: "O modelo redige o resumo", d: "Por item de trabalho, não por pessoa, com os bloqueios primeiro." },
        { path: ["ag", "team"], t: "O resumo chega antes da daily", d: "No canal que o time preferir. Não avalia pessoas nem muda o estado de nada." }
      ] }
  ],

  /* ---------- as duas telas de fluxos ----------
     groups: os fluxos do menu, da fase mais cedo à proposta. Um id sem "f-" vem de assets/data.js; [id, rótulo] troca o nome no menu.
     changes: o que muda para o time, uma linha por etapa do trabalho: [etapa, hoje, com a plataforma, continua com o time, fluxo que mostra]. */
  run: {
    groups: [{ name: null, ids: ["s-pedido", "f-aprova", "s-triagem", "f-prazo", "f-kb", "f-chat"] }],
    changes: [
      ["Entrada", "O funcionário procura a oferta no portal, e a dúvida vira ticket.", "O Stellar consulta chamados, pede ofertas e busca conhecimento pelas ferramentas (Fase 4).", "Cuida do catálogo e do conhecimento que o portal e o chat usam.", "f-chat"],
      ["Triagem", "Alguém lê cada ticket, classifica e encaminha ao grupo certo.", "Uma chamada de modelo sugere categoria e grupo na criação do ticket (Fase 4).", "Confirma a sugestão e trata o que o modelo marcou como incerto.", "s-triagem"],
      ["Atendimento", "A oferta termina em tarefa manual para o grupo solucionador.", "A oferta chama a automação, e o item fecha sozinho (Fase 1). Acesso sensível só executa depois da aprovação (Fase 3).", "Atende o que não tem automação e o que a automação devolveu.", "s-pedido"],
      ["Prazos", "Quando o prazo aperta, alguém abre o ticket para descobrir onde parou.", "O aviso de prazo chega com o diagnóstico: onde o item parou e o que a automação fez (Fase 4).", "Decide a ação: cobrar, reatribuir ou escalar.", "f-prazo"],
      ["Conhecimento", "O artigo é escrito à mão, quando sobra tempo.", "Rascunho de artigo a partir dos tickets resolvidos do tema (Fase 4).", "Revisa, publica e aposenta os artigos.", "f-kb"],
      ["Melhoria", "Achar o que melhorar depende de alguém cruzar relatórios e tickets.", "Volume por oferta e tempo por grupo, pelas ferramentas de leitura (Fase 2).", "Decide o que vira problema, o que sai do catálogo e o que muda.", null]
    ],
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
    ]
  },
  dev: {
    groups: [
      { name: "No plano", ids: ["f-flow", "f-reuso", "f-evento", ["a-nowdev", "Oferta nova"], "f-form", "f-qa"] },
      { name: "Propostas", ids: ["f-sla", "f-revisao", "f-daily"] }
    ],
    changes: [
      ["Demanda e arquitetura", "O pedido chega em texto livre, e achar algo parecido depende de quem lembra.", "Pela IDE, as ferramentas mostram o que já existe (Fase 2). A demanda aciona o agente, que parte da oferta mais parecida (Fase 4).", "Prioriza, decide reaproveitar ou criar e aprova os desvios de padrão.", "f-reuso"],
      ["Construção", "Item, formulário, flow e regra são montados à mão. Cada integração pede um trigger novo.", "Uma ação de Flow, sem script (Fase 1). Evento novo é uma linha no registro (Fase 2). Oferta, formulário, flow e regra chegam como rascunho (Fase 4).", "Revisa o rascunho e constrói o que foge do padrão.", "a-nowdev"],
      ["Revisão de código", "O revisor lê script e update set inteiros antes de promover.", "Proposta: a primeira passada aponta desvios das boas práticas do time.", "Aprova a promoção.", "f-revisao"],
      ["QA", "Conferir cada oferta depois de uma mudança toma tempo, e nem tudo tem teste automatizado.", "Regressão das ofertas em sub-produção, com a evidência da falha (Fase 4).", "Aceita o risco e decide se a mudança segue.", "f-qa"],
      ["DevOps", "Empacotar a mudança, abrir a change request e escrever as notas de release.", "Todo rascunho nasce com change request, só em sub-produção (Fase 3). Notas de release: proposta.", "Promove pelo processo de mudança, como hoje.", null],
      ["Daily e rotina", "O status do time é montado a partir do que cada um lembra.", "Proposta: resumo do que mudou desde ontem, com os bloqueios primeiro.", "A conversa e as decisões da daily.", "f-daily"]
    ]
  },
  /* de cada fluxo para o desenho em raias que o mostra por dentro. Com lead ou note, o texto das raias muda para aquele fluxo. */
  tech: {
    "s-pedido": "q-pedido", "f-aprova": "q-aprova", "s-triagem": "q-triagem", "f-prazo": "q-prazo", "f-kb": "q-kb", "f-chat": "q-chat",
    "f-flow": "q-pedido", "f-reuso": "q-reuso", "f-evento": "q-evento", "a-nowdev": "q-rascunho",
    "f-form": { seq: "q-rascunho", lead: "O formulário nasce junto com o rascunho da oferta: o mesmo caminho, as mesmas ferramentas." },
    "f-qa": "q-regressao",
    "f-sla": { seq: "q-rascunho", note: "O mesmo caminho da oferta. A definição de SLA pede uma ferramenta nova, com subflow do time." },
    "f-revisao": "q-revisao", "f-daily": "q-daily"
  },
  /* de cada fluxo para o exemplo que mostra o que o time recebe */
  board: {
    "s-pedido": "e-flow", "s-triagem": "e-triagem", "f-prazo": "e-prazo", "f-kb": "e-kb",
    "f-flow": "e-flow", "f-reuso": "e-reuso", "f-evento": "e-evento", "a-nowdev": "e-oferta", "f-form": "e-form", "f-qa": "e-regressao",
    "f-sla": "e-sla", "f-revisao": "e-revisao", "f-daily": "e-daily"
  },

  /* ---------- exemplos: o que o time recebe. Cada um é um quadro de cartões e os passos que acendem esses cartões. ----------
     Cartão: k (tipo), t (título), st [cor, texto], wide, by (rodapé) e o corpo: rows (pares), fields (formulário), steps (flow), items (lista),
     form (prévia do formulário), doc (artigo), code, bar, q. flow: [aba, fluxo] que conta a história deste exemplo. */
  exGroups: [
    { name: "Catálogo e serviço", ids: ["e-oferta", "e-form", "e-flow", "e-sla", "e-kb"] },
    { name: "Desenvolvimento", ids: ["e-reuso", "e-evento", "e-revisao", "e-regressao", "e-daily"] },
    { name: "Operação", ids: ["e-triagem", "e-prazo"] }
  ],
  examples: [
    { id: "e-oferta", short: "Oferta", tag: "Fase 4 · agente Now Dev", flow: ["desenvolvimento", "a-nowdev"],
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
        { on: ["chg", "item", "rule"], t: "O time revisa e promove", d: "A nota no ticket lista o que foi criado, o que conferir e o que não foi feito. A promoção segue o processo normal de mudança." }
      ] },

    { id: "e-form", short: "Formulário", tag: "Fase 4 · agente Now Dev", flow: ["desenvolvimento", "f-form"],
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

    { id: "e-flow", short: "Flow", tag: "Fase 1 · ação de Flow", flow: ["desenvolvimento", "f-flow"],
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

    { id: "e-sla", short: "Contrato de SLA", tag: "Proposta · ferramenta nova", flow: ["desenvolvimento", "f-sla"],
      title: "O contrato de SLA sai como rascunho, pronto para negociar",
      today: "A definição é montada à mão: condições de início, de pausa e de parada, calendário e duração.",
      note: "Pede uma ferramenta nova de configuração, com subflow do time. O aviso de prazo, na Fase 4, já está no plano.",
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

    { id: "e-kb", short: "Conhecimento", tag: "Fase 4 · rascunho de artigo", flow: ["operacao", "f-kb"],
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

    { id: "e-reuso", short: "Reuso", tag: "Fase 2 · ferramentas de leitura", flow: ["desenvolvimento", "f-reuso"],
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

    { id: "e-evento", short: "Evento sem trigger", tag: "Fase 2 · Now Event Hub", flow: ["desenvolvimento", "f-evento"],
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

    { id: "e-revisao", short: "Revisão de código", tag: "Proposta · chamada de modelo", flow: ["desenvolvimento", "f-revisao"],
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

    { id: "e-regressao", short: "Regressão", tag: "Fase 4 · agente de QA", flow: ["desenvolvimento", "f-qa"],
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

    { id: "e-daily", short: "Daily", tag: "Proposta · chamada de modelo", flow: ["desenvolvimento", "f-daily"],
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

    { id: "e-triagem", short: "Triagem", tag: "Fase 4 · chamada de modelo", flow: ["operacao", "s-triagem"],
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

    { id: "e-prazo", short: "Prazo", tag: "Fase 4 · agente de Operação", flow: ["operacao", "f-prazo"],
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
      geo: { px: 30, py: 44, rp: 104, nw: 198, maxW: 960 },
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
  insideLegend: [["act", "Passo atual"], ["seen", "Já percorrido"], ["core", "Novo, com a plataforma"], ["ext", "Já existe na instância"], ["az", "Gateway de APIs"]],

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
