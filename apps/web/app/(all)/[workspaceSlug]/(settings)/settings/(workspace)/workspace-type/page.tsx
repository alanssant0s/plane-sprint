/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import { PageHead } from "@/components/core/page-title";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { WorkspaceTypeSettings } from "@/components/workspace/settings/workspace-type";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { WorkspaceTypeSettingsHeader } from "./header";

function WorkspaceTypeSettingsPage() {
  const { currentWorkspace } = useWorkspace();
  const { t } = useTranslation();
  const pageTitle = currentWorkspace?.name
    ? t("workspace_settings.settings.workspace_type.page_label", { workspace: currentWorkspace.name })
    : undefined;

  return (
    <SettingsContentWrapper header={<WorkspaceTypeSettingsHeader />}>
      <PageHead title={pageTitle} />
      <WorkspaceTypeSettings />
    </SettingsContentWrapper>
  );
}

export default observer(WorkspaceTypeSettingsPage);
