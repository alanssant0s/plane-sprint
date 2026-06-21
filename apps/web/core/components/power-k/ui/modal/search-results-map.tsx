/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo } from "react";
import { Briefcase, FileText, Layers, LayoutGrid } from "lucide-react";
// plane imports
import { ContrastIcon, DiceIcon } from "@plane/propel/icons";
import type {
  IWorkspaceDefaultSearchResult,
  IWorkspaceIssueSearchResult,
  IWorkspacePageSearchResult,
  IWorkspaceProjectSearchResult,
  IWorkspaceSearchResult,
  TTerminologyEntity,
} from "@plane/types";
import { generateWorkItemLink } from "@plane/utils";
// components
import type { TPowerKSearchResultsKeys } from "@/components/power-k/core/types";
import { useEntityTerm } from "@/hooks/use-workspace-type";
// plane web imports
import { SEARCH_RESULTS_GROUPS_MAP_EXTENDED } from "@/plane-web/components/command-palette/power-k/search/search-results-map";
import { IssueIdentifier } from "@/plane-web/components/issues/issue-details/issue-identifier";

export type TPowerKSearchResultGroupDetails = {
  icon?: React.ComponentType<{ className?: string }>;
  itemName: (item: any) => React.ReactNode;
  path: (item: any, projectId: string | undefined) => string;
  title: string;
};

type TGetEntityTerm = (entity: TTerminologyEntity, plural?: boolean) => string;

export function getPowerKSearchResultsGroupsMap(
  getTerm: TGetEntityTerm,
  extended: typeof SEARCH_RESULTS_GROUPS_MAP_EXTENDED = SEARCH_RESULTS_GROUPS_MAP_EXTENDED
): Record<TPowerKSearchResultsKeys, TPowerKSearchResultGroupDetails> {
  return {
    cycle: {
      icon: ContrastIcon,
      itemName: (cycle: IWorkspaceDefaultSearchResult) => (
        <p>
          <span className="text-11 text-tertiary">{cycle.project__identifier}</span> {cycle.name}
        </p>
      ),
      path: (cycle: IWorkspaceDefaultSearchResult) =>
        `/${cycle?.workspace__slug}/projects/${cycle?.project_id}/cycles/${cycle?.id}`,
      title: getTerm("cycle", true),
    },
    issue: {
      itemName: (workItem: IWorkspaceIssueSearchResult) => (
        <div className="flex gap-2">
          <IssueIdentifier
            projectId={workItem.project_id}
            issueTypeId={workItem.type_id}
            projectIdentifier={workItem.project__identifier}
            issueSequenceId={workItem.sequence_id}
            size="xs"
          />{" "}
          {workItem.name}
        </div>
      ),
      path: (workItem: IWorkspaceIssueSearchResult) =>
        generateWorkItemLink({
          workspaceSlug: workItem?.workspace__slug,
          projectId: workItem?.project_id,
          issueId: workItem?.id,
          projectIdentifier: workItem.project__identifier,
          sequenceId: workItem?.sequence_id,
        }),
      title: getTerm("work_item", true),
    },
    issue_view: {
      icon: Layers,
      itemName: (view: IWorkspaceDefaultSearchResult) => (
        <p>
          <span className="text-11 text-tertiary">{view.project__identifier}</span> {view.name}
        </p>
      ),
      path: (view: IWorkspaceDefaultSearchResult) =>
        `/${view?.workspace__slug}/projects/${view?.project_id}/views/${view?.id}`,
      title: "Views",
    },
    module: {
      icon: DiceIcon,
      itemName: (module: IWorkspaceDefaultSearchResult) => (
        <p>
          <span className="text-11 text-tertiary">{module.project__identifier}</span> {module.name}
        </p>
      ),
      path: (module: IWorkspaceDefaultSearchResult) =>
        `/${module?.workspace__slug}/projects/${module?.project_id}/modules/${module?.id}`,
      title: getTerm("module", true),
    },
    page: {
      icon: FileText,
      itemName: (page: IWorkspacePageSearchResult) => (
        <p>
          <span className="text-11 text-tertiary">{page.project__identifiers?.[0]}</span> {page.name}
        </p>
      ),
      path: (page: IWorkspacePageSearchResult, projectId: string | undefined) => {
        let redirectProjectId = page?.project_ids?.[0];
        if (!!projectId && page?.project_ids?.includes(projectId)) redirectProjectId = projectId;
        return redirectProjectId
          ? `/${page?.workspace__slug}/projects/${redirectProjectId}/pages/${page?.id}`
          : `/${page?.workspace__slug}/wiki/${page?.id}`;
      },
      title: getTerm("page", true),
    },
    project: {
      icon: Briefcase,
      itemName: (project: IWorkspaceProjectSearchResult) => project?.name,
      path: (project: IWorkspaceProjectSearchResult) => `/${project?.workspace__slug}/projects/${project?.id}/issues/`,
      title: getTerm("project", true),
    },
    workspace: {
      icon: LayoutGrid,
      itemName: (workspace: IWorkspaceSearchResult) => workspace?.name,
      path: (workspace: IWorkspaceSearchResult) => `/${workspace?.slug}/`,
      title: "Workspaces",
    },
    ...extended,
  };
}

export function usePowerKSearchResultsGroupsMap(): Record<TPowerKSearchResultsKeys, TPowerKSearchResultGroupDetails> {
  const projectTerm = useEntityTerm("project", { plural: true });
  const cycleTerm = useEntityTerm("cycle", { plural: true });
  const moduleTerm = useEntityTerm("module", { plural: true });
  const pageTerm = useEntityTerm("page", { plural: true });
  const workItemTerm = useEntityTerm("work_item", { plural: true });

  return useMemo(
    () =>
      getPowerKSearchResultsGroupsMap((entity) => {
        const terms: Record<TTerminologyEntity, string> = {
          project: projectTerm,
          cycle: cycleTerm,
          module: moduleTerm,
          page: pageTerm,
          work_item: workItemTerm,
          epic: workItemTerm,
        };
        return terms[entity];
      }),
    [projectTerm, cycleTerm, moduleTerm, pageTerm, workItemTerm]
  );
}

/** @deprecated Use usePowerKSearchResultsGroupsMap() inside React components. */
export const POWER_K_SEARCH_RESULTS_GROUPS_MAP = getPowerKSearchResultsGroupsMap((entity, plural) => {
  const defaults: Record<TTerminologyEntity, { singular: string; plural: string }> = {
    project: { singular: "Project", plural: "Projects" },
    cycle: { singular: "Cycle", plural: "Cycles" },
    module: { singular: "Module", plural: "Modules" },
    page: { singular: "Page", plural: "Pages" },
    work_item: { singular: "Work item", plural: "Work items" },
    epic: { singular: "Epic", plural: "Epics" },
  };
  const term = defaults[entity];
  return plural ? term.plural : term.singular;
});
