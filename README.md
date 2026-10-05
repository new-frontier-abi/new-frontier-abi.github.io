# DW Automation Platform

Site de apresentação da plataforma de automação do Digital Workplace: Automation Hub, Now Event Hub, ServiceNow MCP e agentes.

Publicado em <https://new-frontier-abi.github.io>.

| Página | Para quem | O que mostra |
|---|---|---|
| [Plataforma](https://new-frontier-abi.github.io/) | Liderança e arquitetura | As quatro peças, o desenho técnico de cada uma no Azure, os fluxos de autoatendimento, o fluxo de cada agente e as fases |
| [Automações](https://new-frontier-abi.github.io/automacoes/) | O time que constrói e opera | A jornada, o ambiente e a esteira, a base passo a passo, os recursos, os times e os agentes |
| [ServiceNow](https://new-frontier-abi.github.io/servicenow/) | O time do ServiceNow | Os fluxos de operação e de desenvolvimento, cada um com o desenho no Azure; os exemplos; os agentes; as garantias |

Tudo o que acontece é contado como um fluxo: um caminho sobre o mapa da plataforma, passo a passo. O mapa aparece inteiro desde o começo: o que o fluxo não usa fica apagado, e o caminho acende a cada passo. Nas duas linhas do tempo, a jornada e as fases, o que ainda não chegou aparece só no contorno. O desenho técnico fica logo abaixo. Na página do ServiceNow, ele é um desenho em raias: uma linha por etapa, uma coluna por participante, com os serviços do Azure dentro de uma zona.

## O que tem aqui

| Caminho | Conteúdo |
|---|---|
| `index.html`, `automacoes/index.html`, `servicenow/index.html` | As três páginas: só o cabeçalho, com o logo, e a lista de arquivos |
| `assets/data.js` | Plataforma: mapa executivo, desenhos técnicos, fluxos (os de autoatendimento e um por agente) e fases |
| `assets/team-data.js` | Time de automações: jornada, ambiente, base, recursos, times e funções |
| `assets/now-data.js` | ServiceNow: os fluxos do time, os processos em raias, os exemplos, a instância por dentro e as garantias |
| `assets/app.js`, `assets/team.js`, `assets/now.js` | As telas de cada página |
| `assets/ui.js` | O que as três páginas dividem: navegação, palco, controles, menus, fluxos sobre o mapa e catálogo de funções |
| `assets/map.js` | O mapa, desenhado em SVG a partir dos dados |
| `assets/seq.js` | O desenho em raias, também em SVG a partir dos dados |
| `assets/site.css` | A identidade e os dois temas: branco, o padrão, e escuro |
| `assets/theme.js` | O botão do cabeçalho que troca o tema e guarda a escolha |
| `assets/dw.svg`, `assets/dw-amber.svg`, `assets/icon.svg` | O monograma do Digital Workplace, em preto e em amarelo (para fundo escuro), e o ícone da página |
| `assets/fonts/` | As duas fontes do site, com as licenças |

## Identidade

A identidade vem do logo do Digital Workplace: preto e amarelo, traço único, nós em círculo.

- O amarelo marca o agora: o passo atual e o botão de avançar. O preto marca o que está escolhido. O resto é neutro.
- No cabeçalho fica só o monograma, sem o círculo em volta. Ele foi redesenhado em vetor a partir da imagem do logo; se existir o arquivo oficial em vetor, é só trocar o desenho no cabeçalho das três páginas e nos arquivos de `assets/`.
- As fontes são Manrope, para o texto, e Geist Mono, para números e código. As duas ficam no próprio site: nada é carregado de fora.

## Como apresentar

- **Avançar** é o botão principal de todo palco. Ele fica sempre no mesmo lugar: dá para clicar sem tirar o cursor de cima. No último passo, ele leva ao próximo fluxo do menu.
- Todo palco começa no primeiro ponto, com o Avançar pronto. Enquanto couber na tela, o palco tem o mesmo tamanho em todos os fluxos de um menu.
- **Tocar** anda sozinho, no tempo de leitura de cada passo.
- **Tela cheia** leva o palco e o menu de fluxos: dá para apresentar uma seção inteira sem sair dela.
- Teclado: `→` e `←` andam um passo, `espaço` toca e pausa, `Home` volta ao começo, `F` abre e fecha a tela cheia.
- O cabeçalho acompanha a rolagem, e a página nunca rola sozinha. No fim de cada tela ficam a anterior e a próxima.
- Nas raias, passar o cursor em um participante, ou tocar nele, mostra o papel dele e acende só as etapas em que ele entra. `Esc` solta.

## Como editar

O conteúdo fica só nos três arquivos de dados. Não há build: abra `index.html` no navegador para conferir e faça o push para a `main`.

- **Mapa**: cada nó tem coluna (`c`) e linha (`r`) em uma grade; `h` é a altura em linhas. Uma ligação anda em linha reta entre nós da mesma linha ou coluna; `bend: "hv"` ou `"vh"` faz um L; `step` desce em degrau até a coluna ao lado.
- **Fluxo**: cada passo tem `path`, a sequência de nós por onde o ponto anda. Só vale passar por ligações que existem. `sub` troca a segunda linha de um nó, no fluxo inteiro ou só em um passo. `phase` é a fase em que o fluxo passa a funcionar; `5` é proposta, e pede `note`. Opcional: `build: true` faz o mapa daquele fluxo se montar passo a passo, só com as peças que ele usa.
- **Fluxo de agente**: um por agente, em `assets/data.js`, do que o aciona ao que uma pessoa decide. As três páginas mostram os mesmos.
- **Fluxo do time do ServiceNow**: em `assets/now-data.js`, sobre o mesmo mapa. `run` e `dev` dizem quais fluxos entram em cada tela e trazem a tabela do que muda para o time. `tech` liga cada fluxo ao processo em raias; `board`, ao exemplo.
- **Desenho técnico**: igual a um fluxo, com o próprio mapa em `map`, que aparece inteiro. Um passo com `on` acende um conjunto de nós em vez de andar.
- **Linha do tempo** (jornada e fases): `p` diz em que passo, ou fase, o nó e a ligação passam a existir; antes disso, o nó aparece só no contorno. Na jornada, `ghost` devolve ao contorno o que foi desligado.
- **Processo em raias**: quem participa (`seq.parts`, tirado de `parts`) e as etapas. Cada etapa tem os trechos que percorre (`hops`: de, para e um rótulo curto). A camada de cada participante (`g`) decide se ele fica dentro da zona do Azure.
- **Exemplo do ServiceNow**: um quadro de cartões (`cards`) e os passos que acendem cada cartão (`on`; o primeiro é o que fica à vista). `flow` diz qual fluxo conta a história dele.

O endereço guarda a seção e o fluxo: `#agentes/a-qa`, `#plataforma/hub`, `servicenow/#operacao/f-prazo`, `servicenow/#exemplos/e-oferta`. `#agentes/funcoes`, nas páginas Automações e ServiceNow, abre direto na lista das funções. O botão de voltar do navegador anda pelas seções.

O site abre no tema branco. O botão no canto do cabeçalho troca para o escuro, e a escolha vale para as três páginas. Para abrir direto em um deles: `?tema=escuro` ou `?tema=claro` no endereço.

Mudou um arquivo de `assets/`? Aumente o número em `?v=` nas três páginas, para ninguém ficar com a versão antiga em cache.

## Regras do conteúdo

- cada passo de um fluxo anda por ligações que existem no mapa, e todo nó de um desenho técnico aparece em algum passo;
- um fluxo só usa peças que já existem na fase dele;
- o que ainda não está no plano de fases aparece marcado como proposta, e proposta que depende de ferramenta nova diz isso;
- nenhum número de ganho: a linha de base é medida antes, e a meta sai dela;
- o site é público: só tipo de serviço e papel de cada peça. Nada de nome de recurso, de identificador interno, de tamanho nem de custo; isso fica no repositório de infraestrutura;
- tickets, ofertas e grupos dos exemplos são fictícios.
