# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import pytest
from django.urls import reverse
from rest_framework import status

from plane.app.serializers import WorkSpaceSerializer
from plane.db.models import Workspace, WorkspaceMember, User
from plane.utils.workspace_type import WorkspaceType


@pytest.mark.unit
class TestWorkSpaceSerializerWorkspaceType:
    def test_workspace_type_defaults_to_default(self, db):
        owner = User.objects.create(email="owner@example.com")
        workspace = Workspace.objects.create(name="WS", slug="ws-type-default", owner=owner)
        data = WorkSpaceSerializer(workspace).data
        assert data["workspace_type"] == WorkspaceType.DEFAULT

    def test_validate_workspace_type_rejects_invalid(self, db):
        owner = User.objects.create(email="owner2@example.com")
        workspace = Workspace.objects.create(name="WS2", slug="ws-type-invalid", owner=owner)
        serializer = WorkSpaceSerializer(workspace, data={"workspace_type": "invalid_type"}, partial=True)
        assert not serializer.is_valid()
        assert "workspace_type" in serializer.errors

    def test_validate_workspace_type_accepts_valid(self, db):
        owner = User.objects.create(email="owner3@example.com")
        workspace = Workspace.objects.create(name="WS3", slug="ws-type-valid", owner=owner)
        serializer = WorkSpaceSerializer(
            workspace,
            data={"workspace_type": WorkspaceType.CIVIL_ENGINEERING},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors
        updated = serializer.save()
        assert updated.workspace_type == WorkspaceType.CIVIL_ENGINEERING


@pytest.mark.contract
class TestWorkspaceTypeAPI:
    @pytest.mark.django_db
    def test_get_workspace_includes_workspace_type(self, session_client, workspace):
        url = reverse("workspace", kwargs={"slug": workspace.slug})
        response = session_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["workspace_type"] == WorkspaceType.DEFAULT

    @pytest.mark.django_db
    def test_patch_workspace_type_admin(self, session_client, workspace):
        url = reverse("workspace", kwargs={"slug": workspace.slug})
        response = session_client.patch(url, {"workspace_type": WorkspaceType.DIGITAL_LAUNCHES}, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["workspace_type"] == WorkspaceType.DIGITAL_LAUNCHES
        workspace.refresh_from_db()
        assert workspace.workspace_type == WorkspaceType.DIGITAL_LAUNCHES

    @pytest.mark.django_db
    def test_patch_workspace_type_invalid(self, session_client, workspace):
        url = reverse("workspace", kwargs={"slug": workspace.slug})
        response = session_client.patch(url, {"workspace_type": "not_a_type"}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    def test_patch_workspace_type_member_forbidden(self, session_client, workspace, create_user):
        member = User.objects.create(email="member@example.com", first_name="Mem", last_name="Ber")
        WorkspaceMember.objects.create(workspace=workspace, member=member, role=15)
        session_client.force_authenticate(user=member)
        url = reverse("workspace", kwargs={"slug": workspace.slug})
        response = session_client.patch(url, {"workspace_type": WorkspaceType.SOFTWARE_DEVELOPMENT}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN
