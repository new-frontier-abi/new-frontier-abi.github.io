/* Conteúdo da página do time do ServiceNow: casos de uso, o que entra na instância e as garantias.
   Cada caso é um quadro de cartões (o que é entregue) e os passos que acendem esses cartões.
   Cartão: k (tipo), t (título), st [cor, texto], wide, by (rodapé) e o corpo: rows (pares), fields (formulário), steps (flow), items (lista), code, bar, q, note.
   Tickets, ofertas e grupos são fictícios. */
window.NOW = {
  groups: [
    { name: "Catálogo", ids: ["c-oferta", "c-flow", "c-servico"] },
    { name: "Eventos e prazos", ids: ["c-evento", "c-agenda", "c-sla"] },
    { name: "Operação", ids: ["c-triagem", "c-automacao", "c-regressao"] }
  ],
  cases: [
    { id: "c-oferta", short: "Oferta nova", tag: "Fase 4 · agente Now Dev",
      title: "Uma oferta nova chega pronta para revisar",
      today: "Item, variáveis, flow e regra de atribuição são configurados à mão, a partir do ticket.",
      cards: [
        { id: "dem", k: "Demanda", t: "DMND0001234 · Nova oferta: acesso a grupo do Entra ID", st: ["wait", "Nova"],
          rows: [["Pedido por", "Operações de TI"], ["Quer", "Pedido aprovado inclui a pessoa no grupo, sem tarefa manual"], ["Parecida com", "Acesso a lista de distribuição"]] },
        { id: "form", wide: true, k: "Item de catálogo · rascunho", t: "Acesso a grupo do Entra ID", st: ["wait", "Sub-produção"],
          fields: [
            { l: "Para quem", req: 1, ty: "Referência · usuário", to: "userPrincipalName" },
            { l: "Grupo", req: 1, ty: "Lista com busca · grupos elegíveis", to: "groupId" },
            { l: "Motivo", req: 1, ty: "Opções", opts: ["Projeto", "Mudança de área", "Cobertura temporária"], to: "fica no ticket" },
            { l: "Justificativa", ty: "Texto longo · obrigatória se o grupo for restrito", to: "fica no ticket" }
          ], by: "Categoria: Acessos" },
        { id: "flow", k: "Flow da oferta", t: "Aprovação, automação e desfecho",
          steps: [
            { k: "Gatilho", t: "Item pedido no catálogo" },
            { k: "Aprovação", t: "Gestor de quem recebe o acesso" },
            { k: "Ação", t: "DW Hub · Run Automation: entra-group-add-member", hl: 1 },
            { k: "Espera", t: "O desfecho volta por callback" },
            { k: "Fim", ends: [["ok", "Concluída: fecha o item"], ["ko", "Falhou: tarefa para o grupo"]] }
          ] },
        { id: "rule", k: "Regra de atribuição", t: "Para o que a automação não resolver",
          rows: [["Tabela", "Tarefa de catálogo"], ["Quando", "Item = Acesso a grupo do Entra ID"], ["Grupo", "Identidade N2"]] },
        { id: "chg", k: "Change request", t: "CHG0031245 · Oferta nova em sub-produção", st: ["wait", "Aguardando revisão"],
          rows: [["Contém", "1 item, 4 variáveis, 1 flow, 1 regra"], ["Revisa", "Desenvolvedor ServiceNow"], ["Promoção", "Processo normal de mudança"]] }
      ],
      steps: [
        { on: ["dem"], t: "O pedido de oferta chega como demanda", d: "O ticket vira o evento de demanda criada, que aciona o agente Now Dev." },
        { on: ["form", "dem"], t: "O agente parte da oferta mais parecida", d: "Lê o catálogo pelas ferramentas e reaproveita as variáveis e os padrões que o time já usa." },
        { on: ["form"], t: "Monta o formulário inteiro", d: "Variáveis, tipos, opções e obrigatoriedade. Cada variável aponta para um parâmetro da automação." },
        { on: ["flow"], t: "Liga a oferta à automação", d: "A ação de Flow é a mesma de todas as ofertas. Mudam a automação e o mapa de parâmetros." },
        { on: ["rule"], t: "Cria a regra de atribuição", d: "Se a automação falhar, a tarefa já cai no grupo certo." },
        { on: ["chg"], t: "Tudo nasce em sub-produção, com change request", d: "As ferramentas de configuração recusam produção e exigem uma change aberta." },
        { on: ["chg", "form", "flow", "rule"], t: "Você revisa e promove", d: "Ajustes voltam ao agente como comentário. A promoção segue o processo normal de mudança." }
      ] },

    { id: "c-flow", short: "Oferta automatizada", tag: "Fase 1 · ação de Flow",
      title: "Uma oferta que já existe passa a se resolver sozinha",
      today: "A oferta termina em uma tarefa manual para o grupo solucionador.",
      cards: [
        { id: "old", k: "Flow · hoje", t: "Sincronizar dispositivo no Intune",
          steps: [
            { k: "Gatilho", t: "Item pedido no catálogo" },
            { k: "Tarefa manual", t: "Alguém do grupo abre o Intune e sincroniza" },
            { k: "Fim", t: "A pessoa fecha a tarefa e o item" }
          ] },
        { id: "new", k: "Flow · com a ação", t: "Sincronizar dispositivo no Intune",
          steps: [
            { k: "Gatilho", t: "Item pedido no catálogo" },
            { k: "Ação", t: "DW Hub · Run Automation", hl: 1 },
            { k: "Espera", t: "O desfecho volta por callback" },
            { k: "Fim", ends: [["ok", "Concluída: fecha o item"], ["ko", "Falhou: tarefa para o grupo"]] }
          ] },
        { id: "ritm", k: "Item pedido", t: "RITM0012345 · Sincronizar dispositivo", st: ["ok", "Fechado"],
          rows: [["Pedido", "Pelo catálogo, como hoje"], ["Execução", "Concluída na primeira tentativa"], ["Quem tocou", "Ninguém"]] },
        { id: "act", wide: true, k: "Ação de Flow · entradas", t: "DW Hub · Run Automation",
          fields: [
            { l: "Automação", req: 1, ty: "Texto · a chave no catálogo", to: "intune-device-sync" },
            { l: "Parâmetros", req: 1, ty: "JSON · vem da variável Dispositivo", to: "managedDeviceId" },
            { l: "Ticket", req: 1, ty: "Referência · o item pedido", to: "chave de idempotência" }
          ], by: "A mesma ação serve a todas as ofertas" },
        { id: "back", k: "Subflow de callback", t: "O que volta do Hub",
          rows: [["Concluída", "Nota de trabalho e item fechado"], ["Falhou", "Nota com o motivo e tarefa para o grupo"], ["Repetida", "A segunda chamada não muda nada"]] }
      ],
      steps: [
        { on: ["old"], t: "Hoje a oferta termina em uma tarefa", d: "Alguém do grupo solucionador abre o Intune e sincroniza à mão." },
        { on: ["new"], t: "A tarefa dá lugar a uma ação", d: "DW Hub · Run Automation entra no lugar da tarefa manual. O resto do flow fica igual." },
        { on: ["act"], t: "Três campos para preencher", d: "Qual automação, de onde vem cada parâmetro e o ticket." },
        { on: ["back", "new"], t: "O flow não fica esperando", d: "O Hub devolve o desfecho por callback. O número do ticket impede execução em duplicidade." },
        { on: ["ritm"], t: "O item fecha sozinho", d: "Se a automação falhar, vira tarefa para o grupo solucionador, com o motivo." }
      ] },

    { id: "c-servico", short: "Serviço novo", tag: "Proposta · fora do plano de fases",
      title: "Um serviço novo sai como um kit para revisar",
      today: "Serviço, ofertas, formulários, grupo e SLA são criados um a um, por pessoas diferentes.",
      note: "Depende de ferramentas novas de configuração, para serviço e SLA, que ainda não estão no plano de fases.",
      cards: [
        { id: "svc", k: "Serviço", t: "Impressão segura", st: ["wait", "Rascunho"],
          rows: [["Dono", "Workplace"], ["Suporte", "Workplace N2"], ["Calendário", "Dias úteis, 8h às 18h"], ["Atribuição", "Tarefas do serviço vão para o grupo de suporte"]] },
        { id: "offers", k: "Ofertas do serviço", t: "Três ofertas, duas com automação",
          items: [
            { t: "Liberar impressão para um usuário", st: ["ok", "automação"] },
            { t: "Cadastrar crachá na impressora", st: ["ok", "automação"] },
            { t: "Reportar falha de impressão", st: ["", "incidente"] }
          ] },
        { id: "sla", k: "Definição de SLA", t: "Pedido de impressão",
          rows: [["Meta", "8 horas úteis"], ["Começa", "Item aprovado"], ["Pausa", "Aguardando o solicitante"], ["Termina", "Item fechado"]], bar: { at: 75, label: "aviso em 75%" } },
        { id: "form", wide: true, k: "Item de catálogo · rascunho", t: "Liberar impressão para um usuário",
          fields: [
            { l: "Para quem", req: 1, ty: "Referência · usuário", to: "userId" },
            { l: "Unidade", req: 1, ty: "Opções", opts: ["Matriz", "Fábrica", "Centro de distribuição"], to: "siteId" },
            { l: "Impressora", req: 1, ty: "Lista com busca · filtrada pela unidade", to: "printerId" },
            { l: "Perfil", req: 1, ty: "Opções", opts: ["Preto e branco", "Colorida"], to: "profile" }
          ] },
        { id: "chg", k: "Change request", t: "CHG0031290 · Serviço Impressão segura", st: ["wait", "Aguardando revisão"],
          rows: [["Contém", "1 serviço, 3 ofertas, 1 SLA, 1 regra"], ["Ambiente", "Sub-produção"], ["Revisa", "Desenvolvedor ServiceNow"]] }
      ],
      steps: [
        { on: ["svc"], t: "O pedido descreve o serviço", d: "Dono, grupo de suporte, calendário e o que o serviço entrega." },
        { on: ["offers"], t: "O agente propõe as ofertas", d: "A partir das ofertas parecidas que já existem no catálogo." },
        { on: ["form"], t: "Cada oferta sai com o formulário completo", d: "Variáveis, opções e a ligação com a automação, quando há uma." },
        { on: ["sla"], t: "O SLA segue o padrão do time", d: "Calendário, pausa e aviso antes do prazo." },
        { on: ["chg"], t: "Um kit só, em sub-produção", d: "Uma change request com tudo. Você revisa uma vez e promove." }
      ] },

    { id: "c-evento", short: "Evento, sem trigger", tag: "Fase 2 · Now Event Hub",
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
        { on: ["who"], t: "Mais um assinante, nenhuma mudança", d: "Hub, agentes e chat leem o mesmo evento. Reenvio não duplica." }
      ] },

    { id: "c-agenda", short: "Agenda", tag: "Fase 2 · agenda do Hub",
      title: "Um trabalho recorrente sai do script agendado",
      today: "Scripts agendados dentro do ServiceNow, cada um com o próprio log e o próprio tratamento de erro.",
      cards: [
        { id: "sch", wide: true, k: "Agenda no Hub", t: "Exportar membros de grupos para revisão de acessos", st: ["ok", "Ligada"],
          fields: [
            { l: "Automação", req: 1, ty: "Do catálogo", to: "entra-group-members-export" },
            { l: "Quando", req: 1, ty: "Todo dia 1º, às 6h", to: "0 6 1 * *" },
            { l: "Fuso", ty: "Horário de Brasília", to: "America/Sao_Paulo" },
            { l: "Parâmetros", req: 1, ty: "A lista de grupos a exportar", to: "groupIds" }
          ] },
        { id: "exec", k: "Execuções", t: "Tentativa, duração e resultado",
          items: [
            { t: "Este mês", s: "concluída", st: ["ok", "ok"] },
            { t: "Mês passado", s: "repetiu uma vez e concluiu", st: ["ok", "ok"] },
            { t: "Há dois meses", s: "concluída", st: ["ok", "ok"] }
          ] },
        { id: "out", k: "Desfecho", t: "Arquivo e evento",
          rows: [["Arquivo", "Guardado com a execução"], ["Evento", "hub.execution.completed"], ["Quem assina", "Quem precisa do arquivo ou do aviso"]] }
      ],
      steps: [
        { on: ["sch"], t: "A agenda é configuração, não script", d: "Qual automação, quando e com quais parâmetros." },
        { on: ["exec"], t: "Cada execução fica registrada", d: "Falha passageira repete sozinha. Esgotadas as tentativas, a execução fica separada, com o contexto." },
        { on: ["out"], t: "O desfecho vira evento", d: "Quem precisa do arquivo ou do aviso assina. Nada disso roda dentro do ServiceNow." }
      ] },

    { id: "c-sla", short: "SLA", tag: "Fase 4 · agente de Operação",
      title: "O prazo avisa antes de estourar",
      today: "O estouro aparece no relatório, depois que aconteceu.",
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
      ] },

    { id: "c-triagem", short: "Triagem", tag: "Fase 4 · chamada de modelo",
      title: "O ticket já nasce no grupo certo",
      today: "A triagem é manual até o ticket chegar ao grupo certo.",
      cards: [
        { id: "inc", k: "Incidente", t: "INC0078901 · Não consigo imprimir no 3º andar", st: ["wait", "Novo"],
          rows: [["Aberto por", "Funcionário, pelo portal"], ["Categoria", "Em branco"], ["Grupo", "Em branco"]] },
        { id: "sug", k: "Sugestão do modelo", t: "Uma chamada, não um agente",
          rows: [["Categoria", "Impressão"], ["Grupo", "Workplace N2"], ["Confiança", "Alta"], ["Parecidos", "Outros incidentes do mesmo andar nesta semana"]] },
        { id: "thr", k: "Regra de uso", t: "O incerto vai para uma pessoa",
          items: [
            { t: "Confiança alta", s: "grava a sugestão no ticket" },
            { t: "Confiança baixa", s: "segue para a triagem humana" },
            { t: "Amostra semanal", s: "o time confere os acertos" }
          ] },
        { id: "kb", k: "Conhecimento", t: "O artigo certo, junto",
          items: [{ t: "Impressora offline: primeiros passos" }, { t: "Fila de impressão travada" }], by: "Pelas ferramentas de conhecimento" }
      ],
      steps: [
        { on: ["inc"], t: "Um incidente é aberto", d: "O ServiceNow publica o evento de incidente criado." },
        { on: ["sug"], t: "Uma chamada de modelo classifica", d: "Classificar é um passo só. Custa menos e erra menos que um agente." },
        { on: ["thr"], t: "O incerto vai para uma pessoa", d: "O time trata o que o modelo marcou como incerto e revisa o restante por amostragem." },
        { on: ["kb", "inc"], t: "A sugestão e o artigo ficam no ticket", d: "Por ferramenta verde, com auditoria. Quem atende confirma ou corrige." }
      ] },

    { id: "c-automacao", short: "Automação nova", tag: "Fase 3 · agentes de entrega",
      title: "Uma tarefa manual vira automação no catálogo",
      today: "Pedido por e-mail, espera na fila do time de automações e integração feita caso a caso.",
      cards: [
        { id: "dem", k: "Demanda", t: "DMND0001301 · Atribuir a licença do Visio a partir do pedido aprovado", st: ["wait", "Nova"],
          rows: [["Pedido por", "Squad ServiceNow"], ["Hoje", "Tarefa manual para o grupo de licenças"], ["Aceite", "Licença atribuída em até 5 minutos depois da aprovação"]] },
        { id: "intake", k: "Agente Intake · demanda estruturada", t: "Código resolve: regra fixa, com API",
          rows: [["Sistemas", "Microsoft 365 e ServiceNow"], ["Já existe?", "Nada parecido no catálogo"], ["Abordagem", "Código"]] },
        { id: "roi", k: "Agente ROI · caso de negócio", t: "Os números vêm do ServiceNow",
          rows: [["Volume", "Pedidos da oferta por mês"], ["Esforço", "Tempo de atendimento do grupo"], ["Decisão", "Uma pessoa prioriza"]] },
        { id: "code", wide: true, k: "Pull request · agente Pré-código", t: "m365-license-assign", st: ["wait", "Aguardando revisão"],
          code: "class Params(BaseModel):\n    userPrincipalName: str\n    license: str\n\n@automation(key=\"m365-license-assign\", domain=\"workplace\", queue=\"fast\", …)\ndef run(params: Params, ctx: Context) -> Result:\n    status = assign_license(ctx, params.userPrincipalName, params.license)\n    return Result(status=status)",
          items: [{ t: "Testes e análise de código", st: ["ok", "passou"] }, { t: "QA em non-prod, com evidências", st: ["ok", "passou"] }] },
        { id: "act", k: "No ServiceNow", t: "Disponível para qualquer oferta",
          fields: [
            { l: "Automação", ty: "Aparece na ação de Flow", to: "m365-license-assign" },
            { l: "Parâmetros", ty: "Usuário e licença", to: "userPrincipalName, license" }
          ] }
      ],
      steps: [
        { on: ["dem"], t: "O time pede pelo ticket de sempre", d: "Uma demanda descreve a tarefa manual que deveria sumir." },
        { on: ["intake"], t: "O agente Intake estrutura e classifica", d: "Procura o que já existe no catálogo e diz se o caso pede código, uma chamada de modelo ou um agente." },
        { on: ["roi"], t: "O caso de negócio sai dos dados do ServiceNow", d: "Volume e tempo de atendimento são lidos pelas ferramentas. Uma pessoa decide se entra." },
        { on: ["code"], t: "A automação é uma função Python", d: "Só a regra de negócio. Fila, repetição, log e monitoramento vêm da plataforma." },
        { on: ["code"], t: "Um engenheiro aprova o pull request", d: "Com os testes e as evidências do QA em non-prod." },
        { on: ["act"], t: "A automação aparece na ação de Flow", d: "Qualquer oferta passa a poder usá-la, sem integração nova no ServiceNow." }
      ] },

    { id: "c-regressao", short: "Regressão", tag: "Fase 4 · agente de QA",
      title: "Antes de uma mudança, as ofertas são testadas sozinhas",
      today: "Teste manual, oferta por oferta, a cada upgrade ou mudança de flow.",
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
        { on: ["chg"], t: "Você decide se a mudança segue", d: "O agente aponta. Promover ou corrigir é decisão do time." }
      ] }
  ],

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
    ["Fase 4", "Revisão dos rascunhos e das sugestões dos agentes", "Oferta nova, triagem, aviso de prazo e regressão"]
  ],
  owner: "A instância continua do time. Os artefatos ficam em repositório, como código, para revisão. O pedido é um desenvolvedor do ServiceNow, em tempo parcial, das Fases 1 a 4."
};
