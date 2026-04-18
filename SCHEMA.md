# ArchProject Studio - Modelo de Dados (Schema)

Este documento descreve as entidades centrais do sistema, sua estrutura de campos, relações e persistência, com base nos ficheiros `data/mock.js` e funções em `core/mutations.js`.

---

### Entity: APP (Configuração Global)

**Criada em:** `data/mock.js` (Seed Inicial)
**Renderizada em:** Múltiplas views (ex: header, dashboard.js)
**Parent:** Root
**Stored in:** `APP` (volátil)

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| name | string | sim | 'ArchProject' | — | Nome da aplicação |
| office | object | sim | — | — | Detalhes como name, address, nif, phone, email, logo |
| currentUser | object | sim | — | — | Contém { id, name, role, email } do utilizador actual |
| portalMode | string \| null | não | null | null, 'client', 'external' | Se null, é vista interna/gabinete |
| displayMode | string | sim | 'simple' | 'simple', 'full' | Controla nível de detalhe na UI, lido via `isFullMode()` |

---

### Entity: UI_STATE (Estado Volátil da Interface)

**Criada em:** `core/state.js`
**Renderizada em:** Todo o lado (controla rotas e abas ligadas)
**Parent:** Root
**Stored in:** `UI_STATE` (não persistido)

| Campo | Tipo | Notas |
|-------|------|-------|
| currentPage | string | 'painel', 'projectos', 'equipa', 'templates', 'orcamentos', 'geral' |
| currentProjectId | string \| null | ID do projecto actualmente aberto |
| currentProjectTab | string | 'visao-geral', 'fases', 'documentos', etc. |
| currentPhaseKey | string \| null | Fase seleccionada na vista |
| timer | object | Contém { interval, running, seconds, projectId, phaseKey, startTime } |
| search | object | Contém estado da modal de pesquisa |
| (Outros) | object | Filtros e estados locais (calendar, docFilter, etc.) |

---

### Entity: Project

**Criada em:** `core/mutations.js` → `createNewProject()`
**Renderizada em:** `project-list.js`, `project-overview.js`, `project-view.js`
**Parent:** Root
**Stored in:** `PROJECTS[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | generateId('PRJ') | — | |
| name | string | sim | — | — | |
| client | string | sim | — | — | ID de Client |
| location | string | não | — | — | |
| typology | string | não | — | — | |
| area | number | não | — | — | |
| budget | number | não | — | — | Orçamento previsto pelo cliente |
| budgetSpent | number | não | — | — | Gasto até ao momento |
| status | string | sim | 'active' | active, completed, archived, on-hold | |
| currentPhaseKey | string | sim | — | (keys das Phases) | Fase actual focada |
| templateUsed | string | não | — | — | ID do Template (se usado na criação) |
| createdAt | string | sim | todayStr() | — | Formato ISO AAAA-MM-DD |
| team | object | sim | — | { members:[], externals:[], clients:[] } | Arrays de IDs |
| phases | array | sim | [] | — | Array de objectos Phase |
| visits | array | não | [] | — | Array de objectos Visit |
| timeLogs | array | não | [] | — | Array de objectos TimeLog |
| pendencias | array | não | [] | — | Array de objectos Pendencia |
| posts | array | não | [] | — | Array de objectos Post (Mensagens internas) |
| history | array | não | [] | — | Registo de actividade (max 200) |

---

### Entity: Phase

**Criada em:** Cópia de `PHASE_DEFINITIONS` via `buildPhasesFromSource` em `core/helpers.js`
**Renderizada em:** `project-phases.js`, `project-overview.js`
**Parent:** Project
**Stored in:** `PROJECTS[].phases[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| key | string | sim | — | ex: 'pp', 'ep', 'ap' | Identificador único dentro do projecto |
| abbr | string | sim | — | ex: 'PP', 'EP' | Usada em Badges |
| name | string | sim | — | — | |
| description| string | não | — | — | |
| order | number | sim | consecutiva | — | Para ordenação |
| dependencies| array | não | [] | — | Array de keys de outras Phases |
| status | string | sim | 'pending' | pending, ready, active, blocked, done | Actualizado via `refreshPhaseStatuses` / manual |
| startDate | string\|null| não | null | — | |
| endDate | string\|null| não | null | — | Previsão |
| endDateActual| string\|null| não | null | — | Data real de fecho |
| budgetHours| number | não | 0 | — | Estimativa de horas |
| deliverables| array | não | [] | — | Array de Deliverables |
| approvals | array | não | [] | — | Array de Approvals |
| photos | array | não | [] | — | Fotos anexadas à fase |
| notes | array | não | [] | — | Notas anexadas à fase |

---

### Entity: Deliverable (Entregável)

**Criada em:** `core/mutations.js` → `addDeliverable()` (agora `addDeliverableFromModal` e mutação central)
**Renderizada em:** `project-phases.js`, `project-documents.js` (ao listar docs do entregável)
**Parent:** Phase
**Stored in:** `PROJECTS[].phases[].deliverables[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | generateId('del') | — | |
| name | string | sim | — | — | |
| description| string | não | '' | — | |
| status | string | sim | 'pending' | pending, in-progress, in-review, approved, done | |
| responsible| string\|null| não | null | — | ID do membro responsável |
| visibility | array | sim | ['admin', 'member']| 'admin', 'member', 'external', 'client' | Controlo de acesso no portal |
| documents | array | não | [] | — | Array de Documents |
| notes | array | não | [] | — | Array de Notas do entregável |

---

### Entity: Document (com Versioning)

**Criada em:** `core/mutations.js` → `uploadDocumentToDeliverable()`
**Renderizada em:** `project-documents.js`
**Parent:** Deliverable
**Stored in:** `PROJECTS[].phases[].deliverables[].documents[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | generateId() | — | |
| filename | string | sim | — | — | |
| version | number | sim | 1 | — | Incrementa a cada nova versão |
| uploadedBy | string | sim | currentUser | — | ID do utilizador |
| uploadedAt | string | sim | todayStr() | — | |
| size | string | não | '' | — | |
| status | string | sim | 'draft' | draft, in-review, shared, approved, obsolete | |
| lastChangeType| string | sim | 'initial' | initial, revision, correction, update, revert | |
| versions | array | sim | [] | — | Histórico completo de versões deste documento |

#### Estrutura de sub-versões (`versions[]`):
Cada objecto em `versions` tem `{ version, filename, uploadedBy, uploadedAt, size, notes, changeType, previousVersion, revertedFrom? }`.

---

### Entity: Approval

**Criada em:** Template (`data/mock.js`) -> Phase
**Renderizada em:** `project-phases.js`
**Parent:** Phase
**Stored in:** `PROJECTS[].phases[].approvals[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | generateId() | — | |
| type | string | sim | 'client' | client, technical, external, council, internal | |
| name | string | sim | — | — | Ex: "Aprovação do programa pelo cliente" |
| status | string | sim | 'pending' | pending, approved, rejected | Actualizado via `updateApprovalStatus` |
| submittedAt| string\|null| não | null | — | Data submissão |
| respondedAt| string\|null| não | null | — | Data resposta |
| respondedBy| string\|null| não | null | — | ID de quem respondeu |
| notes | string | não | '' | — | Justificação/nota da aprovação ou rejeição |

---

### Entity: TimeLog (Registo de Tempo)

**Criada em:** `core/mutations.js` → `addTimeLog()`
**Renderizada em:** `project-time.js`
**Parent:** Project
**Stored in:** `PROJECTS[].timeLogs[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | generateId() | — | |
| user | string | sim | currentUser | — | ID do membro |
| date | string | sim | todayStr() | — | |
| hours | number | sim | — | — | Em formato decimal (ex: 1.5 = 1h30m) |
| phase | string | sim | — | — | Key da Phase (`phaseKey`) |
| description| string | sim | — | — | |
| billable | boolean| sim | true | — | Se o tempo será facturado ao cliente |

---

### Entity: Pendência (Tarefa)

**Criada em:** `core/mutations.js` → `addPendencia()`
**Renderizada em:** `project-pendencias.js`, `geral.js` (Aba Tarefas)
**Parent:** Project
**Stored in:** `PROJECTS[].pendencias[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | generateId() | — | |
| description| string | sim | — | — | |
| priority | string | sim | 'medium' | low, medium, high | |
| responsible| string\|null| não | null | — | ID do membro responsável |
| deadline | string\|null| não | null | — | Data formato ISO |
| status | string | sim | 'open' | open, closed | |
| phase | string\|null| não | null | — | Key da Phase relacionada |
| createdAt | string | sim | todayStr() | — | |

---

### Entity: Visit

**Criada em:** `core/mutations.js` → `addVisitToProject()`
**Renderizada em:** `project-visits.js`
**Parent:** Project
**Stored in:** `PROJECTS[].visits[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | generateId() | — | |
| date | string | sim | todayStr() | — | |
| participants| array | sim | [] | — | Array de IDs de Membros/Externos/Clientes |
| notes/summary| string | não | '' | — | Descrição longa ou sumário da visita |
| status | string | sim | 'completed'| completed, draft, pending | |
| photos | array | não | [] | — | Array de `{ id, filename, date, uploadedBy, description? }` |
| actions | array | não | [] | — | Array de `{ id, description, status ('open'/'done'), responsible }` |

---

### Entity: Post (Message / Comunicação)

**Criada em:** `core/mutations.js` → `addPostToProject()`
**Renderizada em:** `project-messages.js`
**Parent:** Project
**Stored in:** `PROJECTS[].posts[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | generateId() | — | |
| date | string | sim | todayStr() | — | |
| content | string | sim | — | — | Conteúdo HTML/Texto |
| user | string | sim | currentUser | — | ID do autor (`authorId`) |
| phaseKey | string\|null| não | null | — | Ligação opcional a fase |
| internal | boolean| sim | true | — | Se visível apenas internamente ou também portal |

---

### Entity: HistoryEntry

**Criada em:** `core/mutations.js` → `addHistoryEntry()`
**Renderizada em:** `project-overview.js` (Secção de Actividade), `geral.js`
**Parent:** Project
**Stored in:** `PROJECTS[].history[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| date | string | sim | — | — | Data no formato ISO (YYYY-MM-DD) ou timestamp |
| user | string | sim | currentUser | — | ID de quem realizou a acção |
| action | string | sim | — | — | Tipo curto: 'Criou projecto', 'Registou visita' |
| detail | string | sim | — | — | Detalhes em texto legível |
| phase | string\|null| não | null | — | Key da Phase se a acção estiver ligada a uma fase |

---

### Entity: TeamMember / External / Client

**Criada em:** `core/mutations.js` → `upsertTeamMember()`
**Renderizada em:** `equipa.js`, `project-team.js`
**Parent:** Root
**Stored in:** `TEAM.members[]`, `TEAM.externals[]`, `TEAM.clients[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | generateId('u\|e\|c') | — | |
| name | string | sim | — | — | |
| email | string | sim | — | — | |
| phone | string | não | — | — | |
| projects | array | sim | [] | — | IDs de Projectos associados (apenas members/externals) |
| project | string | não | — | — | ID de Projecto (clientes no mock atual. Futuro: Múltiplos) |
| role | string | (members)| — | admin, member | Access Control |
| function | string | (members)| — | — | Ex: 'Director / Arquitecto Principal' |
| specialty| string | (external)| — | — | Ex: 'Estabilidade', 'Topografia' |
| company | string | (external)| — | — | Empresa terceira |

---

### Entity: Template

**Criada em:** (Não há mutação central no mock, mas existe UI em `templates.js`)
**Renderizada em:** `templates.js`
**Parent:** Root
**Stored in:** `TEMPLATES[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | — | — | |
| name | string | sim | — | — | Ex: "Moradia Unifamiliar" |
| description| string | não | — | — | |
| createdAt | string | sim | — | — | |
| updatedAt | string | sim | — | — | |
| phases | array | sim | [] | — | Cópia do array padrão `PHASE_DEFINITIONS` c/ modificações de template |

---

### Entity: QUOTE (Orçamento)

**Criada em:** Actions no módulo `quotes.js` (Muta `QUOTES` global)
**Renderizada em:** `quotes.js`, renderização e PDF
**Parent:** Root
**Stored in:** `QUOTES[]`

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | — | — | Ex: 'QT-1700000001' |
| reference| string | sim | — | — | Ex: 'ORC-2026-001' |
| version | number | sim | 1 | — | Incrementa por revisão |
| status | string | sim | 'draft' | draft, sent, accepted, rejected | |
| createdAt| string | sim | — | — | Formato ISO DateTime |
| projectId| string\|null| não | null | — | Relacionamento (se originou projeto) |
| client | object | sim | — | — | { name, email, phone, nif } |
| brief | object | sim | — | — | Resumo (nome, tipo, área, qualidade, orçamento cliente) |
| scope | object | sim | — | — | Define fases cobertas, exclusions, assumptions |
| fees | object | sim | — | — | Modelo comercial, resumo total, horas (hourly vs fixed) |
| proposal | object | sim | — | — | Intro, legal notes |

### ⚠️ Inconsistências Detectadas

1. **Dependência em Mutações Diretas:** Em `mock.js` e código do projeto, ficheiros mutam objetos globais como `PROJECTS` ou `TEAM` sem sempre passar por `mutations.js` (ex. em Quotes). Todas as salvações devem ser consolidadas posteriormente.
2. **Propriedades Opcionais em Phase:** `deliverables` e `approvals` no mock `PHASE_DEFINITIONS` inicial usam prefixo `defaultDeliverables` e ao gerar no projecto perdem "default".
3. **Array de Documents versão:** Documentos no Deliverables usam array `versions`, mas `changeType` e as regras de fallback por vezes assumem 'initial', porém dados passados não o implementam em uníssono. Migração do Schema precisará fixar schema Zod estrito.
