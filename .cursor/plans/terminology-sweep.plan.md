# Plano: varredura geral de terminologia (white-label)

## Contexto

A feature **Tipo de workspace + Terminologia** já tem backend (`workspace_type`), registry de bundles (`packages/constants/src/workspace-types/`) e hooks (`useEntityTerm`, `useTerminologyT`). Porém a cobertura na UI ainda é parcial:

| Métrica (apps/web)                         | Valor atual |
| ------------------------------------------ | ----------- |
| Arquivos com `useTranslation()`            | ~433        |
| Arquivos com `useTerminologyT()`           | ~55         |
| Arquivos com `useEntityTerm()`             | ~14         |
| Headers com `label="Pages"` etc. hardcoded | 7           |
| Botões `"Add page"` etc. hardcoded         | 2+          |

**Exemplo do furo (screenshot Pages):** sidebar do projeto mostra **Brief** (via `project-navigation` + `useEntityTerm`), mas a listagem usa `pages/(list)/header.tsx` com `label="Pages"` e `"Add page"` fixos em inglês.

---

## Princípios (não negociáveis)

1. **Rotas e APIs não mudam** — só rótulos visíveis.
2. **`work_item`** usa `GLOBAL_TERMINOLOGY` (Task/Tarefa) em todos os tipos.
3. **`page` em `software_development`** sem override (regra de produto).
4. **Squads / Sprints / Intake / Views** — fora do bundle de entidades; tratar como fase separada ou manter nome Plane.
5. Toda string visível ao usuário deve passar por **uma** destas vias:
   - `useEntityTerm("entity", { plural? })`
   - `useTerminologyT()` (chave i18n mapeada)
   - i18n + override em `terminology-i18n.ts`

---

## Arquitetura alvo

```
useTerminologyT()
  └─ resolveTerminologyTranslation()
       ├─ TERMINOLOGY_I18N_OVERRIDES (chaves exatas)
       └─ TERMINOLOGY_I18N_PREFIX_OVERRIDES (prefixos)
            └─ replaceEntityTermInText() sobre t(key) original
```

### Melhorias recomendadas antes da varredura em massa

1. **`useTranslation` → wrapper default** (opcional, fase 4): exportar `useTranslation` de `@plane/i18n` re-exportado em `@/hooks/use-i18n` que já aplica terminologia — evita migrar 400 arquivos manualmente.
2. **Helper composto** para padrões comuns:
   - `useEntityActionLabel("add", "page")` → "Add Brief"
   - `useEntityPageTitle("page", { plural: true })` → breadcrumb/header
3. **Lint/check CI**: script que falha se encontrar strings proibidas ou chaves i18n de entidade usadas com `useTranslation` direto.

---

## Metodologia de varredura

### Passo 1 — Inventário automatizado (gerar relatório)

Rodar buscas e salvar resultado em `scripts/terminology-audit.sh`:

```bash
# A. Hardcoded EN (alta prioridade)
rg -n 'label="(Pages|Cycles|Modules|Work items|Projects|Epics)"' apps/web
rg -n '"(Add page|Add project|Add cycle|Add module|New work item|Create work item)"' apps/web
rg -n 'title: "(Projects|Pages|Cycles|Modules|Work items)"' apps/web
rg -n 'name: "(Work items|Cycles|Modules|Pages)"' apps/web

# B. Chaves i18n de entidade ainda sem override
rg -n 't\(["'\''](common\.(project|module|cycle|page|work_item|epic)|projects|add_project|sidebar\.(projects|cycles|modules|pages|work_items))' apps/web

# C. Arquivos com useTranslation que referenciam namespaces sensíveis
rg -l 'project_empty_state\.|workspace_empty_state\.|project_cycles\.|project_module\.|project_settings\.features\.' apps/web \
  | xargs rg -L 'useTerminologyT'

# D. Constantes estáticas (command palette, search map, webhooks, plans, tour)
rg -n 'title: "(Projects|Pages|Cycles|Modules|Work items)"' apps/web packages
```

### Passo 2 — Classificar cada ocorrência

| Classe                                     | Ação                                                              |
| ------------------------------------------ | ----------------------------------------------------------------- |
| **H1** — string literal em JSX/TS          | Migrar para `useEntityTerm` ou i18n + override                    |
| **H2** — chave i18n conhecida              | Trocar hook para `useTerminologyT` ou adicionar override          |
| **H3** — constante estática (maps, arrays) | Converter para factory `getX(workspaceType, t)` ou hook no render |
| **H4** — template string composta          | Usar helper `replaceEntityTermInText` ou i18n com `{entity}`      |
| **H5** — fora de escopo (Squads, rotas)    | Documentar exceção                                                |

### Passo 3 — Validar por tipo de workspace

Checklist manual com **Marketing** (`project`→Campaign) e **Civil** (`page`→Document):

- [ ] Sidebar workspace + projeto
- [ ] Listagem de projetos + arquivos workspace
- [ ] Nav do projeto (Task, Deliverable, Brief ✓ / Pages ✗)
- [ ] Headers de listagem (pages, cycles, modules, issues)
- [ ] Empty states + arquivos por projeto
- [ ] Modais create/delete/archive
- [ ] Settings do projeto (features toggles)
- [ ] Analytics tabs e empty states
- [ ] Command palette + Power K search
- [ ] Home widgets + onboarding tour
- [ ] Notificações / toasts com nome de entidade

---

## Mapa de superfícies por prioridade

### P0 — Visível em toda sessão (fazer primeiro)

| Superfície                           | Arquivos principais                                                                                            | Problema                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Headers de listagem por entidade** | `pages/(list)/header.tsx`, `cycles/(list)/header.tsx`, `modules/(list)/header.tsx`, `issues/(list)/header.tsx` | `label="Pages"`, `"Add page"`, etc. hardcoded         |
| **Breadcrumbs detalhe**              | `pages/(detail)/header.tsx`, `cycles/(detail)/header.tsx`, `modules/(detail)/header.tsx`                       | Mesmo padrão                                          |
| **Nav do projeto (CE)**              | `ce/components/projects/navigation/helper.tsx`, `ce/components/navigations/use-navigation-items.ts`            | `name: "Pages"` estático — sidebar usa outro caminho  |
| **Project navigation**               | `project-navigation.tsx`                                                                                       | Parcialmente OK; `i18n_key` fallback ainda usa `t()`  |
| **Sidebar projeto**                  | `projects-list.tsx`                                                                                            | `t("projects")` — precisa `useTerminologyT` ✓ parcial |
| **Quick actions**                    | `quick-actions.tsx`                                                                                            | `sidebar.new_work_item` ✓ parcial                     |

### P1 — Fluxos frequentes

| Superfície            | Arquivos                                                                         | Problema                                      |
| --------------------- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| **Modais de criação** | `create-project-modal`, `project/create/*`, `modules/form.tsx`, `cycles/*`       | `create_project`, strings compostas           |
| **Delete/archive**    | `delete-issue-modal.tsx`, `delete-module-modal.tsx`, `delete-modal.tsx` (cycles) | Texto inline `"work item"`, `"module"`        |
| **Issue layouts**     | `spreadsheet-header.tsx`, `group-by-card.tsx`, `layout-quick-actions.tsx`        | `"Work items"` / `"Epics"` hardcoded          |
| **Dropdowns**         | `module/base.tsx`, `cycle/index.tsx`, `module-options.tsx`                       | `module.no_module`, placeholders              |
| **Inbox**             | `add_to_project`, `create_work_item`                                             | Chaves common sem override em alguns arquivos |
| **Filtros aplicados** | `applied-filters/*`, `project-display-filters.tsx`                               | Parcial ✓                                     |

### P2 — Secundário mas visível

| Superfície        | Arquivos                                                      |
| ----------------- | ------------------------------------------------------------- |
| Command palette   | `ce/components/command-palette/helpers.tsx`                   |
| Power K search    | `power-k/ui/modal/search-results-map.tsx`                     |
| Webhooks          | `web-hooks/form/individual-event-options.tsx`                 |
| Analytics         | tabs CE, empty states, `priority-chart.tsx`, `data-table.tsx` |
| Home / onboarding | `no-projects.tsx`, `tour/sidebar.tsx`, `plans.tsx`            |
| Active cycles     | `active-cycle/progress.tsx`, `cycle-stats.tsx`                |
| Profile / recents | `home/recents/index.tsx` (`i18n_key: projects`)               |
| Settings projeto  | headers + pages em `settings/projects/[projectId]/features/*` |
| Auth restriction  | `project-access-restriction.tsx`                              |

### P3 — Exceções / decisão de produto

| Item                            | Decisão sugerida                              |
| ------------------------------- | --------------------------------------------- |
| Squads, Sprints                 | Manter ou criar entidade separada no registry |
| Intake, Views, Stickies         | Manter i18n padrão Plane                      |
| Rotas `/projects/`, `/pages/`   | Não alterar                                   |
| `aria-label` / SEO `PageHead`   | Aplicar terminologia onde for label visível   |
| Planos comerciais (`plans.tsx`) | Baixa prioridade / marketing copy             |

---

## Chaves i18n — gaps no registry (`terminology-i18n.ts`)

### Já cobertas (parcial)

- `common.project*`, `sidebar.*`, `workspace_projects.*`, `workspace_archives.sections.archived_projects.*`
- Prefixos: `project_empty_state.`, `workspace_empty_state.`, `project_cycles.`, `project_module.`, `project_settings.features.`, `disabled_project.`, `home.empty.create_project.`, `power_k.*open_project*`

### Ainda faltam (adicionar override ou prefixo)

```
# common.json
create_project, add_to_project, project_link_copied_to_clipboard
work_items (root key, usado em cycles sidebar)
pages (root key)
entity.* (params { entity: t("common.X") } — interceptar no call site)

# wiki.json / project.json
wiki.add_page, project_pages.*

# home.json
home.recents.filters.projects, home.empty.*

# empty-state.json
empty_state.analytics_*, workspace_empty_state.inbox_*

# project-settings.json
project_settings.general.*, project_settings.labels.* (contém "project")
project_settings.estimates.*, project_settings.automations.*

# accessibility.json
aria_labels.projects_sidebar.* (acessibilidade — aplicar terminologia)

# notifications, work-item.json
Mensagens longas com "work item", "project", "archived"
```

**Regra:** preferir **prefixo** (`project_settings.`) a cadastrar centenas de chaves individuais.

---

## Fases de implementação

### Fase 1 — Headers e breadcrumbs (P0) — ~1 PR

Corrigir os 7 headers com labels hardcoded + botões Add \*:

- [ ] `pages/(list)/header.tsx` — `useEntityTerm("page")` + i18n `add_entity` ou helper
- [ ] `pages/(detail)/header.tsx`
- [ ] `cycles/(list|detail)/header.tsx`
- [ ] `modules/(list|detail)/header.tsx`
- [ ] `archives/issues/(detail)/header.tsx`
- [ ] Unificar padrão: `EntityBreadcrumbLabel` + `EntityAddButton`

**Critério:** Marketing mostra Brief / Add brief; Civil mostra Documento / Adicionar documento.

### Fase 2 — Constantes estáticas → factories (P0–P1) — ~1 PR

- [ ] `ce/components/projects/navigation/helper.tsx`
- [ ] `ce/components/navigations/use-navigation-items.ts`
- [ ] `ce/components/command-palette/helpers.tsx`
- [ ] `power-k/ui/modal/search-results-map.tsx`
- [ ] `web-hooks/form/individual-event-options.tsx`
- [ ] `project/settings/features-list.tsx` — títulos/descrições hardcoded EN nos objetos

Padrão:

```ts
export function getProjectNavItems(getTerm: (e: TTerminologyEntity, p?: boolean) => string) {
  return [{ key: "pages", name: getTerm("page", true), ... }];
}
```

### Fase 3 — Migrar `useTranslation` → `useTerminologyT` por namespace — ~2–3 PRs

Ordem sugerida (cada PR roda checklist manual):

1. **Issues** (~80 arquivos): modais, empty states, quick-add, peek, layout headers
2. **Cycles + Modules** (~50 arquivos)
3. **Pages + Wiki** (~30 arquivos)
4. **Project settings + estimates** (~40 arquivos)
5. **Analytics + Home + Onboarding** (~30 arquivos)
6. **Power K + Command palette** (~20 arquivos)

Script auxiliar por PR:

```bash
rg -l 'project_empty_state\.' apps/web | while read f; do
  grep -q useTerminologyT "$f" || echo "$f"
done
```

### Fase 4 — i18n: templates com `{entity}` (qualidade)

Substituir padrão frágil `replaceTermInText` em frases longas por chaves explícitas:

```json
"add_entity": "Add {entity}",
"archived_entity_title": "Archived {entity_plural}"
```

Adicionar em `en` + `pt-BR`; usar `t("add_entity", { entity: useEntityTerm("page") })`.

### Fase 5 — Guardrails (CI)

- [ ] `scripts/check-terminology.ts`: falha em regex de strings proibidas em `apps/web/**/*.tsx`
- [ ] Opcional: ESLint custom rule — proibir `label="Pages"` etc.
- [ ] Teste unitário em `terminology-i18n.ts` por workspace type (Marketing, Civil, Software)

---

## Testes de aceitação

Para cada `EWorkspaceType` onda 1 (Default, Civil, Digital Launches, Software Dev):

1. Alterar tipo em Settings → Tipo de workspace → Salvar
2. Percorrer checklist P0 sem encontrar termo padrão Plane incorreto
3. Confirmar Software Dev: **Page** permanece "Page"
4. Confirmar work item = Task/Tarefa em todos
5. `pnpm --filter=web exec tsc --noEmit` + smoke manual

---

## Riscos

| Risco                                          | Mitigação                                    |
| ---------------------------------------------- | -------------------------------------------- |
| `replaceTermInText` quebra gramática PT        | Fase 4 com templates i18n                    |
| Regressão em traduções não-EN/pt-BR            | Overrides usam fallback i18n do locale atual |
| Duplicação sidebar vs header (dois code paths) | Fase 2 unifica helpers CE/core               |
| Performance (muitos hooks)                     | `useEntityTermPair()` cache por render       |

---

## Ordem recomendada de execução

1. **Fase 1** — corrige o bug do screenshot (Pages vs Brief)
2. **Fase 2** — command palette e nav CE (segunda fonte de inconsistência)
3. **Expandir prefixos** em `terminology-i18n.ts` (`project_settings.`, `wiki.`, `home.recents.`)
4. **Fase 3** — migração em lote por namespace
5. **Fase 4 + 5** — qualidade e CI

Estimativa: **4–6 PRs** para cobertura ~95% das superfícies visíveis; 100% exige decisão sobre Squads/Sprints e revisão de todas as ~433 chamadas `useTranslation`.
