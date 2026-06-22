/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { IWorkspaceProjectTemplate } from "@plane/types";
import { AlertModalCore } from "@plane/ui";
import { useTerminologyT } from "@/hooks/use-workspace-type";
import { useWorkspaceProjectTemplates } from "@/hooks/store/use-project-template";

type TDeleteTemplateModalProps = {
  template: IWorkspaceProjectTemplate;
  workspaceSlug: string;
  isOpen: boolean;
  onClose: () => void;
};

export const DeleteTemplateModal = observer(function DeleteTemplateModal(props: TDeleteTemplateModalProps) {
  const { template, workspaceSlug, isOpen, onClose } = props;
  const { t } = useTranslation();
  const { t: tt } = useTerminologyT();
  const { archiveTemplate } = useWorkspaceProjectTemplates();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await archiveTemplate(workspaceSlug, template.id);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("success"),
        message: tt("templates.page.delete_success"),
      });
      onClose();
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

  return (
    <AlertModalCore
      handleClose={onClose}
      handleSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isOpen={isOpen}
      title={tt("templates.delete_confirmation.title")}
      content={
        <>
          {tt("templates.delete_confirmation.description.prefix")}
          <span className="font-medium break-words text-primary">{template.name}</span>
          {tt("templates.delete_confirmation.description.suffix")}
        </>
      }
    />
  );
});
