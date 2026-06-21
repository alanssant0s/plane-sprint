/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TTerminologyBundle } from "@plane/types";

export const DESIGN_CREATIVE_TERMINOLOGY: Record<"en" | "pt-BR", TTerminologyBundle> = {
  en: {
    project: { singular: "Job", plural: "Jobs" },
    module: { singular: "Round", plural: "Rounds" },
    cycle: { singular: "Review sprint", plural: "Review sprints" },
    epic: { singular: "Delivery", plural: "Deliveries" },
    page: { singular: "Presentation", plural: "Presentations" },
  },
  "pt-BR": {
    project: { singular: "Job", plural: "Jobs" },
    module: { singular: "Ronda", plural: "Rondas" },
    cycle: { singular: "Sprint de revisão", plural: "Sprints de revisão" },
    epic: { singular: "Entrega", plural: "Entregas" },
    page: { singular: "Apresentação", plural: "Apresentações" },
  },
};
