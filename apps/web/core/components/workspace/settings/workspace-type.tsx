/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { EUserPermissions, EUserPermissionsLevel, WORKSPACE_TYPE_LIST, resolveEntityTerm } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { EWorkspaceType, type TTerminologyEntity } from "@plane/types";
import { cn } from "@plane/utils";
import { SettingsHeading } from "@/components/settings/heading";
import { useWorkspaceType } from "@/hooks/use-workspace-type";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUserPermissions } from "@/hooks/store/user";

const PREVIEW_ENTITIES: TTerminologyEntity[] = ["work_item", "project", "module", "cycle", "page"];

function PreviewTerm({ entity, workspaceType }: { entity: TTerminologyEntity; workspaceType: EWorkspaceType }) {
  const { t, currentLocale } = useTranslation();
  const term = resolveEntityTerm({
    workspaceType,
    locale: currentLocale,
    entity,
    fallback: t,
  });

  return (
    <div className="flex items-center justify-between gap-2 text-body-xs-regular">
      <span className="text-tertiary">{entity}</span>
      <span className="font-medium text-primary">{term.singular}</span>
    </div>
  );
}

function WorkspaceTypePreview({ workspaceType }: { workspaceType: EWorkspaceType }) {
  return (
    <div className="rounded-md border border-subtle bg-layer-2 p-4">
      <p className="mb-3 text-body-xs-medium text-tertiary">Preview</p>
      <div className="flex flex-col gap-2">
        {PREVIEW_ENTITIES.map((entity) => (
          <PreviewTerm key={entity} entity={entity} workspaceType={workspaceType} />
        ))}
      </div>
    </div>
  );
}

export const WorkspaceTypeSettings = observer(function WorkspaceTypeSettings() {
  const { t, currentLocale } = useTranslation();
  const { currentWorkspace, updateWorkspace } = useWorkspace();
  const { allowPermissions } = useUserPermissions();
  const currentType = useWorkspaceType();
  const [selectedType, setSelectedType] = useState<EWorkspaceType>(currentType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedType(currentType);
  }, [currentType]);

  const workspaceSlug = currentWorkspace?.slug;
  const isAdmin = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.WORKSPACE, workspaceSlug);

  const localeKey = currentLocale === "pt-BR" || currentLocale.startsWith("pt") ? "pt-BR" : "en";

  const handleSubmit = async () => {
    if (!workspaceSlug || !isAdmin) return;
    setIsSubmitting(true);
    try {
      await updateWorkspace(workspaceSlug, { workspace_type: selectedType });
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("workspace_settings.settings.workspace_type.success_title"),
        message: t("workspace_settings.settings.workspace_type.success_message"),
      });
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("common.error.label"),
        message: t("common.something_went_wrong"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentWorkspace) return null;

  return (
    <div className="flex flex-col gap-6">
      <SettingsHeading
        title={t("workspace_settings.settings.workspace_type.title")}
        description={t("workspace_settings.settings.workspace_type.description")}
      />

      <div className="rounded-md border border-subtle bg-layer-2 px-4 py-3 text-body-xs-regular text-tertiary">
        {t("workspace_settings.settings.workspace_type.notice")}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {WORKSPACE_TYPE_LIST.map((typeDef) => {
          const isSelected = selectedType === typeDef.id;
          return (
            <button
              key={typeDef.id}
              type="button"
              disabled={!isAdmin}
              onClick={() => setSelectedType(typeDef.id)}
              className={cn(
                "rounded-md border p-4 text-left transition-colors",
                isSelected ? "border-accent-primary bg-accent-primary/5" : "border-subtle bg-layer-2 hover:bg-layer-3",
                !isAdmin && "cursor-not-allowed opacity-60"
              )}
            >
              <div>
                <p className="text-body-sm-medium text-primary">{typeDef.i18n_label[localeKey]}</p>
                <p className="mt-1 text-body-xs-regular text-tertiary">{typeDef.i18n_description[localeKey]}</p>
              </div>
            </button>
          );
        })}
      </div>

      <WorkspaceTypePreview workspaceType={selectedType} />

      {isAdmin && (
        <div>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={selectedType === currentType}
          >
            {t("workspace_settings.settings.workspace_type.save")}
          </Button>
        </div>
      )}
    </div>
  );
});
