# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import pytest

from plane.db.models import Project, WorkspaceProjectTemplate
from plane.utils.project_template_service import (
    duplicate_template,
    get_visible_templates_queryset,
    install_workspace_project_templates,
    is_template_state_change_blocked,
    read_seed_definition,
)


@pytest.mark.unit
def test_read_seed_definition_default():
    seed = read_seed_definition("default_generic_project")
    assert seed is not None
    assert seed["seedId"] == "default_generic_project"
    assert len(seed["modules"]) == 3


@pytest.mark.unit
@pytest.mark.django_db
def test_install_workspace_templates_idempotent(workspace, create_user):
    user = create_user
    first = install_workspace_project_templates(workspace, user.id)
    count_after_first = WorkspaceProjectTemplate.objects.filter(workspace=workspace, deleted_at__isnull=True).count()
    install_workspace_project_templates(workspace, user.id)
    count_after_second = WorkspaceProjectTemplate.objects.filter(workspace=workspace, deleted_at__isnull=True).count()
    assert len(first) >= 1
    assert count_after_first == count_after_second


@pytest.mark.unit
@pytest.mark.django_db
def test_template_projects_marked_is_template(workspace, create_user):
    install_workspace_project_templates(workspace, create_user.id)
    template = WorkspaceProjectTemplate.objects.filter(workspace=workspace).first()
    assert template is not None
    project = Project.objects.get(id=template.project_id)
    assert project.is_template is True


@pytest.mark.unit
@pytest.mark.django_db
def test_visible_templates_respects_workspace_type(workspace, create_user):
    workspace.workspace_type = "digital_launches"
    workspace.save(update_fields=["workspace_type"])
    install_workspace_project_templates(workspace, create_user.id)
    visible = get_visible_templates_queryset(workspace)
    seed_ids = set(visible.values_list("seed_id", flat=True))
    assert "launch_classic_internal" in seed_ids
    assert "civil_residential" not in seed_ids


@pytest.mark.unit
@pytest.mark.django_db
def test_duplicate_template_generates_unique_names(workspace, create_user):
    install_workspace_project_templates(workspace, create_user.id)
    template = WorkspaceProjectTemplate.objects.filter(workspace=workspace, is_system=True).first()
    assert template is not None

    first = duplicate_template(template, create_user.id)
    second = duplicate_template(template, create_user.id)

    assert first.name.endswith("(Copy)")
    assert first.name != second.name
    assert Project.objects.filter(workspace=workspace, name=first.name, deleted_at__isnull=True).exists()
    assert Project.objects.filter(workspace=workspace, name=second.name, deleted_at__isnull=True).exists()


@pytest.mark.unit
def test_template_state_change_is_blocked_for_template_projects():
    project = Project(id="project-id", is_template=True)
    issue = type("Issue", (), {"state_id": "state-a"})()

    assert is_template_state_change_blocked(project, {"state_id": "state-b"}, issue) is True
    assert is_template_state_change_blocked(project, {"state_id": "state-a"}, issue) is False
    assert is_template_state_change_blocked(project, {"name": "Updated"}, issue) is False

    operational = Project(id="project-id", is_template=False)
    assert is_template_state_change_blocked(operational, {"state_id": "state-b"}, issue) is False
