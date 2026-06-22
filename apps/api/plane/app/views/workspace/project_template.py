# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Django imports
from django.db import transaction
from django.utils import timezone

# Third party imports
from rest_framework import status
from rest_framework.response import Response

# Module imports
from plane.app.permissions import WorkspaceEntityPermission, allow_permission, ROLE
from plane.app.serializers import (
    ProjectListSerializer,
    ProjectTemplateInstantiateSerializer,
    ProjectTemplatePreviewSerializer,
    WorkspaceProjectTemplateSerializer,
    WorkspaceProjectTemplateWriteSerializer,
)
from plane.app.views.base import BaseAPIView, BaseViewSet
from plane.db.models import Project, Workspace, WorkspaceProjectTemplate
from plane.utils.project_template_service import (
    create_empty_template,
    duplicate_template,
    get_template_preview,
    get_visible_templates_queryset,
    install_workspace_project_templates,
    instantiate_template,
    promote_project_to_template,
)


class WorkspaceProjectTemplateViewSet(BaseViewSet):
    serializer_class = WorkspaceProjectTemplateSerializer
    model = WorkspaceProjectTemplate
    permission_classes = [WorkspaceEntityPermission]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return WorkspaceProjectTemplateWriteSerializer
        return WorkspaceProjectTemplateSerializer

    def get_queryset(self):
        workspace = Workspace.objects.get(slug=self.kwargs.get("slug"))
        return get_visible_templates_queryset(workspace).select_related("project", "workspace")

    @allow_permission(allowed_roles=[ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST], level="WORKSPACE")
    def list(self, request, slug):
        workspace = Workspace.objects.get(slug=slug)
        # Ensure system seeds for the current workspace type exist before filtering visibility.
        install_workspace_project_templates(workspace, request.user.id)
        templates = (
            get_visible_templates_queryset(workspace)
            .select_related("project")
            .order_by("sort_order", "-created_at")
        )
        serializer = WorkspaceProjectTemplateSerializer(templates, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @allow_permission(allowed_roles=[ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def create(self, request, slug):
        workspace = Workspace.objects.get(slug=slug)
        serializer = WorkspaceProjectTemplateWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        template = create_empty_template(
            workspace,
            request.user.id,
            name=serializer.validated_data["name"],
            description=serializer.validated_data.get("description", ""),
        )
        if serializer.validated_data.get("logo_props"):
            template.logo_props = serializer.validated_data["logo_props"]
            template.save(update_fields=["logo_props"])
        return Response(WorkspaceProjectTemplateSerializer(template).data, status=status.HTTP_201_CREATED)

    @allow_permission(allowed_roles=[ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST], level="WORKSPACE")
    def retrieve(self, request, slug, pk):
        workspace = Workspace.objects.get(slug=slug)
        template = get_visible_templates_queryset(workspace).get(pk=pk)
        return Response(WorkspaceProjectTemplateSerializer(template).data, status=status.HTTP_200_OK)

    @allow_permission(allowed_roles=[ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def partial_update(self, request, slug, pk):
        workspace = Workspace.objects.get(slug=slug)
        template = get_visible_templates_queryset(workspace).get(pk=pk)
        if template.is_system and set(request.data.keys()) - {"sort_order", "is_hidden"}:
            return Response({"error": "System templates cannot be edited"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = WorkspaceProjectTemplateWriteSerializer(template, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(WorkspaceProjectTemplateSerializer(template).data, status=status.HTTP_200_OK)

    @allow_permission(allowed_roles=[ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def destroy(self, request, slug, pk):
        workspace = Workspace.objects.get(slug=slug)
        template = get_visible_templates_queryset(workspace).get(pk=pk)
        if template.is_system:
            return Response({"error": "System templates cannot be deleted"}, status=status.HTTP_400_BAD_REQUEST)
        template.archived_at = timezone.now()
        template.save(update_fields=["archived_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class WorkspaceProjectTemplateInstallEndpoint(BaseAPIView):
    permission_classes = [WorkspaceEntityPermission]

    @allow_permission(allowed_roles=[ROLE.ADMIN], level="WORKSPACE")
    def post(self, request, slug):
        workspace = Workspace.objects.get(slug=slug)
        installed = install_workspace_project_templates(workspace, request.user.id)
        return Response(
            WorkspaceProjectTemplateSerializer(installed, many=True).data,
            status=status.HTTP_200_OK,
        )


class WorkspaceProjectTemplateDuplicateEndpoint(BaseAPIView):
    permission_classes = [WorkspaceEntityPermission]

    @allow_permission(allowed_roles=[ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def post(self, request, slug, template_id):
        workspace = Workspace.objects.get(slug=slug)
        template = get_visible_templates_queryset(workspace).get(pk=template_id)
        name = request.data.get("name")
        new_template = duplicate_template(template, request.user.id, name=name)
        return Response(WorkspaceProjectTemplateSerializer(new_template).data, status=status.HTTP_201_CREATED)


class WorkspaceProjectTemplateInstantiateEndpoint(BaseAPIView):
    permission_classes = [WorkspaceEntityPermission]

    @allow_permission(allowed_roles=[ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def post(self, request, slug, template_id):
        workspace = Workspace.objects.get(slug=slug)
        template = get_visible_templates_queryset(workspace).get(pk=template_id)
        serializer = ProjectTemplateInstantiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if Project.objects.filter(
            workspace=workspace,
            identifier=serializer.validated_data["identifier"].upper(),
            deleted_at__isnull=True,
            is_template=False,
        ).exists():
            return Response({"identifier": "Project identifier already exists"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            project = instantiate_template(
                template,
                request.user.id,
                name=serializer.validated_data["name"],
                identifier=serializer.validated_data["identifier"],
                description=serializer.validated_data.get("description", ""),
            )

        return Response(ProjectListSerializer(project).data, status=status.HTTP_201_CREATED)


class WorkspaceProjectTemplatePreviewEndpoint(BaseAPIView):
    permission_classes = [WorkspaceEntityPermission]

    @allow_permission(allowed_roles=[ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST], level="WORKSPACE")
    def get(self, request, slug, template_id):
        workspace = Workspace.objects.get(slug=slug)
        template = get_visible_templates_queryset(workspace).get(pk=template_id)
        preview = get_template_preview(template)
        return Response(ProjectTemplatePreviewSerializer(preview).data, status=status.HTTP_200_OK)


class WorkspaceProjectPromoteTemplateEndpoint(BaseAPIView):
    permission_classes = [WorkspaceEntityPermission]

    @allow_permission(allowed_roles=[ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def post(self, request, slug, project_id):
        workspace = Workspace.objects.get(slug=slug)
        project = Project.objects.get(pk=project_id, workspace=workspace, is_template=False, deleted_at__isnull=True)
        name = request.data.get("name")
        template = promote_project_to_template(project, request.user.id, name=name)
        return Response(WorkspaceProjectTemplateSerializer(template).data, status=status.HTTP_201_CREATED)
