/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// plane imports
import { CycleIcon, ModuleIcon, PageIcon, ViewsIcon, WorkItemsIcon } from "@plane/propel/icons";
import type { ISvgIcons } from "@plane/propel/icons";
import { useEntityTerm } from "@/hooks/use-workspace-type";
// types
import type { TTourSteps } from "./root";

type Props = {
  step: TTourSteps;
  setStep: React.Dispatch<React.SetStateAction<TTourSteps>>;
};

export function TourSidebar({ step, setStep }: Props) {
  const workItemsTerm = useEntityTerm("work_item", { plural: true });
  const cyclesTerm = useEntityTerm("cycle", { plural: true });
  const modulesTerm = useEntityTerm("module", { plural: true });
  const pagesTerm = useEntityTerm("page", { plural: true });

  const sidebarOptions: {
    key: TTourSteps;
    label: string;
    Icon: React.FC<ISvgIcons>;
  }[] = [
    {
      key: "work-items",
      label: workItemsTerm,
      Icon: WorkItemsIcon,
    },
    {
      key: "cycles",
      label: cyclesTerm,
      Icon: CycleIcon,
    },
    {
      key: "modules",
      label: modulesTerm,
      Icon: ModuleIcon,
    },
    {
      key: "views",
      label: "Views",
      Icon: ViewsIcon,
    },
    {
      key: "pages",
      label: pagesTerm,
      Icon: PageIcon,
    },
  ];

  return (
    <div className="col-span-3 hidden bg-surface-2 p-8 lg:block">
      <h3 className="text-16 font-medium">
        Let{"'"}s get started!
        <br />
        Get more out of Plane.
      </h3>
      <div className="mt-8 space-y-5">
        {sidebarOptions.map((option) => (
          <button
            type="button"
            key={option.key}
            className={`flex cursor-pointer items-center gap-2 border-l-[3px] py-0.5 pr-2 pl-3 text-13 font-medium capitalize ${
              step === option.key ? "border-accent-strong text-accent-primary" : "border-transparent text-secondary"
            }`}
            onClick={() => setStep(option.key)}
          >
            <option.Icon className="h-4 w-4" aria-hidden="true" />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
