/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TTerminologyBundle } from "@plane/types";

export const CUSTOMER_SUCCESS_TERMINOLOGY: Record<"en" | "pt-BR", TTerminologyBundle> = {
  en: {
    project: { singular: "Account", plural: "Accounts" },
    module: { singular: "Journey", plural: "Journeys" },
    cycle: { singular: "Quarter", plural: "Quarters" },
    epic: { singular: "Success plan", plural: "Success plans" },
    page: { singular: "Playbook", plural: "Playbooks" },
  },
  "pt-BR": {
    project: { singular: "Conta", plural: "Contas" },
    module: { singular: "Jornada", plural: "Jornadas" },
    cycle: { singular: "Trimestre", plural: "Trimestres" },
    epic: { singular: "Plano de sucesso", plural: "Planos de sucesso" },
    page: { singular: "Playbook", plural: "Playbooks" },
  },
};
