/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import {
  WORKSPACE_TYPE_I18N_FALLBACK_KEYS,
  WORKSPACE_TYPE_PLURAL_I18N_FALLBACK_KEYS,
  type TEntityTerm,
  type TResolveEntityTermParams,
  type TTerminologyLocale,
} from "@plane/types";
import { GLOBAL_TERMINOLOGY } from "./global-terminology";
import { getWorkspaceTypeDefinition } from "./registry";

function normalizeLocale(locale: string): TTerminologyLocale {
  if (locale === "pt-BR" || locale.startsWith("pt")) return "pt-BR";
  return "en";
}

function fallbackTerm(
  entity: TResolveEntityTermParams["entity"],
  fallback: TResolveEntityTermParams["fallback"]
): TEntityTerm {
  const singular = fallback(WORKSPACE_TYPE_I18N_FALLBACK_KEYS[entity]);
  const pluralKey = WORKSPACE_TYPE_PLURAL_I18N_FALLBACK_KEYS[entity];
  const term: TEntityTerm = { singular };
  if (pluralKey) {
    term.plural = fallback(pluralKey);
  }
  return term;
}

export function resolveEntityTerm({ workspaceType, locale, entity, fallback }: TResolveEntityTermParams): TEntityTerm {
  const normalizedLocale = normalizeLocale(locale);

  if (entity === "work_item") {
    const globalTerm = GLOBAL_TERMINOLOGY[normalizedLocale]?.work_item;
    if (globalTerm) return globalTerm;
  }

  const definition = getWorkspaceTypeDefinition(workspaceType);
  const bundleTerm = definition.terminology[normalizedLocale]?.[entity];
  if (bundleTerm) return bundleTerm;

  return fallbackTerm(entity, fallback);
}
