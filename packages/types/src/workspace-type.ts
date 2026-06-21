/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export enum EWorkspaceType {
  DEFAULT = "default",
  CIVIL_ENGINEERING = "civil_engineering",
  DIGITAL_LAUNCHES = "digital_launches",
  SOFTWARE_DEVELOPMENT = "software_development",
  MARKETING_AGENCY = "marketing_agency",
  CUSTOMER_SUCCESS = "customer_success",
  LEGAL = "legal",
  EDUCATION = "education",
  EVENTS = "events",
  DESIGN_CREATIVE = "design_creative",
}

export type TTerminologyEntity = "work_item" | "project" | "cycle" | "module" | "epic" | "page";

export type TTerminologyLocale = "en" | "pt-BR";

export type TEntityTerm = {
  singular: string;
  plural?: string;
};

export type TTerminologyBundle = Partial<Record<TTerminologyEntity, TEntityTerm>>;

export type TWorkspaceTypeDefinition = {
  id: EWorkspaceType;
  i18n_label: Record<TTerminologyLocale, string>;
  i18n_description: Record<TTerminologyLocale, string>;
  wave: 1 | 2;
  terminology: Partial<Record<TTerminologyLocale, TTerminologyBundle>>;
};

export type TResolveEntityTermParams = {
  workspaceType: EWorkspaceType | string;
  locale: string;
  entity: TTerminologyEntity;
  fallback: (key: string) => string;
};

export const WORKSPACE_TYPE_I18N_FALLBACK_KEYS: Record<TTerminologyEntity, string> = {
  work_item: "common.work_item",
  project: "common.project",
  cycle: "common.cycle",
  module: "common.module",
  epic: "common.epic",
  page: "common.page",
};

export const WORKSPACE_TYPE_PLURAL_I18N_FALLBACK_KEYS: Partial<Record<TTerminologyEntity, string>> = {
  work_item: "common.work_items",
  project: "common.projects",
  cycle: "common.cycles",
  module: "common.modules",
  epic: "common.epics",
  page: "common.pages",
};
