# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Third party imports
from rest_framework import serializers

# Module imports
from plane.app.serializers.base import BaseSerializer
from plane.db.models import Issue, Module, WorkspaceProjectTemplate


class WorkspaceProjectTemplateSerializer(BaseSerializer):
    class Meta:
        model = WorkspaceProjectTemplate
        fields = [
            "id",
            "name",
            "description",
            "seed_id",
            "workspace_type",
            "is_system",
            "is_default_for_type",
            "project_id",
            "sort_order",
            "logo_props",
            "archived_at",
            "is_hidden",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["project_id"] = str(instance.project_id)
        data["module_count"] = getattr(
            instance,
            "module_count",
            Module.objects.filter(project=instance.project, deleted_at__isnull=True).count(),
        )
        data["issue_count"] = getattr(
            instance,
            "issue_count",
            Issue.objects.filter(project=instance.project, deleted_at__isnull=True).count(),
        )
        return data


class WorkspaceProjectTemplateWriteSerializer(BaseSerializer):
    class Meta:
        model = WorkspaceProjectTemplate
        fields = ["name", "description", "logo_props", "sort_order", "is_hidden"]


class ProjectTemplateInstantiateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    identifier = serializers.CharField(max_length=12)
    description = serializers.CharField(required=False, allow_blank=True, default="")


class ProjectTemplatePreviewSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    description = serializers.CharField()
    modules = serializers.ListField()
    states = serializers.ListField()
    issue_count = serializers.IntegerField()
    is_system = serializers.BooleanField()
