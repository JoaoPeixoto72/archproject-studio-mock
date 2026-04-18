# ArchProject Studio - Mapa de Cores e Tokens (COLOR-MAP.md)

Levantamento de cores em hardcode ao longo do código-fonte (js, styles.css) que precisam de ser substituídas por tokens CSS coerentes aquando da migração do sistema.

## Fundos Gerais (Backgrounds) & Paineis

| Cor Hex / RGB | Onde é usada (Categorias) | Quantidade | Token CSS sugerido |
|---------|-------------|------------|-------------------|
| `#f9fafb` | bg da app global, painéis listagem (`var(--bg-main)`) | ++ | `var(--bg-main)` ou `var(--surface-50)` |
| `#ffffff`, `#fff` | Cards, modais, campos de input, navbar | +++++ | `var(--bg-card)` |
| `#f3f4f6` | Hover effects, headers de tabelas secundários | +++ | `var(--surface-100)` |
| `#fafaf9` | Fundos de blocos de listas secundárias | ++ | `var(--surface-100-warm)` |
| `#f0ece7` | Modais no Quotes_Module | + | `var(--border-warm)` |

## Borders e Divisórias

| Cor Hex / RGB | Onde é usada (Categorias) | Quantidade | Token CSS sugerido |
|---------|-------------|------------|-------------------|
| `#e5e7eb` | Separadores de tables, inputs (global) (`var(--border-base)`) | +++++ | `var(--border-default)` |
| `#d1d5db` | Hover/focus border, checkboxes unselected | +++ | `var(--border-strong)` |
| `#eee` | Card borders variados | ++ | `var(--border-default)` |
| `#f0ece7`, `#e5dfd5` | Borders em Quotes / Templates | ++ | `var(--border-warm)` ou `theme-warm` |

## Texto (Tipografia)

| Cor Hex / RGB | Onde é usada (Categorias) | Quantidade | Token CSS sugerido |
|---------|-------------|------------|-------------------|
| `#111827` | Texto principal, headers, cards | +++++ | `var(--text-primary)` |
| `#4b5563` | Subtextos, labels, links não ativados | ++++ | `var(--text-secondary)` |
| `#6b7280` | Texto muted, descrições contextuais | ++++ | `var(--text-muted)` |
| `#9ca3af` | Placeholders, ícones de inatividade, notas minúsculas | +++ | `var(--text-ghost)` |
| `#374151` | Algum intermédio entre secondary e primary | ++ | `var(--text-dark)` |
| `#808080`, `#999`, `#ccc` | Vários componentes legacy (Dashboard, Quotes) | ++ | (Substituir pelos tokens oficiais) |
| `#7a736b`, `#9a928a` | Texto secundário no Quotes_Module | ++ | `var(--text-secondary-warm)` |

## Acentos (Marca & Estados)

| Cor Hex / RGB | Onde é usada (Categorias) | Quantidade | Token CSS sugerido |
|---------|-------------|------------|-------------------|
| `#2563eb` | Primary Blue: Links ativos, Primary Buttons, Checkbox focus | ++++ | `var(--brand-primary)` |
| `#1d4ed8` | Blue Hover: Estados de Hover de botões primary | +++ | `var(--brand-primary-hover)` |
| `#eff6ff` | Fundo de destaque, hover em itens da sidebar ativos | ++ | `var(--brand-primary-light)` |

### Estados: Sucesso (Verdes)
| Cor Hex / RGB | Onde é usada (Categorias) | Quantidade | Token CSS sugerido |
|---------|-------------|------------|-------------------|
| `#16a34a`, `#10b981`, `#059669` | Success text, Ícones ('done', aprovações, client visibility) | +++ | `var(--state-success)` |
| `#dcfce7`, `#d1fae5` | Background para badges de success | +++ | `var(--state-success-light)` |

### Estados: Alerta / Aviso (Amarelos / Laranjas)
| Cor Hex / RGB | Onde é usada (Categorias) | Quantidade | Token CSS sugerido |
|---------|-------------|------------|-------------------|
| `#d97706`, `#f59e0b`, `#ea580c` | Warning/In-review text (external visibility) | +++ | `var(--state-warning)` |
| `#fef3c7`, `#fffbeb`, `#ffedd5`| Fundo de badges pending/alerta moderado | +++ | `var(--state-warning-light)` |

### Estados: Erro / Bloqueio (Vermelhos)
| Cor Hex / RGB | Onde é usada (Categorias) | Quantidade | Token CSS sugerido |
|---------|-------------|------------|-------------------|
| `#ef4444`, `#dc2626` | Text/Boroders de bloqueio, overdue tasks, deletes | +++ | `var(--state-danger)` |
| `#fee2e2`, `#fef2f2` | Badges de atraso, fundo erro | +++ | `var(--state-danger-light)` |

### Estados PENDENTES / READY
| Cor Hex / RGB | Onde é usada (Categorias) | Quantidade | Token CSS sugerido |
|---------|-------------|------------|-------------------|
| `#7e22ce`, `#6b21a8` | Estados Purple (ex: Ready / Fase Pronta) | + | `var(--state-ready)` |
| `#f3e8ff` | Purple background | + | `var(--state-ready-light)` |

---

### ⚠️ Inconsistências
1. **Desvios de tonalidade:** Existem blocos de código com `#eee`, `#ccc`, e `#999` misturados com a palette do Tailwind Moderno (`#e5e7eb`, `#d1d5db`). Devem todos convergir e usar as CSS Vars correspondentes (ex: `var(--border-default)`).
2. O módulo de **Templates** e **Quotes** utilizam ocasionalmente um "tema pastel warm" (com hexs: `#f0ece7`, `#7a736b`, `#c5b9a8`) diferente do azul-acizentado (`#f3f4f6`) do UI normal. Ao migrar, ou assume-se multitema, ou uniformiza-se num CSS Var partilhado.
3. No script de utilidades `utils.js` e em rendering (`renderProjectDocuments`) existem as classes do Tailwind em hardcode `bg-green-100`, que, apesar de mais fáceis, vão de encontro ao CSS estrito que usará Tokens. A migração precisará migrar tudo o que vem de `utils.js -> getStatusColor()` para injectar a Root Classe correta (ex: `class="badge state-success"`).
