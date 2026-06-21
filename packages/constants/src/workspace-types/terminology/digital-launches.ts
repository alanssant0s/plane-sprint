/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TTerminologyBundle } from "@plane/types";

export const DIGITAL_LAUNCHES_TERMINOLOGY: Record<"en" | "pt-BR", TTerminologyBundle> = {
  en: {
    project: { singular: "Launch", plural: "Launches" },
    module: { singular: "Phase", plural: "Phases" },
    cycle: { singular: "Week", plural: "Weeks" },
    epic: { singular: "Macro", plural: "Macros" },
    page: { singular: "Asset", plural: "Assets" },
  },
  "pt-BR": {
    project: { singular: "Lançamento", plural: "Lançamentos" },
    module: { singular: "Fase", plural: "Fases" },
    cycle: { singular: "Semana", plural: "Semanas" },
    epic: { singular: "Macro", plural: "Macros" },
    page: { singular: "Asset", plural: "Assets" },
  },
};
