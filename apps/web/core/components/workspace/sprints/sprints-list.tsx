/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { cn } from "@plane/utils";
import { useWorkspaceSprint } from "@/hooks/store/use-workspace-sprint";
import { SprintCreateModal } from "./sprint-modal";

type Props = {
  automationId: string;
};

const formatDate = (date: string | null) => {
  if (!date) return "No date";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(date));
};

export const WorkspaceSprintsList = observer(function WorkspaceSprintsList(props: Props) {
  const { automationId } = props;
  const { workspaceSlug } = useParams();
  const [showArchived, setShowArchived] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {
    completeWorkspaceSprint,
    fetchArchivedWorkspaceSprints,
    fetchWorkspaceSprints,
    getArchivedSprintsByAutomationId,
    getSprintAutomationById,
    getSprintById,
    getSprintsByAutomationId,
  } = useWorkspaceSprint();

  const workspaceSlugValue = workspaceSlug?.toString();
  const automation = getSprintAutomationById(automationId);
  const sprintIds = showArchived
    ? getArchivedSprintsByAutomationId(automationId)
    : getSprintsByAutomationId(automationId);

  useEffect(() => {
    if (!workspaceSlugValue || !automationId) return;
    fetchWorkspaceSprints(workspaceSlugValue, automationId);
    fetchArchivedWorkspaceSprints(workspaceSlugValue, automationId);
  }, [automationId, fetchArchivedWorkspaceSprints, fetchWorkspaceSprints, workspaceSlugValue]);

  const handleComplete = async (sprintId: string) => {
    if (!workspaceSlugValue) return;
    try {
      await completeWorkspaceSprint(workspaceSlugValue, sprintId);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Sprint completed",
        message: "Completed sprints are available in Archived.",
      });
    } catch (_error) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Could not complete sprint",
        message: "Please try again.",
      });
    }
  };

  return (
    <>
      <SprintCreateModal
        automationId={automationId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-subtle px-5 py-3">
          <div>
            <h2 className="text-16 font-semibold text-primary">{automation?.name ?? "Sprints"}</h2>
            <p className="text-12 text-tertiary">
              {automation
                ? `${automation.sprint_duration_days} day sprint • ${automation.name_template}`
                : "Manage active sprints"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchived(false)}
              className={cn({ "bg-layer-transparent-active": !showArchived })}
            >
              Open
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchived(true)}
              className={cn({ "bg-layer-transparent-active": showArchived })}
            >
              Archived
            </Button>
            {!showArchived && (
              <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                Add sprint
              </Button>
            )}
          </div>
        </div>
        <div className="vertical-scrollbar h-full overflow-y-auto p-5">
          {sprintIds.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-md border border-dashed border-subtle text-13 text-tertiary">
              {showArchived ? "No archived sprints yet." : "No open sprints yet."}
            </div>
          ) : (
            <div className="space-y-2">
              {sprintIds.map((sprintId: string) => {
                const sprint = getSprintById(sprintId);
                if (!sprint) return null;
                return (
                  <div
                    key={sprint.id}
                    className="flex items-center justify-between rounded-md border border-subtle bg-surface-1 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-14 font-medium text-primary">{sprint.name}</h3>
                        {sprint.status && (
                          <span className="rounded bg-surface-2 px-1.5 py-0.5 text-11 text-tertiary capitalize">
                            {sprint.status}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-12 text-tertiary">
                        {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)} • {sprint.total_issues ?? 0}{" "}
                        work items
                      </p>
                    </div>
                    {!showArchived && (
                      <Button variant="ghost" size="sm" onClick={() => handleComplete(sprint.id)}>
                        Complete sprint
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
});
