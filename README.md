# DW Automation Platform

Site de apresentação da plataforma de automação do Digital Workplace: Automation Hub, Now Event Hub, ServiceNow MCP e agentes.

Publicado em <https://new-frontier-abi.github.io>. Página do time: <https://new-frontier-abi.github.io/automacoes/>.

## O que tem aqui

| Caminho | Conteúdo |
|---|---|
| `index.html` | A plataforma em quatro telas: plataforma, autoatendimento, agentes e fases |
| `automacoes/index.html` | A página do time de automações: jornada, base, recursos, times e agentes |
| `assets/data.js` | Conteúdo da plataforma: peças, ligações, exemplos e fases |
| `assets/team-data.js` | Conteúdo da página do time |
| `assets/map.js` | O mapa, desenhado em SVG a partir dos dados |
| `assets/app.js`, `assets/team.js` | As telas e o Play de cada página |
| `assets/site.css` | Os dois temas: branco, o padrão, e escuro |
| `assets/theme.js` | O botão do cabeçalho que troca o tema e guarda a escolha |

## Como editar

O conteúdo fica só em `assets/data.js` e em `assets/team-data.js`. Não há build: abra `index.html` no navegador para conferir e faça o push para a `main`.

O site abre no tema branco. O botão no canto do cabeçalho troca para o escuro, e a escolha vale para as duas páginas. Para abrir direto em um deles: `?tema=escuro` ou `?tema=claro` no endereço.

Mudou o `site.css` ou o `theme.js`? Aumente o número em `?v=` nas duas páginas, para ninguém ficar com a versão antiga em cache.

Regras do conteúdo:

- cada passo de um exemplo anda por ligações que existem no mapa;
- um exemplo só usa peças que já existem na fase dele;
- nada de identificadores internos de infraestrutura nem de valores de custo: o site é público.
