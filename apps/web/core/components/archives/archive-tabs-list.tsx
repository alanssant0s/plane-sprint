/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
// types
import type { IProject, TTerminologyEntity } from "@plane/types";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useEntityTerm } from "@/hooks/use-workspace-type";

const ARCHIVES_TAB_ENTITY_MAP: Record<string, TTerminologyEntity> = {
  issues: "work_item",
  cycles: "cycle",
  modules: "module",
};

const ARCHIVES_TAB_LIST: {
  key: string;
  shouldRender: (projectDetails: IProject) => boolean;
}[] = [
  {
    key: "issues",
    shouldRender: () => true,
  },
  {
    key: "cycles",
    shouldRender: (projectDetails) => projectDetails.cycle_view,
  },
  {
    key: "modules",
    shouldRender: (projectDetails) => projectDetails.module_view,
  },
];

function ArchiveTabLabel({ tabKey }: { tabKey: string }) {
  const entity = ARCHIVES_TAB_ENTITY_MAP[tabKey];
  const workItemTerm = useEntityTerm("work_item", { plural: true });
  const cycleTerm = useEntityTerm("cycle", { plural: true });
  const moduleTerm = useEntityTerm("module", { plural: true });

  const labelByEntity: Record<string, string> = {
    work_item: workItemTerm,
    cycle: cycleTerm,
    module: moduleTerm,
  };

  return labelByEntity[entity] ?? tabKey;
}

export const ArchiveTabsList = observer(function ArchiveTabsList() {
  // router
  const { workspaceSlug, projectId } = useParams();
  const pathname = usePathname();
  // store hooks
  const { getProjectById } = useProject();

  // derived values
  if (!projectId) return null;
  const projectDetails = getProjectById(projectId?.toString());
  if (!projectDetails) return null;

  return (
    <>
      {ARCHIVES_TAB_LIST.map(
        (tab) =>
          tab.shouldRender(projectDetails) && (
            <Link key={tab.key} href={`/${workspaceSlug}/projects/${projectId}/archives/${tab.key}`}>
              <span
                className={`flex min-w-min flex-shrink-0 border-b-2 px-4 py-4 text-13 font-medium whitespace-nowrap outline-none ${
                  pathname.includes(tab.key)
                    ? "border-accent-strong text-accent-primary"
                    : "border-transparent text-tertiary hover:border-subtle hover:text-placeholder"
                }`}
              >
                <ArchiveTabLabel tabKey={tab.key} />
              </span>
            </Link>
          )
      )}
    </>
  );
});
