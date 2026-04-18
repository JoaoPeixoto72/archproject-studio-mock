# ArchProject Studio - Mapa de API (API-MAP.md)

Este documento mapeia todas as funções do mock local para os eventuais endpoints da nova API (HonoJS / SvelteKit).

## 1. Mutações Centrais (`core/mutations.js`)

### `createNewProject(projectData)`
**Endpoint:** `POST /api/projects`
**Auth:** sim (admin, member)
**Side effects:** insert DB
**Tabelas D1 afectadas:** `projects`
**Notas:** Deve gerar ID seguro (ex: uuid/nanoid) ou DB id.

### `upsertTeamMember(type, memberData, existingId)`
**Endpoint:** `PUT /api/team/:id` ou `POST /api/team`
**Auth:** sim (admin)
**Side effects:** insert/update pessoa, RBAC check
**Tabelas D1 afectadas:** `users`, `external_entities`, `clients`
**Notas:** Mapeamento dependerá de como Clientes são vistos vs Utilizadores internos.

### `addDeliverableFromModal(projectId, phaseKey, delData)` e `addDeliverable(...)`
**Endpoint:** `POST /api/projects/:projectId/phases/:phaseKey/deliverables`
**Auth:** sim (admin, member)
**Side effects:** addHistoryEntry
**Tabelas D1 afectadas:** `deliverables`, `history`
**Notas:** A mutação foi combinada. Zod Schema: precisa validar nome.

### `addTimeLog(projectId, entry)`
**Endpoint:** `POST /api/projects/:projectId/time-logs`
**Auth:** sim
**Validação:** hours > 0, phase required
**Side effects:** addHistoryEntry
**Tabelas D1 afectadas:** `time_logs`, `history`

### `addPendencia(projectId, pendencia)`
**Endpoint:** `POST /api/projects/:projectId/pendencias`
**Auth:** sim
**Validação:** desc obrigatória
**Side effects:** addHistoryEntry
**Tabelas D1 afectadas:** `pendencias`, `history`

### `updatePendencia(projectId, pendId, changes)` & `updatePendenciaStatus(...)`
**Endpoint:** `PATCH /api/projects/:projectId/pendencias/:pendId`
**Auth:** sim
**Side effects:** addHistoryEntry se alterar status
**Tabelas D1 afectadas:** `pendencias`

### `updatePhaseStatus(projectId, phaseKey, status, endDateActual)`
**Endpoint:** `PATCH /api/projects/:projectId/phases/:phaseKey/status`
**Auth:** sim (admin, member)
**Side effects:** addHistoryEntry, trigger refreshPhaseStatuses
**Tabelas D1 afectadas:** `phases`, `history`

### `updateApprovalStatus(projectId, phaseKey, approvalId, status, notes)`
**Endpoint:** `PATCH /api/projects/:projectId/phases/:phaseKey/approvals/:approvalId`
**Auth:** sim (pode ser client se for aprovação client)
**Side effects:** respondedAt, respondedBy set automatico
**Tabelas D1 afectadas:** `approvals`

### `addVisitToProject(projectId, visit)`
**Endpoint:** `POST /api/projects/:projectId/visits`
**Auth:** sim
**Side effects:** addHistoryEntry
**Tabelas D1 afectadas:** `visits`

### `updateVisitStatus`, `removeVisitPhoto`, `addPhotosToVisit`, `updateVisitAction`
**Endpoint:** `PATCH /api/projects/:projectId/visits/:visitId` (ou child endpoints)
**Auth:** sim
**Tabelas D1 afectadas:** `visits`, `visit_photos`, `visit_actions`

### `addPostToProject(projectId, post)`
**Endpoint:** `POST /api/projects/:projectId/posts`
**Auth:** sim
**Side effects:** addHistoryEntry
**Tabelas D1 afectadas:** `posts`

### `addPhotoToPhase` e `addNoteToPhase`
**Endpoint:** `POST /api/projects/:projectId/phases/:phaseKey/photos|notes`
**Auth:** sim
**Side effects:** upload R2 para fotos
**Tabelas D1 afectadas:** `phase_photos`, `phase_notes`

### `uploadDocumentToDeliverable(projectId, phaseKey, deliverableId, docData)`
**Endpoint:** `POST /api/projects/:projectId/deliverables/:deliverableId/documents`
**Auth:** sim
**Side effects:** Processar ficheiro no Cloudflare R2 antes do metadata na DB (D1). Lida versão.
**Tabelas D1 afectadas:** `documents`, `document_versions`

### `revertDocumentVersion(...)` e `compareDocumentVersions(...)`
**Endpoint:** `POST /api/projects/:projectId/docs/:docId/revert` / `GET compare`
**Auth:** sim (admin/member)
**Side effects:** nova entrada logada no D1 de file version
**Tabelas D1 afectadas:** `documents`, `document_versions`

### `updateDeliverable(...)` e `removeDeliverable(...)`
**Endpoint:** `PATCH|DELETE /api/projects/:projectId/deliverables/:deliverableId`
**Auth:** sim (admin)
**Tabelas D1 afectadas:** `deliverables`

### Outros Updates: `removeDocument`, `addDeliverableNote`, `removePhase`, `addTeamMember`, `updateDocStatus`
Assegurar a modelagem CRUD correta nos controllers com D1.

---

## 2. Helpers (Queries/Reads) (`core/helpers.js` / `domain.js`)

**Nota:** No SvelteKit, a maioria destas "funções" não será chamada no frontend de uma loja global. Elas convertem-se em JOINs SQL no servidor e são servidas no `Page Server Load` de cada Rota.

### `getProject(projectId)`
**Query equivalente:** `SELECT * FROM projects WHERE id = ? LIMIT 1` (Com joins nested para views plenas).
**Usado em:** `project-view.js` (Page Load route principal)

### `getPhase(projectId, phaseKey)`
**Query equivalente:** `SELECT * FROM phases WHERE project_id = ? AND key = ?`

### `getAllPendencias()` / `getAllPendingApprovals()` / `getAllTimeLogs()` / `getAllHistory()`
**Query equivalente:**
`SELECT p.*, pr.name as proj_name FROM pendencias p JOIN projects pr...`
**Usado em:** `dashboard.js` (Dashboard principal)
**Pode ser:** Computados no Server Load de `/(admin)/dashboard/+page.server.ts`

### `getProjectHealth(projectId)` / `getPhaseProgress(phase)`
**Query equivalente:** Computed no backend ou via triggers no DB que agregam deadlines e statuses.
**Usado em:** Widgets do projeto.

### `refreshPhaseStatuses(projectId)`
**Side Effect Check:** No futuro Hono (Cloudflare), isto pode ser implementado nos `afterInsert`/`afterUpdate` logic (ou Cloudflare Queues).
**Lógica:** Dependências precisam despoletar um update recursivo/cascata nas fases presas.

### Horas (`getTotalHours`, `getPhaseHours`, `getBillableHours`, `getWeeklyHours`)
**Query equivalente:** `SUM(hours) FROM time_logs WHERE project = ? / date BETWEEN ? AND ?`
**Pode ser:** Endpoints `/api/reports/time` agg.

### `buildPhasesFromSource(source)`
**Nota:** Utilizado ao clonar de template. A ser operado no backend durante a criação do projeto via POST!

### ⚠️ Inconsistências
1. `UI_STATE` não é API. Pertencerá ao contexto do SvelteKit (`$state` runes).
2. Quotes não tem a sua API delineada nativamente no `mutations` atual. Precisará do seu CRUD `api/quotes/`.
