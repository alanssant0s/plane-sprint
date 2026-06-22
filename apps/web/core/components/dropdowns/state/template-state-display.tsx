/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import { StateGroupIcon } from "@plane/propel/icons";
import type { IState } from "@plane/types";
import { cn } from "@plane/utils";
import { DropdownButton } from "@/components/dropdowns/buttons";
import { BUTTON_VARIANTS_WITH_TEXT } from "@/components/dropdowns/constants";
import type { TDropdownProps } from "@/components/dropdowns/types";

type Props = TDropdownProps & {
  getStateById: (stateId: string | null | undefined) => IState | undefined;
  iconSize?: string;
  value: string | undefined | null;
};

export const TemplateWorkItemStateDisplay = observer(function TemplateWorkItemStateDisplay(props: Props) {
  const {
    buttonClassName,
    buttonContainerClassName,
    buttonVariant = "border-with-text",
    getStateById,
    hideIcon = false,
    iconSize = "size-4",
    showTooltip = false,
    value,
  } = props;
  const { t } = useTranslation();
  const selectedState = value ? getStateById(value) : undefined;

  return (
    <div className={cn("flex h-full max-w-full items-center", buttonContainerClassName)}>
      <DropdownButton
        className={cn("cursor-default", buttonClassName)}
        isActive={false}
        tooltipHeading={t("state")}
        tooltipContent={selectedState?.name ?? t("state")}
        showTooltip={showTooltip}
        variant={buttonVariant}
        renderToolTipByDefault={false}
      >
        {!hideIcon && (
          <StateGroupIcon
            stateGroup={selectedState?.group ?? "backlog"}
            color={selectedState?.color ?? "var(--text-color-tertiary)"}
            className={cn("flex-shrink-0", iconSize)}
            percentage={selectedState?.order}
          />
        )}
        {BUTTON_VARIANTS_WITH_TEXT.includes(buttonVariant) && (
          <span className="flex-grow truncate text-left text-secondary">{selectedState?.name ?? t("state")}</span>
        )}
      </DropdownButton>
    </div>
  );
});
