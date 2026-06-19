/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useRef, useState } from "react";
import { observer } from "mobx-react";
import { ChevronDownIcon, CycleIcon } from "@plane/propel/icons";
import { ComboDropDown } from "@plane/ui";
import { cn } from "@plane/utils";
import { useWorkspaceSprint } from "@/hooks/store/use-workspace-sprint";
import { useDropdown } from "@/hooks/use-dropdown";
import { WorkspaceSprintOptions } from "./sprint-options";

type Props = {
  value: string | null;
  onChange: (sprintId: string | null) => void;
  disabled?: boolean;
  className?: string;
};

export const WorkspaceSprintDropdown = observer(function WorkspaceSprintDropdown(props: Props) {
  const { value, onChange, disabled = false, className } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { getSprintById } = useWorkspaceSprint();
  const selectedName = value ? getSprintById(value)?.name : null;
  const { handleClose, handleKeyDown, handleOnClick } = useDropdown({
    dropdownRef,
    isOpen,
    setIsOpen,
  });

  const dropdownOnChange = (sprintId: string | null) => {
    onChange(sprintId);
    handleClose();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <ComboDropDown
      as="div"
      ref={dropdownRef}
      className={cn("h-full", className)}
      value={value ?? ""}
      onChange={dropdownOnChange}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      button={
        <button
          ref={setReferenceElement}
          type="button"
          className={cn(
            "border-custom-border-200 bg-custom-background-100 text-custom-text-300 hover:bg-custom-background-80 flex h-5 max-w-44 cursor-pointer items-center gap-1 rounded border px-1.5 text-caption-sm-regular outline-hidden disabled:cursor-not-allowed disabled:opacity-60",
            className
          )}
          onClick={handleOnClick}
          disabled={disabled}
          title={selectedName ?? "No sprint"}
        >
          <CycleIcon className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{selectedName ?? "No sprint"}</span>
          <ChevronDownIcon className="h-2.5 w-2.5 flex-shrink-0" aria-hidden="true" />
        </button>
      }
    >
      {isOpen && <WorkspaceSprintOptions isOpen={isOpen} referenceElement={referenceElement} />}
    </ComboDropDown>
  );
});
