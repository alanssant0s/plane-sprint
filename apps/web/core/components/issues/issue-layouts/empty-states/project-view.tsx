/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// components
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { EmptyStateDetailed } from "@plane/propel/empty-state";
import { EIssuesStoreType } from "@plane/types";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useUserPermissions } from "@/hooks/store/user";
import { useEntityAddLabel, useTerminologyT } from "@/hooks/use-workspace-type";

export const ProjectViewEmptyState = observer(function ProjectViewEmptyState() {
  // store hooks
  const { toggleCreateIssueModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();
  const { t } = useTerminologyT();
  const addLabel = useEntityAddLabel("work_item");

  // auth
  const isCreatingIssueAllowed = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT
  );

  return (
    // TODO: Add translation
    <EmptyStateDetailed
      assetKey="work-item"
      title={t("project_empty_state.no_issues.title")}
      description={t("project_empty_state.no_issues.description")}
      actions={[
        {
          label: addLabel,
          onClick: () => {
            toggleCreateIssueModal(true, EIssuesStoreType.PROJECT_VIEW);
          },
          disabled: !isCreatingIssueAllowed,
          variant: "primary",
        },
      ]}
    />
  );
});
