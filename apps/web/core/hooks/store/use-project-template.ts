/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useContext } from "react";
import { StoreContext } from "@/lib/store-context";
import type { IWorkspaceProjectTemplateStore } from "@/store/project-template.store";

export const useWorkspaceProjectTemplates = (): IWorkspaceProjectTemplateStore => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("StoreContext not found");
  return context.workspaceProjectTemplate;
};
