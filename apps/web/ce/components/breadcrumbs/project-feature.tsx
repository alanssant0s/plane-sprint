/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { ReactNode } from "react";
import { observer } from "mobx-react";
import type { EProjectFeatureKey } from "@plane/constants";
import { Breadcrumbs } from "@plane/ui";
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
import type { TNavigationItem } from "@/components/workspace/sidebar/project-navigation";
import { useProject } from "@/hooks/store/use-project";
import { useEntityTerm, useFeatureEntityTerm } from "@/hooks/use-workspace-type";
import { getProjectFeatureNavigation } from "../projects/navigation/helper";

type TProjectFeatureBreadcrumbProps = {
  workspaceSlug: string;
  projectId: string;
  featureKey: EProjectFeatureKey;
  isLast?: boolean;
  additionalNavigationItems?: TNavigationItem[];
};

export const ProjectFeatureBreadcrumb = observer(function ProjectFeatureBreadcrumb(
  props: TProjectFeatureBreadcrumbProps
) {
  const { workspaceSlug, projectId, featureKey, isLast = false, additionalNavigationItems } = props;
  const { getPartialProjectById } = useProject();
  const entityLabel = useFeatureEntityTerm(featureKey, { plural: true });
  const workItemTerm = useEntityTerm("work_item", { plural: true });
  const cycleTerm = useEntityTerm("cycle", { plural: true });
  const moduleTerm = useEntityTerm("module", { plural: true });
  const pageTerm = useEntityTerm("page", { plural: true });
  const project = getPartialProjectById(projectId);

  if (!project) return null;

  const navigationItems = getProjectFeatureNavigation(workspaceSlug, projectId, project, (entity) => {
    const terms = {
      work_item: workItemTerm,
      cycle: cycleTerm,
      module: moduleTerm,
      page: pageTerm,
      project: workItemTerm,
      epic: workItemTerm,
    };
    return terms[entity];
  });
  const allNavigationItems = [...(additionalNavigationItems || []), ...navigationItems];
  const currentNavigationItem = allNavigationItems.find((item) => item.key === featureKey);
  const icon = currentNavigationItem?.icon as ReactNode;
  const name = entityLabel ?? currentNavigationItem?.name;
  const href = currentNavigationItem?.href;

  return (
    <Breadcrumbs.Item
      component={
        <BreadcrumbLink
          key={featureKey}
          label={name}
          isLast={isLast}
          href={href}
          icon={<Breadcrumbs.Icon>{icon}</Breadcrumbs.Icon>}
        />
      }
      showSeparator={false}
      isLast={isLast}
    />
  );
});
