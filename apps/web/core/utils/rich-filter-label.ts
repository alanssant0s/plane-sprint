/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

const RICH_FILTER_LABEL_KEYS: Record<string, string> = {
  Projects: "common.projects",
  Module: "common.module",
  Cycle: "common.cycle",
  "State Group": "common.state_group",
  State: "common.state",
  Assignees: "common.assignees",
  Priority: "common.priority",
  Label: "common.labels",
  "Start date": "common.order_by.start_date",
  "Target date": "common.order_by.due_date",
  "Created at": "common.sort.created_on",
  "Updated at": "common.sort.updated_on",
  "Created by": "common.created_by",
  Mentions: "mentions",
};

export function resolveRichFilterLabel(
  label: string,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const key = label.includes(".") ? label : RICH_FILTER_LABEL_KEYS[label];
  return key ? t(key) : label;
}
