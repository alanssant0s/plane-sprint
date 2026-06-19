/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { PageHead } from "@/components/core/page-title";
import { WorkspaceSprintsList } from "@/components/workspace/sprints/sprints-list";
import { useWorkspaceSprint } from "@/hooks/store/use-workspace-sprint";

function WorkspaceSprintDetailPage() {
  const { sprintId } = useParams();
  const { getSprintAutomationById } = useWorkspaceSprint();
  const automationId = sprintId?.toString();
  const automation = getSprintAutomationById(automationId);

  if (!automationId) return null;

  return (
    <>
      <PageHead title={automation?.name ?? "Sprints"} />
      <WorkspaceSprintsList automationId={automationId} />
    </>
  );
}

export default observer(WorkspaceSprintDetailPage);
