/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback } from "react";
import { EWorkspaceType, type TEntityTerm, type TTerminologyEntity } from "@plane/types";
import { resolveEntityTerm, resolveTerminologyTranslation } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { resolveRichFilterLabel } from "@/utils/rich-filter-label";

export function useWorkspaceType(): EWorkspaceType {
  const { currentWorkspace } = useWorkspace();
  const workspaceType = currentWorkspace?.workspace_type;

  if (workspaceType && Object.values(EWorkspaceType).includes(workspaceType)) {
    return workspaceType;
  }

  return EWorkspaceType.DEFAULT;
}

type TUseEntityTermOptions = {
  plural?: boolean;
};

export function useEntityTerm(entity: TTerminologyEntity, options?: TUseEntityTermOptions): string {
  const workspaceType = useWorkspaceType();
  const { t, currentLocale } = useTranslation();

  const term = resolveEntityTerm({
    workspaceType,
    locale: currentLocale,
    entity,
    fallback: t,
  });

  if (options?.plural && term.plural) return term.plural;
  return term.singular;
}

export function useEntityTermPair(entity: TTerminologyEntity): TEntityTerm {
  const workspaceType = useWorkspaceType();
  const { t, currentLocale } = useTranslation();

  return resolveEntityTerm({
    workspaceType,
    locale: currentLocale,
    entity,
    fallback: t,
  });
}

export function useTerminologyT() {
  const translation = useTranslation();
  const workspaceType = useWorkspaceType();
  const { t: baseT, currentLocale } = translation;

  const t = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      resolveTerminologyTranslation({
        key,
        options,
        workspaceType,
        locale: currentLocale,
        fallback: baseT,
      }),
    [baseT, currentLocale, workspaceType]
  );

  return { ...translation, t, tBase: baseT };
}

export function useArchivedSectionTitle(entity: TTerminologyEntity, options?: TUseEntityTermOptions): string {
  const { t } = useTerminologyT();
  const term = useEntityTerm(entity, options);
  return `${t("workspace_projects.scope.archived_projects")} ${term}`;
}

export function useEntityListLabel(entity: TTerminologyEntity): string {
  return useEntityTerm(entity, { plural: true });
}

export function useAllIssuesGroupLabel(isEpic = false): string {
  const entityTerm = useEntityTerm(isEpic ? "epic" : "work_item", { plural: true });
  return `All ${entityTerm}`;
}

export function useEntityAddLabel(entity: TTerminologyEntity): string {
  const { t, tBase } = useTerminologyT();
  const term = useEntityTerm(entity);

  if (entity === "work_item") {
    return t("issue.add.label");
  }

  return tBase("terminology.add_entity", { entity: term });
}

export { resolveRichFilterLabel } from "@/utils/rich-filter-label";

export function useRichFilterLabel(label: string): string {
  const { t } = useTerminologyT();
  return resolveRichFilterLabel(label, t);
}

export function useEntityAddingLabel(entity: TTerminologyEntity): string {
  const { tBase } = useTerminologyT();
  const term = useEntityTerm(entity);
  return tBase("terminology.adding_entity", { entity: term });
}

export function useEntityNotFoundLabel(entity: TTerminologyEntity): string {
  const { tBase } = useTerminologyT();
  const term = useEntityTerm(entity, { plural: true });
  return tBase("terminology.no_entity_found", { entity_plural: term });
}

const FEATURE_KEY_ENTITY_MAP: Partial<Record<string, TTerminologyEntity>> = {
  work_items: "work_item",
  cycles: "cycle",
  modules: "module",
  pages: "page",
  epics: "epic",
};

export function useFeatureEntityTerm(featureKey: string, options?: TUseEntityTermOptions): string | null {
  const entity = FEATURE_KEY_ENTITY_MAP[featureKey];
  if (!entity) return null;
  return useEntityTerm(entity, options);
}
