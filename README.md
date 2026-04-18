# ArchProject Studio 2026 — Módulo de Arquitectura

## 🎯 O Que a App Faz e Para Quem É
**O Que Faz:** É um sistema de gestão operacional altamente focado no ciclo de vida de projectos de arquitectura. Permite:
- Gestão progressiva de Fases de Projecto (do Programa Preliminar ao Projecto de Execução e Obra).
- Documentação centralizada inteligente com associação a entregáveis.
- Controlo Financeiro, Faturação e Orçamentação.
- Registo de Tempo (Timesheets) e Planeamento da equipa (Timeline Gantt).
- Portais dedicados para clientes aprovarem e visualizarem peças desenhadas e escritas.

**Para Quem É:** Arquitectos, Gestores de Projecto, Engenheiros Especialistas, Clientes e Colaboradores Externos. É um módulo vertical projetado exclusivamente para as particularidades do fluxo de trabalho *Arch*.

## 🛠️ Stack Tecnológica Actual
- **HTML5 / CSS3 (Vanilla)**: Design system próprio com variáveis CSS puras, sem Tailwind. Promove uma estética "industrial", minimalista e orientada a produtividade intensiva extrema.
- **JavaScript (Vanilla JS)**: Single Page Application (SPA) baseada em manipulação direta do DOM via utilitários próprios (ex: `core/helpers.js`).
- **Estado e Backend Simulado**: Zero servidor neste momento. O estado da UI vive na RAM (`UI_STATE`), enquanto a "base de dados" relacional do utilizador foi emulada recorrendo inteiramente a `localStorage`, facilitando o prototipismo rápido.

## 🗂️ Árvore de Ficheiros (O Que Cada Um Faz)

### 🔹 Core & Engine (`core/`)
- `app.js` (Na Raiz): Ponto de entrada e Router da Aplicação (`handleRoute`, `navigate`). Interpreta o hash URL e reencaminha para a vista correta.
- `state.js`: Define o estado global e volátil da interface (`UI_STATE`).
- `persistence.js`: Camada de abstracção para `localStorage`. Simula transações de base de dados e carrega as root stores (`PROJECTS`, `APP`, `QUOTES`).
- `mutations.js`: **Central Única de Escrita**. O único local autorizado pela arquitectura a criar, atualizar e eliminar dados.
- `helpers.js`: Funções utilitárias que afetam o DOM de maneira controlada (`DOM.render`, `openModal`, `closeModal`) ou manipulam o UX (Toasts, formatação de Euros).
- `access.js`: Controlo rígido de acessibilidade e Role-Based Access Control (RBAC). Dita o que o Gestor vs o Cliente vê num projecto.

### 🔹 Automação e Domínio (`data/`)
- `mock.js`: Garante a injecção de estado base se a base de dados estiver vazia. Contém equipa base e templates paramétricos de Arquitetura.
- `domain.js`: O cérebro do produto arquitetónico puro. Executa o recálculo dos estados das fases do projeto quando há avanços de produção.
- `utils.js`: Helpers não associados a views: geradores de IDs universais, mapas de cores industriais para labels e tradutores de datas.

### 🔹 Módulo Core: Projetos (`modules/projects/`)
- `project-list.js`: Motor que renderiza, categoriza e filtra o catálogo de portfólio.
- `project-view.js`: A base do projeto aberto que abriga todos os separadores do contexto local (Injetor de Tabs).
- `project-phases.js`: **[Interface Operacional]** Grelha dedicada exclusivamente à lógica macro do ciclo de vida. Lista Fases, os seus entregáveis essenciais, tarefas e gere as ativações/aprovações de patamar através de modais curtos.
- **`project-documents.js`: [Unified Data Hub]** Concentra todos os uploads do projeto. Discrimina Fotografias e Documentos e associa ficheiros às devidas fases. Suporta filtragem por "Fase" ou "Nome".
- `project-visits.js`: O painel focado no exterior. Registo de deslocações e logs geográficos do trabalho de obra (Check-in's em obra).
- `project-financials.js` / `project-time.js` / `project-time-modal.js`: Componentes encarregues de fechar o ciclo logístico: Custos, Faturação programada, Honorários e Cronómetros.
- `project-pendencias.js`: Tarefas de prioridade visualizada (Tasks isoladas que fogem da rigidez de um "Entregável" protocolado).
- `project-messages.js` / `project-team.js`: Ferramentas colaborativas e diário do projeto partilhadas com membros.

### 🔹 Central do Estúdio (Outras Vistas)
- `dashboard.js`: Painel executivo inicial (Sumários, agenda pendente e cálculo de momentum).
- `calendario.js`: O motor analítico temporal. Une Num mapa mensal unificado e Gantt Horizontal Fases, Prazos de Tarefas e Visitas — fazendo reencaminhamento automático da data para a Tab individual correta no projeto.
- `geral.js`: A visão Omnisciente. "Quero ver Todas as Pendências do Gabinete" ou "Todos os tempos".
- `equipa.js`: Registo do escritório e gestão de credenciais para as construtoras e donos de obra colaborarem num determinado projeto.
- `portal.js`: A plataforma espelho da aplicação de acesso apenas a *Read-only* ou comentários do cliente final e sub-empreiteiros, com as devidas seguranças a esconder os bastidores.

### 🔹 Motor de Orçamentos (`modules/quotes/`)
- `quotes.js`: Engine que executa a formatação dos orçamentos, cotação por secções.
- `quote-presets.js`: Base de dados dos valores base do mercado de Arquitetura em vigor para agilizar propostas de clientes em 1 click.

---

## 🚀 Prontidão para Migração Cloudflare (Hono + SvelteKit Multi-Tenant SaaS)
**VEREDICTO: TOTALMENTE PRONTO PARA MIGRAÇÃO (READY-TO-PORT).**

O repositório completou os requisitos exigidos para funcionar como o primeiro sub-módulo orgânico do base SaaS com Cloudflare. A estrutura actual segue uma separação paradigmática intencional que resolve as falhas da migração:

1. **Separação Absoluta Estado/Vista/Mutação**: 
   - A camada lógica está separada na totalidade em blocos estanques. O ficheiro `core/mutations.js` pode ser desencaixado transformando-se 1:1 de chamadas assíncronas no frontend para a API baseada em **Hono**. As lógicas de "update", "delete", etc., traduzem instantaneamente para Controllers.
   - Os templates de visualização desvinculados de estado interno nas vistas facilitam a passagem em minutos para renderização hiper-reactiva do **Svelte 5** (`$props`, `$derived`, `$state`).

2. **Sanidade Relacional SQLite Pronta (`persistence.js` & `domain.js`)**:
   - Os objectos `localStorage` JSON operam debaixo de modelos rigorosamente validados e normalizados (Entregáveis, Fases vinculadas através de keys e arrays estritos). O `DB.get` e o `DB.set` podem ser transferidos verticalmente para um mapeamento relacional dentro de bases D1, beneficiando da transacionalidade Multi-Tenant. 

3. **Arquitetura "Module-First" Solidificada**:
   - Foram eliminadas redundâncias profundas no decorrer do trabalho. Em vez de duplicarmos UI complexa em Fases, os Ficheiros migraram definitivamente pro hub unificado de "Documentos". Menos peso visual → Menos componentes Svelte complexos e repetíveis de futuro. Fases é gerida agora exclusivamente com Modais em todo o lugar (mantendo a escalabilidade limpa).

4. **Design Tokens Nativo Cloudflare SaaS**:
   - O UI tem zero *hardcoded colors*. Está completamente adaptado ao `tokens.css` via design system industrial. Entrará na *Cloudflare Platform* com identidade perfeitamente sincronizada com a marca SaaS Core.

5. **Preparação Identity/Auth Cloudflare**:
   - Foram consolidados mecanismos passivos que utilizam e reagem a `APP.currentUser`. Quando ocorrer a passagem pro módulo do backend, o JWT será embutido naturalmente contra o sistema hierárquico provisto. 

Basta seguir a diretriz SaaS e empacotar este front-end purista para a suite Cloudflare.