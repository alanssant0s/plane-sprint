/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { EWorkspaceType, type TProjectTemplateSeedRef } from "@plane/types";
import { TEMPLATE_SEED_CATALOG } from "./catalog";

export const WORKSPACE_TYPE_DEFAULT_TEMPLATES: Record<EWorkspaceType, TProjectTemplateSeedRef[]> = {
  [EWorkspaceType.DEFAULT]: [{ seedId: "default_generic_project", wave: 1 }],
  [EWorkspaceType.CIVIL_ENGINEERING]: [{ seedId: "civil_residential", wave: 1 }],
  [EWorkspaceType.DIGITAL_LAUNCHES]: [
    { seedId: "launch_seed", wave: 1 },
    { seedId: "launch_classic_internal", wave: 1, isDefault: true },
    { seedId: "launch_perpetual_funnel", wave: 1 },
    { seedId: "launch_meteoric", wave: 1 },
    { seedId: "launch_high_ticket", wave: 1 },
  ],
  [EWorkspaceType.SOFTWARE_DEVELOPMENT]: [{ seedId: "dev_feature_delivery", wave: 1 }],
  [EWorkspaceType.MARKETING_AGENCY]: [{ seedId: "agency_marketing_campaign", wave: 2 }],
  [EWorkspaceType.CUSTOMER_SUCCESS]: [{ seedId: "cs_account_success_plan", wave: 2 }],
  [EWorkspaceType.LEGAL]: [{ seedId: "legal_advisory_case", wave: 2 }],
  [EWorkspaceType.EDUCATION]: [{ seedId: "edu_course_term", wave: 2 }],
  [EWorkspaceType.EVENTS]: [{ seedId: "events_corporate", wave: 2 }],
  [EWorkspaceType.DESIGN_CREATIVE]: [{ seedId: "design_brand_job", wave: 2 }],
};

export function getTemplateSeedsForWorkspaceType(workspaceType: EWorkspaceType | string): TProjectTemplateSeedRef[] {
  const type = workspaceType as EWorkspaceType;
  return WORKSPACE_TYPE_DEFAULT_TEMPLATES[type] ?? WORKSPACE_TYPE_DEFAULT_TEMPLATES[EWorkspaceType.DEFAULT];
}

export function getDefaultTemplateSeedId(workspaceType: EWorkspaceType | string): string | undefined {
  const seeds = getTemplateSeedsForWorkspaceType(workspaceType);
  return seeds.find((seed) => seed.isDefault)?.seedId ?? seeds[0]?.seedId;
}

export function getTemplateSeedMeta(seedId: string) {
  return TEMPLATE_SEED_CATALOG[seedId];
}

export function validateTemplateRegistry(): string[] {
  const errors: string[] = [];
  const catalogIds = new Set(Object.keys(TEMPLATE_SEED_CATALOG));

  for (const [workspaceType, seeds] of Object.entries(WORKSPACE_TYPE_DEFAULT_TEMPLATES)) {
    for (const seed of seeds) {
      if (!catalogIds.has(seed.seedId)) {
        errors.push(`Missing catalog entry for seed "${seed.seedId}" (workspace type ${workspaceType})`);
      }
      const meta = TEMPLATE_SEED_CATALOG[seed.seedId];
      if (meta && !meta.workspaceTypes.includes(workspaceType as EWorkspaceType)) {
        errors.push(`Seed "${seed.seedId}" is not mapped to workspace type ${workspaceType}`);
      }
    }
  }

  return errors;
}
