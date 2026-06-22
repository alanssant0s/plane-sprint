/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Fragment, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronRightIcon, PlusIcon } from "@plane/propel/icons";
import { IconButton } from "@plane/propel/icon-button";
import { Tooltip } from "@plane/propel/tooltip";
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { cn } from "@plane/utils";
import { useTerminologyT, useWorkspaceType } from "@/hooks/use-workspace-type";
import { useUserPermissions } from "@/hooks/store/user";
import { useWorkspaceProjectTemplates } from "@/hooks/store/use-project-template";
import { CreateTemplateModal } from "@/components/project-templates/create-template-modal";

export const SidebarProjectTemplatesList = observer(function SidebarProjectTemplatesList() {
  const [isOpen, setIsOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { workspaceSlug } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTerminologyT();
  const workspaceType = useWorkspaceType();
  const { allowPermissions } = useUserPermissions();
  const { currentWorkspaceTemplateIds, fetchWorkspaceProjectTemplates, getTemplateById } =
    useWorkspaceProjectTemplates();

  const workspaceSlugValue = workspaceSlug?.toString();
  const canCreate = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  useEffect(() => {
    if (!workspaceSlugValue) return;
    fetchWorkspaceProjectTemplates(workspaceSlugValue);
  }, [fetchWorkspaceProjectTemplates, workspaceSlugValue, workspaceType]);

  useEffect(() => {
    if (pathname.includes("/templates")) setIsOpen(true);
  }, [pathname]);

  if (!workspaceSlugValue) return null;

  const templateIds = currentWorkspaceTemplateIds ?? [];

  const openTemplate = (projectId: string) => {
    router.push(`/${workspaceSlugValue}/projects/${projectId}/issues`);
  };

  const openGrid = () => {
    router.push(`/${workspaceSlugValue}/templates`);
  };

  return (
    <>
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(template) => openTemplate(template.project_id)}
      />
      <Disclosure as="div" className="flex flex-col" defaultOpen>
        <div className="group flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-placeholder hover:bg-layer-transparent-hover">
          <Disclosure.Button
            as="button"
            type="button"
            className="flex w-full items-center gap-1 text-left text-13 font-semibold whitespace-nowrap text-placeholder"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="text-13 font-semibold">{t("templates.sidebar.title")}</span>
          </Disclosure.Button>
          <div className="flex items-center gap-1">
            {canCreate && (
              <Tooltip tooltipHeading={t("templates.sidebar.add")} tooltipContent="">
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={PlusIcon}
                  onClick={() => setIsCreateModalOpen(true)}
                  className="hidden text-placeholder group-hover:inline-flex"
                  aria-label={t("templates.sidebar.add")}
                />
              </Tooltip>
            )}
            <IconButton
              variant="ghost"
              size="sm"
              icon={ChevronRightIcon}
              onClick={() => setIsOpen(!isOpen)}
              className="text-placeholder"
              iconClassName={cn("transition-transform", { "rotate-90": isOpen })}
            />
          </div>
        </div>
        <Transition
          show={isOpen}
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Disclosure.Panel as={Fragment}>
            <div className="ml-2 flex flex-col gap-0.5 border-l border-subtle pl-2">
              {templateIds.length === 0 ? (
                <button
                  type="button"
                  onClick={openGrid}
                  className="px-2 py-1 text-left text-11 text-tertiary hover:text-primary"
                >
                  {t("templates.sidebar.empty")}
                </button>
              ) : (
                templateIds.slice(0, 5).map((templateId) => {
                  const template = getTemplateById(templateId);
                  if (!template) return null;
                  return (
                    <button
                      key={templateId}
                      type="button"
                      onClick={() => openTemplate(template.project_id)}
                      className="truncate rounded px-2 py-1 text-left text-13 text-secondary hover:bg-layer-transparent-hover hover:text-primary"
                    >
                      {template.name}
                    </button>
                  );
                })
              )}
              {templateIds.length > 5 && (
                <button
                  type="button"
                  onClick={openGrid}
                  className="px-2 py-1 text-left text-11 text-tertiary hover:text-primary"
                >
                  {t("templates.sidebar.view_all")}
                </button>
              )}
            </div>
          </Disclosure.Panel>
        </Transition>
      </Disclosure>
    </>
  );
});
