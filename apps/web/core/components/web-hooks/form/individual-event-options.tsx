/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { IWebhook, TTerminologyEntity } from "@plane/types";
import { Checkbox } from "@plane/ui";
import { useEntityTerm } from "@/hooks/use-workspace-type";

type TGetEntityTerm = (entity: TTerminologyEntity, plural?: boolean) => string;

export function getIndividualWebhookOptions(getTerm: TGetEntityTerm): {
  key: keyof IWebhook;
  label: string;
  description: string;
}[] {
  return [
    {
      key: "project",
      label: getTerm("project", true),
      description: `${getTerm("project")} created, updated, or deleted`,
    },
    {
      key: "cycle",
      label: getTerm("cycle", true),
      description: `${getTerm("cycle")} created, updated, or deleted`,
    },
    {
      key: "issue",
      label: getTerm("work_item", true),
      description: `${getTerm("work_item")} created, updated, deleted, added to a cycle or module`,
    },
    {
      key: "module",
      label: getTerm("module", true),
      description: `${getTerm("module")} created, updated, or deleted`,
    },
    {
      key: "issue_comment",
      label: `${getTerm("work_item")} comments`,
      description: "Comment posted, updated, or deleted",
    },
  ];
}

type Props = {
  control: Control<IWebhook, any>;
};

export function WebhookIndividualEventOptions({ control }: Props) {
  const projectTerm = useEntityTerm("project");
  const projectTermPlural = useEntityTerm("project", { plural: true });
  const cycleTerm = useEntityTerm("cycle");
  const cycleTermPlural = useEntityTerm("cycle", { plural: true });
  const moduleTerm = useEntityTerm("module");
  const moduleTermPlural = useEntityTerm("module", { plural: true });
  const workItemTerm = useEntityTerm("work_item");
  const workItemTermPlural = useEntityTerm("work_item", { plural: true });

  const options = useMemo(
    () =>
      getIndividualWebhookOptions((entity, plural) => {
        const terms: Record<TTerminologyEntity, { singular: string; plural: string }> = {
          project: { singular: projectTerm, plural: projectTermPlural },
          cycle: { singular: cycleTerm, plural: cycleTermPlural },
          module: { singular: moduleTerm, plural: moduleTermPlural },
          page: { singular: projectTerm, plural: projectTermPlural },
          work_item: { singular: workItemTerm, plural: workItemTermPlural },
          epic: { singular: workItemTerm, plural: workItemTermPlural },
        };
        const term = terms[entity];
        return plural ? term.plural : term.singular;
      }),
    [
      projectTerm,
      projectTermPlural,
      cycleTerm,
      cycleTermPlural,
      moduleTerm,
      moduleTermPlural,
      workItemTerm,
      workItemTermPlural,
    ]
  );

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 px-6 lg:grid-cols-2">
      {options.map((option) => (
        <Controller
          key={option.key}
          control={control}
          name={option.key}
          render={({ field: { onChange, value } }) => (
            <div>
              <div className="flex items-center gap-2">
                <Checkbox id={option.key} onChange={() => onChange(!value)} checked={value === true} />
                <label className="text-13" htmlFor={option.key}>
                  {option.label}
                </label>
              </div>
              <p className="mt-0.5 ml-6 text-11 text-tertiary">{option.description}</p>
            </div>
          )}
        />
      ))}
    </div>
  );
}
