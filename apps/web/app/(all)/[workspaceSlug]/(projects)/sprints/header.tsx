/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useEffect, useMemo } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { EIssueFilterType, ISSUE_DISPLAY_FILTERS_BY_PAGE, WORK_ITEM_TRACKER_ELEMENTS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { CycleIcon, WorkItemsIcon } from "@plane/propel/icons";
import type { IIssueDisplayFilterOptions, IIssueDisplayProperties } from "@plane/types";
import { EIssueLayoutTypes, EIssuesStoreType } from "@plane/types";
import { Breadcrumbs, Header } from "@plane/ui";
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
import { DisplayFiltersSelection, FiltersDropdown } from "@/components/issues/issue-layouts/filters";
import { WorkItemFiltersToggle } from "@/components/work-item-filters/filters-toggle";
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useIssues } from "@/hooks/store/use-issues";
import { useWorkspaceSprint } from "@/hooks/store/use-workspace-sprint";
import { useAppRouter } from "@/hooks/use-app-router";
import { GlobalViewLayoutSelection } from "@/plane-web/components/views/helper";

const SPRINT_VIEW_ID = "all-issues";

const formatSprintWeek = (startDate: string | null, endDate: string | null) => {
  if (!startDate && !endDate) return undefined;

  const formatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  const start = startDate ? formatter.format(new Date(startDate)) : "No start";
  const end = endDate ? formatter.format(new Date(endDate)) : "No end";

  return `${start} - ${end}`;
};

export const WorkspaceSprintsHeader = observer(function WorkspaceSprintsHeader() {
  const router = useAppRouter();
  const { workspaceSlug, workspaceSprintId } = useParams();
  const sprintId = workspaceSprintId?.toString();
  const workspaceSlugValue = workspaceSlug?.toString();
  const { t } = useTranslation();

  const {
    issuesFilter: { filters, updateFilters },
  } = useIssues(EIssuesStoreType.GLOBAL);
  const { toggleCreateIssueModal } = useCommandPalette();
  const { fetchWorkspaceSprints, getSprintById } = useWorkspaceSprint();

  const sprint = getSprintById(sprintId);
  const issueFilters = filters[SPRINT_VIEW_ID];
  const activeLayout = issueFilters?.displayFilters?.layout;
  const sprintWeek = sprint ? formatSprintWeek(sprint.start_date, sprint.end_date) : undefined;

  useEffect(() => {
    if (workspaceSlugValue) fetchWorkspaceSprints(workspaceSlugValue);
  }, [fetchWorkspaceSprints, workspaceSlugValue]);

  const currentLayoutFilters = useMemo(() => {
    const layout = activeLayout ?? EIssueLayoutTypes.SPREADSHEET;
    const layoutFilters = ISSUE_DISPLAY_FILTERS_BY_PAGE.my_issues.layoutOptions[layout];

    if (!sprintId || !layoutFilters?.display_properties) return layoutFilters;

    return {
      ...layoutFilters,
      display_properties: layoutFilters.display_properties.filter((property) => property !== "sprint"),
    };
  }, [activeLayout, sprintId]);

  const handleDisplayFilters = useCallback(
    (updatedDisplayFilter: Partial<IIssueDisplayFilterOptions>) => {
      if (!workspaceSlugValue) return;
      updateFilters(
        workspaceSlugValue,
        undefined,
        EIssueFilterType.DISPLAY_FILTERS,
        updatedDisplayFilter,
        SPRINT_VIEW_ID
      );
    },
    [updateFilters, workspaceSlugValue]
  );

  const handleDisplayProperties = useCallback(
    (property: Partial<IIssueDisplayProperties>) => {
      if (!workspaceSlugValue) return;
      updateFilters(workspaceSlugValue, undefined, EIssueFilterType.DISPLAY_PROPERTIES, property, SPRINT_VIEW_ID);
    },
    [updateFilters, workspaceSlugValue]
  );

  const handleLayoutChange = useCallback(
    (layout: EIssueLayoutTypes) => {
      if (!workspaceSlugValue) return;
      updateFilters(workspaceSlugValue, undefined, EIssueFilterType.DISPLAY_FILTERS, { layout }, SPRINT_VIEW_ID);
    },
    [updateFilters, workspaceSlugValue]
  );

  return (
    <>
      <Header>
        <Header.LeftItem>
          <Breadcrumbs onBack={() => router.back()} className="flex-grow-0">
            <Breadcrumbs.Item
              component={
                <BreadcrumbLink
                  label="Sprints"
                  href={`/${workspaceSlugValue}/sprints`}
                  icon={<CycleIcon className="h-4 w-4 text-tertiary" />}
                />
              }
            />
            <Breadcrumbs.Item
              component={
                <BreadcrumbLink
                  label={sprintId ? (sprint?.name ?? "Sprint") : "Manage sprints"}
                  icon={<WorkItemsIcon className="h-4 w-4 text-tertiary" />}
                  isLast
                />
              }
              isLast
            />
          </Breadcrumbs>
          {sprintWeek && <span className="text-12 text-tertiary">{sprintWeek}</span>}
        </Header.LeftItem>
        <Header.RightItem className="items-center">
          {sprintId && workspaceSlugValue && (
            <>
              <GlobalViewLayoutSelection
                onChange={handleLayoutChange}
                selectedLayout={activeLayout ?? EIssueLayoutTypes.SPREADSHEET}
                workspaceSlug={workspaceSlugValue}
              />
              <WorkItemFiltersToggle entityType={EIssuesStoreType.GLOBAL} entityId={SPRINT_VIEW_ID} />
              <FiltersDropdown title={t("common.display")} placement="bottom-end">
                <DisplayFiltersSelection
                  layoutDisplayFiltersOptions={currentLayoutFilters}
                  displayFilters={issueFilters?.displayFilters ?? {}}
                  handleDisplayFiltersUpdate={handleDisplayFilters}
                  displayProperties={{ ...(issueFilters?.displayProperties ?? {}), sprint: false }}
                  handleDisplayPropertiesUpdate={handleDisplayProperties}
                />
              </FiltersDropdown>
              <Button
                variant="primary"
                size="lg"
                data-ph-element={WORK_ITEM_TRACKER_ELEMENTS.HEADER_ADD_BUTTON.WORK_ITEMS}
                onClick={() => {
                  toggleCreateIssueModal(true);
                }}
              >
                {t("issue.add.label")}
              </Button>
            </>
          )}
        </Header.RightItem>
      </Header>
    </>
  );
});
