/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { LayoutTemplate } from "lucide-react";
import { useParams } from "next/navigation";
import { Breadcrumbs, BreadcrumbNavigationSearchDropdown, Header } from "@plane/ui";
import { useTerminologyT } from "@/hooks/use-workspace-type";
import { ALL_TEMPLATES_VALUE, useTemplateNavigationOptions } from "@/hooks/use-template-navigation-options";

export const WorkspaceTemplatesHeader = observer(function WorkspaceTemplatesHeader() {
  const { workspaceSlug } = useParams();
  const { t } = useTerminologyT();
  const workspaceSlugValue = workspaceSlug?.toString();
  const { switcherOptions, navigateToTemplate } = useTemplateNavigationOptions(workspaceSlugValue);

  return (
    <Header>
      <Header.LeftItem>
        <Breadcrumbs>
          <Breadcrumbs.Item
            component={
              <BreadcrumbNavigationSearchDropdown
                selectedItem={ALL_TEMPLATES_VALUE}
                navigationItems={switcherOptions}
                onChange={navigateToTemplate}
                title={t("templates.page.all")}
                icon={
                  <Breadcrumbs.Icon>
                    <LayoutTemplate className="size-4 flex-shrink-0 text-tertiary" />
                  </Breadcrumbs.Icon>
                }
                isLast
              />
            }
            isLast
          />
        </Breadcrumbs>
      </Header.LeftItem>
    </Header>
  );
});
