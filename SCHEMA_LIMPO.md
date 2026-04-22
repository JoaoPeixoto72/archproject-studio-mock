# Schema — Módulo de Arquitectura

> **Modelo de dados por entidade.** Agnóstico de stack — cabe à IA implementadora mapear para a tecnologia da app base (SQL, NoSQL, objectos em memória, etc.).
>
> **Convenções:**
> - Campos `id` são strings únicas dentro da colecção. A IA pode escolher o esquema (ex.: `prj_abc123`, UUID, autoincrement) desde que consistente.
> - Datas em armazenamento: ISO `YYYY-MM-DD` (ou ISO 8601 com hora quando indicado).
> - Relações: representadas por `id` da entidade relacionada. A IA decide se implementa foreign keys reais ou só convenção.
> - "Colecção" = conjunto de documentos/registos do mesmo tipo. Implementação depende da stack.
> - Regras de negócio que envolvem estas entidades estão em `SPEC_FUNCIONAL.md` (é a fonte de verdade se houver conflito).

---

## Entity: App (Configuração Global)

Colecção: `app_config` (singleton — um único registo).

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| name | string | sim | 'ArchProject' | — | Nome da aplicação/módulo |
| office | object | sim | — | — | `{ name, address, nif, phone, email, logo }` |
| currentUser | object | sim | — | — | `{ id, name, role, email }` — ou resolvido pela auth da app base |
| portalMode | string \| null | não | null | null, 'client', 'external' | Modo de visualização activo |
| displayMode | string | sim | 'simple' | 'simple', 'full' | Nível de detalhe global da UI |

---

## Entity: Project

Colecção: `projects`. Criada via mutação `createProject`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| name | string | sim | — | — | Nome do projecto |
| client | string | sim | — | — | ID de Client |
| location | string | não | — | — | Localização da obra |
| typology | string | não | — | moradia, apartamento, comercial, reabilitação, outro | |
| area | number | não | — | — | Em m² |
| budget | number | não | — | — | Valor contratado com cliente |
| budgetSpent | number | não | — | — | Custo interno acumulado (derivado) |
| status | string | sim | 'active' | active, on-hold, completed, archived | |
| currentPhaseKey | string | sim | — | (keys das fases) | Fase actual em foco |
| templateUsed | string | não | — | — | ID do Template usado na criação |
| createdAt | string | sim | hoje | — | ISO `YYYY-MM-DD` |
| team | object | sim | — | — | `{ members:[ids], externals:[ids], clients:[ids] }` |
| phases | array | sim | [] | — | Array de Phase |
| visits | array | não | [] | — | Array de Visit |
| timeLogs | array | não | [] | — | Array de TimeLog |
| pendencias | array | não | [] | — | Array de Pendencia |
| posts | array | não | [] | — | Array de Post |
| history | array | não | [] | — | Array de HistoryEntry (máx. 200) |
| paymentSchedule | array | não | [] | — | Array de `{ id, amount, dueDate, status, description }` onde `status ∈ {pending, paid, overdue}` |
| quoteId | string \| null | não | null | — | Orçamento de origem (se foi convertido) |

---

## Entity: Phase

Parent: Project. Armazenada em `project.phases[]`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| key | string | sim | — | ex: 'pp', 'ep', 'pe' | Único dentro do projecto |
| abbr | string | sim | — | ex: 'PP', 'EP' | Usada em badges |
| name | string | sim | — | — | Nome completo da fase |
| description | string | não | — | — | |
| order | number | sim | — | — | Ordem de exibição |
| dependencies | array | não | [] | — | Array de `key` de outras fases |
| status | string | sim | 'pending' | pending, ready, active, blocked, done | Ver regras de transição na spec §4.B.2 |
| startDate | string \| null | não | null | — | Previsão |
| endDate | string \| null | não | null | — | Previsão |
| endDateActual | string \| null | não | null | — | Data real de fecho (preenchida ao completar) |
| budgetHours | number | não | 0 | — | Horas estimadas |
| blockReason | string \| null | não | null | — | Motivo se `status = blocked` |
| deliverables | array | não | [] | — | Array de Deliverable |
| approvals | array | não | [] | — | Array de Approval |
| photos | array | não | [] | — | Fotos anexadas à fase |
| notes | array | não | [] | — | Notas livres anexadas à fase |

---

## Entity: Deliverable (Entregável)

Parent: Phase. Armazenada em `phase.deliverables[]`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| name | string | sim | — | — | |
| description | string | não | '' | — | |
| status | string | sim | 'pending' | pending, in-progress, in-review, approved, done | |
| responsible | string \| null | não | null | — | ID de membro |
| visibility | array | sim | ['admin','member'] | admin, member, external, client | Quem pode ver este entregável (controla portais) |
| documents | array | não | [] | — | Array de Document |
| notes | array | não | [] | — | Notas do entregável |

---

## Entity: Document (com versionamento)

Parent: Deliverable. Armazenada em `deliverable.documents[]`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| filename | string | sim | — | — | Nome actual (última versão) |
| version | number | sim | 1 | — | Número da versão actual |
| uploadedBy | string | sim | — | — | ID do utilizador |
| uploadedAt | string | sim | hoje | — | ISO |
| size | string | não | '' | — | Tamanho (simulado ou real) |
| status | string | sim | 'draft' | draft, in-review, shared, approved, obsolete | |
| lastChangeType | string | sim | 'initial' | initial, revision, correction, update, revert | |
| versions | array | sim | — | — | Histórico completo; ver sub-schema abaixo |

### Sub-schema `versions[]`

Cada entrada:

| Campo | Tipo | Obrigatório | Default | Notas |
|-------|------|-------------|---------|-------|
| version | number | sim | — | Número sequencial |
| filename | string | sim | — | Nome nessa versão |
| uploadedBy | string | sim | — | — |
| uploadedAt | string | sim | — | — |
| size | string | não | '' | — |
| notes | string | não | '' | Notas da versão |
| changeType | string | sim | — | initial, revision, correction, update, revert |
| previousVersion | number \| null | sim | null na `initial` | Versão imediatamente anterior |
| revertedFrom | number | não | — | Se `changeType = 'revert'`, versão da qual foi revertido |

**Regra crítica:** o array é **append-only**. Nunca remover entradas. Ver spec §4.B.3.

---

## Entity: Approval

Parent: Phase. Armazenada em `phase.approvals[]`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| type | string | sim | 'client' | client, technical, external, council, internal | |
| name | string | sim | — | — | Ex: "Aprovação do programa pelo cliente" |
| status | string | sim | 'pending' | pending, approved, rejected | |
| submittedAt | string \| null | não | null | — | Quando foi submetida para aprovação |
| respondedAt | string \| null | não | null | — | Quando houve decisão |
| respondedBy | string \| null | não | null | — | ID de quem respondeu |
| notes | string | não | '' | — | Justificação da resposta |

---

## Entity: TimeLog

Parent: Project. Armazenada em `project.timeLogs[]`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| user | string | sim | — | — | ID do membro |
| date | string | sim | hoje | — | ISO |
| hours | number | sim | — | — | Decimal (ex.: 1.5 = 1h30m) |
| phase | string | sim | — | — | `key` da fase |
| description | string | sim | — | — | |
| billable | boolean | sim | true | — | Se é facturável ao cliente |

---

## Entity: Pendencia (Tarefa)

Parent: Project. Armazenada em `project.pendencias[]`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| description | string | sim | — | — | |
| priority | string | sim | 'medium' | low, medium, high | |
| responsible | string \| null | não | null | — | ID de membro |
| deadline | string \| null | não | null | — | ISO |
| status | string | sim | 'open' | open, closed | |
| phase | string \| null | não | null | — | `key` de fase (opcional) |
| createdAt | string | sim | hoje | — | |

---

## Entity: Visit

Parent: Project. Armazenada em `project.visits[]`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| date | string | sim | hoje | — | |
| participants | array | sim | [] | — | IDs de members/externals/clients |
| summary | string | não | '' | — | Notas longas ou sumário |
| status | string | sim | 'completed' | draft, pending, completed | |
| photos | array | não | [] | — | `{ id, filename, date, uploadedBy, description? }` |
| actions | array | não | [] | — | `{ id, description, status, responsible }` onde `status ∈ {open, done}` |

---

## Entity: Post (Mensagem / Comunicação)

Parent: Project. Armazenada em `project.posts[]`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| date | string | sim | hoje | — | |
| content | string | sim | — | — | Texto/HTML simples (sanitizar) |
| user | string | sim | — | — | ID do autor |
| phaseKey | string \| null | não | null | — | `key` de fase se associada |
| internal | boolean | sim | true | — | Se `false`, visível nos portais |

---

## Entity: HistoryEntry

Parent: Project. Armazenada em `project.history[]`. **Append-only** — nunca apagar, mesmo ao apagar o item relacionado.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| date | string | sim | agora | — | ISO com timestamp |
| user | string | sim | — | — | ID do autor |
| action | string | sim | — | — | Tipo curto (ex.: "Criou entregável") |
| detail | string | sim | — | — | Texto legível |
| phase | string \| null | não | null | — | `key` de fase se relevante |

---

## Entity: TeamMember (Interno)

Colecção: `team_members`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| name | string | sim | — | — | |
| email | string | sim | — | — | Funciona como handle |
| phone | string | não | — | — | |
| role | string | sim | 'member' | admin, member | Controlo de acesso |
| function | string | não | — | — | Ex.: "Director", "Arquitecto Sénior", "Estagiário" |
| hourlyRate | number | não | 0 | — | € / hora, para cálculos financeiros |
| projects | array | sim | [] | — | IDs de projectos associados |

**Regra:** tem de existir sempre pelo menos 1 admin activo.

---

## Entity: External (Colaborador Externo)

Colecção: `externals`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| name | string | sim | — | — | |
| email | string | sim | — | — | |
| phone | string | não | — | — | |
| company | string | não | — | — | Empresa terceira |
| specialty | string | sim | — | — | Ex.: "Estabilidade", "Térmica", "Topografia" |
| projects | array | sim | [] | — | IDs de projectos onde colabora |

---

## Entity: Client

Colecção: `clients`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| name | string | sim | — | — | |
| email | string | sim | — | — | |
| phone | string | não | — | — | |
| nif | string | não | — | — | |
| projects | array | sim | [] | — | IDs de projectos onde é cliente |

---

## Entity: Template

Colecção: `templates`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| name | string | sim | — | — | Ex.: "Moradia Unifamiliar" |
| description | string | não | — | — | |
| createdAt | string | sim | hoje | — | |
| updatedAt | string | sim | hoje | — | |
| phases | array | sim | [] | — | Estrutura igual a Phase mas usada como "molde" |
| usedBy | array | não | [] | — | IDs de projectos criados a partir deste template (para contagem) |

**Regra:** editar template **não** afecta projectos já criados a partir dele (cópia no momento da criação).

---

## Entity: Quote (Orçamento)

Colecção: `quotes`.

| Campo | Tipo | Obrigatório | Default | Valores possíveis | Notas |
|-------|------|-------------|---------|-------------------|-------|
| id | string | sim | gerado | — | |
| reference | string | sim | — | formato `ORC-YYYY-NNN` | Sequencial por ano |
| version | number | sim | 1 | — | Incrementa por revisão |
| status | string | sim | 'draft' | draft, sent, accepted, rejected | |
| createdAt | string | sim | agora | — | ISO com timestamp |
| projectId | string \| null | não | null | — | Projecto criado a partir deste orçamento (se convertido) |
| client | object | sim | — | — | `{ name, email, phone, nif }` |
| brief | object | sim | — | — | `{ name, typology, area, quality, budgetClient }` |
| scope | object | sim | — | — | `{ phases[], exclusions[], assumptions[] }` |
| fees | object | sim | — | — | Ver sub-schema abaixo |
| proposal | object | sim | — | — | `{ intro, legalNotes }` |

### Sub-schema `fees`

```
{
  model: 'hourly' | 'fixed',
  hourly: { rate, totalHours } | null,
  fixed: [{ phaseKey, price, included: [...], optionals: [...] }] | null,
  summary: {
    base: number,           // soma bruta do modelo escolhido
    optionals: number,      // soma de opcionais seleccionados
    subtotal: number,       // base + optionals
    vatRate: number,        // default 23 (PT)
    vat: number,            // subtotal × vatRate / 100
    total: number,          // subtotal + vat
    internalCost: number,   // estimativa de custo interno
    grossMargin: number,    // subtotal - internalCost
    grossMarginPct: number  // grossMargin / subtotal × 100
  }
}
```

---

## Entity: Settings (Parâmetros do Gabinete)

Colecção: `settings` (singleton).

| Campo | Tipo | Obrigatório | Default | Notas |
|-------|------|-------------|---------|-------|
| internalRoles | array | sim | [] | `[{ name, hourlyRateDefault }]` |
| externalSpecialties | array | sim | [] | Lista de strings (ex.: "Estabilidade", "Térmica") |
| vatRateDefault | number | sim | 23 | Taxa IVA por defeito |
| proposalIntroTemplate | string | não | '' | Template de intro de orçamento |
| proposalLegalNotesTemplate | string | não | '' | Template de notas legais |
| currency | string | sim | 'EUR' | Só informativo nesta versão |
| language | string | sim | 'pt-PT' | Só informativo nesta versão |

---

## Relações entre entidades (visão resumida)

```
App (singleton)
Settings (singleton)

Project
 ├─ team.members[]   → TeamMember.id
 ├─ team.externals[] → External.id
 ├─ team.clients[]   → Client.id
 ├─ templateUsed     → Template.id (snapshot no momento da criação)
 ├─ quoteId          → Quote.id (se foi convertido)
 ├─ phases[]
 │   ├─ dependencies[] → phase.key (mesmo projecto)
 │   ├─ deliverables[]
 │   │   └─ documents[] (com versions[] append-only)
 │   └─ approvals[]
 ├─ timeLogs[]       → user ∈ TeamMember.id, phase ∈ phase.key
 ├─ pendencias[]     → responsible ∈ TeamMember.id, phase ∈ phase.key (opcional)
 ├─ visits[]         → participants[] ∈ {TeamMember,External,Client}.id
 ├─ posts[]          → user ∈ TeamMember.id, phaseKey (opcional)
 ├─ history[]        (append-only)
 └─ paymentSchedule[]

Quote
 └─ projectId → Project.id (após conversão)
```

---

## Notas finais

- **Integridade referencial** não é garantida pelo schema — é responsabilidade das mutações (ver spec §14).
- **Entidades aninhadas vs colecções separadas:** o schema acima assume que `phases`, `deliverables`, `documents`, `timeLogs`, etc., vivem dentro do objecto `project`. Se a app base preferir colecções SQL separadas com foreign keys, a IA pode normalizar — desde que mantenha a mesma semântica e regras.
- **A spec funcional (`SPEC_FUNCIONAL.md`) prevalece** em caso de conflito com este schema.
