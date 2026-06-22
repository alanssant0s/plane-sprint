/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { FormEvent } from "react";
import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { IWorkspaceProjectTemplate } from "@plane/types";
import { EModalPosition, EModalWidth, Input, ModalCore, TextArea } from "@plane/ui";
import { useTerminologyT } from "@/hooks/use-workspace-type";
import { useWorkspaceProjectTemplates } from "@/hooks/store/use-project-template";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (template: IWorkspaceProjectTemplate) => void;
};

export const CreateTemplateModal = observer(function CreateTemplateModal(props: Props) {
  const { isOpen, onClose, onCreated } = props;
  const { workspaceSlug } = useParams();
  const { t } = useTranslation();
  const { t: tt } = useTerminologyT();
  const { createTemplate } = useWorkspaceProjectTemplates();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!workspaceSlug || !name.trim()) return;

    try {
      setIsSubmitting(true);
      const template = await createTemplate(workspaceSlug.toString(), {
        name: name.trim(),
        description: description.trim(),
      });
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("success"),
        message: tt("templates.page.create_success"),
      });
      resetForm();
      onCreated?.(template);
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
    <ModalCore isOpen={isOpen} handleClose={handleClose} position={EModalPosition.CENTER} width={EModalWidth.LG}>
      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        <h3 className="text-18 font-medium text-primary">{tt("templates.settings.create_template.label")}</h3>
        <div className="space-y-3">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={tt("templates.settings.form.project.template.name.placeholder")}
            required
          />
          <TextArea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={tt("templates.settings.form.project.template.description.placeholder")}
            className="min-h-20 resize-none"
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || !name.trim()}>
            {tt("templates.settings.form.project.button.create")}
          </Button>
        </div>
      </form>
    </ModalCore>
  );
});
