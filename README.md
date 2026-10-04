# DW Automation Platform

Site de apresentação da plataforma de automação do Digital Workplace: Automation Hub, Now Event Hub, ServiceNow MCP e agentes.

Publicado em <https://new-frontier-abi.github.io>.

## O que tem aqui

| Caminho | Conteúdo |
|---|---|
| `index.html` | A plataforma em quatro telas: plataforma, autoatendimento, agentes e fases |
| `assets/data.js` | Todo o conteúdo: peças, ligações, exemplos e fases |
| `assets/map.js` | O mapa da arquitetura, desenhado em SVG |
| `assets/app.js` | As telas e o Play |
| `assets/site.css` | Tema, claro e escuro |

## Como editar

O conteúdo fica só em `assets/data.js`. Não há build: abra `index.html` no navegador para conferir e faça o push para a `main`.

Regras do conteúdo:

- cada passo de um exemplo anda por ligações que existem no mapa;
- um exemplo só usa peças que já existem na fase dele;
- nada de identificadores internos de infraestrutura nem de valores de custo: o site é público.
