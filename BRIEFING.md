# Briefing — Módulo de Arquitectura

> **Para a IA/equipa que vai implementar este módulo.** Lê este ficheiro primeiro. Demora 2 minutos.

## 1. O que vais construir

Um **módulo vertical de gestão de projectos de arquitectura** para ser integrado numa **app base SaaS existente**. Não é uma app standalone.

O módulo serve gabinetes de arquitectura no dia-a-dia: gerir projectos por fases (do Programa Preliminar ao fim de obra), documentos versionados, registo de tempo, orçamentos, visitas de obra, e dois modos de portal para clientes e colaboradores externos acompanharem o trabalho.

**Personas:** Admin (sócio/director), Member (arquitecto do gabinete), External (engenheiro/consultor externo), Client (cliente final).

## 2. Em que contexto vais construir

- **Integras numa app base existente.** Usa a stack, design system, sistema de rotas, autenticação e persistência que essa app já tiver. **Não escolhas stack por tua conta.**
- Se a app base não tiver algum desses mecanismos (ex.: storage, permissões), cria versão simplificada e **documenta a assumpção**.
- **Não precisas de replicar** nenhuma implementação de referência. Só precisas de cumprir a especificação funcional.

## 3. Ficheiros que recebes

Por ordem de leitura:

1. **`BRIEFING.md`** — este ficheiro. Enquadramento.
2. **`SPEC_FUNCIONAL.md`** — **documento principal.** Descreve menus, ecrãs, campos, acções, regras de negócio, fluxos end-to-end e checklist de aceitação. É aqui que está o "o quê" e o "porquê".
3. **`SCHEMA_LIMPO.md`** — estrutura de dados por entidade (campos, tipos, valores possíveis). Agnóstico de implementação.

**Ignora qualquer outro ficheiro que te forneçam sobre este tema** — pode ser documentação interna do protótipo original e vai baralhar-te.

## 4. Regras de ouro

1. **A `SPEC_FUNCIONAL.md` é a fonte de verdade.** Se o schema parecer dizer algo diferente, a spec ganha.
2. **Respeita as regras de negócio críticas** (resumidas na §14 da spec). São elas que distinguem este módulo de um CRUD genérico.
3. **Respeita permissões** (§1.8 e §10 da spec). Cliente nunca vê custos/horas. Externo nunca vê financeiro nem outras especialidades.
4. **Cria mock data realista** ao arrancar (§15.3 da spec): gabinete, equipa, templates, 4-6 projectos em estados diferentes, orçamentos, tempos, visitas, pendências, histórico. Nomes fictícios.
5. **Não inventes funcionalidades extra** que não estejam pedidas (nada de chatbots, gamification, AI summaries, etc.).
6. **Em caso de dúvida:** opção mais simples, mais consistente com o resto, e **documenta a decisão** em comentário ou num `DECISIONS.md` que crias.
7. **Permissões em dúvida → default mais restritivo.**

## 5. Como saber que terminaste

A spec inclui um **checklist de aceitação com 17 grupos de testes** (§16). Corre-o tu própria/o antes de dar o módulo como pronto. Se algum item falhar, corrige e revalida. Só consideras terminado quando tudo passar.

## 6. O que **não** está no âmbito

Não precisas de implementar (a spec explica o que fazer em alternativa):
- Autenticação real (usa a da app base ou mock).
- Upload binário real de ficheiros (guarda apenas metadados — filename, size, uploadedAt, uploadedBy).
- Envio real de emails/notificações.
- Multi-tenant.
- Assinatura digital.
- Impressão em PDF (`window.print()` do HTML formatado é aceitável).

---

**Próximo passo:** abre `SPEC_FUNCIONAL.md` e começa pela §0 e §1 (contexto e princípios transversais). A §4 (Menu Projectos, 10 tabs) é a mais densa e é onde está o coração do módulo.
