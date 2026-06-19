/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { sortBy } from "lodash-es";
import type {
  IWorkspaceSprint,
  IWorkspaceSprintAutomation,
  TIssue,
  TWorkspaceSprintAutomationPayload,
  TWorkspaceSprintCreatePayload,
} from "@plane/types";
import { WorkspaceSprintService } from "@/services/sprint.service";
import type { CoreRootStore } from "./root.store";

export interface IWorkspaceSprintStore {
  loader: boolean;
  fetchedMap: Record<string, boolean>;
  automationFetchedMap: Record<string, boolean>;
  sprintMap: Record<string, IWorkspaceSprint>;
  archivedSprintMap: Record<string, IWorkspaceSprint>;
  automationMap: Record<string, IWorkspaceSprintAutomation>;
  currentWorkspaceSprintIds: string[] | null;
  currentWorkspaceSprintAutomationIds: string[] | null;
  getSprintsByAutomationId: (automationId: string | null | undefined) => string[];
  getArchivedSprintsByAutomationId: (automationId: string | null | undefined) => string[];
  fetchWorkspaceSprintAutomations: (workspaceSlug: string) => Promise<IWorkspaceSprintAutomation[]>;
  createWorkspaceSprintAutomation: (
    workspaceSlug: string,
    data: Partial<TWorkspaceSprintAutomationPayload>
  ) => Promise<IWorkspaceSprintAutomation>;
  updateWorkspaceSprintAutomation: (
    workspaceSlug: string,
    automationId: string,
    data: Partial<TWorkspaceSprintAutomationPayload>
  ) => Promise<IWorkspaceSprintAutomation>;
  updateWorkspaceSprintAutomationSortOrder: (
    workspaceSlug: string,
    automationId: string,
    sortOrder: number
  ) => Promise<IWorkspaceSprintAutomation>;
  fetchWorkspaceSprints: (workspaceSlug: string, automationId?: string) => Promise<IWorkspaceSprint[]>;
  fetchArchivedWorkspaceSprints: (workspaceSlug: string, automationId?: string) => Promise<IWorkspaceSprint[]>;
  createWorkspaceSprint: (
    workspaceSlug: string,
    data: Partial<TWorkspaceSprintCreatePayload>
  ) => Promise<IWorkspaceSprint>;
  updateWorkspaceSprint: (
    workspaceSlug: string,
    sprintId: string,
    data: Partial<TWorkspaceSprintCreatePayload>
  ) => Promise<IWorkspaceSprint>;
  completeWorkspaceSprint: (workspaceSlug: string, sprintId: string) => Promise<void>;
  getSprintById: (sprintId: string | null | undefined) => IWorkspaceSprint | null;
  getSprintAutomationById: (automationId: string | null | undefined) => IWorkspaceSprintAutomation | null;
  getSprintNameById: (sprintId: string | null | undefined) => string | undefined;
  addIssueToSprint: (workspaceSlug: string, sprintId: string, issueId: string) => Promise<void>;
  removeIssueFromSprint: (workspaceSlug: string, sprintId: string, issueId: string) => Promise<void>;
}

export class WorkspaceSprintStore implements IWorkspaceSprintStore {
  loader = false;
  fetchedMap: Record<string, boolean> = {};
  automationFetchedMap: Record<string, boolean> = {};
  sprintMap: Record<string, IWorkspaceSprint> = {};
  archivedSprintMap: Record<string, IWorkspaceSprint> = {};
  automationMap: Record<string, IWorkspaceSprintAutomation> = {};

  rootStore;
  sprintService;

  constructor(_rootStore: CoreRootStore) {
    makeObservable(this, {
      loader: observable.ref,
      fetchedMap: observable,
      automationFetchedMap: observable,
      sprintMap: observable,
      archivedSprintMap: observable,
      automationMap: observable,
      currentWorkspaceSprintIds: computed,
      currentWorkspaceSprintAutomationIds: computed,
      fetchWorkspaceSprints: action,
      fetchArchivedWorkspaceSprints: action,
      fetchWorkspaceSprintAutomations: action,
      createWorkspaceSprintAutomation: action,
      updateWorkspaceSprintAutomation: action,
      updateWorkspaceSprintAutomationSortOrder: action,
      createWorkspaceSprint: action,
      updateWorkspaceSprint: action,
      completeWorkspaceSprint: action,
      addIssueToSprint: action,
      removeIssueFromSprint: action,
    });

    this.rootStore = _rootStore;
    this.sprintService = new WorkspaceSprintService();
  }

  get currentWorkspaceSprintIds() {
    const workspaceSlug = this.rootStore.router.workspaceSlug;
    if (!workspaceSlug || !this.fetchedMap[workspaceSlug]) return null;

    const sprints = Object.values(this.sprintMap).filter((sprint) => !sprint.archived_at);
    return sortBy(sprints, [(sprint) => sprint.start_date ?? "", (sprint) => sprint.sort_order]).map(
      (sprint) => sprint.id
    );
  }

  get currentWorkspaceSprintAutomationIds() {
    const workspaceSlug = this.rootStore.router.workspaceSlug;
    if (!workspaceSlug || !this.automationFetchedMap[workspaceSlug]) return null;

    const automations = Object.values(this.automationMap).filter((automation) => automation.workspace_id);
    return sortBy(automations, [(automation) => automation.sort_order]).map((automation) => automation.id);
  }

  getSprintById = computedFn((sprintId: string | null | undefined) => {
    if (!sprintId) return null;
    return this.sprintMap[sprintId] ?? this.archivedSprintMap[sprintId] ?? null;
  });

  getSprintAutomationById = computedFn((automationId: string | null | undefined) => {
    if (!automationId) return null;
    return this.automationMap[automationId] ?? null;
  });

  getSprintNameById = computedFn((sprintId: string | null | undefined) => this.getSprintById(sprintId)?.name);

  getSprintsByAutomationId = computedFn((automationId: string | null | undefined) => {
    if (!automationId) return [];
    return sortBy(
      Object.values(this.sprintMap).filter((sprint) => sprint.automation_id === automationId && !sprint.archived_at),
      [(sprint) => sprint.start_date ?? "", (sprint) => sprint.sort_order]
    ).map((sprint) => sprint.id);
  });

  getArchivedSprintsByAutomationId = computedFn((automationId: string | null | undefined) => {
    if (!automationId) return [];
    return sortBy(
      Object.values(this.archivedSprintMap).filter((sprint) => sprint.automation_id === automationId),
      [(sprint) => sprint.archived_at ?? ""]
    ).map((sprint) => sprint.id);
  });

  fetchWorkspaceSprintAutomations = async (workspaceSlug: string) => {
    const automations = await this.sprintService.listAutomations(workspaceSlug);
    runInAction(() => {
      automations.forEach((automation) => {
        this.automationMap[automation.id] = automation;
      });
      this.automationFetchedMap[workspaceSlug] = true;
    });
    return automations;
  };

  createWorkspaceSprintAutomation = async (workspaceSlug: string, data: Partial<TWorkspaceSprintAutomationPayload>) => {
    const automation = await this.sprintService.createAutomation(workspaceSlug, data);
    runInAction(() => {
      this.automationMap[automation.id] = automation;
      this.automationFetchedMap[workspaceSlug] = true;
    });
    await this.fetchWorkspaceSprints(workspaceSlug, automation.id);
    return automation;
  };

  updateWorkspaceSprintAutomation = async (
    workspaceSlug: string,
    automationId: string,
    data: Partial<TWorkspaceSprintAutomationPayload>
  ) => {
    const automation = await this.sprintService.updateAutomation(workspaceSlug, automationId, data);
    runInAction(() => {
      this.automationMap[automation.id] = automation;
    });
    await this.fetchWorkspaceSprints(workspaceSlug, automation.id);
    return automation;
  };

  updateWorkspaceSprintAutomationSortOrder = async (workspaceSlug: string, automationId: string, sortOrder: number) => {
    const previousSortOrder = this.automationMap[automationId]?.sort_order;
    try {
      runInAction(() => {
        if (this.automationMap[automationId]) this.automationMap[automationId].sort_order = sortOrder;
      });
      const automation = await this.sprintService.updateAutomation(workspaceSlug, automationId, {
        sort_order: sortOrder,
      } as Partial<TWorkspaceSprintAutomationPayload>);
      runInAction(() => {
        this.automationMap[automation.id] = automation;
      });
      return automation;
    } catch (error) {
      runInAction(() => {
        if (this.automationMap[automationId] && previousSortOrder !== undefined)
          this.automationMap[automationId].sort_order = previousSortOrder;
      });
      throw error;
    }
  };

  fetchWorkspaceSprints = async (workspaceSlug: string, automationId?: string) => {
    try {
      this.loader = true;
      const sprints = await this.sprintService.list(
        workspaceSlug,
        automationId ? { automation_id: automationId } : undefined
      );

      runInAction(() => {
        sprints.forEach((sprint) => {
          this.sprintMap[sprint.id] = sprint;
          delete this.archivedSprintMap[sprint.id];
        });
        this.fetchedMap[workspaceSlug] = true;
        this.loader = false;
      });

      return sprints;
    } catch (error) {
      runInAction(() => {
        this.loader = false;
      });
      throw error;
    }
  };

  fetchArchivedWorkspaceSprints = async (workspaceSlug: string, automationId?: string) => {
    const sprints = await this.sprintService.listArchived(workspaceSlug, automationId);
    runInAction(() => {
      sprints.forEach((sprint) => {
        this.archivedSprintMap[sprint.id] = sprint;
        delete this.sprintMap[sprint.id];
      });
    });
    return sprints;
  };

  createWorkspaceSprint = async (workspaceSlug: string, data: Partial<TWorkspaceSprintCreatePayload>) => {
    const sprint = await this.sprintService.create(workspaceSlug, data);
    runInAction(() => {
      this.sprintMap[sprint.id] = sprint;
    });
    return sprint;
  };

  updateWorkspaceSprint = async (
    workspaceSlug: string,
    sprintId: string,
    data: Partial<TWorkspaceSprintCreatePayload>
  ) => {
    const sprint = await this.sprintService.update(workspaceSlug, sprintId, data);
    runInAction(() => {
      this.sprintMap[sprint.id] = sprint;
    });
    return sprint;
  };

  completeWorkspaceSprint = async (workspaceSlug: string, sprintId: string) => {
    const response = await this.sprintService.archive(workspaceSlug, sprintId);
    runInAction(() => {
      const sprint = this.sprintMap[sprintId];
      if (!sprint) return;
      const archivedSprint = { ...sprint, archived_at: response.archived_at, status: "archived" as const };
      this.archivedSprintMap[sprintId] = archivedSprint;
      delete this.sprintMap[sprintId];
    });
  };

  addIssueToSprint = async (workspaceSlug: string, sprintId: string, issueId: string) => {
    const issueBeforeUpdate = this.rootStore.issue.issues.getIssueById(issueId);
    const sprint = this.getSprintById(sprintId);
    const optimisticUpdate: Partial<TIssue> = {
      global_sprint_id: sprintId,
      global_sprint_name: sprint?.name ?? issueBeforeUpdate?.global_sprint_name ?? null,
    };

    this.rootStore.issue.issues.updateIssue(issueId, optimisticUpdate);

    try {
      const response = await this.sprintService.addIssue(workspaceSlug, sprintId, issueId);
      this.rootStore.issue.issues.updateIssue(issueId, {
        global_sprint_id: response.sprint,
        global_sprint_name: this.getSprintNameById(response.sprint) ?? optimisticUpdate.global_sprint_name ?? null,
      });
    } catch (error) {
      if (issueBeforeUpdate) {
        this.rootStore.issue.issues.updateIssue(issueId, {
          global_sprint_id: issueBeforeUpdate.global_sprint_id,
          global_sprint_name: issueBeforeUpdate.global_sprint_name,
        });
      }
      throw error;
    }
  };

  removeIssueFromSprint = async (workspaceSlug: string, sprintId: string, issueId: string) => {
    const issueBeforeUpdate = this.rootStore.issue.issues.getIssueById(issueId);

    this.rootStore.issue.issues.updateIssue(issueId, {
      global_sprint_id: null,
      global_sprint_name: null,
    });

    try {
      await this.sprintService.removeIssue(workspaceSlug, sprintId, issueId);
    } catch (error) {
      if (issueBeforeUpdate) {
        this.rootStore.issue.issues.updateIssue(issueId, {
          global_sprint_id: issueBeforeUpdate.global_sprint_id,
          global_sprint_name: issueBeforeUpdate.global_sprint_name,
        });
      }
      throw error;
    }
  };
}
