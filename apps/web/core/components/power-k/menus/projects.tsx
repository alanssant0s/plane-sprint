/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { observer } from "mobx-react";
import { Logo } from "@plane/propel/emoji-icon-picker";
import type { TPartialProject } from "@plane/types";
import { useEntityTerm } from "@/hooks/use-workspace-type";
import { PowerKMenuBuilder } from "./builder";

type Props = {
  projects: TPartialProject[];
  onSelect: (project: TPartialProject) => void;
};

export const PowerKProjectsMenu = observer(function PowerKProjectsMenu({ projects, onSelect }: Props) {
  const projectsTerm = useEntityTerm("project", { plural: true });

  return (
    <PowerKMenuBuilder
      items={projects}
      getKey={(project) => project.id}
      getIconNode={(project) => (
        <span className="shrink-0">
          <Logo logo={project.logo_props} size={14} />
        </span>
      )}
      getValue={(project) => project.name}
      getLabel={(project) => project.name}
      onSelect={onSelect}
      emptyText={`No ${projectsTerm.toLowerCase()} found`}
    />
  );
});
