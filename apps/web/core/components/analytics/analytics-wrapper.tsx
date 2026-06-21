/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { useTranslation } from "@plane/i18n";
import { useEntityTerm } from "@/hooks/use-workspace-type";
import { cn } from "@plane/utils";

type Props = {
  i18nTitle?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

function AnalyticsWrapper(props: Props) {
  const { i18nTitle, title, children, className } = props;
  const { t } = useTranslation();
  const workItemsLabel = useEntityTerm("work_item", { plural: true });
  const resolvedTitle = title ?? (i18nTitle ? t(i18nTitle) : workItemsLabel);
  return (
    <div className={cn("px-6 py-4", className)}>
      <h1 className={"mb-4 text-20 font-bold md:mb-6"}>{resolvedTitle}</h1>
      {children}
    </div>
  );
}

export default AnalyticsWrapper;
