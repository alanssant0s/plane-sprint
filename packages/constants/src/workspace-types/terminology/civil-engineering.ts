/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TTerminologyBundle } from "@plane/types";

export const CIVIL_ENGINEERING_TERMINOLOGY: Record<"en" | "pt-BR", TTerminologyBundle> = {
  en: {
    project: { singular: "Construction", plural: "Constructions" },
    module: { singular: "Stage", plural: "Stages" },
    cycle: { singular: "Phase", plural: "Phases" },
    epic: { singular: "Macro stage", plural: "Macro stages" },
    page: { singular: "Document", plural: "Documents" },
  },
  "pt-BR": {
    project: { singular: "Obra", plural: "Obras" },
    module: { singular: "Etapa", plural: "Etapas" },
    cycle: { singular: "Fase", plural: "Fases" },
    epic: { singular: "Macroetapa", plural: "Macroetapas" },
    page: { singular: "Documento", plural: "Documentos" },
  },
};
