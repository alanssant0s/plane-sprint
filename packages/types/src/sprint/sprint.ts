/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TIssue } from "../issues/issue";

export type TWorkspaceSprintStatus = "archived" | "current" | "draft" | "past" | "upcoming";

export interface IWorkspaceSprint {
  id: string;
  workspace_id: string;
  automation_id: string | null;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  owned_by_id: string;
  sort_order: number;
  archived_at: string | null;
  source: "automation" | "manual";
  sequence_id: number | null;
  logo_props: Record<string, unknown>;
  timezone: string;
  version: number;
  status?: TWorkspaceSprintStatus;
  total_issues?: number;
  created_at?: string;
  updated_at?: string;
}

export type TWorkspaceSprintCreatePayload = Pick<
  IWorkspaceSprint,
  "name" | "description" | "start_date" | "end_date" | "logo_props" | "timezone"
> & { automation_id?: string | null };

export interface IWorkspaceSprintAutomation {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  enabled: boolean;
  start_date: string;
  sprint_duration_days: number;
  timezone: string;
  name_template: string;
  next_sequence: number;
  auto_create_next: boolean;
  sort_order: number;
  active_sprints_count?: number;
  created_at?: string;
  updated_at?: string;
}

export type TWorkspaceSprintAutomationPayload = Pick<
  IWorkspaceSprintAutomation,
  | "name"
  | "description"
  | "enabled"
  | "start_date"
  | "sprint_duration_days"
  | "timezone"
  | "name_template"
  | "auto_create_next"
  | "sort_order"
>;

export interface WorkspaceSprintIssueResponse {
  id: string;
  issue_detail: TIssue;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  workspace: string;
  project: string;
  issue: string;
  sprint: string;
}
