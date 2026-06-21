/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { useEntityTerm } from "@/hooks/use-workspace-type";
import AnalyticsWrapper from "../analytics-wrapper";
import TotalInsights from "../total-insights";
import CreatedVsResolved from "./created-vs-resolved";
import CustomizedInsights from "./customized-insights";
import WorkItemsInsightTable from "./workitems-insight-table";

function WorkItems() {
  const workItemsLabel = useEntityTerm("work_item", { plural: true });

  return (
    <AnalyticsWrapper title={workItemsLabel}>
      <div className="flex flex-col gap-14">
        <TotalInsights analyticsType="work-items" />
        <CreatedVsResolved />
        <CustomizedInsights />
        <WorkItemsInsightTable />
      </div>
    </AnalyticsWrapper>
  );
}

export { WorkItems };
