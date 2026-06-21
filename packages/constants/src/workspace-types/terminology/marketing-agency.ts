/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TTerminologyBundle } from "@plane/types";

export const MARKETING_AGENCY_TERMINOLOGY: Record<"en" | "pt-BR", TTerminologyBundle> = {
  en: {
    project: { singular: "Campaign", plural: "Campaigns" },
    module: { singular: "Deliverable", plural: "Deliverables" },
    cycle: { singular: "Creative sprint", plural: "Creative sprints" },
    epic: { singular: "Initiative", plural: "Initiatives" },
    page: { singular: "Brief", plural: "Briefs" },
  },
  "pt-BR": {
    project: { singular: "Campanha", plural: "Campanhas" },
    module: { singular: "Entrega", plural: "Entregas" },
    cycle: { singular: "Sprint criativo", plural: "Sprints criativos" },
    epic: { singular: "Iniciativa", plural: "Iniciativas" },
    page: { singular: "Brief", plural: "Briefs" },
  },
};
