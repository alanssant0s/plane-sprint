/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useMemo } from "react";
import { observer } from "mobx-react";
import { LayoutTemplate } from "lucide-react";
// plane imports
import { ProjectIcon } from "@plane/propel/icons";
import type { ICustomSearchSelectOption } from "@plane/types";
import { CustomSearchSelect } from "@plane/ui";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useWorkspaceProjectTemplates } from "@/hooks/store/use-project-template";
import { useUserPermissions } from "@/hooks/store/user";
import { useAppRouter } from "@/hooks/use-app-router";
import { buildPartialProjectFromTemplate, useTemplateNavigationOptions } from "@/hooks/use-template-navigation-options";
// plane web imports
import { useNavigationItems } from "@/plane-web/components/navigations";
// local imports
import { SwitcherLabel } from "../common/switcher-label";
import { ProjectHeaderButton } from "./project-header-button";
import { getTabUrl } from "./tab-navigation-utils";
import { useTabPreferences } from "./use-tab-preferences";

type TProjectHeaderProps = {
  workspaceSlug: string;
  projectId: string;
};

export const ProjectHeader = observer(function ProjectHeader(props: TProjectHeaderProps) {
  const { workspaceSlug, projectId } = props;
  const router = useAppRouter();
  const { joinedProjectIds, getPartialProjectById } = useProject();
  const { getTemplateByProjectId } = useWorkspaceProjectTemplates();
  const { allowPermissions } = useUserPermissions();
  const {
    switcherOptions: templateSwitcherOptions,
    navigateToTemplate,
    getSelectedValueForProject,
  } = useTemplateNavigationOptions(workspaceSlug);

  const currentProjectDetails = getPartialProjectById(projectId);
  const templateForProject = getTemplateByProjectId(projectId);
  const isTemplateProject = Boolean(currentProjectDetails?.is_template ?? templateForProject);
  const headerProject =
    currentProjectDetails ?? (templateForProject ? buildPartialProjectFromTemplate(templateForProject) : undefined);

  const navigationItems = useNavigationItems({
    workspaceSlug,
    projectId,
    project: headerProject,
    allowPermissions,
  });

  const { tabPreferences } = useTabPreferences(workspaceSlug, projectId);

  const availableTabKeys = useMemo(() => navigationItems.map((item) => item.key), [navigationItems]);

  const validatedDefaultTabKey = useMemo(
    () =>
      availableTabKeys.includes(tabPreferences.defaultTab)
        ? tabPreferences.defaultTab
        : availableTabKeys[0] || "work_items",
    [availableTabKeys, tabPreferences.defaultTab]
  );

  const projectSwitcherOptions = useMemo<ICustomSearchSelectOption[]>(
    () =>
      joinedProjectIds
        .map((id): ICustomSearchSelectOption | null => {
          const project = getPartialProjectById(id);
          if (!project || project.is_template) return null;

          return {
            value: id,
            query: project.name,
            content: (
              <SwitcherLabel
                name={project.name}
                logo_props={project.logo_props}
                LabelIcon={ProjectIcon}
                type="material"
              />
            ),
          };
        })
        .filter((option): option is ICustomSearchSelectOption => option !== null),
    [joinedProjectIds, getPartialProjectById]
  );

  const switcherOptions = useMemo(() => {
    if (!isTemplateProject) return projectSwitcherOptions;

    if (!templateForProject) return templateSwitcherOptions;

    const selectedValue = templateForProject.is_system ? templateForProject.id : templateForProject.project_id;
    if (templateSwitcherOptions.some((option) => option.value === selectedValue)) {
      return templateSwitcherOptions;
    }

    return [
      ...templateSwitcherOptions,
      {
        value: selectedValue,
        query: templateForProject.name,
        content: <SwitcherLabel name={templateForProject.name} LabelIcon={LayoutTemplate} />,
      },
    ];
  }, [isTemplateProject, projectSwitcherOptions, templateForProject, templateSwitcherOptions]);

  const handleProjectChange = useCallback(
    (value: string) => {
      if (isTemplateProject) {
        navigateToTemplate(value);
        return;
      }

      if (value !== headerProject?.id) {
        router.push(getTabUrl(workspaceSlug, value, validatedDefaultTabKey));
      }
    },
    [headerProject?.id, isTemplateProject, navigateToTemplate, router, validatedDefaultTabKey, workspaceSlug]
  );

  if (!headerProject) return null;

  return (
    <CustomSearchSelect
      options={switcherOptions}
      value={isTemplateProject ? getSelectedValueForProject(headerProject.id) : headerProject.id}
      onChange={handleProjectChange}
      customButton={<ProjectHeaderButton project={headerProject} isTemplate={isTemplateProject} />}
      className="h-full rounded"
      customButtonClassName="group flex items-center gap-0.5 rounded-sm hover:bg-surface-2 outline-none cursor-pointer h-full"
    />
  );
});
