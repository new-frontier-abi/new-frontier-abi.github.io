# DW Automation Platform

Site de apresentação da plataforma de automação do Digital Workplace: Automation Hub, Now Event Hub, ServiceNow MCP e agentes.

Publicado em <https://new-frontier-abi.github.io>.

| Página | Para quem | O que mostra |
|---|---|---|
| [Plataforma](https://new-frontier-abi.github.io/) | Liderança e arquitetura | As quatro peças, o desenho técnico de cada uma no Azure, os exemplos e as fases |
| [Automações](https://new-frontier-abi.github.io/automacoes/) | O time que constrói e opera | A jornada, o ambiente e a esteira, a base passo a passo, os recursos, os times e os agentes |
| [ServiceNow](https://new-frontier-abi.github.io/servicenow/) | O time do ServiceNow | Nove casos de uso com o que cada um entrega, o que entra na instância e as garantias |

Em cada página, a primeira aba tem o desenho executivo em cima e o técnico logo abaixo.

## O que tem aqui

| Caminho | Conteúdo |
|---|---|
| `index.html`, `automacoes/index.html`, `servicenow/index.html` | As três páginas: só o cabeçalho e a lista de arquivos |
| `assets/data.js` | Plataforma: mapa executivo, desenhos técnicos, exemplos e fases |
| `assets/team-data.js` | Time de automações: jornada, ambiente, base, recursos, times e funções |
| `assets/now-data.js` | ServiceNow: casos de uso, a instância por dentro e as garantias |
| `assets/app.js`, `assets/team.js`, `assets/now.js` | As telas de cada página |
| `assets/ui.js` | O que as três páginas dividem: navegação, palco, controles do Play, menus e catálogo de funções |
| `assets/map.js` | O mapa, desenhado em SVG a partir dos dados |
| `assets/site.css` | Os dois temas: branco, o padrão, e escuro |
| `assets/theme.js` | O botão do cabeçalho que troca o tema e guarda a escolha |

## Como editar

O conteúdo fica só nos três arquivos de dados. Não há build: abra `index.html` no navegador para conferir e faça o push para a `main`.

- **Mapa**: cada nó tem coluna (`c`) e linha (`r`) em uma grade; `h` é a altura em linhas. Uma ligação anda em linha reta entre nós da mesma linha ou coluna; `bend: "hv"` ou `"vh"` faz um L.
- **Exemplo sobre um mapa**: cada passo tem `path`, a sequência de nós por onde o ponto anda. Só vale passar por ligações que existem.
- **Desenho técnico**: igual a um exemplo, com o próprio mapa em `map`. Um passo com `on` acende um conjunto de nós em vez de andar.
- **Caso de uso do ServiceNow**: um quadro de cartões (`cards`) e os passos que acendem cada cartão (`on`; o primeiro é o que fica à vista).

O endereço guarda a aba e o exemplo: `#agentes/s-falha`, `#plataforma/hub`, `servicenow/#casos/c-evento`.

O site abre no tema branco. O botão no canto do cabeçalho troca para o escuro, e a escolha vale para as três páginas. Para abrir direto em um deles: `?tema=escuro` ou `?tema=claro` no endereço.

Mudou um arquivo de `assets/`? Aumente o número em `?v=` nas três páginas, para ninguém ficar com a versão antiga em cache.

Teclado, em qualquer palco com Play: `→` e `←` andam um passo, `espaço` toca e pausa, `Home` volta ao começo, `F` abre em tela cheia.

## Regras do conteúdo

- cada passo de um exemplo anda por ligações que existem no mapa, e todo nó de um desenho técnico aparece em algum passo;
- um exemplo só usa peças que já existem na fase dele;
- o que ainda não está no plano de fases aparece marcado como proposta;
- o site é público: só tipo de serviço e papel de cada peça. Nada de nome de recurso, de identificador interno, de tamanho nem de custo; isso fica no repositório de infraestrutura;
- tickets, ofertas e grupos dos exemplos são fictícios.
