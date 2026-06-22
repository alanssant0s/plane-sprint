/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useMemo } from "react";
import { LayoutTemplate } from "lucide-react";
import type { ICustomSearchSelectOption, IWorkspaceProjectTemplate, TPartialProject } from "@plane/types";
import { SwitcherLabel } from "@/components/common/switcher-label";
import { useWorkspaceProjectTemplates } from "@/hooks/store/use-project-template";
import { useTerminologyT, useWorkspaceType } from "@/hooks/use-workspace-type";
import { useAppRouter } from "@/hooks/use-app-router";

export const ALL_TEMPLATES_VALUE = "__all_templates__";

export function buildPartialProjectFromTemplate(template: IWorkspaceProjectTemplate): TPartialProject {
  return {
    id: template.project_id,
    name: template.name,
    identifier: "",
    sort_order: template.sort_order,
    logo_props: template.logo_props as TPartialProject["logo_props"],
    archived_at: template.archived_at,
    workspace: "",
    cycle_view: false,
    issue_views_view: true,
    module_view: true,
    page_view: false,
    inbox_view: false,
    is_template: true,
  };
}

export function getTemplateNavigationHref(workspaceSlug: string, template: IWorkspaceProjectTemplate): string {
  return `/${workspaceSlug}/projects/${template.project_id}/issues`;
}

export function useTemplateNavigationOptions(workspaceSlug: string | undefined) {
  const router = useAppRouter();
  const { t } = useTerminologyT();
  const workspaceType = useWorkspaceType();
  const { currentWorkspaceTemplateIds, fetchWorkspaceProjectTemplates, getTemplateById, getTemplateByProjectId } =
    useWorkspaceProjectTemplates();

  useEffect(() => {
    if (!workspaceSlug) return;
    fetchWorkspaceProjectTemplates(workspaceSlug);
  }, [fetchWorkspaceProjectTemplates, workspaceSlug, workspaceType]);

  const switcherOptions = useMemo<ICustomSearchSelectOption[]>(() => {
    const options: ICustomSearchSelectOption[] = [
      {
        value: ALL_TEMPLATES_VALUE,
        query: t("templates.page.all"),
        content: <SwitcherLabel name={t("templates.page.all")} LabelIcon={LayoutTemplate} />,
      },
    ];

    (currentWorkspaceTemplateIds ?? []).forEach((templateId) => {
      const template = getTemplateById(templateId);
      if (!template) return;

      options.push({
        value: template.is_system ? template.id : template.project_id,
        query: template.name,
        content: <SwitcherLabel name={template.name} LabelIcon={LayoutTemplate} />,
      });
    });

    return options;
  }, [currentWorkspaceTemplateIds, getTemplateById, t]);

  const navigateToTemplate = useCallback(
    (value: string) => {
      if (!workspaceSlug) return;

      if (value === ALL_TEMPLATES_VALUE) {
        router.push(`/${workspaceSlug}/templates`);
        return;
      }

      const template = (currentWorkspaceTemplateIds ?? [])
        .map((templateId) => getTemplateById(templateId))
        .find((item) => item && (item.id === value || item.project_id === value));

      if (!template) return;

      router.push(getTemplateNavigationHref(workspaceSlug, template));
    },
    [currentWorkspaceTemplateIds, getTemplateById, router, workspaceSlug]
  );

  const getSelectedValueForProject = useCallback(
    (projectId: string) => {
      const template = (currentWorkspaceTemplateIds ?? [])
        .map((templateId) => getTemplateById(templateId))
        .find((item) => item?.project_id === projectId);

      if (!template) return projectId;
      return template.is_system ? template.id : template.project_id;
    },
    [currentWorkspaceTemplateIds, getTemplateById]
  );

  return {
    switcherOptions,
    navigateToTemplate,
    getSelectedValueForProject,
    getTemplateByProjectId,
    ALL_TEMPLATES_VALUE,
  };
}
