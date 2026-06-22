/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { EWorkspaceType } from "./workspace-type";

export type TProjectTemplateSeedRef = {
  seedId: string;
  wave: 1 | 2;
  isDefault?: boolean;
};

export type TProjectTemplateSeedMeta = {
  seedId: string;
  i18n: {
    en: string;
    "pt-BR": string;
  };
  i18n_description?: {
    en: string;
    "pt-BR": string;
  };
  workspaceTypes: EWorkspaceType[];
  wave: 1 | 2;
  moduleCount: number;
  issueCount: number;
  defaultIssueState: string;
  hasBacklog: boolean;
};

export type TProjectTemplateSeedState = {
  name: string;
  group: string;
  color?: string;
};

export type TProjectTemplateSeedLabel = {
  name: string;
  color?: string;
};

export type TProjectTemplateSeedModule = {
  name: string;
  sort_order?: number;
};

export type TProjectTemplateSeedIssue = {
  name: string;
  module?: string;
  labels?: string[];
  priority?: string;
  description?: string;
  parent?: string;
};

export type TProjectTemplateSeedDefinition = {
  seedId: string;
  workspaceTypes: string[];
  defaultIssueState: string;
  states: TProjectTemplateSeedState[];
  labels: TProjectTemplateSeedLabel[];
  modules: TProjectTemplateSeedModule[];
  issues: TProjectTemplateSeedIssue[];
};

export type IWorkspaceProjectTemplate = {
  id: string;
  name: string;
  description: string;
  seed_id: string | null;
  workspace_type: string | null;
  is_system: boolean;
  is_default_for_type: boolean;
  project_id: string;
  sort_order: number;
  logo_props: Record<string, unknown>;
  archived_at: string | null;
  is_hidden: boolean;
  module_count?: number;
  issue_count?: number;
  created_at: string;
  updated_at: string;
};

export type TWorkspaceProjectTemplatePayload = {
  name: string;
  description?: string;
  logo_props?: Record<string, unknown>;
  is_hidden?: boolean;
};

export type TProjectTemplateInstantiatePayload = {
  name: string;
  identifier: string;
  description?: string;
  project_lead?: string;
};

export type TProjectTemplatePreview = {
  id: string;
  name: string;
  description: string;
  modules: Array<{ name: string; issue_count: number }>;
  states: string[];
  issue_count: number;
  is_system: boolean;
};
