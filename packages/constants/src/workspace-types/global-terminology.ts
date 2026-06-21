/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TEntityTerm, TTerminologyLocale } from "@plane/types";

export const GLOBAL_TERMINOLOGY: Record<TTerminologyLocale, { work_item: TEntityTerm }> = {
  en: {
    work_item: { singular: "Task", plural: "Tasks" },
  },
  "pt-BR": {
    work_item: { singular: "Tarefa", plural: "Tarefas" },
  },
};
