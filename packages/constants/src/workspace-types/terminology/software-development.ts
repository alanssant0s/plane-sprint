/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TTerminologyBundle } from "@plane/types";

export const SOFTWARE_DEVELOPMENT_TERMINOLOGY: Record<"en" | "pt-BR", TTerminologyBundle> = {
  en: {
    project: { singular: "Product", plural: "Products" },
    module: { singular: "Component", plural: "Components" },
    cycle: { singular: "Sprint", plural: "Sprints" },
    epic: { singular: "Epic", plural: "Epics" },
  },
  "pt-BR": {
    project: { singular: "Produto", plural: "Produtos" },
    module: { singular: "Componente", plural: "Componentes" },
    cycle: { singular: "Sprint", plural: "Sprints" },
    epic: { singular: "Épico", plural: "Épicos" },
  },
};
