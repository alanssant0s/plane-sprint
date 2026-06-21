/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";

import { useTerminologyT } from "@/hooks/use-workspace-type";
import { PlusIcon } from "@plane/propel/icons";
import { Row } from "@plane/ui";
import type { TQuickAddIssueButton } from "../root";

export const ListQuickAddIssueButton = observer(function ListQuickAddIssueButton(props: TQuickAddIssueButton) {
  const { onClick, isEpic = false } = props;
  const { t } = useTerminologyT();
  return (
    <Row
      className="flex w-full cursor-pointer items-center gap-2 bg-layer-transparent py-3 hover:bg-layer-transparent-hover"
      onClick={onClick}
    >
      <PlusIcon className="h-3.5 w-3.5 stroke-2" />
      <span className="text-13 font-medium">{isEpic ? t("epic.new") : t("issue.new")}</span>
    </Row>
  );
});
