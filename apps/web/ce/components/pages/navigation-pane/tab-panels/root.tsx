/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// store
import type { TPageInstance } from "@/store/pages/base-page";
// local imports
import type { TPageNavigationPaneTab } from "..";
import { PageNavigationPaneLinksTabPanel } from "./links";

export type TPageNavigationPaneAdditionalTabPanelsRootProps = {
  activeTab: TPageNavigationPaneTab;
  page: TPageInstance;
};

export function PageNavigationPaneAdditionalTabPanelsRoot(props: TPageNavigationPaneAdditionalTabPanelsRootProps) {
  const { activeTab, page } = props;

  if (activeTab === "links") {
    return <PageNavigationPaneLinksTabPanel page={page} />;
  }

  return null;
}
