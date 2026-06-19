# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Django imports
from django.conf import settings
from django.db import models

# Module imports
from .workspace import WorkspaceBaseModel


class WorkspaceSprint(WorkspaceBaseModel):
    name = models.CharField(max_length=255, verbose_name="Sprint Name")
    description = models.TextField(verbose_name="Sprint Description", blank=True)
    start_date = models.DateTimeField(verbose_name="Start Date", blank=True, null=True)
    end_date = models.DateTimeField(verbose_name="End Date", blank=True, null=True)
    automation = models.ForeignKey(
        "db.WorkspaceSprintAutomation",
        on_delete=models.SET_NULL,
        related_name="sprints",
        null=True,
        blank=True,
    )
    source = models.CharField(max_length=50, default="manual")
    sequence_id = models.IntegerField(null=True, blank=True)
    owned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_workspace_sprints",
    )
    sort_order = models.FloatField(default=65535)
    archived_at = models.DateTimeField(null=True)
    logo_props = models.JSONField(default=dict)
    timezone = models.CharField(max_length=255, default="UTC")
    version = models.IntegerField(default=1)

    class Meta:
        verbose_name = "Workspace Sprint"
        verbose_name_plural = "Workspace Sprints"
        db_table = "workspace_sprints"
        ordering = ("-created_at",)

    def save(self, *args, **kwargs):
        if self._state.adding:
            smallest_sort_order = WorkspaceSprint.objects.filter(workspace=self.workspace).aggregate(
                smallest=models.Min("sort_order")
            )["smallest"]

            if smallest_sort_order is not None:
                self.sort_order = smallest_sort_order - 10000

        super(WorkspaceSprint, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} <{self.workspace.name}>"


class WorkspaceSprintAutomation(WorkspaceBaseModel):
    name = models.CharField(max_length=255, verbose_name="Sprint Group Name")
    description = models.TextField(verbose_name="Sprint Group Description", blank=True)
    enabled = models.BooleanField(default=True)
    start_date = models.DateTimeField(verbose_name="Automation Start Date")
    sprint_duration_days = models.PositiveIntegerField(default=14)
    timezone = models.CharField(max_length=255, default="UTC")
    name_template = models.CharField(max_length=255, default="Sprint {{number}}")
    next_sequence = models.IntegerField(default=1)
    auto_create_next = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Workspace Sprint Automation"
        verbose_name_plural = "Workspace Sprint Automations"
        db_table = "workspace_sprint_automations"
        ordering = ("sort_order", "-created_at")

    sort_order = models.FloatField(default=65535)

    def save(self, *args, **kwargs):
        if self._state.adding:
            smallest_sort_order = WorkspaceSprintAutomation.objects.filter(workspace=self.workspace).aggregate(
                smallest=models.Min("sort_order")
            )["smallest"]

            if smallest_sort_order is not None:
                self.sort_order = smallest_sort_order - 10000

        super(WorkspaceSprintAutomation, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} <{self.workspace.name}>"


class WorkspaceSprintIssue(WorkspaceBaseModel):
    issue = models.ForeignKey("db.Issue", on_delete=models.CASCADE, related_name="issue_workspace_sprint")
    sprint = models.ForeignKey(WorkspaceSprint, on_delete=models.CASCADE, related_name="sprint_issues")

    class Meta:
        unique_together = ["issue", "sprint", "deleted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["sprint", "issue"],
                condition=models.Q(deleted_at__isnull=True),
                name="workspace_sprint_issue_when_deleted_at_null",
            ),
            models.UniqueConstraint(
                fields=["issue"],
                condition=models.Q(deleted_at__isnull=True),
                name="workspace_sprint_issue_unique_active_issue",
            ),
        ]
        verbose_name = "Workspace Sprint Issue"
        verbose_name_plural = "Workspace Sprint Issues"
        db_table = "workspace_sprint_issues"
        ordering = ("-created_at",)

    def save(self, *args, **kwargs):
        if self.issue_id:
            self.project = self.issue.project
            self.workspace = self.issue.workspace
        super(WorkspaceSprintIssue, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.issue} <{self.sprint}>"
