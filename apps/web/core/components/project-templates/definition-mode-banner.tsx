/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@plane/propel/button";
import { useTerminologyT } from "@/hooks/use-workspace-type";
import { useProjectTemplateMode } from "@/hooks/use-project-template-mode";

type Props = {
  projectId: string;
};

export const ProjectTemplateDefinitionBanner = observer(function ProjectTemplateDefinitionBanner(props: Props) {
  const { projectId } = props;
  const { workspaceSlug } = useParams();
  const router = useRouter();
  const { t } = useTerminologyT();
  const { isTemplateMode } = useProjectTemplateMode(projectId);

  if (!isTemplateMode) return null;

  return (
    <div className="border-accent-primary/20 flex flex-wrap items-center justify-between gap-3 border-b bg-accent-primary/5 px-4 py-2">
      <p className="text-13 text-primary">{t("templates.definition_mode.banner")}</p>
      <Button variant="secondary" size="sm" onClick={() => router.push(`/${workspaceSlug?.toString()}/templates`)}>
        {t("templates.definition_mode.instantiate")}
      </Button>
    </div>
  );
});
