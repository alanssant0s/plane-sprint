/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { CustomSelect } from "@plane/ui";
import { useTerminologyT, useWorkspaceType } from "@/hooks/use-workspace-type";
import { useWorkspaceProjectTemplates } from "@/hooks/store/use-project-template";

const BLANK_TEMPLATE_VALUE = "blank";

export type TProjectTemplateSelect = {
  disabled?: boolean;
  selectedTemplateId?: string | null;
  onSelect?: (templateId: string | null) => void;
};

export const ProjectTemplateSelect = observer(function ProjectTemplateSelect(props: TProjectTemplateSelect) {
  const { disabled, selectedTemplateId, onSelect } = props;
  const { workspaceSlug } = useParams();
  const { t } = useTerminologyT();
  const workspaceType = useWorkspaceType();
  const { currentWorkspaceTemplateIds, fetchWorkspaceProjectTemplates, getTemplateById } =
    useWorkspaceProjectTemplates();

  const workspaceSlugValue = workspaceSlug?.toString();

  useEffect(() => {
    if (!workspaceSlugValue) return;
    fetchWorkspaceProjectTemplates(workspaceSlugValue);
  }, [fetchWorkspaceProjectTemplates, workspaceSlugValue, workspaceType]);

  const templates = (currentWorkspaceTemplateIds ?? [])
    .map((id) => getTemplateById(id))
    .filter((template) => template !== undefined && !template.is_hidden);

  if (!templates.length) return null;

  const selectedTemplate = selectedTemplateId ? getTemplateById(selectedTemplateId) : undefined;
  const selectValue = selectedTemplateId ?? BLANK_TEMPLATE_VALUE;
  const triggerLabel = selectedTemplate ? selectedTemplate.name : t("templates.create_project.blank");

  const handleChange = (value: string) => {
    onSelect?.(value === BLANK_TEMPLATE_VALUE ? null : value);
  };

  return (
    <div className="space-y-2">
      <label className="text-13 font-medium text-secondary">{t("templates.create_project.field_label")}</label>
      <CustomSelect
        value={selectValue}
        onChange={handleChange}
        disabled={disabled}
        input
        buttonClassName="w-full bg-surface-1 text-primary"
        label={<span className="truncate text-13 text-primary">{triggerLabel}</span>}
      >
        <CustomSelect.Option value={BLANK_TEMPLATE_VALUE}>
          <span className="text-13">{t("templates.create_project.blank")}</span>
        </CustomSelect.Option>
        {templates.map((template) => (
          <CustomSelect.Option key={template.id} value={template.id}>
            <span className="text-13 text-primary">{template.name}</span>
            {template.is_system && (
              <span className="ml-1 text-11 text-tertiary">({t("templates.page.badge_system")})</span>
            )}
          </CustomSelect.Option>
        ))}
      </CustomSelect>
      {selectedTemplate && (
        <p className="text-12 text-tertiary">
          {t("templates.create_project.template_selected", { name: selectedTemplate.name })}
        </p>
      )}
    </div>
  );
});
