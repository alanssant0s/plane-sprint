/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TTerminologyBundle } from "@plane/types";

export const LEGAL_TERMINOLOGY: Record<"en" | "pt-BR", TTerminologyBundle> = {
  en: {
    project: { singular: "Case", plural: "Cases" },
    module: { singular: "Procedural phase", plural: "Procedural phases" },
    cycle: { singular: "Deadline", plural: "Deadlines" },
    epic: { singular: "Proceeding", plural: "Proceedings" },
    page: { singular: "Filing", plural: "Filings" },
  },
  "pt-BR": {
    project: { singular: "Caso", plural: "Casos" },
    module: { singular: "Fase processual", plural: "Fases processuais" },
    cycle: { singular: "Prazo", plural: "Prazos" },
    epic: { singular: "Processo", plural: "Processos" },
    page: { singular: "Peça", plural: "Peças" },
  },
};
