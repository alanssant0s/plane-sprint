/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { action, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import type {
  IProject,
  IWorkspaceProjectTemplate,
  TProjectTemplateInstantiatePayload,
  TProjectTemplatePreview,
  TWorkspaceProjectTemplatePayload,
} from "@plane/types";
import { WorkspaceProjectTemplateService } from "@/services/project-template.service";
import type { CoreRootStore } from "./root.store";

export interface IWorkspaceProjectTemplateStore {
  loader: boolean;
  fetchedMap: Record<string, boolean>;
  templateMap: Record<string, IWorkspaceProjectTemplate>;
  currentWorkspaceTemplateIds: string[] | null;
  fetchWorkspaceProjectTemplates: (workspaceSlug: string) => Promise<IWorkspaceProjectTemplate[]>;
  installSeeds: (workspaceSlug: string) => Promise<IWorkspaceProjectTemplate[]>;
  createTemplate: (workspaceSlug: string, data: TWorkspaceProjectTemplatePayload) => Promise<IWorkspaceProjectTemplate>;
  duplicateTemplate: (workspaceSlug: string, templateId: string, name?: string) => Promise<IWorkspaceProjectTemplate>;
  instantiateTemplate: (
    workspaceSlug: string,
    templateId: string,
    data: TProjectTemplateInstantiatePayload
  ) => Promise<IProject>;
  getTemplatePreview: (workspaceSlug: string, templateId: string) => Promise<TProjectTemplatePreview>;
  promoteProjectToTemplate: (
    workspaceSlug: string,
    projectId: string,
    name?: string
  ) => Promise<IWorkspaceProjectTemplate>;
  updateTemplate: (
    workspaceSlug: string,
    templateId: string,
    data: Partial<TWorkspaceProjectTemplatePayload>
  ) => Promise<IWorkspaceProjectTemplate>;
  archiveTemplate: (workspaceSlug: string, templateId: string) => Promise<void>;
  getTemplateById: (templateId: string) => IWorkspaceProjectTemplate | undefined;
  getTemplateByProjectId: (projectId: string) => IWorkspaceProjectTemplate | undefined;
}

export class WorkspaceProjectTemplateStore implements IWorkspaceProjectTemplateStore {
  loader: boolean = false;
  fetchedMap: Record<string, boolean> = {};
  templateMap: Record<string, IWorkspaceProjectTemplate> = {};
  currentWorkspaceTemplateIds: string[] | null = null;

  private templateService = new WorkspaceProjectTemplateService();

  constructor(_rootStore: CoreRootStore) {
    makeObservable(this, {
      loader: observable.ref,
      fetchedMap: observable.ref,
      templateMap: observable.ref,
      currentWorkspaceTemplateIds: observable.ref,
      fetchWorkspaceProjectTemplates: action,
      installSeeds: action,
      createTemplate: action,
      duplicateTemplate: action,
      instantiateTemplate: action,
      getTemplatePreview: action,
      promoteProjectToTemplate: action,
      updateTemplate: action,
      archiveTemplate: action,
    });
  }

  getTemplateById = computedFn((templateId: string) => this.templateMap[templateId]);

  getTemplateByProjectId = computedFn((projectId: string) =>
    Object.values(this.templateMap).find((template) => template.project_id === projectId)
  );

  fetchWorkspaceProjectTemplates = async (workspaceSlug: string) => {
    this.loader = true;
    try {
      const templates = await this.templateService.list(workspaceSlug);
      runInAction(() => {
        const nextTemplateMap = { ...this.templateMap };
        templates.forEach((template) => {
          nextTemplateMap[template.id] = template;
        });
        this.templateMap = nextTemplateMap;
        this.currentWorkspaceTemplateIds = templates.map((t) => t.id);
        this.fetchedMap[workspaceSlug] = true;
      });
      return templates;
    } finally {
      runInAction(() => {
        this.loader = false;
      });
    }
  };

  installSeeds = async (workspaceSlug: string) => {
    const templates = await this.templateService.installSeeds(workspaceSlug);
    runInAction(() => {
      const nextTemplateMap = { ...this.templateMap };
      templates.forEach((template) => {
        nextTemplateMap[template.id] = template;
      });
      this.templateMap = nextTemplateMap;
      this.currentWorkspaceTemplateIds = templates.map((t) => t.id);
      this.fetchedMap[workspaceSlug] = true;
    });
    return templates;
  };

  createTemplate = async (workspaceSlug: string, data: TWorkspaceProjectTemplatePayload) => {
    const template = await this.templateService.create(workspaceSlug, data);
    runInAction(() => {
      this.templateMap = { ...this.templateMap, [template.id]: template };
      this.currentWorkspaceTemplateIds = [...(this.currentWorkspaceTemplateIds ?? []), template.id];
      this.fetchedMap[workspaceSlug] = true;
    });
    return template;
  };

  duplicateTemplate = async (workspaceSlug: string, templateId: string, name?: string) => {
    const template = await this.templateService.duplicate(workspaceSlug, templateId, name);
    runInAction(() => {
      this.templateMap = { ...this.templateMap, [template.id]: template };
      this.currentWorkspaceTemplateIds = [template.id, ...(this.currentWorkspaceTemplateIds ?? [])];
    });
    return template;
  };

  instantiateTemplate = async (workspaceSlug: string, templateId: string, data: TProjectTemplateInstantiatePayload) => {
    return this.templateService.instantiate(workspaceSlug, templateId, data);
  };

  getTemplatePreview = async (workspaceSlug: string, templateId: string) => {
    return this.templateService.preview(workspaceSlug, templateId);
  };

  promoteProjectToTemplate = async (workspaceSlug: string, projectId: string, name?: string) => {
    const template = await this.templateService.promoteProject(workspaceSlug, projectId, name);
    runInAction(() => {
      this.templateMap = { ...this.templateMap, [template.id]: template };
      this.currentWorkspaceTemplateIds = [template.id, ...(this.currentWorkspaceTemplateIds ?? [])];
    });
    return template;
  };

  updateTemplate = async (
    workspaceSlug: string,
    templateId: string,
    data: Partial<TWorkspaceProjectTemplatePayload>
  ) => {
    const template = await this.templateService.update(workspaceSlug, templateId, data);
    runInAction(() => {
      this.templateMap = { ...this.templateMap, [template.id]: template };
    });
    return template;
  };

  archiveTemplate = async (workspaceSlug: string, templateId: string) => {
    await this.templateService.archive(workspaceSlug, templateId);
    runInAction(() => {
      const nextTemplateMap = { ...this.templateMap };
      delete nextTemplateMap[templateId];
      this.templateMap = nextTemplateMap;
      this.currentWorkspaceTemplateIds = (this.currentWorkspaceTemplateIds ?? []).filter((id) => id !== templateId);
    });
  };
}
