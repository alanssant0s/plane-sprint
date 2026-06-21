/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import {
  WORKSPACE_TYPE_I18N_FALLBACK_KEYS,
  WORKSPACE_TYPE_PLURAL_I18N_FALLBACK_KEYS,
  type TTerminologyEntity,
} from "@plane/types";
import { resolveEntityTerm } from "./resolve-entity-term";

type TTerminologyI18nOverride =
  | { kind: "term"; entity: TTerminologyEntity; plural?: boolean }
  | { kind: "count_label"; entity: TTerminologyEntity }
  | { kind: "replace"; entity: TTerminologyEntity; plural?: boolean }
  | { kind: "multi_replace"; entities: { entity: TTerminologyEntity; plural?: boolean }[] };

export const TERMINOLOGY_I18N_OVERRIDES: Record<string, TTerminologyI18nOverride> = {
  projects: { kind: "term", entity: "project", plural: true },
  add_project: { kind: "replace", entity: "project" },
  "common.project": { kind: "term", entity: "project" },
  "common.projects": { kind: "term", entity: "project", plural: true },
  "common.cycle": { kind: "term", entity: "cycle" },
  "common.cycles": { kind: "term", entity: "cycle", plural: true },
  "common.module": { kind: "term", entity: "module" },
  "common.modules": { kind: "term", entity: "module", plural: true },
  "common.page": { kind: "term", entity: "page" },
  "common.pages": { kind: "term", entity: "page", plural: true },
  "common.work_item": { kind: "term", entity: "work_item" },
  "common.work_items": { kind: "term", entity: "work_item", plural: true },
  "common.sub_work_item": { kind: "term", entity: "work_item" },
  "common.epic": { kind: "term", entity: "epic" },
  "common.epics": { kind: "term", entity: "epic", plural: true },
  "common.project_name": { kind: "replace", entity: "project" },
  "common.project_timezone": { kind: "replace", entity: "project" },
  "sidebar.projects": { kind: "term", entity: "project", plural: true },
  "sidebar.cycles": { kind: "term", entity: "cycle", plural: true },
  "sidebar.modules": { kind: "term", entity: "module", plural: true },
  "sidebar.pages": { kind: "term", entity: "page", plural: true },
  "sidebar.work_items": { kind: "term", entity: "work_item", plural: true },
  "sidebar.epics": { kind: "term", entity: "epic", plural: true },
  "sidebar.new_work_item": { kind: "replace", entity: "work_item" },
  "workspace_projects.label": { kind: "count_label", entity: "project" },
  "workspace_projects.create.label": { kind: "replace", entity: "project" },
  "workspace_projects.scope.my_projects": { kind: "replace", entity: "project", plural: true },
  "workspace_projects.empty_state.general.title": { kind: "replace", entity: "project", plural: true },
  "workspace_projects.empty_state.general.description": {
    kind: "multi_replace",
    entities: [
      { entity: "project", plural: true },
      { entity: "project" },
      { entity: "cycle", plural: true },
      { entity: "module", plural: true },
    ],
  },
  "workspace_projects.empty_state.general.primary_button.text": { kind: "replace", entity: "project" },
  "workspace_projects.empty_state.no_projects.title": { kind: "replace", entity: "project" },
  "workspace_projects.empty_state.no_projects.description": {
    kind: "multi_replace",
    entities: [{ entity: "work_item", plural: true }, { entity: "project" }],
  },
  "workspace_projects.empty_state.no_projects.primary_button.text": { kind: "replace", entity: "project" },
  "workspace_projects.empty_state.filter.title": { kind: "replace", entity: "project", plural: true },
  "workspace_projects.empty_state.filter.description": { kind: "replace", entity: "project", plural: true },
  "workspace_projects.empty_state.search.description": { kind: "replace", entity: "project", plural: true },
  publish_project: { kind: "replace", entity: "project" },
  leave_project: { kind: "replace", entity: "project" },
  open_project: { kind: "replace", entity: "project" },
  add_work_item: { kind: "replace", entity: "work_item" },
  create_work_item: { kind: "replace", entity: "work_item" },
  projects_and_issues: { kind: "replace", entity: "project", plural: true },
  projects_and_issues_description: {
    kind: "multi_replace",
    entities: [
      { entity: "project", plural: true },
      { entity: "work_item", plural: true },
    ],
  },
  "workspace_archives.sections.archived_projects.title": {
    kind: "multi_replace",
    entities: [{ entity: "project", plural: true }],
  },
  "workspace_archives.sections.archived_projects.empty": {
    kind: "multi_replace",
    entities: [{ entity: "project", plural: true }],
  },
  create_project: { kind: "replace", entity: "project" },
  project_name: { kind: "replace", entity: "project" },
  project_id: { kind: "replace", entity: "project" },
  project_description_placeholder: { kind: "replace", entity: "project" },
  "common.project_id": { kind: "replace", entity: "project" },
  "common.update_project": { kind: "replace", entity: "project" },
  "project_settings.title": { kind: "replace", entity: "project" },
  add_to_project: { kind: "replace", entity: "project" },
  "common.create_project": { kind: "replace", entity: "project" },
  "common.add_to_project": { kind: "replace", entity: "project" },
  pages: { kind: "term", entity: "page", plural: true },
  modules: { kind: "term", entity: "module", plural: true },
  work_items: { kind: "term", entity: "work_item", plural: true },
  issues: { kind: "term", entity: "work_item", plural: true },
  create_new_issue: { kind: "replace", entity: "work_item" },
  change_parent_issue: { kind: "replace", entity: "work_item" },
  remove_parent_issue: { kind: "replace", entity: "work_item" },
  "wiki.add_page": { kind: "replace", entity: "page" },
  "issue.add.label": { kind: "replace", entity: "work_item" },
  "issue.new": { kind: "replace", entity: "work_item" },
  "issue.adding": { kind: "replace", entity: "work_item" },
  "issue.display.properties.sub_issue_count": { kind: "replace", entity: "work_item" },
  "issue.display.properties.work_item_count": { kind: "replace", entity: "work_item", plural: true },
  "issue.display.extra.show_sub_issues": { kind: "replace", entity: "work_item", plural: true },
  "home.recents.filters.projects": { kind: "replace", entity: "project", plural: true },
  "home.recents.filters.pages": { kind: "term", entity: "page", plural: true },
  "home.recents.filters.issues": { kind: "term", entity: "work_item", plural: true },
  "cycle.label": { kind: "term", entity: "cycle" },
  "module.no_module": { kind: "replace", entity: "module" },
};

const STANDARD_ENTITY_REPLACEMENTS: { entity: TTerminologyEntity; plural?: boolean }[] = [
  { entity: "project", plural: true },
  { entity: "project" },
  { entity: "work_item", plural: true },
  { entity: "work_item" },
  { entity: "cycle", plural: true },
  { entity: "cycle" },
  { entity: "module", plural: true },
  { entity: "module" },
  { entity: "page", plural: true },
  { entity: "page" },
  { entity: "epic", plural: true },
  { entity: "epic" },
];

const PROJECT_CYCLE_ENTITY_REPLACEMENTS: { entity: TTerminologyEntity; plural?: boolean }[] = [
  { entity: "cycle", plural: true },
  { entity: "cycle" },
  { entity: "work_item", plural: true },
  { entity: "work_item" },
  { entity: "project" },
];

const PROJECT_MODULE_ENTITY_REPLACEMENTS: { entity: TTerminologyEntity; plural?: boolean }[] = [
  { entity: "module", plural: true },
  { entity: "module" },
  { entity: "work_item", plural: true },
  { entity: "work_item" },
  { entity: "project", plural: true },
  { entity: "project" },
];

export const TERMINOLOGY_I18N_PREFIX_OVERRIDES: { prefix: string; override: TTerminologyI18nOverride }[] = [
  { prefix: "project_empty_state.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "workspace_empty_state.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "project_cycles.", override: { kind: "multi_replace", entities: PROJECT_CYCLE_ENTITY_REPLACEMENTS } },
  { prefix: "project_module.", override: { kind: "multi_replace", entities: PROJECT_MODULE_ENTITY_REPLACEMENTS } },
  { prefix: "project_settings.features.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "disabled_project.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  {
    prefix: "home.empty.create_project.",
    override: { kind: "multi_replace", entities: [{ entity: "project" }, { entity: "project", plural: true }] },
  },
  {
    prefix: "workspace_empty_state.projects_archived",
    override: { kind: "multi_replace", entities: [{ entity: "project", plural: true }] },
  },
  {
    prefix: "empty_state.projects_archived",
    override: { kind: "multi_replace", entities: [{ entity: "project", plural: true }] },
  },
  { prefix: "power_k.navigation_actions.open_project", override: { kind: "replace", entity: "project" } },
  { prefix: "power_k.navigation_actions.open_project_cycle", override: { kind: "replace", entity: "cycle" } },
  { prefix: "power_k.navigation_actions.open_project_module", override: { kind: "replace", entity: "module" } },
  { prefix: "power_k.navigation_actions.open_project_view", override: { kind: "replace", entity: "project" } },
  { prefix: "power_k.navigation_actions.open_project_setting", override: { kind: "replace", entity: "project" } },
  { prefix: "power_k.page_placeholders.open_project", override: { kind: "replace", entity: "project" } },
  { prefix: "power_k.page_placeholders.open_project_cycle", override: { kind: "replace", entity: "cycle" } },
  { prefix: "power_k.page_placeholders.open_project_module", override: { kind: "replace", entity: "module" } },
  { prefix: "power_k.page_placeholders.open_project_view", override: { kind: "replace", entity: "project" } },
  { prefix: "power_k.page_placeholders.open_project_setting", override: { kind: "replace", entity: "project" } },
  { prefix: "issue.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "wiki.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "home.recents.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "home.empty.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "project_settings.general.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "project_settings.labels.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  {
    prefix: "project_settings.estimates.",
    override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS },
  },
  {
    prefix: "project_settings.automations.",
    override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS },
  },
  { prefix: "empty_state.analytics_", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "empty_state.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  {
    prefix: "accessibility.aria_labels.projects_sidebar.",
    override: { kind: "multi_replace", entities: [{ entity: "project", plural: true }] },
  },
  { prefix: "notifications.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "work_item.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "workspace_analytics.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "workspace_archives.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "profile.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "project_settings.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "power_k.creation_actions.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  {
    prefix: "power_k.contextual_actions.",
    override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS },
  },
  {
    prefix: "power_k.navigation_actions.",
    override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS },
  },
  { prefix: "power_k.page_placeholders.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "power_k.search_menu.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "epic.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
  { prefix: "entity.", override: { kind: "multi_replace", entities: STANDARD_ENTITY_REPLACEMENTS } },
];

function getTerminologyOverride(key: string): TTerminologyI18nOverride | undefined {
  if (TERMINOLOGY_I18N_OVERRIDES[key]) return TERMINOLOGY_I18N_OVERRIDES[key];
  return TERMINOLOGY_I18N_PREFIX_OVERRIDES.find(({ prefix }) => key.startsWith(prefix))?.override;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function replaceTermInText(text: string, oldTerm: string, newTerm: string): string {
  if (!oldTerm || oldTerm === newTerm) return text;

  const regex = new RegExp(`\\b${escapeRegExp(oldTerm)}\\b`, "gi");

  return text.replace(regex, (match) => {
    if (match === match.toUpperCase()) return newTerm.toUpperCase();
    if (match[0] === match[0].toUpperCase()) {
      return newTerm.charAt(0).toUpperCase() + newTerm.slice(1);
    }
    return newTerm.toLowerCase();
  });
}

type TResolveTerminologyTranslationParams = {
  key: string;
  options?: Record<string, unknown>;
  workspaceType: string;
  locale: string;
  fallback: (key: string, options?: Record<string, unknown>) => string;
};

function getEntityTerm(
  entity: TTerminologyEntity,
  plural: boolean | undefined,
  workspaceType: string,
  locale: string,
  fallback: TResolveTerminologyTranslationParams["fallback"]
): string {
  const term = resolveEntityTerm({
    workspaceType,
    locale,
    entity,
    fallback: (termKey) => fallback(termKey),
  });

  if (plural && term.plural) return term.plural;
  return term.singular;
}

function getDefaultEntityTerm(
  entity: TTerminologyEntity,
  plural: boolean | undefined,
  fallback: TResolveTerminologyTranslationParams["fallback"]
): string {
  const singularKey = WORKSPACE_TYPE_I18N_FALLBACK_KEYS[entity];
  const pluralKey = WORKSPACE_TYPE_PLURAL_I18N_FALLBACK_KEYS[entity];
  const key = plural && pluralKey ? pluralKey : singularKey;
  return fallback(key);
}

function replaceEntityTermInText(
  text: string,
  entity: TTerminologyEntity,
  plural: boolean | undefined,
  workspaceType: string,
  locale: string,
  fallback: TResolveTerminologyTranslationParams["fallback"]
): string {
  const defaultTerm = getDefaultEntityTerm(entity, plural, fallback);
  const newTerm = getEntityTerm(entity, plural, workspaceType, locale, fallback);
  return replaceTermInText(text, defaultTerm, newTerm);
}

export function resolveTerminologyTranslation({
  key,
  options,
  workspaceType,
  locale,
  fallback,
}: TResolveTerminologyTranslationParams): string {
  const override = getTerminologyOverride(key);
  const baseTranslation = fallback(key, options);

  if (!override) return baseTranslation;

  if (override.kind === "term") {
    return getEntityTerm(override.entity, override.plural, workspaceType, locale, fallback);
  }

  if (override.kind === "count_label") {
    const count = Number(options?.count ?? 1);
    const usePlural = count !== 1;
    return getEntityTerm(override.entity, usePlural, workspaceType, locale, fallback);
  }

  if (override.kind === "replace") {
    return replaceEntityTermInText(baseTranslation, override.entity, override.plural, workspaceType, locale, fallback);
  }

  return override.entities.reduce(
    (text, { entity, plural }) => replaceEntityTermInText(text, entity, plural, workspaceType, locale, fallback),
    baseTranslation
  );
}
