/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@plane/constants";
import type {
  IProject,
  IWorkspaceProjectTemplate,
  TProjectTemplateInstantiatePayload,
  TProjectTemplatePreview,
  TWorkspaceProjectTemplatePayload,
} from "@plane/types";
import { APIService } from "@/services/api.service";

export class WorkspaceProjectTemplateService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async list(workspaceSlug: string): Promise<IWorkspaceProjectTemplate[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/project-templates/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async create(workspaceSlug: string, data: TWorkspaceProjectTemplatePayload): Promise<IWorkspaceProjectTemplate> {
    return this.post(`/api/workspaces/${workspaceSlug}/project-templates/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async installSeeds(workspaceSlug: string): Promise<IWorkspaceProjectTemplate[]> {
    return this.post(`/api/workspaces/${workspaceSlug}/project-templates/install-seeds/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async duplicate(workspaceSlug: string, templateId: string, name?: string): Promise<IWorkspaceProjectTemplate> {
    return this.post(`/api/workspaces/${workspaceSlug}/project-templates/${templateId}/duplicate/`, { name })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async instantiate(
    workspaceSlug: string,
    templateId: string,
    data: TProjectTemplateInstantiatePayload
  ): Promise<IProject> {
    return this.post(`/api/workspaces/${workspaceSlug}/project-templates/${templateId}/instantiate/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async preview(workspaceSlug: string, templateId: string): Promise<TProjectTemplatePreview> {
    return this.get(`/api/workspaces/${workspaceSlug}/project-templates/${templateId}/preview/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async promoteProject(workspaceSlug: string, projectId: string, name?: string): Promise<IWorkspaceProjectTemplate> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/promote-template/`, { name })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async update(
    workspaceSlug: string,
    templateId: string,
    data: Partial<TWorkspaceProjectTemplatePayload>
  ): Promise<IWorkspaceProjectTemplate> {
    return this.patch(`/api/workspaces/${workspaceSlug}/project-templates/${templateId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async archive(workspaceSlug: string, templateId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/project-templates/${templateId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
