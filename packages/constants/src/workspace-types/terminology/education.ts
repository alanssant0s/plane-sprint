/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TTerminologyBundle } from "@plane/types";

export const EDUCATION_TERMINOLOGY: Record<"en" | "pt-BR", TTerminologyBundle> = {
  en: {
    project: { singular: "Course", plural: "Courses" },
    module: { singular: "Learning module", plural: "Learning modules" },
    cycle: { singular: "Term", plural: "Terms" },
    epic: { singular: "Program", plural: "Programs" },
    page: { singular: "Material", plural: "Materials" },
  },
  "pt-BR": {
    project: { singular: "Curso", plural: "Cursos" },
    module: { singular: "Módulo didático", plural: "Módulos didáticos" },
    cycle: { singular: "Período letivo", plural: "Períodos letivos" },
    epic: { singular: "Programa", plural: "Programas" },
    page: { singular: "Material", plural: "Materiais" },
  },
};
