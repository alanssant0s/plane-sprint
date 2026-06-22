/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useParams, useRouter } from "next/navigation";
import {
  getDefaultTemplateSeedId,
  getTemplateSeedMeta,
  TEMPLATE_SEED_CATALOG,
  EUserPermissions,
  EUserPermissionsLevel,
} from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { PageHead } from "@/components/core/page-title";
import { TemplatePreviewModal } from "@/components/project-templates/template-preview-modal";
import { CreateTemplateModal } from "@/components/project-templates/create-template-modal";
import { DeleteTemplateModal } from "@/components/project-templates/delete-template-modal";
import { useTerminologyT, useWorkspaceType } from "@/hooks/use-workspace-type";
import { useUserPermissions } from "@/hooks/store/user";
import { useWorkspaceProjectTemplates } from "@/hooks/store/use-project-template";

const WorkspaceProjectTemplatesPage = observer(function WorkspaceProjectTemplatesPage() {
  const { workspaceSlug } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { t: tt } = useTerminologyT();
  const workspaceType = useWorkspaceType();
  const { allowPermissions } = useUserPermissions();
  const {
    currentWorkspaceTemplateIds,
    fetchWorkspaceProjectTemplates,
    installSeeds,
    getTemplateById,
    duplicateTemplate,
    updateTemplate,
  } = useWorkspaceProjectTemplates();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [duplicatingTemplateId, setDuplicatingTemplateId] = useState<string | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [togglingVisibilityId, setTogglingVisibilityId] = useState<string | null>(null);

  const workspaceSlugValue = workspaceSlug?.toString();
  const canManage = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );
  const canInstall = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.WORKSPACE);

  useEffect(() => {
    if (!workspaceSlugValue) return;
    fetchWorkspaceProjectTemplates(workspaceSlugValue);
  }, [fetchWorkspaceProjectTemplates, workspaceSlugValue, workspaceType]);

  const templateIds = currentWorkspaceTemplateIds ?? [];
  const defaultSeedId = getDefaultTemplateSeedId(workspaceType);
  const templateToDelete = deleteTemplateId ? getTemplateById(deleteTemplateId) : undefined;

  const handleInstall = async () => {
    if (!workspaceSlugValue) return;
    await installSeeds(workspaceSlugValue);
  };

  const openTemplate = (projectId: string) => {
    if (!workspaceSlugValue) return;
    router.push(`/${workspaceSlugValue}/projects/${projectId}/issues`);
  };

  const handleDuplicate = async (templateId: string) => {
    if (!workspaceSlugValue || duplicatingTemplateId) return;

    try {
      setDuplicatingTemplateId(templateId);
      const template = await duplicateTemplate(workspaceSlugValue, templateId);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("success"),
        message: tt("templates.page.duplicate_success"),
      });
      openTemplate(template.project_id);
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("common.error.label"),
        message: t("common.something_went_wrong"),
      });
    } finally {
      setDuplicatingTemplateId(null);
    }
  };

  const handleTemplateCreated = (template: { project_id: string }) => {
    openTemplate(template.project_id);
  };

  const handleToggleVisibility = async (templateId: string, isHidden: boolean) => {
    if (!workspaceSlugValue || togglingVisibilityId) return;

    try {
      setTogglingVisibilityId(templateId);
      await updateTemplate(workspaceSlugValue, templateId, { is_hidden: !isHidden });
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("success"),
        message: tt(isHidden ? "templates.page.show_success" : "templates.page.hide_success"),
      });
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("common.error.label"),
        message: t("common.something_went_wrong"),
      });
    } finally {
      setTogglingVisibilityId(null);
    }
  };

  const getSeedLabel = (seedId: string | null) => {
    if (!seedId) return null;
    const meta = getTemplateSeedMeta(seedId) ?? TEMPLATE_SEED_CATALOG[seedId];
    if (!meta) return seedId;
    return meta.i18n["pt-BR"] ?? meta.i18n.en;
  };

  return (
    <>
      <PageHead title={tt("templates.page.title")} />
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleTemplateCreated}
      />
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="border-b border-subtle px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-18 font-semibold text-primary">{tt("templates.page.title")}</h1>
              <p className="mt-1 text-13 text-tertiary">{tt("templates.page.description")}</p>
            </div>
            <div className="flex items-center gap-2">
              {canManage && (
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                  {tt("templates.page.create")}
                </Button>
              )}
              {canInstall && templateIds.length === 0 && (
                <Button variant="secondary" onClick={handleInstall}>
                  {tt("templates.page.install_seeds")}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {templateIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-14 text-tertiary">{tt("templates.page.empty")}</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {canManage && (
                  <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    {tt("templates.page.create")}
                  </Button>
                )}
                {canInstall && (
                  <Button variant="secondary" onClick={handleInstall}>
                    {tt("templates.page.install_seeds")}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templateIds.map((templateId) => {
                const template = getTemplateById(templateId);
                if (!template) return null;
                const isDefault = template.seed_id === defaultSeedId;
                return (
                  <div
                    key={templateId}
                    className="shadow-xs flex flex-col rounded-lg border border-subtle bg-surface-1 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-14 font-semibold text-primary">{template.name}</h2>
                        {template.is_system && (
                          <span className="mt-1 inline-block rounded bg-layer-2 px-2 py-0.5 text-11 text-secondary">
                            {tt("templates.page.badge_system")}
                          </span>
                        )}
                        {isDefault && (
                          <span className="mt-1 ml-1 inline-block rounded bg-accent-primary/10 px-2 py-0.5 text-11 text-accent-primary">
                            {tt("templates.page.badge_default")}
                          </span>
                        )}
                        {template.is_hidden && (
                          <span className="mt-1 ml-1 inline-block rounded bg-layer-2 px-2 py-0.5 text-11 text-secondary">
                            {tt("templates.page.badge_hidden")}
                          </span>
                        )}
                      </div>
                    </div>
                    {template.description && (
                      <p className="mt-2 line-clamp-2 text-13 text-tertiary">{template.description}</p>
                    )}
                    <p className="mt-3 text-11 text-placeholder">
                      {t("templates.page.stats", {
                        modules: template.module_count ?? 0,
                        issues: template.issue_count ?? 0,
                      })}
                    </p>
                    {template.is_system && (
                      <p className="mt-2 text-11 text-tertiary">{tt("templates.page.system_readonly")}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="primary" size="sm" onClick={() => openTemplate(template.project_id)}>
                        {tt("templates.page.open")}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setPreviewId(templateId)}>
                        {tt("templates.page.preview")}
                      </Button>
                      {canManage && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={duplicatingTemplateId === templateId}
                          onClick={() => handleDuplicate(templateId)}
                        >
                          {tt("templates.page.duplicate")}
                        </Button>
                      )}
                      {canManage && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={togglingVisibilityId === templateId}
                          onClick={() => handleToggleVisibility(templateId, template.is_hidden)}
                        >
                          {tt(
                            template.is_hidden ? "templates.page.show_in_creation" : "templates.page.hide_from_creation"
                          )}
                        </Button>
                      )}
                      {canManage && !template.is_system && (
                        <Button variant="secondary" size="sm" onClick={() => setDeleteTemplateId(templateId)}>
                          {tt("templates.page.delete")}
                        </Button>
                      )}
                    </div>
                    {template.seed_id && (
                      <p className="mt-2 text-11 text-placeholder">{getSeedLabel(template.seed_id)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {previewId && workspaceSlugValue && (
        <TemplatePreviewModal
          workspaceSlug={workspaceSlugValue}
          templateId={previewId}
          isOpen={Boolean(previewId)}
          onClose={() => setPreviewId(null)}
        />
      )}
      {templateToDelete && workspaceSlugValue && (
        <DeleteTemplateModal
          template={templateToDelete}
          workspaceSlug={workspaceSlugValue}
          isOpen={Boolean(deleteTemplateId)}
          onClose={() => setDeleteTemplateId(null)}
        />
      )}
    </>
  );
});

export default WorkspaceProjectTemplatesPage;
