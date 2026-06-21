/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// components
import { PageHead } from "@/components/core/page-title";
import { ArchivedCycleLayoutRoot } from "@/components/cycles/archived-cycles";
import { ArchivedCyclesHeader } from "@/components/cycles/archived-cycles/header";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useArchivedSectionTitle } from "@/hooks/use-workspace-type";
import type { Route } from "./+types/page";

function ProjectArchivedCyclesPage({ params }: Route.ComponentProps) {
  const { projectId } = params;
  const { getProjectById } = useProject();
  const archivedCyclesTitle = useArchivedSectionTitle("cycle", { plural: true });
  const project = getProjectById(projectId);
  const pageTitle = project?.name && `${project?.name} - ${archivedCyclesTitle}`;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="relative flex h-full w-full flex-col overflow-hidden">
        <ArchivedCyclesHeader />
        <ArchivedCycleLayoutRoot />
      </div>
    </>
  );
}

export default observer(ProjectArchivedCyclesPage);
