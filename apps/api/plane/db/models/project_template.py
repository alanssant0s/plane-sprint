# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Django imports
from django.conf import settings
from django.db import models
from django.db.models import Q

# Module imports
from .base import BaseModel


class WorkspaceProjectTemplate(BaseModel):
    workspace = models.ForeignKey(
        "db.Workspace",
        on_delete=models.CASCADE,
        related_name="project_templates",
    )
    project = models.ForeignKey(
        "db.Project",
        on_delete=models.CASCADE,
        related_name="workspace_template",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    seed_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    workspace_type = models.CharField(max_length=64, null=True, blank=True)
    is_system = models.BooleanField(default=False)
    is_default_for_type = models.BooleanField(default=False)
    sort_order = models.FloatField(default=65535)
    logo_props = models.JSONField(default=dict)
    archived_at = models.DateTimeField(null=True)
    is_hidden = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Workspace Project Template"
        verbose_name_plural = "Workspace Project Templates"
        db_table = "workspace_project_templates"
        ordering = ("sort_order", "-created_at")
        constraints = [
            models.UniqueConstraint(
                fields=["workspace", "seed_id"],
                condition=Q(deleted_at__isnull=True, seed_id__isnull=False),
                name="workspace_project_template_unique_seed",
            ),
        ]

    def __str__(self):
        return f"{self.name} <{self.workspace.name}>"

    def save(self, *args, **kwargs):
        if self._state.adding:
            smallest = (
                WorkspaceProjectTemplate.objects.filter(workspace=self.workspace)
                .aggregate(smallest=models.Min("sort_order"))
                .get("smallest")
            )
            if smallest is not None:
                self.sort_order = smallest - 10000
        super().save(*args, **kwargs)
