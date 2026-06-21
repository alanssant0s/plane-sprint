/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TTerminologyBundle } from "@plane/types";

export const EVENTS_TERMINOLOGY: Record<"en" | "pt-BR", TTerminologyBundle> = {
  en: {
    project: { singular: "Event", plural: "Events" },
    module: { singular: "Area", plural: "Areas" },
    cycle: { singular: "Countdown", plural: "Countdowns" },
    epic: { singular: "Production", plural: "Productions" },
    page: { singular: "Run of show", plural: "Runs of show" },
  },
  "pt-BR": {
    project: { singular: "Evento", plural: "Eventos" },
    module: { singular: "Área", plural: "Áreas" },
    cycle: { singular: "Countdown", plural: "Countdowns" },
    epic: { singular: "Produção", plural: "Produções" },
    page: { singular: "Run of show", plural: "Runs of show" },
  },
};
