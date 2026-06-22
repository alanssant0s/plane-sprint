/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "react-router";
// plane imports
import { PROJECT_TRACKER_ELEMENTS } from "@plane/constants";
import { useTerminologyT } from "@/hooks/use-workspace-type";
import { Button } from "@plane/propel/button";
import { cn } from "@plane/utils";
// components
import { SettingsBoxedControlItem } from "@/components/settings/boxed-control-item";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useWorkspaceProjectTemplates } from "@/hooks/store/use-project-template";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { useRouter } from "next/navigation";
// local imports
import { ArchiveRestoreProjectModal } from "../archive-restore-modal";
import { DeleteProjectModal } from "../delete-project-modal";

type Props = {
  projectId: string;
};

export const GeneralProjectSettingsControlSection = observer(function GeneralProjectSettingsControlSection(
  props: Props
) {
  const { projectId } = props;
  // states
  const [selectProject, setSelectedProject] = useState<string | null>(null);
  const [archiveProject, setArchiveProject] = useState<boolean>(false);
  // params
  const { workspaceSlug } = useParams();
  // store hooks
  const { currentProjectDetails } = useProject();
  const { promoteProjectToTemplate } = useWorkspaceProjectTemplates();
  const router = useRouter();
  // translation
  const { t } = useTerminologyT();

  if (!currentProjectDetails) return null;

  const handlePromote = async () => {
    if (!workspaceSlug || currentProjectDetails.is_template) return;
    try {
      const template = await promoteProjectToTemplate(workspaceSlug, projectId);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("success"),
        message: t("templates.promote.success"),
      });
      router.push(`/${workspaceSlug}/projects/${template.project_id}/issues`);
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("toast.error"),
        message: t("something_went_wrong"),
      });
    }
  };

  return (
    <div className="mt-10">
      {workspaceSlug && (
        <ArchiveRestoreProjectModal
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          isOpen={archiveProject}
          onClose={() => setArchiveProject(false)}
          archive
        />
      )}
      <DeleteProjectModal
        project={currentProjectDetails}
        isOpen={Boolean(selectProject)}
        onClose={() => setSelectedProject(null)}
      />
      <div className="rounded-lg border border-subtle bg-layer-2">
        {!currentProjectDetails.is_template && (
          <SettingsBoxedControlItem
            className="rounded-b-none border-0 border-b"
            title={t("templates.promote.title")}
            description={t("templates.promote.description")}
            control={
              <Button variant="secondary" onClick={handlePromote}>
                {t("templates.promote.button")}
              </Button>
            }
          />
        )}
        {/* Project Selector */}
        <SettingsBoxedControlItem
          className={cn("border-0 border-b", currentProjectDetails.is_template ? "rounded-lg" : "rounded-b-none")}
          title={t("project_settings.general.archive_project.title")}
          description={t("project_settings.general.archive_project.description")}
          control={
            <Button variant="secondary" onClick={() => setArchiveProject(true)}>
              {t("project_settings.general.archive_project.button")}
            </Button>
          }
        />
        {/* Format Selector */}
        <SettingsBoxedControlItem
          className="rounded-t-none border-0"
          title={t("project_settings.general.delete_project.title")}
          description={t("project_settings.general.delete_project.description")}
          control={
            <Button
              variant="error-outline"
              onClick={() => setSelectedProject(currentProjectDetails.id ?? null)}
              data-ph-element={PROJECT_TRACKER_ELEMENTS.DELETE_PROJECT_BUTTON}
            >
              {t("project_settings.general.delete_project.button")}
            </Button>
          }
        />
      </div>
    </div>
  );
});
