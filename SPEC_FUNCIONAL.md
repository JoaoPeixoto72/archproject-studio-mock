# ArchProject — Especificação Funcional do Módulo de Arquitectura

> **Objectivo deste documento:** permitir que uma IA (ou equipa) implemente o módulo de Arquitectura numa app base SaaS já existente, **sem ter acesso ao código ou ao mock** do protótipo original. Descreve os menus, ecrãs, campos, acções e regras de negócio críticas que definem o comportamento do módulo.
>
> **Documentos complementares** (fornecer à IA implementadora em conjunto):
> - `README.md` — visão de alto nível e stack de referência.
> - `SCHEMA.md` — modelo de dados detalhado por entidade, campo a campo.
> - Este ficheiro — **UX, ecrãs, regras de negócio, fluxos e critérios de aceitação**.
>
> **Como ler este documento:** cada secção de menu tem sempre a mesma estrutura — **Propósito → O que mostra → Acções → Regras de negócio → Estados e mensagens**. Se algo não estiver explicitamente escrito, a IA deve escolher a **opção mais simples e consistente com o resto da spec** e documentá-la nos comentários do código.

---

## 0. Contexto e Âmbito

### 0.1 Contexto de integração

Esta especificação descreve um **módulo vertical de Arquitectura** que será **integrado numa app base SaaS existente** (não é uma app standalone). A IA implementadora deve:
- Seguir as convenções da app base (estrutura de pastas, sistema de rotas, sistema de permissões, design tokens).
- Se a app base já tiver autenticação, utilizador actual, roles e persistência, reutilizar esses mecanismos em vez de recriar.
- Se algum desses mecanismos não existir na app base, criar uma versão simplificada mas funcional (documentando a assumpção).

### 0.2 O que este módulo faz

Gere o **ciclo de vida operacional de projectos de arquitectura** num gabinete, desde o orçamento inicial até ao fim de obra. Cobre: fases estruturadas, entregáveis com aprovações, documentos versionados, registo de tempo, tarefas (pendências), visitas de obra com fotos, comunicação interna e com cliente, orçamentação com IVA, e dois modos de portal (cliente e colaborador externo).

### 0.3 Personas

| Persona | Quem é | O que faz |
|---|---|---|
| **Admin** | Sócio/director do gabinete | Tudo. Gere equipa, configurações, todos os projectos. |
| **Member (Interno)** | Arquitecto ou assistente do gabinete | Trabalha nos projectos a que pertence. Regista tempo, sobe documentos, cria pendências, faz visitas. |
| **External** | Engenheiro/consultor externo (estabilidade, térmica, acústica, etc.) | Vê apenas os projectos a que foi associado. Entrega peças na sua especialidade. Não vê valores financeiros nem outros externos. |
| **Client** | Cliente final do projecto | Vê apenas o(s) seu(s) projecto(s), em modo leitura/aprovação. Não vê custos internos, horas ou comunicação interna. |

### 0.4 O que **não** está no âmbito (gaps assumidos)

A IA implementadora **não** precisa de implementar, mas deve deixar hooks/placeholders:
- Autenticação real (usar a da app base, ou mock hardcoded se não existir).
- Upload binário real de ficheiros (usar metadados simulados — ver secção 13).
- Envio real de emails/notificações push.
- Multi-tenant / multi-gabinete (single-tenant por agora).
- Integração com ERPs ou sistemas fiscais externos.
- Impressão real em PDF (aceitável `window.print()` do HTML formatado).
- Assinatura digital de documentos.

---

## 1. Princípios Transversais

### 1.1 Layout Global

A app tem três zonas persistentes:

1. **Sidebar lateral** (esquerda, sempre visível em desktop)
   - Logo/nome do gabinete no topo.
   - Avatar + nome do utilizador actual + role.
   - Campo de pesquisa global (ver §12).
   - Lista de menus principais (ver §1.2).
   - Acessos rápidos a "Entrar como Cliente" e "Entrar como Externo" (simula portais).

2. **Barra de Timer** (topo ou fixa, sempre visível quando há timer activo)
   - Mostra cronómetro em formato `HH:MM:SS`.
   - Indica projecto e fase a que o tempo está a ser imputado.
   - Botões: Pausar/Retomar e Parar.
   - Ao parar, regista automaticamente um TimeLog (ver §14.6).

3. **Área principal de conteúdo**
   - Renderiza a página correspondente ao menu/rota actual.
   - Scroll independente da sidebar.

### 1.2 Menus Principais (Sidebar)

Ordem recomendada:

1. **Painel** (dashboard inicial)
2. **Calendário**
3. **Geral** (visão cross-projectos: todas as tarefas, tempos, actividade)
4. **Projectos** (lista; abre vista individual com 10 tabs)
5. **Orçamentação**
6. **Templates**
7. **Equipa**
8. **Configurações**
9. (Separador) **Entrar como Cliente** / **Entrar como Externo**

### 1.3 Modais e Toasts (padrões)

- **Modais** são usados para *todas* as acções de criação/edição que precisem de mais de 2 campos. Têm: título, corpo, botões "Cancelar" e "Confirmar/Guardar". Fecham com ESC, clique no fundo, ou botão X.
- **Toasts** confirmam acções bem-sucedidas e erros. Aparecem 3-4s e desaparecem. Devem ser não-bloqueantes.
- **Confirmações destrutivas** (apagar projecto, apagar documento, etc.) exigem modal de confirmação com o nome do item a apagar.

### 1.4 Modo de Exibição (`displayMode`)

A app tem dois modos globais:
- `simple` — menos detalhe, ideal para rápida consulta.
- `full` — mostra filtros extra, colunas adicionais, dropdowns de agregação.

É alternável nas Configurações e afecta quase todas as listagens. Guardar em `APP.displayMode`.

### 1.5 Persistência e Reactividade

- Todos os dados **sobrevivem a recargas da página** (persistência local ou via backend da app base).
- Após qualquer mutação (criar/editar/apagar), a vista actual re-renderiza automaticamente com os dados actualizados.
- O utilizador nunca precisa de fazer F5 para ver o efeito de uma acção.

### 1.6 Sistema de Cores e Badges

Cada estado tem uma cor canónica. A IA deve usar os design tokens da app base, mas manter estas associações semânticas:

| Estado | Cor semântica | Quando |
|---|---|---|
| `pending` | cinza/neutro | Fase ou pendência à espera |
| `ready` | azul | Pode iniciar |
| `active` / `in-progress` | amarelo/âmbar | Em curso |
| `blocked` | vermelho | Bloqueado |
| `done` / `completed` / `approved` | verde | Concluído |
| `rejected` | vermelho escuro | Rejeitado |
| `draft` | cinza claro | Rascunho |
| `in-review` / `shared` | azul claro | Em análise |
| `obsolete` | cinza escuro, barrado | Versão antiga |

Prioridades: `low` (cinza), `medium` (azul), `high` (vermelho).

### 1.7 Formato de Dados

- Datas: ISO `YYYY-MM-DD` em armazenamento; exibição `DD/MM/YYYY`.
- Moeda: Euro, formato `€ 1 234,56` (separador de milhares = espaço; decimal = vírgula).
- Horas: decimal (`1.5h` = 1h30m) com uma casa decimal.
- IDs: string, prefixada por tipo (ex.: `prj_abc123`, `del_xyz`) — a IA pode escolher o esquema desde que consistente.

### 1.8 Permissões (resumo)

| Recurso | Admin | Member | External | Client |
|---|---|---|---|---|
| Ver todos os projectos | ✅ | Só os seus | Só os seus | Só o(s) seu(s) |
| Criar projecto | ✅ | ✅ | ❌ | ❌ |
| Apagar projecto | ✅ | ❌ | ❌ | ❌ |
| Ver valores financeiros | ✅ | ✅ | ❌ | ❌ |
| Ver horas imputadas | ✅ | Suas + totais | ❌ | ❌ |
| Aprovar fases/entregáveis | ✅ | ✅ (se responsável) | ✅ (técnicas) | ✅ (cliente) |
| Upload de documentos | ✅ | ✅ | ✅ (sua área) | ❌ |
| Ver mensagens internas | ✅ | ✅ | ❌ | ❌ |
| Aceder a Equipa/Configurações | ✅ | ❌ | ❌ | ❌ |

Detalhe adicional por entregável: campo `visibility[]` (ver §4 e SCHEMA). Um entregável com `visibility: ['admin','member']` **não aparece** a externos nem a clientes, mesmo que estejam associados ao projecto.

---

## 2. Menu: Painel (Dashboard)

### 2.1 Propósito

Ecrã inicial ao abrir a app. Dá ao gestor do gabinete uma leitura de 5 segundos sobre "o que precisa da minha atenção hoje".

### 2.2 O que mostra

1. **Cards de KPI no topo** (4 cartões): nº projectos activos, horas registadas este mês, receita prevista (orçamentos aceites + pagamentos agendados), nº de pendências abertas.
2. **Painel de Atenção** — lista priorizada de itens que requerem acção:
   - Pendências vencidas (com nº de dias de atraso).
   - Aprovações paradas há mais de 7 dias.
   - Entregáveis partilhados com externos/clientes sem resposta.
   - Pagamentos vencidos (do `paymentSchedule`).
   - Cada item tem cor, texto descritivo e link directo para a tab relevante do projecto.
3. **Próximas visitas** (7 dias) — lista curta.
4. **Projectos em destaque** — 3-5 projectos com maior actividade recente.
5. **Atalho "Check-in Rápido"** — botão que, a partir do painel, abre modal de registo de visita num projecto (selector de projecto + data + notas rápidas).

### 2.3 Acções

- Clicar num item do painel de atenção → navega para o contexto exacto (ex.: tab Pendências do projecto X com o item em destaque).
- "Check-in Rápido" → modal de visita (ver §4.5).
- Clicar num card de KPI → navega para a vista agregada correspondente.

### 2.4 Regras de negócio

- Se não houver nada que requeira atenção → mostrar estado vazio positivo ("Tudo em dia").
- Itens vencidos ordenam-se por dias de atraso (mais atrasado primeiro).
- Aprovações "paradas" = status `pending` + `submittedAt` há mais de 7 dias.
- Pagamentos vencidos = `paymentSchedule[i].dueDate < hoje` e `status != 'paid'`.

---

## 3. Menu: Calendário

### 3.1 Propósito

Ver no tempo **fases**, **prazos de entregáveis**, **pendências** e **visitas** de todos os projectos.

### 3.2 O que mostra

Duas vistas alternáveis via toggle:

**Vista Mensal (default)**
- Grelha mensal tradicional (7 colunas, 5-6 linhas).
- Em cada dia, chips com eventos (ex.: "📐 PE — Vila X", "📅 Visita Obra Y", "✅ Aprovação fim P3").
- Cor do chip segue o tipo: fase (azul), visita (verde), aprovação (âmbar), pendência (vermelho se atrasada).
- Navegação: mês anterior / mês seguinte / "hoje".

**Vista Timeline / Gantt horizontal**
- Linha horizontal por projecto; barras coloridas por fase (com start/endDate).
- Scroll horizontal para meses adicionais.
- Marcadores verticais: hoje, deadlines.

### 3.3 Acções

- Clicar num evento → navega para o contexto (ex.: fase no projecto, visita, pendência).
- Toggle mensal/timeline no topo direito.
- Botão "Sincronizar" (placeholder — apenas mostra toast "Funcionalidade em breve").

### 3.4 Regras de negócio

- Agregar eventos de todos os projectos a que o utilizador tem acesso (respeitar permissões).
- Eventos sem data não aparecem (não assumir data).
- Um projecto com fase activa mostra a fase em destaque (cor mais saturada).

---

## 4. Menu: Projectos

Este é o menu mais denso. Divide-se em:
- **4.A — Lista de Projectos** (vista index)
- **4.B — Vista Individual do Projecto** (10 tabs)

---

### 4.A Lista de Projectos

#### 4.A.1 Propósito

Índice de todos os projectos do gabinete, filtrável e ordenável.

#### 4.A.2 O que mostra

Toggle entre:
- **Vista Lista/Tabela** (default): colunas Nome, Cliente, Progresso (barra %), Status, Data início, Orçamento, Localização, Saúde (círculo colorido), Equipa (avatares).
- **Vista Kanban**: colunas por status (`active`, `on-hold`, `completed`, `archived`), cartões draggable.

Barra de filtros no topo: pesquisa por nome/cliente, dropdown de status, toggle de vista.

#### 4.A.3 Acções

- **"+ Novo Projecto"** (botão destacado topo direito) → abre wizard de criação (ver §11.1).
- Clicar num projecto → abre vista individual (tab default: Visão Geral).
- Clicar em cabeçalho de coluna → ordena (asc/desc).
- No Kanban, arrastar cartão entre colunas → muda status (com confirmação se for `archived`).

#### 4.A.4 Regras de negócio

- **Progresso** = `(nº fases done) / (total fases) × 100`.
- **Saúde** (cor do círculo):
  - Verde: no prazo, sem pendências urgentes, orçamento < 90%.
  - Âmbar: algum atraso pequeno ou orçamento 90-100%.
  - Vermelho: atraso grave, orçamento > 100%, ou bloqueios.
  - A IA pode simplificar: verde se tudo ok, âmbar se houver pendências vencidas, vermelho se houver fase `blocked` ou orçamento estourado.
- **Data fim prevista** = maior `endDate` das fases.
- **Avatares de equipa**: mostrar até 3 iniciais + "+N" para o resto.
- Members só vêem projectos onde estão em `team.members`.

---

### 4.B Vista Individual do Projecto

Ao abrir um projecto, mostra:
- **Header do projecto**: nome, cliente, status badge, localização, % progresso, botões acção rápida (iniciar timer, adicionar pendência, nova mensagem).
- **10 Tabs** (ordem canónica):
  1. Visão Geral
  2. Fases
  3. Documentos
  4. Pendências
  5. Visitas
  6. Tempo
  7. Financeiro
  8. Equipa
  9. Mensagens
  10. Histórico

URL/rota: `projecto/:id/:tab`.

---

#### 4.B.1 Tab: Visão Geral

**Propósito:** Síntese do projecto em uma página.

**O que mostra:**
- Cards rápidos: total de horas registadas (billable vs non-billable), entregáveis concluídos / total + barra, orçamento aproximado (`~Xk €`), nº pendências abertas.
- Resumo contratual: referência de orçamento/contrato (link para o orçamento original, se existir).
- **Estado das fases**: lista vertical das 8 fases com status, dependências, e fase actual destacada.
- **Próximos passos** (gerado automaticamente): entregáveis pendentes prioritários, aprovações pendentes, pendências high-priority.
- Últimas entradas do histórico (5 últimas).

**Acções:** links para as tabs correspondentes.

**Regras de negócio:** tudo é derivado — sem formulários nesta tab.

---

#### 4.B.2 Tab: Fases

**Propósito:** Gerir o ciclo de vida do projecto — activar, bloquear, completar fases; criar e aprovar entregáveis.

**O que mostra:**
Lista de **8 fases canónicas** do projecto (vindas do template usado na criação). Cada fase é um card com:
- Abbr + nome (ex.: `PE — Projecto de Execução`).
- Badge de status.
- Barra de progresso (entregáveis done / total).
- Datas (início/fim previstos e reais).
- Dependências (mostrar como chips que ficam verdes quando satisfeitas).
- Lista expansível de **Entregáveis** (cada um com status, responsável, nº de documentos anexados, chip de visibilidade).
- Lista expansível de **Aprovações** necessárias para concluir a fase.
- Acções rápidas: activar/bloquear/completar, editar detalhes, adicionar entregável, adicionar aprovação.

Toggle "detailed / compact" para densidade de informação.

**As 8 fases canónicas** (template Moradia, o template standard):

| Key | Abbr | Nome completo |
|---|---|---|
| `pp` | PP | Programa Preliminar |
| `ep` | EP | Estudo Prévio |
| `ap` ou `pb` | AP/PB | Anteprojecto / Projecto Base |
| `pe` | PE | Projecto de Execução |
| `lic` | LIC | Licenciamento |
| `cp` | CP | Compatibilização de Projecto |
| `ao` | AO | Assistência Técnica à Obra |
| `tf` | TF | Telas Finais |

(Um template pode acrescentar ou remover — a IA deve tratar como lista ordenada pelo campo `order`, não assumir fixo em 8.)

**Dependências canónicas:** cada fase depende tipicamente da anterior. Ex.: `ep` depende de `pp`; `pe` depende de `ap`; `ao` depende de `lic`.

**Acções:**
- **Activar fase** (modal): verifica dependências. Se houver dependências não-`done`, mostrar aviso listando-as, mas permitir "iniciar mesmo assim" (com confirmação).
- **Bloquear fase** (modal): pede motivo obrigatório; fase fica `blocked` com `blockReason` guardado.
- **Completar fase** (modal de confirmação): marca `done`, regista `endDateActual = hoje`, dispara re-cálculo de dependentes.
- **Editar detalhes** (modal): nome, descrição, datas, `budgetHours`.
- **Adicionar entregável** (modal): nome, descrição, responsável (dropdown da equipa), visibilidade (checkboxes: admin, member, external, client).
- **Aprovar / Rejeitar aprovação**: botão por aprovação; rejeição pede notas.

**Regras de negócio críticas:**

1. **Promoção automática `pending → ready`**: sempre que uma fase é completada (`done`), o sistema reavalia todas as outras fases. Qualquer fase em `pending` cujas `dependencies` estejam todas `done` passa para `ready`. **Inversa também:** se uma fase `ready` perder uma dependência (por edição), volta a `pending`.
2. Uma fase `done`, `active` ou `blocked` **não é automaticamente alterada** pelo recálculo — mantém o estado explicitamente definido.
3. Só é possível ter **uma fase `active` por projecto** ao mesmo tempo. Activar outra muda a anterior para `done` ou `ready` (pedir escolha no modal).
4. Completar uma fase cuja aprovação `client` ainda está `pending` deve mostrar aviso mas permitir (o utilizador pode ter razão para avançar).
5. A fase actual do projecto (`currentPhaseKey`) = a fase `active`. Se nenhuma estiver `active`, é a primeira `ready`; se nenhuma, a primeira `pending`.
6. Entregáveis herdam a visibilidade — um entregável apenas `['admin']` nunca aparece a ninguém excepto admins.
7. Todas as acções geram entradas de `history`.

---

#### 4.B.3 Tab: Documentos

**Propósito:** biblioteca unificada de todos os ficheiros do projecto, com associação a entregáveis e versionamento.

**O que mostra:**
- Barra superior: pesquisa, filtro por fase, filtro por status do documento.
- Botão "Upload" (acção principal).
- **Agrupamento por fase**: lista colapsável por fase, dentro de cada fase os entregáveis, e dentro destes os documentos (com versão actual).
- Cada documento mostra: filename, versão actual (ex.: `v3`), data de upload, quem subiu, tamanho, status, número de versões históricas (link "ver histórico").

**Acções:**

- **Upload de novo documento** (modal):
  - Associar a um entregável (dropdown hierárquico fase → entregáveis).
  - Campo filename (obrigatório).
  - Tamanho (simulado, placeholder).
  - Notas iniciais (opcional).
  - Status inicial (default: `draft`).

- **Substituir / Nova versão** (botão dentro do documento):
  - Modal com filename (pode ser igual ou diferente).
  - Tipo de alteração: `revision` (correcções menores), `correction` (corrige erro), `update` (actualização maior).
  - Notas da versão.
  - Opcional: alterar status.

- **Ver histórico de versões** (expande lista): para cada versão mostra número, data, quem, changeType, notas, tamanho. Botão "Reverter para esta versão".

- **Reverter versão**: cria uma **nova versão** com `changeType: 'revert'`, copiando o conteúdo da versão alvo. Nunca apaga histórico.

- **Comparar versões**: selector de duas versões → mostra diff textual de filename/notas/tamanho (a IA pode simplificar como comparação lado-a-lado).

- **Mudar status** do documento (dropdown inline): `draft` → `in-review` → `shared` → `approved` / `obsolete`.

- **Remover documento** (modal de confirmação): remove o objecto inteiro (incluindo histórico). Só admin.

**Regras de negócio críticas:**

1. **Primeira versão** (upload novo): `version: 1`, `versions: [{version:1, changeType:'initial', previousVersion:null, ...}]`.
2. **Substituição**: incrementa `version`, adiciona entrada em `versions[]` com `previousVersion` = versão anterior. Actualiza `filename`, `uploadedAt`, `uploadedBy`, `size`, `lastChangeType` no documento principal.
3. **Migração legacy**: se um documento antigo não tiver `versions[]`, criar automaticamente com entrada `initial` ao fazer primeira nova versão.
4. **Reverter**: empurra nova entrada em `versions[]` com `changeType: 'revert'` e `revertedFrom: versão alvo`. O conteúdo principal passa a reflectir o da versão alvo.
5. Filtros: pesquisa aplica-se a filename; filtro de fase filtra; filtro de status filtra o status actual.
6. Cada upload/versão gera entrada de `history` com detalhe legível (ex.: "Nova versão v3 — Projecto de Execução — correcção").

---

#### 4.B.4 Tab: Pendências (Tarefas)

**Propósito:** to-dos leves do projecto que não justificam ser um entregável formal.

**O que mostra:**
- Contador no topo (nº abertas).
- Botão "+ Nova Pendência".
- Filtros (visíveis em `full` mode): responsável, fase.
- Lista de **abertas**: cada uma com chip de prioridade (cor), descrição, fase abreviada, responsável, deadline, indicador de urgência (texto como "hoje", "em 3 dias", "atrasada 2 dias").
- Lista de **fechadas**: strikethrough, ícone de check, colapsável.
- Empty state: "Sem pendências abertas".

**Acções:**

- **Criar pendência** (modal): descrição (obrigatória), prioridade (low/medium/high, default medium), responsável (dropdown), deadline (date picker), fase (dropdown das fases do projecto).
- **Fechar** (checkbox na lista): muda `status` para `closed`.
- **Reabrir** (botão na lista fechada): `status` volta a `open`.
- **Editar** (clique no item): mesmo modal de criação.

**Regras de negócio:**

1. Urgência visual:
   - Deadline passou → vermelho "atrasada N dias".
   - Deadline é hoje → âmbar "hoje".
   - Deadline nos próximos 3 dias → amarelo "em N dias".
   - Caso contrário → cinza neutro.
2. Pendências `high` aparecem sempre no topo da lista de abertas (mesmo que sem deadline).
3. Fecho de pendência regista `history`.
4. Uma pendência não é obrigatoriamente ligada a uma fase (campo opcional).

---

#### 4.B.5 Tab: Visitas

**Propósito:** Registar visitas à obra/terreno, com participantes, fotografias e acções de follow-up.

**O que mostra:**
- Botão "+ Registar Visita".
- Lista cronológica (mais recente primeiro) de visitas. Cada card:
  - Data + badge de status.
  - Participantes (iniciais ou nomes).
  - Notas/sumário.
  - Contador de fotos + contador de acções abertas.
  - Expansível: lista de fotos em grelha, lista de acções com checkbox.

**Acções:**

- **Registar visita** (modal):
  - Data (default: hoje).
  - Participantes: multi-selector com membros + externos + clientes associados ao projecto.
  - Notas (textarea, obrigatório).
  - Status (default: `completed`).
  - Upload de fotos (simulado — metadados): nome do ficheiro + descrição opcional. Permite múltiplas.
  - Acções de follow-up: lista dinâmica — cada acção é `{description, responsible}`; começam com status `open`.

- **Adicionar fotos** (botão dentro de visita existente).
- **Remover foto** (confirmação).
- **Marcar acção concluída** (checkbox inline): `status: 'done'`.
- **Reabrir acção** (se estava `done`).
- **Editar visita**: modal igual ao de criação.
- **Alterar status da visita** (dropdown): `draft`, `completed`, `pending`.

**Regras de negócio:**

1. Participantes têm de pertencer ao `team` do projecto (members, externals ou clients). Multi-select valida isso.
2. Uma visita pode ser salva como `draft` (ainda a completar).
3. Acções abertas de visitas aparecem também na tab Pendências? **Não** — são coisas distintas. Acções são ligadas à visita, pendências são gerais.
4. "Check-in rápido" do dashboard (§2.3) pré-preenche data = hoje e abre o modal de visita.
5. Cada visita gera entrada de `history`.

---

#### 4.B.6 Tab: Tempo

**Propósito:** Ver e registar tempo imputado ao projecto.

**O que mostra:**
- 4 cards KPI: Total de horas, Orçamento de horas (`budgetHours` somado), Horas billable (a verde), variação (% vs orçamento).
- Secção "Por fase": para cada fase com `budgetHours > 0`, linha com abbr, nome, horas orçadas, horas reais, variância em %. Cores: vermelho se > +10%, verde se < -10%, âmbar entre.
- Secção "Últimos registos" (até 20): data, fase, descrição, utilizador, horas, marcador billable (€) ou não (—).
- Botão "+ Registar Tempo".
- Botão "Iniciar Cronómetro" (pré-selecciona este projecto).

**Acções:**

- **Registar tempo manual** (modal):
  - Data (default hoje).
  - Fase (dropdown).
  - Descrição (obrigatória).
  - Horas (decimal, ex.: 1.5).
  - Billable (checkbox, default true).

- **Iniciar cronómetro** → ver §12.

- **Editar registo** (só autor ou admin): modal igual ao de criação.
- **Apagar registo** (só autor ou admin, com confirmação).

**Regras de negócio:**

1. Horas guardadas em decimal.
2. Billable default = `true`. Horas não-billable existem para registos internos/aprendizagem.
3. A variância por fase = `(horasReais - budgetHours) / budgetHours × 100`.
4. Um membro não pode apagar o registo de outro membro.
5. Somatórios na UI actualizam em tempo real após criar/editar.

---

#### 4.B.7 Tab: Financeiro

**Propósito:** Ver custos, facturação programada, comparar orçamento vs real.

**O que mostra:**
- **Resumo de orçamento**: valor contratado (€), facturado até hoje, por facturar, pago, em dívida.
- **Progresso de pagamentos**: barra + tabela do `paymentSchedule` (parcelas com data prevista, valor, status, botão "marcar como pago").
- **Orçamento vs Real por fase**: para cada fase, horas orçadas × custo/hora do responsável + valor acordado vs custos reais (timeLogs × hourlyRate dos membros).
- **Análise de custos internos e margem**: custo total interno (soma de horas × hourlyRate), margem bruta = (valor contratado - custo interno), margem bruta %.
- Alertas visuais: vermelho se custo > valor contratado, âmbar se 80-100%.

**Acções:**

- **Marcar parcela como paga** (botão → confirmação). Regista `history`.
- **Adicionar parcela** (modal): valor, data prevista, descrição. Útil se o orçamento original não tinha.
- **Editar parcela**.

**Regras de negócio:**

1. Cálculos são sempre derivados — não há "total facturado" guardado; é somatório das parcelas `paid`.
2. `hourlyRate` do membro vem das Configurações (ver §8).
3. Formato €: ver §1.7.
4. Externos e clientes **não vêem** esta tab.
5. Se não houver `paymentSchedule`, mostrar estado vazio com CTA para criar.

---

#### 4.B.8 Tab: Equipa

**Propósito:** Gerir quem trabalha no projecto (diferente da Equipa global do gabinete).

**O que mostra:**
- Três secções: **Internos**, **Externos**, **Cliente(s)**.
- Cada pessoa: avatar/iniciais, nome, role/especialidade, função, projectos activos (nº), botão remover.

**Acções:**

- **+ Adicionar Interno** (modal): selector das pessoas da equipa do gabinete não ainda associadas.
- **+ Adicionar Externo** (modal): selector dos externos registados; opção de criar novo inline.
- **+ Adicionar Cliente** (modal): selector dos clientes registados; opção de criar novo inline.
- **Remover** (confirmação): remove do projecto (não apaga a pessoa globalmente).

**Regras de negócio:**

1. Admin e o próprio membro podem remover-se.
2. Remover alguém que tem TimeLogs/pendências atribuídas → aviso mas permitir (dados ficam atribuídos a IDs).
3. Um cliente só pode ver projectos onde está em `team.clients`.
4. Um projecto pode ter múltiplos clientes (casais, empresas).

---

#### 4.B.9 Tab: Mensagens

**Propósito:** Diário/wall do projecto para comunicação persistente.

**O que mostra:**
- Lista cronológica (mais recente primeiro) de "posts": avatar, autor, data, conteúdo, chip "Interno" vs "Partilhado (cliente/externo)", chip de fase se ligada.
- Campo de composição no topo (textarea + checkboxes: "interno", "fase associada" dropdown).

**Acções:**

- **Publicar mensagem**: adiciona post. Se `internal = true`, não visível em portais.
- **Apagar** (autor ou admin, confirmação).

**Regras de negócio:**

1. Default `internal = true`.
2. Uma mensagem com `internal = false` é visível no portal cliente e/ou externo se ligada a uma fase que eles vêem.
3. Suporta HTML simples (links). Sanitizar input para evitar XSS.
4. Cada mensagem gera entrada `history`.

---

#### 4.B.10 Tab: Histórico

**Propósito:** Log auditável de tudo o que aconteceu no projecto.

**O que mostra:**
- Lista cronológica invertida (mais recente primeiro).
- Cada entrada: data/hora, utilizador, acção curta (ex.: "Criou entregável"), detalhe legível, fase (se aplicável).
- Filtros: por utilizador, por fase, por tipo de acção.

**Acções:**

- Apenas leitura. Sem apagar.
- Limite de 200 entradas visíveis; mais antigas colapsadas com "ver mais".

**Regras de negócio:**

1. Cada mutação relevante (criar projecto, activar fase, upload doc, registar visita, etc.) chama a função central que adiciona entrada.
2. Nunca apagar histórico, mesmo ao apagar o item associado.

---

## 5. Menu: Orçamentação

### 5.1 Propósito

Criar e gerir orçamentos/propostas comerciais **antes** de existir projecto. Um orçamento aceite pode ser **convertido em projecto**.

### 5.2 O que mostra

Vista de lista de orçamentos:
- Referência (ex.: `ORC-2026-001`), cliente, status (draft/sent/accepted/rejected), total €, data criação, acções.

Topo: botão "+ Novo Orçamento" e filtros por status.

### 5.3 Wizard de Criação (4 passos)

**Passo 1 — Cliente e Brief:**
- Dados do cliente: nome, email, telefone, NIF (nenhum obrigatório exceto nome).
- Brief: nome do projecto, tipologia (dropdown: moradia, apartamento, comercial, reabilitação, outro), área m², qualidade de acabamentos (low/medium/premium), orçamento indicativo do cliente.

**Passo 2 — Âmbito (Scope):**
- Dropdown de **Template** (default: "Moradia") que pré-preenche fases e entregáveis.
- Fases incluídas (checkboxes; podem editar quantidade/horas por fase).
- Exclusões explícitas (textarea).
- Pressupostos (textarea).

**Passo 3 — Honorários:**
- Modelo: `hourly` (valor/hora × horas estimadas) ou `fixed` (preço por fase).
- Se `hourly`: taxa horária, horas totais.
- Se `fixed`: tabela por fase com preço fixo + opcionais.
- Cálculo automático: subtotal, IVA (23% default mas editável), total.
- Campo adicional: custo interno estimado (gerado auto se `hourly`), margem bruta (%).

**Passo 4 — Proposta e Revisão:**
- Intro (textarea editável; tem template base por tipologia).
- Notas legais (padrão editável).
- Pré-visualização do PDF/HTML.
- Botões: "Guardar Rascunho", "Enviar ao Cliente" (muda status para `sent`), "Imprimir/PDF" (`window.print()`).

### 5.4 Acções adicionais na lista

- **Duplicar orçamento** → novo com `version` incrementada.
- **Marcar como aceite** → status `accepted`.
- **Marcar como rejeitado** → status `rejected` com motivo opcional.
- **Converter em Projecto** (só se `accepted`): ver §5.6.
- **Apagar** (só draft) com confirmação.

### 5.5 Presets e Benchmarks

A app deve ter presets de:
- **Preços de mercado por região** (Lisboa, Porto, Algarve, Centro, Norte Interior). Valores indicativos €/m² para cada tipologia.
- **Biblioteca de entregáveis** (8+ itens standard com preço unitário e qty sugerida).
- **Template "Moradia"**: fases com horas estimadas e preço fixo sugerido, mais lista de exclusões standard.

A IA pode inventar valores plausíveis (ex.: moradia Lisboa premium €2500/m²), documentando que são placeholders editáveis.

### 5.6 Conversão Orçamento → Projecto

Ao converter:
1. Criar novo projecto com:
   - Nome = brief.name.
   - Cliente = cria cliente novo se não existir (com os dados do orçamento) ou liga ao existente.
   - Fases = cópia das do orçamento, com `budgetHours` correctos.
   - Entregáveis da biblioteca = aplicados às fases.
   - `paymentSchedule` = gerado automaticamente (ex.: 30% assinatura, 30% PE, 40% TF; ou distribuído por fase).
   - `templateUsed` = referência ao template do orçamento.
   - `budget` = total do orçamento.
2. Ligar o orçamento ao projecto (`quote.projectId`, `project.quoteId`).
3. Navegar para o projecto novo.
4. Registar em `history` da criação.

### 5.7 Regras de negócio

1. Referência única: formato `ORC-YYYY-NNN`, sequencial por ano.
2. IVA default 23% (PT) mas editável por orçamento.
3. Total = subtotal × (1 + vatRate/100) + opcionais.
4. Margem bruta % = (total sem IVA - custo interno) / total sem IVA × 100.
5. Orçamento `sent` e `accepted` não podem ser editados excepto nas notas; para alterar, duplicar (nova versão).

---

## 6. Menu: Templates

### 6.1 Propósito

Biblioteca de templates de projecto reutilizáveis (Moradia, Apartamento, Reabilitação, Comercial, Interior Design, etc.).

### 6.2 O que mostra

Grelha de cards, cada um com:
- Nome + descrição.
- Contadores: nº fases, nº entregáveis totais, nº aprovações totais.
- Em `full` mode: nº de projectos criados a partir deste template (uso).
- Data de última actualização.

### 6.3 Acções

- **+ Novo Template** (modal wizard):
  - Nome, descrição.
  - Fases: adicionar/remover/reordenar; para cada uma, abbr, nome, budgetHours, dependências.
  - Entregáveis por fase: nome, descrição, visibilidade default.
  - Aprovações por fase: tipo, nome.
- **Editar template existente** (mesmo modal preenchido).
- **Duplicar**.
- **Apagar** (confirmação; avisar se tem projectos a usá-lo).

### 6.4 Regras de negócio

1. Apagar template não apaga projectos que o usaram (são cópias independentes no momento da criação).
2. Editar template **não** afecta projectos já criados (cópia no momento da criação).
3. Template não pode ter zero fases.
4. Dependências não podem ser circulares — validar.

---

## 7. Menu: Equipa

### 7.1 Propósito

Registar e gerir pessoas do gabinete (members), colaboradores externos e clientes.

### 7.2 O que mostra

Três secções (ou tabs):
- **Membros Internos**: nome, email, telefone, função, role (admin/member), custo/hora, projectos activos (nº).
- **Externos**: nome, empresa, especialidade, email, telefone, projectos onde colabora.
- **Clientes**: nome, email, telefone, NIF, projectos associados.

Busca e filtros (especialidade para externos).

### 7.3 Acções

- **+ Adicionar** em cada secção → modal com campos da entidade (ver SCHEMA).
- **Editar** (click no card).
- **Remover** (confirmação). Regra: não permitir apagar se tiver projectos activos; pedir para primeiro desassociar ou arquivar.
- **Ver projectos** (drill-down).

### 7.4 Regras de negócio

1. Email obrigatório (funciona como handle).
2. Role `admin` só pode ser atribuído por outro admin.
3. Só pode haver no mínimo 1 admin activo.
4. Externos e clientes não têm login nesta versão — apenas acedem a portais via link simulado (ver §11).

---

## 8. Menu: Configurações

### 8.1 Propósito

Parâmetros globais do gabinete.

### 8.2 O que mostra

Sub-tabs:

**Geral:**
- Dados do escritório: nome, morada, NIF, telefone, email, logo (placeholder).
- Modo de exibição default (`simple`/`full`).
- Moeda (default EUR), idioma (default pt-PT) — apenas mostrar, sem implementar i18n.

**Cargos Internos:**
- Lista editável de cargos/funções (Director, Arquitecto Sénior, Arquitecto, Estagiário, etc.).
- Por cargo: nome, custo/hora default (aplicado a novos membros).

**Especialidades Externas:**
- Lista editável: Estabilidade, Térmica, Acústica, Topografia, Hidráulica, Eléctrica, Paisagismo, etc.
- Usada nos dropdowns ao criar externos.

**Orçamentação:**
- Taxa IVA default (23%).
- Template de intro de proposta (textarea).
- Template de notas legais (textarea).

### 8.3 Acções

Guardar (toast de sucesso). Sem wizards — tudo inline.

### 8.4 Regras de negócio

Só Admin acede a este menu.

---

## 9. Menu: Geral

### 9.1 Propósito

Visão cross-projectos. "Quero ver tudo de um tipo em toda a agência."

### 9.2 O que mostra

Tabs:

**Tarefas (todas as pendências do gabinete):**
- Filtros: prioridade, projecto, responsável, status (default: apenas `open`).
- Ordenação default: urgência (prioridade + deadline).
- Lista igual ao §4.B.4 mas agregada de todos os projectos.
- Coluna adicional: nome do projecto (com link).

**Aprovações:**
- Todas as aprovações pendentes, ordenadas por antiguidade.
- Por cada uma: projecto, fase, tipo, data de submissão, acções aprovar/rejeitar.

**Actividade (histórico global):**
- Filtros: projecto, utilizador.
- Lista do history de todos os projectos, ordem cronológica inversa.

**Relatórios:**
- **Horas por membro** (semana, mês, total) com % utilização (partindo de 40h/semana).
- **Horas por projecto**.
- **Últimos 30 registos de tempo** (tabela).
- Opcional: exportar CSV (se a app base suportar).

### 9.3 Regras de negócio

Mesmos filtros de permissão — cada utilizador só vê o que tem acesso.

---

## 10. Portais (Cliente e Externo)

### 10.1 Conceito

Não são menus, são **modos de visualização simulados** da app na perspectiva de um cliente ou externo. Accionáveis via sidebar ("Entrar como Cliente/Externo") e rota `portal-cliente/:id` ou `portal-externo/:id`.

Ao entrar em modo portal:
- **Banner visível no topo**: "A visualizar como Cliente: João Silva" + botão "Voltar ao Atelier".
- Sidebar muda para o menu mínimo do portal.
- Esconder toda a info financeira, histórica, horas e comunicação interna.

### 10.2 Portal Cliente

**Menu reduzido:**
- Bem-vindo (dashboard pessoal do cliente).
- Projecto (ou selector se tiver múltiplos).
- Mensagens.
- Documentos (partilhados).
- Calendário (apenas visitas e marcos do seu projecto).

**No projecto do cliente mostra:**
- Progresso global, fase actual (visual limpo, sem jargão técnico).
- Entregáveis com `visibility` incluindo `client` e status `shared` ou `approved`.
- Documentos com status `shared` ou `approved` (só versão actual).
- Aprovações pendentes do cliente (botões "Aprovar" / "Rejeitar com comentário").
- Mensagens com `internal = false`.
- Visitas (com fotos) do projecto.
- Sem: custos, horas, pendências internas, histórico.

**Acções do cliente:**
- Aprovar / rejeitar aprovações do tipo `client`.
- Escrever mensagens (sempre `internal = false`, aparecem do lado interno).
- Marcar documentos como vistos (opcional).

### 10.3 Portal Externo

**Menu reduzido:**
- Bem-vindo.
- Projectos associados.
- Documentos (da sua especialidade).
- Mensagens (thread do projecto, excepto internas).

**Por projecto, o externo vê:**
- Fases (só status, sem datas internas detalhadas).
- Entregáveis com `visibility` incluindo `external` **e associados à sua especialidade**.
- Documentos desses entregáveis.
- Aprovações do tipo `external` (ou `technical`) pendentes que lhe digam respeito.
- Sem: outras especialidades, financeiro, horas, mensagens internas.

**Acções:**
- Upload de novos documentos na sua área (ex.: engenheiro de estabilidade sobe peças de estabilidade).
- Aprovar/rejeitar aprovações técnicas.
- Mensagens (não internas).

### 10.4 Regras de negócio

1. Ao entrar num portal, a sessão interna não se perde — o banner permite voltar.
2. Se o utilizador não tiver um projecto ao qual aceder, mostrar mensagem "Não há projectos partilhados consigo".
3. Nenhuma mutação admin-only pode ser accionada a partir do portal.
4. Design do portal deve ser mais arejado, menos denso do que a interface interna (cliente/externo não é utilizador power).

---

## 11. Fluxos End-to-End Principais

### 11.1 Criar Projecto Novo

1. Menu Projectos → "+ Novo Projecto".
2. Wizard: nome, cliente (dropdown existente ou criar inline), tipologia, localização, datas previstas, orçamento, **template** (dropdown).
3. (Opcional) adicionar membros internos e externos iniciais.
4. Confirmar → novo projecto criado com fases/entregáveis/aprovações copiados do template.
5. Navegar para a vista do projecto, tab Visão Geral.
6. `history` regista "Projecto criado via template X".

### 11.2 Completar uma Fase com Aprovação do Cliente

1. Projecto X → Fases → fase `EP — Estudo Prévio` está `active`.
2. Membro sobe documentos finais para os entregáveis (tab Documentos), mudando status para `shared`.
3. Uma aprovação `client` está pendente → notificação visual no card da fase.
4. Cliente entra no portal → vê aprovação pendente → aprova.
5. Sistema regista `respondedAt`, `respondedBy`, `status=approved`.
6. Membro clica "Completar Fase" → fase fica `done`, `endDateActual = hoje`.
7. Recálculo automático: fase seguinte (`AP`) passa de `pending` para `ready`.
8. Gestor activa `AP`.

### 11.3 Upload com Nova Versão de Documento

1. Projecto → Documentos → documento `Planta_Implantacao_v2.pdf`.
2. "Substituir / Nova versão".
3. Modal: filename `Planta_Implantacao_v3.pdf`, changeType `correction`, notas "Corrigida anotação do cliente sobre recuo frontal".
4. Upload → version = 3, versions[] ganha entrada nova, documento principal actualizado, `history` regista.
5. Cliente vê nova versão no portal com nota.

### 11.4 Registar Tempo por Cronómetro

1. Projecto → Tempo → "Iniciar Cronómetro".
2. Modal: fase, descrição, billable (default true).
3. Iniciar → barra de timer global fica visível com projecto e fase.
4. Utilizador trabalha; pode mudar de página (timer continua).
5. Volta e clica "Parar".
6. Se horas ≥ 0.01, cria TimeLog automaticamente com a descrição dada.
7. Toast "Registadas 1.3h no projecto X".

### 11.5 Check-in de Visita

1. Dashboard → "Check-in Rápido".
2. Selector de projecto → modal de visita pré-preenchido com hoje.
3. Participantes (multi-select), notas, fotos (metadata), acções de follow-up.
4. Guardar → visita criada; se houve acções → aparecem na tab Visitas.
5. Partilhada com cliente aparece no portal.

### 11.6 Converter Orçamento Aceite em Projecto

1. Orçamentação → orçamento `ORC-2026-012` → status `accepted`.
2. Botão "Converter em Projecto".
3. Modal: confirmar mapeamento (fases, membros iniciais, paymentSchedule proposto).
4. Confirmar → novo projecto criado, orçamento liga-se a ele.
5. Navegar para o projecto.

---

## 12. Pesquisa Global e Timer Global

### 12.1 Pesquisa Global (sidebar)

Campo de input no topo da sidebar. Ao digitar (debounced), mostra dropdown com resultados em categorias:
- Projectos.
- Clientes.
- Membros / Externos.
- Documentos (por filename).
- Pendências (por descrição).

Clicar num resultado → navega para o item.
ESC ou clique fora fecha.
Filtros de permissão aplicam-se (não mostrar o que o utilizador não pode ver).

### 12.2 Timer Global

- Sempre um único timer activo (ao iniciar outro, o anterior é parado automaticamente, criando o TimeLog pendente).
- Estado: `{running, projectId, phaseKey, description, startTime, elapsed}`.
- Ao pausar, guarda `elapsed`; ao retomar, continua desse ponto.
- Ao parar, calcula horas totais (arredondadas a 2 casas decimais), cria TimeLog se > 0.
- Persiste entre recargas de página? **Decisão da IA**: idealmente sim (guardar timestamp de início); se for complexo, aceitável que pare ao recarregar.

---

## 13. Comportamentos Observáveis Esperados

### 13.1 Persistência

- Tudo o que é criado/editado sobrevive a F5.
- Se a app base tem DB/API, usar. Se não, `localStorage` com namespace `arch_*`.

### 13.2 Upload de Ficheiros

- Nesta versão é **simulado**: guardar apenas metadados (filename, size, uploadedAt, uploadedBy).
- UI deve mostrar um "input file" mas não é obrigatório fazer upload binário real.
- Se a app base tiver sistema de storage (R2/S3), usar e guardar `fileKey`.

### 13.3 Permissões

- Server-side ou client-side (se for só front), mas aplicadas **de facto**: um cliente a navegar para `projecto/XYZ` de um projecto que não é dele recebe 403 ou redirect.

### 13.4 Estado Vazio

Todas as listagens têm estado vazio explícito com texto amigável e CTA para a acção principal (ex.: "Sem projectos. Crie o seu primeiro →").

### 13.5 Validação de Formulários

- Campos obrigatórios marcados visualmente (*).
- Mensagens de erro inline (junto ao campo).
- Botão "Guardar" desabilitado ou com aviso até form estar válido.

### 13.6 Feedback de Acções

- Toda acção bem-sucedida gera toast ("Projecto criado", "Documento v3 carregado").
- Toda acção falhada gera toast de erro com motivo.

---

## 14. Regras de Negócio Críticas (Resumo Executivo)

Esta secção agrega as regras que, se não forem implementadas, fazem a app parecer "quase igual mas não é". **São críticas para a fidelidade da réplica.**

1. **Promoção automática de fases** `pending → ready` quando todas as dependências estão `done`. Inversa também. Ver §4.B.2.
2. **Uma só fase `active`** por projecto. Ver §4.B.2.
3. **Versionamento imutável** de documentos: cada substituição incrementa versão e guarda histórico; reverter cria nova versão, nunca apaga. Ver §4.B.3.
4. **Timer global único** que ao parar cria TimeLog automático. Ver §12.2.
5. **Visibilidade por entregável** (`visibility[]`) filtra o que externos e clientes vêem, independentemente de estarem associados ao projecto. Ver §1.8, §4.B.2.
6. **Mensagens internas vs partilhadas** (`internal`): internas nunca aparecem em portais. Ver §4.B.9.
7. **Conversão orçamento → projecto** é uma criação completa, com fases, entregáveis, paymentSchedule, e liga `quote ↔ project`. Ver §5.6, §11.6.
8. **IVA 23% editável**, total = subtotal × (1+vat/100). Ver §5.7.
9. **Saúde do projecto** é cor derivada (verde/âmbar/vermelho) baseada em prazos, pendências e orçamento. Ver §4.A.4.
10. **History é append-only**: nunca apagar entradas, mesmo ao apagar o item. Ver §4.B.10.
11. **Check-in rápido** do dashboard abre modal de visita pré-preenchido. Ver §2.3, §11.5.
12. **Portais escondem** tudo o que é custo/horas/história/comunicação interna. Ver §10.

---

## 15. Stack e Integração

### 15.1 Liberdade tecnológica

A IA implementadora deve **seguir a stack da app base onde este módulo vai viver**. Esta spec é agnóstica.

Se a app base não estiver decidida, sugere-se:
- Front: framework moderno (React, Vue, Svelte) ou vanilla JS modular.
- Estado global mínimo; preferir estado por rota/componente.
- Persistência: API REST/RPC + DB (SQLite/Postgres) ou `localStorage` para protótipo.
- Autenticação: reutilizar a da app base ou mock com "utilizador actual" hardcoded.

### 15.2 Convenções sugeridas (se não houver guidance)

- Namespaces: tudo relacionado com este módulo prefixado `arch_` ou em pasta `modules/arch/`.
- Rotas: `/arch/painel`, `/arch/projectos/:id/:tab`, etc.
- Design: reutilizar tokens da app base (cores, espaçamento, tipografia).

### 15.3 Mock Data Inicial (a criar pela IA)

A IA deve criar um **mock inicial realista** para permitir demonstrar todas as funcionalidades ao arrancar numa instalação nova:

- **1 gabinete** com logo/dados fictícios.
- **5-8 membros** internos com diferentes roles (1 admin, alguns arquitectos, estagiário).
- **4-6 externos** (diferentes especialidades).
- **3-5 clientes**.
- **2-3 templates** (pelo menos "Moradia", um de "Reabilitação" e um de "Comercial").
- **4-6 projectos** em diferentes fases e estados:
  - Um no início (PP ready).
  - Um a meio (PE active, com documentos e aprovações).
  - Um perto do fim (AO active).
  - Um bloqueado (para testar blockReason).
  - Um completo.
- **Orçamentos** em cada status (draft, sent, accepted, rejected).
- **TimeLogs** distribuídos pelos últimos 30 dias.
- **Visitas** com fotos (metadados) e acções.
- **Mensagens** várias, algumas internas, algumas partilhadas.
- **Pendências** com diferentes prioridades e deadlines (algumas atrasadas para testar cores).
- **Histórico** populado (mínimo 20 entradas por projecto).

Nomes fictícios (evitar nomes reais). Valores monetários realistas para Portugal.

---

## 16. Critérios de Aceitação (Checklist de Auto-Validação)

A IA implementadora **deve validar** que os seguintes fluxos funcionam end-to-end antes de dar o módulo como pronto. Se algum falhar, corrigir e revalidar.

### 16.1 Navegação e Setup
- [ ] Sidebar mostra todos os menus; clicar em cada um navega correctamente.
- [ ] Pesquisa global encontra projectos, clientes, documentos e pendências.
- [ ] Modo `simple` / `full` alterna e afecta listagens.
- [ ] Reload da página preserva dados criados.

### 16.2 Projectos
- [ ] Criar projecto a partir de template copia fases, entregáveis e aprovações.
- [ ] Lista de projectos ordena por cada coluna.
- [ ] Kanban permite mover projecto entre status.
- [ ] Vista individual abre com Visão Geral.
- [ ] As 10 tabs navegam sem perder contexto.

### 16.3 Fases
- [ ] Activar, bloquear, completar fase funcionam.
- [ ] Ao completar uma fase, fases dependentes passam de `pending` para `ready`.
- [ ] Ao editar dependências removendo, fases podem voltar a `pending`.
- [ ] Só uma fase pode estar `active` em simultâneo.
- [ ] Adicionar/editar/remover entregáveis funciona.
- [ ] Aprovações podem ser aprovadas/rejeitadas.

### 16.4 Documentos
- [ ] Upload cria documento v1 com versions[] inicial.
- [ ] Substituir cria versão N+1 com previousVersion correcto.
- [ ] Histórico mostra todas as versões.
- [ ] Reverter cria nova versão `revert`.
- [ ] Filtros (fase, status, pesquisa) funcionam em combinação.

### 16.5 Pendências
- [ ] Criar, editar, fechar, reabrir.
- [ ] Pendências atrasadas mostram-se a vermelho com dias de atraso.
- [ ] Pendências `high` aparecem no topo.
- [ ] Tab Geral → Tarefas agrega de todos os projectos.

### 16.6 Visitas
- [ ] Registar visita com participantes, fotos e acções.
- [ ] Adicionar/remover fotos de visita existente.
- [ ] Marcar acção como concluída.
- [ ] Check-in rápido do dashboard abre modal pré-preenchido.

### 16.7 Tempo
- [ ] Registo manual de tempo funciona.
- [ ] Cronómetro inicia, pausa, retoma e pára.
- [ ] Parar cronómetro cria TimeLog automaticamente (se > 0).
- [ ] Variância por fase calcula correctamente.
- [ ] Só autor/admin pode editar/apagar registo.

### 16.8 Financeiro
- [ ] PaymentSchedule listado; marcar parcela como paga funciona.
- [ ] Orçamento vs real por fase calcula com hourlyRate.
- [ ] Margem bruta calcula.
- [ ] Tab Financeiro não aparece a externos/clientes.

### 16.9 Equipa do Projecto
- [ ] Adicionar/remover internos, externos, clientes.
- [ ] Cliente só vê o seu projecto.

### 16.10 Mensagens
- [ ] Publicar mensagem interna e partilhada.
- [ ] Mensagens internas não aparecem no portal cliente.

### 16.11 Histórico
- [ ] Todas as acções principais geram entrada de history com detalhe.
- [ ] Apagar item não apaga history relacionado.
- [ ] Filtros funcionam.

### 16.12 Orçamentação
- [ ] Wizard de 4 passos funciona.
- [ ] Cálculo de IVA 23% correcto.
- [ ] Converter orçamento aceite em projecto cria projecto completo e liga-os.
- [ ] Referência sequencial ORC-ANO-NNN.

### 16.13 Templates
- [ ] Criar, editar, duplicar, apagar.
- [ ] Apagar template com projectos associados dá aviso.
- [ ] Editar template não afecta projectos existentes.

### 16.14 Equipa e Configurações
- [ ] CRUD de members, externals, clients funciona.
- [ ] Configurações guardam e aplicam-se (ex.: mudar IVA default, custo/hora por cargo).

### 16.15 Portais
- [ ] Entrar como cliente mostra só os projectos do cliente.
- [ ] Cliente vê apenas entregáveis com `visibility: client`, status `shared`/`approved`.
- [ ] Cliente aprova/rejeita aprovações do tipo `client`.
- [ ] Banner "voltar ao atelier" funciona.
- [ ] Portal externo mostra apenas projectos/entregáveis da sua especialidade.
- [ ] Portais não mostram custos, horas ou mensagens internas.

### 16.16 Permissões
- [ ] Admin vê tudo.
- [ ] Member só vê projectos onde está.
- [ ] External nunca vê financeiro.
- [ ] Client não vê nem pode editar pendências, horas, mensagens internas.

### 16.17 Mock Data
- [ ] App arranca com dados mock realistas que demonstram todas as funcionalidades.
- [ ] Existe pelo menos um projecto em cada estado (início, meio, fim, bloqueado, completo).
- [ ] Nomes são fictícios, não reais.

---

## 17. O Que Fazer em Caso de Dúvida

Se durante a implementação a IA encontrar um caso não previsto nesta spec:

1. **Escolher a opção mais simples** que não contradiga nenhuma regra explicitada.
2. **Ser consistente** com o resto da app (se uma vista usa cards, outra semelhante também deve).
3. **Documentar a decisão** em comentário no código ou num `DECISIONS.md` que a IA crie.
4. **Não inventar funcionalidades extra** que não estejam pedidas (ex.: não adicionar gamification, não adicionar chatbot).
5. **Se a dúvida for sobre permissões** → default é mais restritivo.
6. **Se a dúvida for sobre dados** → inferir do `SCHEMA.md` antes de inventar.

---

## 18. Anexos

### 18.1 Glossário

- **Fase** — etapa do projecto (PP, EP, PE, etc.).
- **Entregável** (Deliverable) — produto concreto de uma fase (ex.: "Peças desenhadas EP").
- **Aprovação** (Approval) — marco formal de validação (cliente, técnica, municipal).
- **Pendência** — tarefa/to-do leve.
- **TimeLog** — registo de tempo imputado.
- **Visita** — ida a obra/terreno com registo.
- **Post** — mensagem no mural do projecto.
- **History** — log imutável de acções.

### 18.2 Documentos relacionados

- `README.md` — visão geral da app de referência.
- `SCHEMA.md` — schema detalhado por entidade.
- Este ficheiro — UX, ecrãs, regras e fluxos.

---

**Fim da especificação.** A IA implementadora tem agora todos os inputs necessários: **o que construir** (este ficheiro), **que dados usar** (`SCHEMA.md`), **e enquadramento geral** (`README.md`). Ao terminar, deve correr o checklist da secção 16 e só considerar o módulo pronto quando todos os itens estiverem ✅.
