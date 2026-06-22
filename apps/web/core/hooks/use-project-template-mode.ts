/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useProject } from "@/hooks/store/use-project";
import { useWorkspaceProjectTemplates } from "@/hooks/store/use-project-template";

export function useIsTemplateProject(projectId: string | undefined | null): boolean {
  const { getPartialProjectById } = useProject();
  const { getTemplateByProjectId } = useWorkspaceProjectTemplates();

  if (!projectId) return false;

  const project = getPartialProjectById(projectId);
  return Boolean(project?.is_template ?? getTemplateByProjectId(projectId));
}

export function useProjectTemplateMode(projectId: string | undefined) {
  const { getProjectById } = useProject();
  const project = projectId ? getProjectById(projectId) : undefined;
  const isTemplateMode = useIsTemplateProject(projectId);

  return {
    isTemplateMode,
    project,
  };
}
