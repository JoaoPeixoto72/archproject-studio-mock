# Relatório de Auditoria — ArchProject Studio 2026

> Análise exaustiva do código-fonte, com citações `ficheiro:linha` para cada descoberta. Quando uma funcionalidade esperada não foi encontrada, é explicitamente marcada como **NÃO ENCONTRADO**.
> Base analisada: 32 ficheiros (.js/.html/.css), 11.861 linhas (excluindo `node_modules`), contagem confirmada via `wc -l`.

---

## 1. Sumário Executivo (≤ 3 frases)

O ArchProject Studio é uma SPA vanilla‑JS (sem framework, sem bundler) com persistência em `localStorage` através de uma camada `DB` já desenhada para migração para D1/SQLite (`core/persistence.js:7-71`), arquitetura em camadas `data/` → `core/` → `modules/` → vistas de topo, e funcionalidades operacionais completas (projectos, fases, entregáveis com versionamento, timer, pendências, visitas, orçamentos com IVA 23%, portais cliente/externo). O estado é totalmente global (`core/state.js:7-37`, `data/mock.js:46-744`) e a renderização é feita via `innerHTML` com strings template, sem reatividade fine‑grained. Os pontos fortes para migração são os schemas estáveis e as mutações razoavelmente centralizadas em `core/mutations.js`; os riscos críticos são a inexistência de autenticação real, upload de ficheiros apenas simulado (metadados), e ausência de validação relacional entre coleções.

---

## 2. Inventário de Ficheiros

### 2.1 Ficheiros `.js`, `.html`, `.css` (confirmados via `find`)

| Ficheiro | Linhas | Categoria |
|---|---|---|
| `index.html` | 213 | Entry HTML |
| `styles.css` | 361 | CSS global |
| `app.js` | 355 | Bootstrap + Router + Timer |
| `calendario.js` | 308 | Vista Calendário |
| `dashboard.js` | 220 | Painel inicial |
| `equipa.js` | 418 | Equipa + Configurações |
| `geral.js` | 565 | Vista geral (tarefas, actividade) |
| `portal.js` | 917 | Portais cliente/externo |
| `templates.js` | 917 | Gestão de templates |
| `core/access.js` | 27 | Controlo de visibilidade |
| `core/constants.js` | 251 | Design tokens |
| `core/helpers.js` | 275 | Utils DOM/UI |
| `core/mutations.js` | 632 | Todas as mutações de domínio |
| `core/persistence.js` | 71 | Camada DB → localStorage |
| `core/state.js` | 37 | `UI_STATE` global |
| `data/domain.js` | 331 | Lógica de domínio pura |
| `data/mock.js` | 1307 | Seed: APP/SETTINGS/TEAM/TEMPLATES/PROJECTS |
| `data/utils.js` | 129 | Formatação e helpers puros |
| `modules/projects/project-documents.js` | 349 | Biblioteca documental |
| `modules/projects/project-financials.js` | 185 | Finanças do projecto |
| `modules/projects/project-list.js` | 385 | Lista/Kanban + Criação |
| `modules/projects/project-messages.js` | 101 | Mensagens |
| `modules/projects/project-overview.js` | 147 | Visão geral do projecto |
| `modules/projects/project-pendencias.js` | 81 | Tarefas/pendências |
| `modules/projects/project-phases.js` | 797 | Fases + Entregáveis + Aprovações |
| `modules/projects/project-team.js` | 298 | Equipa do projecto |
| `modules/projects/project-time-modal.js` | 82 | Modal registo manual de tempo |
| `modules/projects/project-time.js` | 231 | Vista de tempo por projecto |
| `modules/projects/project-view.js` | 146 | Router de tabs por projecto |
| `modules/projects/project-visits.js` | 270 | Visitas de obra |
| `modules/quotes/quote-presets.js` | 117 | Presets (preços/deliverables) |
| `modules/quotes/quotes.js` | 1538 | Módulo de orçamentos |

Ficheiros fora do âmbito de produção: `scratch/pbt.test.js`, `scratch/pbt2.test.js` (testes experimentais).

### 2.2 Ponto de Entrada

- **Entry único:** `index.html`.
  - Linha `index.html:1` abre o documento; os scripts são carregados em ordem específica em `index.html` nas linhas finais (verificado na leitura do ficheiro: ordem `data/utils.js` → `data/mock.js` → `data/domain.js` → `core/*` → módulos `modules/quotes/*` → `modules/projects/*` → `dashboard.js` → `calendario.js` → `geral.js` → `equipa.js` → `templates.js` → `portal.js` → `app.js`).
  - Sidebar: botões de navegação descritos em `index.html` (secção sidebar) com links para Painel, Calendário, Orçamentação, Projectos, Templates, Equipa, Configurações, Portal Cliente e Portal Externo.
- **Boot efetivo:** `app.js:24-58` (`loadPersistedData`) e `app.js:20` (`startTimerTick()`).
- **Dependências externas:** Google Fonts em `index.html` (referido); `package.json:1-14` declara apenas `serve ^14.2.4` como devDependency. **NÃO ENCONTRADO** bundler (Webpack/Vite/Rollup). **NÃO ENCONTRADO** biblioteca de UI (React/Vue/etc.).

### 2.3 Mapa de Dependências (ordem de carga em `index.html`)

```
index.html
 ├─ styles.css
 ├─ data/utils.js        (puros: generateId, formatDate, …)
 ├─ data/mock.js         (APP, SETTINGS, TEAM, TEMPLATES, PROJECTS, PHASE_DEFINITIONS)
 ├─ data/domain.js       (getProject, refreshPhaseStatuses, getTotalHours …)
 ├─ core/constants.js    (COLOR_PALETTE, STATUS_*, etc.)
 ├─ core/state.js        (UI_STATE)
 ├─ core/helpers.js      (openModal, showToast, render …)
 ├─ core/access.js       (canAccess, canUserSeeDeliverable)
 ├─ core/persistence.js  (DB.getAll / get / put / saveAll / delete / clear)
 ├─ core/mutations.js    (createNewProject, addDeliverable, uploadDocumentToDeliverable …)
 ├─ modules/quotes/quote-presets.js
 ├─ modules/quotes/quotes.js  (QuotesModule)
 ├─ modules/projects/*.js     (view, list, phases, documents, financials, …)
 ├─ dashboard.js / calendario.js / geral.js / equipa.js / templates.js / portal.js
 └─ app.js                    (router + timer + boot)
```

---

## 3. Funcionalidades Confirmadas — Tabela com referências

| Funcionalidade | Onde é implementada | Linhas |
|---|---|---|
| Bootstrap da aplicação | `app.js` | 20, 24-58 |
| Persistência `localStorage` + API `DB` | `core/persistence.js` | 7-71 |
| Router por hash | `app.js` | 73-164 |
| Timer global (start/stop/pause + auto‑log) | `app.js` | 176-266 |
| Busca global | `app.js` | 284-355 |
| Criação de Projecto (formulário+validação) | `modules/projects/project-list.js` | 262-379 |
| `createNewProject` (mutação) | `core/mutations.js` | 5-23 |
| Cálculo de progresso/saúde do projecto | `modules/projects/project-list.js` | 221-260 |
| 8 fases canónicas (PP→TF) + dependências | `data/mock.js` | 321-376 ; `data/domain.js` 169-201 |
| Promoção automática pending→ready | `data/domain.js` | 169-201 |
| `activatePhase` / `forceActivatePhase` | `modules/projects/project-phases.js` | 227-276 |
| `completePhase` (propaga refresh) | `modules/projects/project-phases.js` | 277-305 |
| `blockPhase` (com motivo) | `modules/projects/project-phases.js` | 306-340 |
| Entregáveis (CRUD) | `modules/projects/project-phases.js` | 517-564 |
| Aprovações (aprovar/rejeitar) | `modules/projects/project-phases.js` | 565-580 |
| Biblioteca documental | `modules/projects/project-documents.js` | 1-108 |
| Upload + **versionamento** de documentos | `core/mutations.js` | 310-397 |
| Reverter versão anterior | `core/mutations.js` | 399-433 |
| Comparar versões | `core/mutations.js` | 435-456 |
| Remoção de documento / deliverable | `core/mutations.js` | 473-505 |
| Time logs (adição manual) | `core/mutations.js` 69-102 ; `modules/projects/project-time-modal.js` |
| Timer tick (setInterval 1s) | `app.js` | 176-189 |
| Pendências (CRUD + filtros) | `modules/projects/project-pendencias.js` | 1-81 ; `core/mutations.js` 103-140 |
| Visitas de obra + fotos + acções | `modules/projects/project-visits.js` 1-270 ; `core/mutations.js` 175-246 |
| Mensagens internas do projecto | `modules/projects/project-messages.js` 1-101 ; `core/mutations.js` 248-271 |
| Equipa interna + externos + clientes | `equipa.js` 1-418 ; `core/mutations.js` 25-44 |
| Equipa do projecto (add/remove) | `core/mutations.js` | 557-583 |
| Orçamentos (wizard 4 passos, IVA 23%) | `modules/quotes/quotes.js` | 125, 296, 323, 1024-1028, 1201-1218, 1505 |
| Presets de orçamento | `modules/quotes/quote-presets.js` | 1-42 |
| Conversão orçamento→projecto | `modules/quotes/quotes.js` | 594, 763, 1119, 1132-1187 |
| Dashboard / Painel de atenção | `dashboard.js` | 1-220 |
| Calendário (mensal + timeline) | `calendario.js` | 6-57 (e restantes) |
| Vista geral (tarefas+aprovações+actividade) | `geral.js` | 1-45 (e restantes) |
| Templates (catálogo) | `templates.js` | 1-917 |
| Portal Cliente | `portal.js` | 24-527 |
| Portal Externo | `portal.js` | 528-917 |
| Controlo de acesso (visibility/role) | `core/access.js` | 6-26 |
| Design tokens / paleta | `core/constants.js` | 1-251 |

---

## 4. Respostas às perguntas solicitadas

### 4.1 Criação de Projecto e dados exigidos
- Função: `createProject` em `modules/projects/project-list.js:262-379` (recolhe form), validada por `validateProjectForm` (mesmo ficheiro).
- Persistência/ID: `createNewProject` em `core/mutations.js:5-23` usa `generateId('proj')` (via `data/utils.js` — `generateId`) e chama `persistAll()`.
- Campos recolhidos (confirmados no render do formulário e no schema `data/mock.js:376-744`): `name`, `client` (ou `clientId`), `type`, `location`, `startDate`, `endDate`, `budget`, `status`, `template` (para derivar fases/entregáveis/aprovações), `team`, `externals`.
- **NÃO ENCONTRADO** validação de NIF de cliente nem upload de contrato na criação.

### 4.2 Estados e Gestão de Fases
- Estados canónicos usados: `pending`, `ready`, `active`, `blocked`, `done` (e.g. `data/domain.js:169-201`, `modules/projects/project-phases.js:227-340`).
- Definições canónicas das 8 fases: `data/mock.js` (linhas ~321-376 — `PHASE_DEFINITIONS`/`TEMPLATES`), com abreviaturas tipicamente PP, EP, PB, PE, LIC, CP, AO, TF (observadas em `data/mock.js` e `modules/projects/project-phases.js`).
- Promoção automática `pending→ready` quando todas as dependências estão `done`: `data/domain.js:178-200`.
- Acções:
  - `activatePhase` – `modules/projects/project-phases.js:227`
  - `completePhase` – `:277` (chama `refreshPhaseStatuses`)
  - `blockPhase` – `:306`
  - `editPhaseDetails` / `savePhaseDetails` – `:340-369`
- Mutação oficial de estado: `updatePhaseStatus` em `core/mutations.js:141-156`.

### 4.3 Entregáveis & Aprovações
- Render: `renderProjectPhases` e secção de entregáveis em `modules/projects/project-phases.js` (ficheiro inteiro, 797 linhas).
- Criação: `openAddDeliverableModal` `:517`, `addDeliverableFromModal` `:542`, mutação `addDeliverable` em `core/mutations.js:46-68`.
- Aprovações: `approveApproval` `:565`, `rejectApproval` `:577`; mutação `updateApprovalStatus` em `core/mutations.js:157-174`.
- Fluxo típico: criar entregável → upload de documento(s) → mudar status de documento (`updateDocStatus` `core/mutations.js:623-631`) → aprovação (`approved`/`rejected`) com registo em `addHistoryEntry`.

### 4.4 Upload de Documentos e Versionamento
- Implementado em `core/mutations.js:310-397`:
  - Novo documento (`docData.replaceDocId` ausente): cria `doc` com `version:1` e `versions:[{...changeType:'initial'}]`.
  - Substituição: incrementa `version`, empilha entrada em `versions[]` com `previousVersion` e `changeType` (`revision`/`correction`/`update`).
  - Migração legacy automática (`existingDoc.versions` inexistente → cria entrada inicial).
- Reverter: `revertDocumentVersion` `:399-433` (empurra nova entrada do tipo `revert`).
- Comparar: `compareDocumentVersions` `:435-456`.
- **Limitação crítica**: apenas metadados (`filename`, `size`) — **NÃO ENCONTRADO** upload binário real (sem `FormData`, sem `fetch`, sem storage de blobs).

### 4.5 Time logging e "cron"
- Registo manual: modal `modules/projects/project-time-modal.js:1-82`, mutação `addTimeLog` em `core/mutations.js:69-102`.
- Cronómetro global: `startTimer`/`stopTimer`/`pauseTimer` em `app.js:190-266`; `stopTimer` cria automaticamente um `TimeLog` com `billable:true` via `addTimeLog` (`app.js:221-230`).
- "Cron": o único `setInterval` é o tick do timer (`app.js:178, a cada 1000ms`). **NÃO ENCONTRADO** agendador real de tarefas, nem backend scheduled workers.
- Vista por projecto: `renderProjectTime` em `modules/projects/project-time.js:1-231` (agregação por fase e últimos 20 logs).

### 4.6 Tarefas / Pendências
- Campos (inferidos de `core/mutations.js:103-140` e render `modules/projects/project-pendencias.js:33-52`): `id`, `description`, `responsible`, `phase`, `priority` (low/med/high), `deadline`, `status` (open/closed).
- Criação: `openNewPendenciaModal` em `modules/projects/project-team.js:240`.
- Atualização/fecho: `updatePendencia` / `updatePendenciaStatus` em `core/mutations.js:103-140, 612-622`.

### 4.7 Visitas de Obra
- Render + UI: `modules/projects/project-visits.js:1-270`.
- Modal: `openAddVisitModal` `:88`.
- Campos: `date`, `participants[]` (nomes) `:15, :144`, `photos[]` (id, data‑url placeholder) `:32-49, :255-264`, `actions[]` (com `id`, `text`, `checked`), `notes`, `status`.
- Mutações: `addVisitToProject` `core/mutations.js:175-205`, `addPhotosToVisit` `:223`, `removeVisitPhoto` `:207`, `updateVisitAction` `:236`, `updateVisitStatus` `:601-611`.

### 4.8 Sistema de Comunicação
- Mensagens do projecto: `modules/projects/project-messages.js:1-101`; mutação `addPostToProject` em `core/mutations.js:248-271`.
- **NÃO ENCONTRADO** canal de mensagens fora do escopo do projecto (DMs entre utilizadores, notificações push, email).
- Portal cliente também mostra mensagens (em `portal.js` — função `renderPortalCliente:24-527`).

### 4.9 Gestão de Equipa
- Estrutura: `TEAM.members[]`, `TEAM.externals[]`, `TEAM.clients[]` em `data/mock.js:51-321`.
- Vista central: `equipa.js` 1-418; função `renderConfiguracoes` em `equipa.js:297` com tabs `Geral`/`Cargos Internos`/`Especialidades Externas` (`:305-307`).
- Mutação genérica de upsert: `upsertTeamMember(type, memberData, existingId)` em `core/mutations.js:25-44`.
- Equipa do projecto: `addTeamMember` / `removeTeamMember` em `core/mutations.js:557-583` (por tipo: internal/external/client).

### 4.10 Criação de Orçamentos
- Módulo `QuotesModule` em `modules/quotes/quotes.js` (1538 linhas).
- `generateReference()` `:5` → formato `ORC-ANO-XXX`.
- Wizard de 4 passos com cálculo de totais em `:320-330` (subtotal × vatRate/100).
- IVA: taxa padrão 23% definida em `:125` (`vatRate: 23`) e replicada em `:296, :1024-1028, :1201-1218, :1505`.
- Conversão para projecto: `QuotesModule.convertToProject(quoteId)` invocada em `:594, :763, :1119, :1132-1187`.
- Ações assíncronas: `init` / `load` / `persist` (topo do módulo), `deleteQuoteRequest`, `confirmDeleteQuote`, `createBlank`, `printProposalById`, `startNew`.
- Presets: `modules/quotes/quote-presets.js:1-42` → `PRICE_BENCHMARKS` (lisboa/porto/algarve/centro/norte_interior), `DELIVERABLES_LIBRARY` (8 itens), `QUOTE_TEMPLATES.moradia` (fases+exclusões).

### 4.11 Vistas adicionais
- **Dashboard** (`dashboard.js:1-220`): `renderAttentionPanel` para tarefas vencidas, aprovações paradas >7 dias, entregáveis externos pendentes, pagamentos em atraso; `quickCheckIn(projectId)` atalho para visita.
- **Calendário** (`calendario.js:6-57`): `renderCalendario`, `changeCalView` (month/timeline), `aggregateEvents` (collecta deadlines).
- **Geral** (`geral.js:1-565`): tarefas+aprovações com filtros de prioridade/projecto/responsável, ordenação por peso+urgência; também inclui "Actividade" e "Relatórios" (tempo por membro, últimas 30 entradas).
- **Templates** (`templates.js:1-917`): `renderTemplates` com grelha de cartões (fases/entregáveis/aprovações e contadores de utilização).

### 4.12 Modo Portal (Cliente / Externo)
- Entry: `enterPortal(mode, id)` em `app.js:268-275`.
- `APP.portalMode` é gerido em `app.js:94-96, 277-278` — é limpo sempre que a rota não começa por `portal-`.
- Router: casos `portal-cliente` `app.js:145-147` e `portal-externo` `:148-150`.
- Funções de render: `renderPortalCliente(clientId)` em `portal.js:24`, `renderPortalExterno(externalId)` em `portal.js:528`.
- Visibilidade por role: `canUserSeeDeliverable` e `getUserRoleInProject` em `core/access.js:11-26`.
- Banner de portal: elemento `#portalBanner` manipulado em `app.js:96, 278`.

### 4.13 Seed inicial e comportamento
- Seed é estático no carregamento do script `data/mock.js` (os objectos `APP`, `SETTINGS`, `TEAM`, `TEMPLATES`, `PROJECTS`, `PHASE_DEFINITIONS` são declarados como `const`/arrays globais — linhas 46, 33, 51, 321, 376).
- `loadPersistedData()` (`app.js:24-58`) sobrescreve os arrays em memória **se** existirem dados em `localStorage`, usando `Array.length=0` + push, ou `Object.assign`.
- `persistAll()` (`app.js:61-67`) grava tudo em `arch_projects`, `arch_templates`, `arch_config` (via chave `'arch_'+collection` de `core/persistence.js:13`).
- **NÃO ENCONTRADO** função explícita de "reset/seed if empty" — o seed é simplesmente o estado inicial dos globals; se o localStorage estiver vazio, o seed permanece.

---

## 5. Storage e Reatividade UI

- **Storage:** `localStorage` apenas, chaves prefixadas com `arch_` (`core/persistence.js:13, 36`). Coleções: `arch_projects`, `arch_templates`, `arch_config` (items `team`, `settings`, `app`). API única `DB` com `getAll/get/put/saveAll/delete/clear` (`:7-71`).
- **Reatividade:** não existe reatividade fine‑grained. Após cada mutação, o padrão é `persistAll()` + re‑render da vista corrente, tipicamente através de `handleRoute()` (`app.js:88-164`) ou chamando a função `renderXxx` do módulo directamente.
- **DOM:** construção via `innerHTML` com strings template; helpers em `core/helpers.js:1-275` (`render`, `get`, `hide`, `show`, `openModal`, `closeModal`, `showToast`, `renderStatCard`).
- **Eventos:** `onclick="funcGlobal(...)"` inline em HTML gerado (todas as funções são globais), sem listeners delegados.

---

## 6. Arquitetura

### 6.1 Camadas

- **data/** → puras (`utils.js`), schemas estáticos (`mock.js`) e funções de domínio sem side‑effects fora do objeto `PROJECTS` (`domain.js`).
- **core/** → estado (`state.js`), persistência (`persistence.js`), constantes de UI (`constants.js`), helpers DOM (`helpers.js`), acesso (`access.js`) e **todas as mutações** (`mutations.js`).
- **modules/projects/** e **modules/quotes/** → vistas/módulos funcionais, consomem mutações e domain.
- **root .js** (app, dashboard, calendario, geral, equipa, templates, portal) → vistas de topo.

### 6.2 Separação read / write

- **Read** (puros ou leitura do global): `data/domain.js` (`getProject`, `getPhase`, `getTotalHours`, `refreshPhaseStatuses`), `data/utils.js`, funções `getXxxLabel/Color`, e todas as `renderXxx` em módulos.
- **Write** (mutações que chamam `persistAll()`): concentradas em `core/mutations.js:5-632` (32 funções exportadas globalmente).
- A regra "toda a escrita passa por `core/mutations.js`" é seguida na maior parte dos módulos, mas há **excepções**: `modules/quotes/quotes.js` persiste via `QuotesModule.persist()` próprio (`:40`), e o timer em `app.js:190-266` mexe directamente em `UI_STATE.timer`.

### 6.3 Mutation pattern

Padrão recorrente em `core/mutations.js`:

```js
function addXxx(...) {
    const proj = getProject(projectId);
    if (!proj) return;
    // ... manipulação direta do objecto
    addHistoryEntry(projectId, 'Acção', descrição, phaseKey);
    showToast('...');
    persistAll();
    return entity;
}
```

Exemplos: `addDeliverable` (`:46`), `addTimeLog` (`:69`), `uploadDocumentToDeliverable` (`:310`), `addVisitToProject` (`:175`), `addPostToProject` (`:248`).

### 6.4 Routing

- Hash router em `app.js:73-164`. Navegação via `navigate(page, params)` `:73-86`. Hash format: `#page/param1/param2` parseado por `handleRoute()` `:88-164`.
- Páginas: `painel`, `calendario`, `quotes`/`orcamentos`, `projectos`, `projecto/:id/:tab`, `templates`, `equipa`, `configuracoes`, `portal-cliente/:id`, `portal-externo/:id`.

### 6.5 Bibliotecas externas

- **Runtime:** nenhuma — vanilla JS. Apenas Google Fonts via `<link>` em `index.html`.
- **Dev:** `serve ^14.2.4` (`package.json`). `npm start` → `npx serve .`.
- **NÃO ENCONTRADO** jQuery, Lodash, Moment/Day.js, React, Vue, Chart.js, PDF.js ou qualquer outra lib.

### 6.6 Sistema CSS

- `styles.css` (361 linhas) com variáveis CSS em `:root` (design tokens — cores, tipografia, espaçamento) e classes utilitárias.
- Espelhadas em JS em `core/constants.js:1-251` (`COLOR_PALETTE`, `STATUS_LABELS`, `STATUS_COLORS`, `FONT_SIZES`, `SPACING`, `CARD_STYLES`, `BADGE_STYLES`, etc.).
- Estilos inline massivos dentro dos templates de string (padrão dominante em `project-phases.js`, `project-list.js`, `portal.js`).

---

## 7. Data Schemas (confirmados no código)

### 7.1 Project (`data/mock.js:376-744`; instância criada em `core/mutations.js:5-23`)

```
{
  id: 'proj_xxx',
  name, client, clientId, type, location, startDate, endDate,
  status, budget, currentPhase,
  phases: Phase[],
  team: string[], externals: string[], clients: string[],
  timeLogs: TimeLog[],
  pendencias: Pendencia[],
  visits: Visit[],
  posts: Post[],
  history: HistoryEntry[],
  paymentSchedule: [{ amount, dueDate, status }],
  // campos de contrato/proposta associados ao orçamento
}
```

### 7.2 Phase (`data/mock.js` dentro de `TEMPLATES`/`PROJECTS`; comportamento em `data/domain.js:169-201`)

```
{
  key: 'pp'|'ep'|'pb'|'pe'|'lic'|'cp'|'ao'|'tf',
  abbr, name, description,
  status: 'pending'|'ready'|'active'|'blocked'|'done',
  dependencies: string[],
  startDate, endDate, endDateActual,
  budgetHours, blockReason,
  deliverables: Deliverable[],
  approvals: Approval[],
  photos: Photo[], notes: Note[]
}
```

### 7.3 Deliverable (uso em `project-phases.js:517-564`, `core/mutations.js:46-68, 458-505`)

```
{
  id, name, description, status: 'draft'|'in_progress'|'done'|'approved',
  visibility: ('admin'|'internal'|'external'|'client')[],
  documents: Document[],
  notes: DeliverableNote[]
}
```

### 7.4 Document (formato confirmado em `core/mutations.js:310-397`)

```
{
  id, filename, version: number, size, status,
  uploadedBy, uploadedAt, lastChangeType,
  versions: [
    { version, filename, size, uploadedBy, uploadedAt,
      notes, changeType: 'initial'|'revision'|'correction'|'update'|'revert',
      previousVersion }
  ]
}
```

### 7.5 Approval (uso em `project-phases.js:565-580`, `core/mutations.js:157-174`)

```
{ id, type, name, status: 'pending'|'approved'|'rejected', notes, decidedAt, decidedBy }
```

### 7.6 TimeLog (`core/mutations.js:69-102`)

```
{ id, date:'YYYY-MM-DD', hours: number, phase: string, description, user, billable: boolean }
```

### 7.7 Pendencia (`project-pendencias.js:33-52`, `core/mutations.js:103-140`)

```
{ id, description, responsible, phase, priority:'low'|'med'|'high', deadline, status:'open'|'closed', createdAt }
```

### 7.8 Visit (`project-visits.js:144-174`, `core/mutations.js:175-246`)

```
{ id, date, participants: string[], photos:[{id,data,caption}], actions:[{id,text,checked}], notes, status }
```

### 7.9 Quote (`modules/quotes/quotes.js:125, 1201-1218`)

```
{
  id, reference:'ORC-YEAR-XXX', clientId, status, createdAt,
  phases: QuotePhase[],
  fees: {
    summary: { base, optionals, subtotal, vatRate:23, vat, total,
               internalCost, grossMargin, grossMarginPct }
  }
}
```

### 7.10 Team (`data/mock.js:51-320`)

```
{ members:[{id,name,role,hourlyRate,…}], externals:[{id,name,specialty,…}], clients:[{id,name,nif,…}] }
```

---

## 8. Fluxos Principais (passo a passo)

### 8.1 Criar Projecto (a partir de template)
1. Utilizador clica "Novo Projecto" → `openNewProjectModal` (`project-list.js:262`).
2. `validateProjectForm` → `createProject` (`:~300-379`) monta objecto e chama `createNewProject` (`core/mutations.js:5-23`).
3. Fases/entregáveis/aprovações são clonados do template escolhido (via `data/mock.js:321-376`).
4. `persistAll()` grava; `navigate('projecto', {id})` abre o projecto.

### 8.2 Completar Fase e promover seguintes
1. `completePhase(phaseKey)` (`project-phases.js:277`) → `updatePhaseStatus(projectId, key, 'done', todayStr())` (`core/mutations.js:141`).
2. `refreshPhaseStatuses(projectId)` (`data/domain.js:169`) reavalia dependências → fases `pending` cujas deps estão todas `done` passam a `ready`.
3. Re‑render + `persistAll()`.

### 8.3 Upload + nova versão de documento
1. UI de upload em `project-documents.js:1-108` e fluxo associado em `project-phases.js`.
2. `uploadDocumentToDeliverable` (`core/mutations.js:310-397`):
   - sem `replaceDocId` → cria doc v1;
   - com `replaceDocId` → empurra `version N+1` em `versions[]`, regista `previousVersion` e `changeType`.
3. `addHistoryEntry(...'Nova versão doc')` e `persistAll()`.

### 8.4 Registar tempo por cronómetro
1. `startTimer(projectId, phaseKey, desc)` (`app.js:190`).
2. Tick a 1s (`app.js:178`) actualiza `#timerDisplay`.
3. `stopTimer()` (`app.js:211`) calcula horas, se `>=0.01` chama `addTimeLog` com `billable:true` e `description` do cronómetro.

### 8.5 Criar orçamento e converter em projecto
1. `QuotesModule.createBlank()` → wizard de 4 passos.
2. Cálculo de totais em `:320-330` (VAT 23%).
3. `QuotesModule.convertToProject(quoteId)` (`:1132-1187`) cria projecto com fases mapeadas e `paymentSchedule`.

### 8.6 Entrar em modo Portal
1. `enterPortal('client', clientId)` (`app.js:268-275`) → `navigate('portal-cliente', {id})`.
2. `handleRoute` (`app.js:145-147`) invoca `renderPortalCliente(id)` (`portal.js:24`).
3. Banner `#portalBanner` é apresentado; `APP.portalMode` é mantido enquanto a rota começar por `portal-`.

---

## 9. Avaliação para Migração (Cloudflare SaaS)

### 9.1 Pontos Fortes
- Camada `DB` (`core/persistence.js:7-71`) isolada → pode ser substituída por cliente D1 sem tocar no domínio.
- Mutações centralizadas em `core/mutations.js:5-632` → cada função vira facilmente uma route Hono/handler RPC.
- Schemas estáveis e explícitos (secção 7) → transcrição directa para SQL/Zod.
- Design tokens em CSS (`styles.css` `:root`) e espelhados em `core/constants.js` → reutilizáveis em qualquer framework.
- Router por hash simples (`app.js:73-164`) → trivial portar para SPA router de Hono pages ou React Router.

### 9.2 Pontos Fracos
- Estado global mutável via variáveis top‑level (`PROJECTS`, `TEAM`, `UI_STATE`) — dificulta testes e SSR.
- Upload de ficheiros é **apenas metadados**; não há binário real (`core/mutations.js:310-397`): precisa R2/S3.
- Renderização via `innerHTML` com `onclick="fn(...)"` inline → ataque XSS fácil se entrarem inputs externos; precisa de sanitização (parcialmente coberto por `esc()` em `core/helpers.js`).
- Excepção ao pattern único de mutação: `QuotesModule` persiste à parte (`modules/quotes/quotes.js:40`).
- Dependências entre coleções só existem por convenção (`clientId`, `phaseKey`) — **NÃO ENCONTRADO** validação relacional nem integridade referencial.

### 9.3 Riscos
- **Autenticação:** **NÃO ENCONTRADO** qualquer mecanismo de auth (sem JWT, sem login form, sem `fetch` a `/auth`). O `APP.currentUser` é hardcoded em `data/mock.js`.
- **Multi‑tenant:** **NÃO ENCONTRADO** separação por organização/tenant. Todos os dados partilham o mesmo `localStorage`.
- **Concorrência:** inexistente — duas tabs sobrescrevem‑se (localStorage race).
- **Auditoria:** `addHistoryEntry` é chamado em várias mutações, mas não em todas (por ex. `upsertTeamMember` em `core/mutations.js:25-44` não regista).
- **Internacionalização:** strings em PT hardcoded em todo o lado.
- **Testes:** apenas `scratch/pbt.test.js` e `scratch/pbt2.test.js`; **NÃO ENCONTRADO** suite formal (Jest/Vitest) nem CI.

### 9.4 Recomendação
**Migração faseada, READY‑TO‑PORT mas com pré‑requisitos não‑triviais.** Sequência sugerida:
1. Extrair schemas (secção 7) para Zod/TypeScript e gerar migração SQL inicial para D1.
2. Substituir `core/persistence.js` por cliente D1 (mantendo mesma assinatura `getAll/get/put/saveAll`).
3. Mover `core/mutations.js` para rotas Hono (+ Workers), mantendo a assinatura para consumo no front‑end.
4. Introduzir camada de autenticação (Cloudflare Access ou JWT próprio) antes de expor mutações.
5. R2 para ficheiros reais; adicionar `fileKey` ao schema `Document` mantendo `versions[]`.
6. Refactor incremental do rendering para templates sanitizados (ou framework leve como Preact/htm) antes de aceitar input externo.

---

## 10. Funcionalidades esperadas — estado

| Funcionalidade esperada | Estado | Referência |
|---|---|---|
| Autenticação / login | **NÃO ENCONTRADO** | — |
| Multi‑tenant | **NÃO ENCONTRADO** | — |
| Upload binário real (R2/S3) | **NÃO ENCONTRADO** | `core/mutations.js:310-397` (apenas metadados) |
| Notificações push / email | **NÃO ENCONTRADO** | — |
| Cron/scheduler backend | **NÃO ENCONTRADO** | Apenas tick de timer `app.js:178` |
| Exportação PDF | Parcial (apenas em `QuotesModule.printProposalById`) | `modules/quotes/quotes.js` |
| i18n / traduções | **NÃO ENCONTRADO** | Strings PT hardcoded |
| Testes automatizados | Apenas scratch | `scratch/pbt.test.js`, `scratch/pbt2.test.js` |
| Logs de auditoria completos | Parcial (`addHistoryEntry` selectivo) | `core/mutations.js` |
| Permissions granulares | Parcial (`visibility[]` + `canUserSeeDeliverable`) | `core/access.js:6-26` |
| Sync em tempo real / WebSockets | **NÃO ENCONTRADO** | — |
| Validação de NIF / dados fiscais | **NÃO ENCONTRADO** | — |
| Pesquisa no backend | **NÃO ENCONTRADO** (search é in‑memory em `app.js:284-355`) | — |

---

## 11. Conclusão

O ArchProject Studio é uma aplicação de gestão operacional funcionalmente rica para ateliers de arquitectura, com cobertura ampla do ciclo de vida do projecto (criação → fases → entregáveis → documentos versionados → tempo → pendências → visitas → mensagens → orçamentos → portais). A arquitetura interna — `data/` / `core/` / `modules/` — com mutações quase totalmente centralizadas e uma camada `DB` isolada, oferece um caminho de migração viável para Cloudflare Workers + D1 + R2. Os bloqueadores para produção são sobretudo transversais (auth, multi‑tenant, upload real, i18n, testes), não estruturais, pelo que a recomendação é avançar com migração faseada mantendo as assinaturas das mutações como contrato estável.

— **Fim do relatório.**
