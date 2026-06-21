/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// plane imports
import { EUserPermissions, EProjectFeatureKey } from "@plane/constants";
import { CycleIcon, IntakeIcon, ModuleIcon, PageIcon, ViewsIcon, WorkItemsIcon } from "@plane/propel/icons";
import type { TTerminologyEntity } from "@plane/types";
// components
import type { TNavigationItem } from "@/components/workspace/sidebar/project-navigation";

type TGetEntityTerm = (entity: TTerminologyEntity, plural?: boolean) => string;

export const getProjectFeatureNavigation = (
  workspaceSlug: string,
  projectId: string,
  project: {
    cycle_view: boolean;
    module_view: boolean;
    issue_views_view: boolean;
    page_view: boolean;
    inbox_view: boolean;
  },
  getTerm: TGetEntityTerm
): TNavigationItem[] => [
  {
    i18n_key: "sidebar.work_items",
    key: EProjectFeatureKey.WORK_ITEMS,
    name: getTerm("work_item", true),
    href: `/${workspaceSlug}/projects/${projectId}/issues`,
    icon: WorkItemsIcon,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    shouldRender: true,
    sortOrder: 1,
  },
  {
    i18n_key: "sidebar.cycles",
    key: EProjectFeatureKey.CYCLES,
    name: getTerm("cycle", true),
    href: `/${workspaceSlug}/projects/${projectId}/cycles`,
    icon: CycleIcon,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    shouldRender: project.cycle_view,
    sortOrder: 2,
  },
  {
    i18n_key: "sidebar.modules",
    key: EProjectFeatureKey.MODULES,
    name: getTerm("module", true),
    href: `/${workspaceSlug}/projects/${projectId}/modules`,
    icon: ModuleIcon,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    shouldRender: project.module_view,
    sortOrder: 3,
  },
  {
    i18n_key: "sidebar.views",
    key: EProjectFeatureKey.VIEWS,
    name: "Views",
    href: `/${workspaceSlug}/projects/${projectId}/views`,
    icon: ViewsIcon,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    shouldRender: project.issue_views_view,
    sortOrder: 4,
  },
  {
    i18n_key: "sidebar.pages",
    key: EProjectFeatureKey.PAGES,
    name: getTerm("page", true),
    href: `/${workspaceSlug}/projects/${projectId}/pages`,
    icon: PageIcon,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    shouldRender: project.page_view,
    sortOrder: 5,
  },
  {
    i18n_key: "sidebar.intake",
    key: EProjectFeatureKey.INTAKE,
    name: "Intake",
    href: `/${workspaceSlug}/projects/${projectId}/intake`,
    icon: IntakeIcon,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    shouldRender: project.inbox_view,
    sortOrder: 6,
  },
];
