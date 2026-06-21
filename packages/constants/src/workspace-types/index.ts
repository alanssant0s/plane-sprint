/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export { GLOBAL_TERMINOLOGY } from "./global-terminology";
export { resolveEntityTerm } from "./resolve-entity-term";
export {
  getWorkspaceTypeDefinition,
  isValidWorkspaceType,
  WORKSPACE_TYPE_LIST,
  WORKSPACE_TYPE_REGISTRY,
} from "./registry";
export {
  resolveTerminologyTranslation,
  replaceTermInText,
  TERMINOLOGY_I18N_OVERRIDES,
  TERMINOLOGY_I18N_PREFIX_OVERRIDES,
} from "./terminology-i18n";
