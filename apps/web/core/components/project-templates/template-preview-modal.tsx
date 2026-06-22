/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { CloseIcon } from "@plane/propel/icons";
import type { TProjectTemplatePreview } from "@plane/types";
import { useTerminologyT } from "@/hooks/use-workspace-type";
import { useWorkspaceProjectTemplates } from "@/hooks/store/use-project-template";

type Props = {
  workspaceSlug: string;
  templateId: string;
  isOpen: boolean;
  onClose: () => void;
};

export const TemplatePreviewModal = observer(function TemplatePreviewModal(props: Props) {
  const { workspaceSlug, templateId, isOpen, onClose } = props;
  const { t } = useTranslation();
  const { t: tt } = useTerminologyT();
  const { getTemplatePreview } = useWorkspaceProjectTemplates();
  const [preview, setPreview] = useState<TProjectTemplatePreview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getTemplatePreview(workspaceSlug, templateId)
      .then(setPreview)
      .finally(() => setLoading(false));
  }, [getTemplatePreview, isOpen, templateId, workspaceSlug]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop p-4">
      <div className="shadow-lg max-h-[80vh] w-full max-w-lg overflow-hidden rounded-lg border border-subtle bg-surface-1">
        <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
          <h2 className="text-14 font-semibold text-primary">{tt("templates.preview.title")}</h2>
          <button type="button" onClick={onClose} aria-label={t("close")}>
            <CloseIcon className="h-4 w-4 text-secondary" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
          {loading && <p className="text-13 text-tertiary">{t("loading")}</p>}
          {!loading && preview && (
            <div className="space-y-4">
              <div>
                <h3 className="text-14 font-medium text-primary">{preview.name}</h3>
                {preview.description && <p className="mt-1 text-13 text-tertiary">{preview.description}</p>}
              </div>
              <div>
                <p className="text-12 font-medium text-secondary">{tt("templates.preview.states")}</p>
                <p className="mt-1 text-13 text-primary">{preview.states.join(" → ")}</p>
              </div>
              <div>
                <p className="text-12 font-medium text-secondary">{tt("templates.preview.modules")}</p>
                <ul className="mt-2 space-y-1">
                  {preview.modules.map((module) => (
                    <li key={module.name} className="flex justify-between text-13 text-primary">
                      <span>{module.name}</span>
                      <span className="text-tertiary">{module.issue_count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-12 text-tertiary">
                {tt("templates.preview.total_issues", { count: preview.issue_count })}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end border-t border-subtle px-4 py-3">
          <Button variant="secondary" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
});
