/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import useSWR from "swr";
import { useParams } from "next/navigation";
// plane imports
import { useTranslation } from "@plane/i18n";
import { ScrollArea } from "@plane/propel/scrollarea";
import { ControlLink } from "@plane/ui";
// helpers
import { buildInternalPageHref } from "@/helpers/page-links";
import { useAppRouter } from "@/hooks/use-app-router";
// services
import { ProjectPageService } from "@/services/page";
import type { TPageLinkSummary } from "@/services/page/project-page.service";
// store
import type { TPageInstance } from "@/store/pages/base-page";

const projectPageService = new ProjectPageService();

type Props = {
  page: TPageInstance;
};

type LinkSectionProps = {
  title: string;
  emptyLabel: string;
  links: TPageLinkSummary[];
  workspaceSlug: string;
  projectId: string;
};

function LinkSection(props: LinkSectionProps) {
  const { title, emptyLabel, links, workspaceSlug, projectId } = props;
  const router = useAppRouter();

  return (
    <div className="mb-4">
      <p className="mb-2 text-11 font-medium text-tertiary">{title}</p>
      {links.length === 0 ? (
        <p className="text-11 text-placeholder">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col gap-1">
          {links.map((link) => {
            if (!link.id) return null;
            const href = buildInternalPageHref(workspaceSlug, projectId, link.id);
            return (
              <ControlLink
                key={link.id}
                href={href}
                onClick={() => router.push(href)}
                className="rounded-sm px-2 py-1.5 text-11 text-primary transition-colors hover:bg-layer-1"
              >
                {link.name}
              </ControlLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const PageNavigationPaneLinksTabPanel = observer(function PageNavigationPaneLinksTabPanel(props: Props) {
  const { page } = props;
  const { workspaceSlug, projectId } = useParams();
  const { t } = useTranslation();

  const { data, isLoading } = useSWR(
    workspaceSlug && projectId && page.id ? `PAGE_LINKS_${workspaceSlug}_${projectId}_${page.id}` : null,
    () => projectPageService.fetchPageLinks(workspaceSlug!.toString(), projectId!.toString(), page.id!)
  );

  return (
    <ScrollArea
      orientation="vertical"
      size="sm"
      scrollType="hover"
      className="hide-scrollbar size-full overflow-y-auto"
      viewportClassName="px-4"
    >
      {isLoading ? (
        <p className="text-11 text-tertiary">{t("page_navigation_pane.tabs.links.loading")}</p>
      ) : (
        <>
          <LinkSection
            title={t("page_navigation_pane.tabs.links.outgoing")}
            emptyLabel={t("page_navigation_pane.tabs.links.empty_state.outgoing")}
            links={data?.outgoing ?? []}
            workspaceSlug={workspaceSlug!.toString()}
            projectId={projectId!.toString()}
          />
          <LinkSection
            title={t("page_navigation_pane.tabs.links.incoming")}
            emptyLabel={t("page_navigation_pane.tabs.links.empty_state.incoming")}
            links={data?.incoming ?? []}
            workspaceSlug={workspaceSlug!.toString()}
            projectId={projectId!.toString()}
          />
        </>
      )}
    </ScrollArea>
  );
});
