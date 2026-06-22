# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Python imports
import json
import os
import time
import uuid
from typing import Any, Dict, List, Optional, Tuple

# Django imports
from django.conf import settings
from django.db import models, transaction
from django.db.models import Q
from django.utils import timezone

# Module imports
from plane.db.models import (
    Issue,
    IssueLabel,
    IssueSequence,
    Label,
    Module,
    ModuleIssue,
    Project,
    ProjectMember,
    ProjectUserProperty,
    State,
    Workspace,
    WorkspaceMember,
    WorkspaceProjectTemplate,
)
from plane.utils.workspace_type import WorkspaceType


STATE_GROUP_MAP = {
    "backlog": "backlog",
    "unstarted": "unstarted",
    "started": "started",
    "completed": "completed",
    "cancelled": "cancelled",
}

DEFAULT_STATE_COLORS = {
    "backlog": "#A3A3A3",
    "unstarted": "#3F76FF",
    "started": "#F59E0B",
    "completed": "#16A34A",
    "cancelled": "#EF4444",
}


def get_seed_dir() -> str:
    return os.path.join(settings.SEED_DIR, "project_templates")


def read_seed_definition(seed_id: str) -> Optional[Dict[str, Any]]:
    file_path = os.path.join(get_seed_dir(), f"{seed_id}.json")
    if not os.path.exists(file_path):
        return None
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def _template_identifier(workspace: Workspace, seed_id: Optional[str] = None) -> str:
    base = (seed_id or "CUSTOM")[:8].upper().replace("_", "")
    candidate = f"TPL{base}"[:12]
    counter = 0
    while Project.objects.filter(workspace=workspace, identifier=candidate, deleted_at__isnull=True).exists():
        counter += 1
        candidate = f"TPL{base[:8]}{counter}"[:12]
    return candidate


def _ensure_unique_project_name(workspace: Workspace, desired_name: str) -> str:
    if not Project.objects.filter(workspace=workspace, name=desired_name, deleted_at__isnull=True).exists():
        return desired_name

    counter = 2
    while True:
        candidate = f"{desired_name} ({counter})"
        if not Project.objects.filter(workspace=workspace, name=candidate, deleted_at__isnull=True).exists():
            return candidate
        counter += 1


def _ensure_project_members(project: Project, user_id: uuid.UUID) -> None:
    workspace_members = WorkspaceMember.objects.filter(workspace=project.workspace, is_active=True)
    existing = set(
        ProjectMember.objects.filter(project=project, is_active=True).values_list("member_id", flat=True)
    )
    to_create = []
    for member in workspace_members:
        if member.member_id in existing:
            continue
        to_create.append(
            ProjectMember(
                project=project,
                member_id=member.member_id,
                role=member.role,
                workspace_id=project.workspace_id,
                created_by_id=user_id,
            )
        )
    if to_create:
        ProjectMember.objects.bulk_create(to_create)


def _create_template_project(
    workspace: Workspace,
    name: str,
    user_id: uuid.UUID,
    *,
    seed_id: Optional[str] = None,
    description: str = "",
) -> Project:
    project = Project(
        workspace=workspace,
        name=name,
        description=description,
        identifier=_template_identifier(workspace, seed_id),
        is_template=True,
        module_view=True,
        issue_views_view=True,
        page_view=False,
        cycle_view=False,
        intake_view=False,
        created_by_id=user_id,
    )
    project.save(created_by_id=user_id, disable_auto_set_user=True)
    _ensure_project_members(project, user_id)
    return project


def _apply_seed_to_project(project: Project, seed: Dict[str, Any], user_id: uuid.UUID) -> None:
    workspace = project.workspace
    state_map: Dict[str, uuid.UUID] = {}
    label_map: Dict[str, uuid.UUID] = {}
    module_map: Dict[str, uuid.UUID] = {}

    for index, state_seed in enumerate(seed.get("states", [])):
        group = STATE_GROUP_MAP.get(state_seed.get("group", "unstarted"), state_seed.get("group", "unstarted"))
        state = State.objects.create(
            name=state_seed["name"],
            group=group,
            color=state_seed.get("color") or DEFAULT_STATE_COLORS.get(group, "#3F76FF"),
            sequence=index,
            project=project,
            workspace=workspace,
            created_by_id=user_id,
        )
        state_map[state_seed["name"]] = state.id
        if state_seed["name"] == seed.get("defaultIssueState"):
            project.default_state_id = state.id

    project.save(update_fields=["default_state"])

    for label_seed in seed.get("labels", []):
        label = Label.objects.create(
            name=label_seed["name"],
            color=label_seed.get("color", "#858585"),
            project=project,
            workspace=workspace,
            created_by_id=user_id,
        )
        label_map[label_seed["name"]] = label.id

    for index, module_seed in enumerate(seed.get("modules", [])):
        module = Module.objects.create(
            name=module_seed["name"],
            sort_order=module_seed.get("sort_order", (index + 1) * 1000),
            status="backlog",
            project=project,
            workspace=workspace,
            created_by_id=user_id,
        )
        module_map[module_seed["name"]] = module.id

    default_state_id = state_map.get(seed.get("defaultIssueState")) or next(iter(state_map.values()), None)
    issue_name_map: Dict[str, Issue] = {}

    for issue_seed in seed.get("issues", []):
        state_id = state_map.get(issue_seed.get("state")) if issue_seed.get("state") else default_state_id
        issue = Issue(
            name=issue_seed["name"],
            description_html=issue_seed.get("description", ""),
            priority=issue_seed.get("priority", "none"),
            state_id=state_id,
            project=project,
            workspace=workspace,
            created_by_id=user_id,
        )
        issue.save(created_by_id=user_id, disable_auto_set_user=True)
        issue_name_map[issue_seed["name"]] = issue

        IssueSequence.objects.create(
            issue=issue,
            project=project,
            workspace=workspace,
            created_by_id=user_id,
        )

        module_name = issue_seed.get("module")
        if module_name and module_name in module_map:
            ModuleIssue.objects.create(
                issue=issue,
                module_id=module_map[module_name],
                project=project,
                workspace=workspace,
                created_by_id=user_id,
            )

        for label_name in issue_seed.get("labels", []):
            if label_name in label_map:
                IssueLabel.objects.create(
                    issue=issue,
                    label_id=label_map[label_name],
                    project=project,
                    workspace=workspace,
                    created_by_id=user_id,
                )

    for issue_seed in seed.get("issues", []):
        parent_name = issue_seed.get("parent")
        if not parent_name:
            continue
        child = issue_name_map.get(issue_seed["name"])
        parent = issue_name_map.get(parent_name)
        if child and parent:
            child.parent_id = parent.id
            child.save(update_fields=["parent_id"])


def copy_project_structure(
    source_project: Project,
    target_project: Project,
    user_id: uuid.UUID,
    *,
    reset_issue_states: bool = True,
) -> None:
    workspace = source_project.workspace
    state_map: Dict[uuid.UUID, uuid.UUID] = {}
    label_map: Dict[uuid.UUID, uuid.UUID] = {}
    module_map: Dict[uuid.UUID, uuid.UUID] = {}

    default_target_state_id = None

    for state in State.objects.filter(project=source_project, deleted_at__isnull=True).order_by("sequence"):
        new_state = State.objects.create(
            name=state.name,
            group=state.group,
            color=state.color,
            sequence=state.sequence,
            project=target_project,
            workspace=workspace,
            created_by_id=user_id,
        )
        state_map[state.id] = new_state.id
        if source_project.default_state_id == state.id:
            default_target_state_id = new_state.id

    if default_target_state_id:
        target_project.default_state_id = default_target_state_id
        target_project.save(update_fields=["default_state"])

    for label in Label.objects.filter(project=source_project, deleted_at__isnull=True):
        new_label = Label.objects.create(
            name=label.name,
            color=label.color,
            description=label.description,
            project=target_project,
            workspace=workspace,
            created_by_id=user_id,
        )
        label_map[label.id] = new_label.id

    for module in Module.objects.filter(project=source_project, deleted_at__isnull=True).order_by("sort_order"):
        new_module = Module.objects.create(
            name=module.name,
            description=module.description,
            sort_order=module.sort_order,
            status=module.status,
            project=target_project,
            workspace=workspace,
            created_by_id=user_id,
        )
        module_map[module.id] = new_module.id

    issue_map: Dict[uuid.UUID, uuid.UUID] = {}
    issues = Issue.objects.filter(project=source_project, deleted_at__isnull=True).order_by("created_at")

    for issue in issues:
        state_id = state_map.get(issue.state_id)
        if reset_issue_states and default_target_state_id:
            state_id = default_target_state_id

        new_issue = Issue(
            name=issue.name,
            description_html=issue.description_html or "",
            priority=issue.priority,
            state_id=state_id,
            project=target_project,
            workspace=workspace,
            created_by_id=user_id,
        )
        new_issue.save(created_by_id=user_id, disable_auto_set_user=True)
        issue_map[issue.id] = new_issue.id

        IssueSequence.objects.create(
            issue=new_issue,
            project=target_project,
            workspace=workspace,
            created_by_id=user_id,
        )

        for module_issue in ModuleIssue.objects.filter(issue=issue, deleted_at__isnull=True):
            if module_issue.module_id in module_map:
                ModuleIssue.objects.create(
                    issue=new_issue,
                    module_id=module_map[module_issue.module_id],
                    project=target_project,
                    workspace=workspace,
                    created_by_id=user_id,
                )

        for issue_label in IssueLabel.objects.filter(issue=issue, deleted_at__isnull=True):
            if issue_label.label_id in label_map:
                IssueLabel.objects.create(
                    issue=new_issue,
                    label_id=label_map[issue_label.label_id],
                    project=target_project,
                    workspace=workspace,
                    created_by_id=user_id,
                )

    for issue in issues:
        if issue.parent_id and issue.id in issue_map and issue.parent_id in issue_map:
            Issue.objects.filter(id=issue_map[issue.id]).update(parent_id=issue_map[issue.parent_id])


def create_empty_template(
    workspace: Workspace,
    user_id: uuid.UUID,
    *,
    name: str,
    description: str = "",
) -> WorkspaceProjectTemplate:
    project = _create_template_project(workspace, name, user_id)
    default_states = [
        {"name": "Backlog", "group": "backlog"},
        {"name": "Todo", "group": "unstarted"},
        {"name": "In Progress", "group": "started"},
        {"name": "Done", "group": "completed"},
    ]
    _apply_seed_to_project(
        project,
        {"defaultIssueState": "Backlog", "states": default_states, "labels": [], "modules": [], "issues": []},
        user_id,
    )
    return WorkspaceProjectTemplate.objects.create(
        workspace=workspace,
        project=project,
        name=name,
        description=description,
        is_system=False,
        created_by_id=user_id,
    )


def install_seed_template(
    workspace: Workspace,
    seed_id: str,
    user_id: uuid.UUID,
    *,
    workspace_type: str,
    is_default_for_type: bool = False,
    display_name: str,
    description: str = "",
) -> Optional[WorkspaceProjectTemplate]:
    if WorkspaceProjectTemplate.objects.filter(
        workspace=workspace, seed_id=seed_id, deleted_at__isnull=True
    ).exists():
        return WorkspaceProjectTemplate.objects.get(workspace=workspace, seed_id=seed_id, deleted_at__isnull=True)

    seed = read_seed_definition(seed_id)
    if not seed:
        return None

    project = _create_template_project(workspace, display_name, user_id, seed_id=seed_id, description=description)
    _apply_seed_to_project(project, seed, user_id)

    return WorkspaceProjectTemplate.objects.create(
        workspace=workspace,
        project=project,
        name=display_name,
        description=description,
        seed_id=seed_id,
        workspace_type=workspace_type,
        is_system=True,
        is_default_for_type=is_default_for_type,
        created_by_id=user_id,
    )


SEED_DISPLAY_NAMES = {
    "default_generic_project": "Projeto Genérico",
    "civil_residential": "Obra Residencial",
    "launch_seed": "Lançamento Semente",
    "launch_classic_internal": "Lançamento Clássico (Interno)",
    "launch_perpetual_funnel": "Lançamento Perpétuo",
    "launch_meteoric": "Lançamento Meteórico",
    "launch_high_ticket": "Lançamento High Ticket",
    "dev_feature_delivery": "Entrega de Feature",
    "agency_marketing_campaign": "Campanha de Marketing",
    "cs_account_success_plan": "Plano de Sucesso da Conta",
    "legal_advisory_case": "Caso Jurídico — Consultivo",
    "edu_course_term": "Curso — Ciclo Letivo",
    "events_corporate": "Evento Corporativo",
    "design_brand_job": "Job Criativo — Identidade Visual",
}

WORKSPACE_TYPE_SEEDS = {
    WorkspaceType.DEFAULT: [("default_generic_project", False)],
    WorkspaceType.CIVIL_ENGINEERING: [("civil_residential", False)],
    WorkspaceType.DIGITAL_LAUNCHES: [
        ("launch_seed", False),
        ("launch_classic_internal", True),
        ("launch_perpetual_funnel", False),
        ("launch_meteoric", False),
        ("launch_high_ticket", False),
    ],
    WorkspaceType.SOFTWARE_DEVELOPMENT: [("dev_feature_delivery", False)],
    WorkspaceType.MARKETING_AGENCY: [("agency_marketing_campaign", False)],
    WorkspaceType.CUSTOMER_SUCCESS: [("cs_account_success_plan", False)],
    WorkspaceType.LEGAL: [("legal_advisory_case", False)],
    WorkspaceType.EDUCATION: [("edu_course_term", False)],
    WorkspaceType.EVENTS: [("events_corporate", False)],
    WorkspaceType.DESIGN_CREATIVE: [("design_brand_job", False)],
}


def install_workspace_project_templates(workspace: Workspace, user_id: uuid.UUID) -> List[WorkspaceProjectTemplate]:
    workspace_type = workspace.workspace_type or WorkspaceType.DEFAULT
    seeds = WORKSPACE_TYPE_SEEDS.get(workspace_type, WORKSPACE_TYPE_SEEDS[WorkspaceType.DEFAULT])
    installed = []
    for seed_id, is_default in seeds:
        template = install_seed_template(
            workspace,
            seed_id,
            user_id,
            workspace_type=workspace_type,
            is_default_for_type=is_default,
            display_name=SEED_DISPLAY_NAMES.get(seed_id, seed_id),
        )
        if template:
            installed.append(template)
    return installed


def get_visible_templates_queryset(workspace: Workspace):
    workspace_type = workspace.workspace_type or WorkspaceType.DEFAULT
    return WorkspaceProjectTemplate.objects.filter(
        workspace=workspace,
        archived_at__isnull=True,
        deleted_at__isnull=True,
    ).filter(Q(is_system=False) | Q(workspace_type=workspace_type))


def instantiate_template(
    template: WorkspaceProjectTemplate,
    user_id: uuid.UUID,
    *,
    name: str,
    identifier: str,
    description: str = "",
) -> Project:
    workspace = template.workspace
    identifier = identifier.strip().upper()

    operational = Project(
        workspace=workspace,
        name=name,
        description=description,
        identifier=identifier,
        is_template=False,
        module_view=True,
        issue_views_view=True,
        cycle_view=template.project.cycle_view,
        page_view=template.project.page_view,
        intake_view=template.project.intake_view,
        created_by_id=user_id,
    )
    operational.save(created_by_id=user_id, disable_auto_set_user=True)
    _ensure_project_members(operational, user_id)

    copy_project_structure(template.project, operational, user_id, reset_issue_states=True)

    for member in WorkspaceMember.objects.filter(workspace=workspace, is_active=True):
        ProjectUserProperty.objects.get_or_create(
            project=operational,
            user_id=member.member_id,
            workspace=workspace,
            defaults={"created_by_id": user_id},
        )

    return operational


@transaction.atomic
def duplicate_template(
    template: WorkspaceProjectTemplate,
    user_id: uuid.UUID,
    *,
    name: Optional[str] = None,
) -> WorkspaceProjectTemplate:
    workspace = template.workspace
    new_name = _ensure_unique_project_name(workspace, name or f"{template.name} (Copy)")
    project = _create_template_project(workspace, new_name, user_id)
    copy_project_structure(template.project, project, user_id, reset_issue_states=False)

    return WorkspaceProjectTemplate.objects.create(
        workspace=workspace,
        project=project,
        name=new_name,
        description=template.description,
        is_system=False,
        created_by_id=user_id,
    )


def promote_project_to_template(
    project: Project,
    user_id: uuid.UUID,
    *,
    name: Optional[str] = None,
) -> WorkspaceProjectTemplate:
    if project.is_template:
        raise ValueError("Project is already a template")

    workspace = project.workspace
    template_name = name or f"{project.name} (Modelo)"
    template_project = _create_template_project(workspace, template_name, user_id)
    template_project.template_source_id = project.id
    template_project.save(update_fields=["template_source"])

    copy_project_structure(project, template_project, user_id, reset_issue_states=True)

    return WorkspaceProjectTemplate.objects.create(
        workspace=workspace,
        project=template_project,
        name=template_name,
        is_system=False,
        created_by_id=user_id,
    )


def get_template_preview(template: WorkspaceProjectTemplate) -> Dict[str, Any]:
    project = template.project
    modules = Module.objects.filter(project=project, deleted_at__isnull=True).order_by("sort_order")
    module_data = []
    for module in modules:
        count = ModuleIssue.objects.filter(module=module, deleted_at__isnull=True).count()
        module_data.append({"name": module.name, "issue_count": count})

    states = list(
        State.objects.filter(project=project, deleted_at__isnull=True).order_by("sequence").values_list("name", flat=True)
    )
    issue_count = Issue.objects.filter(project=project, deleted_at__isnull=True).count()

    return {
        "id": str(template.id),
        "name": template.name,
        "description": template.description,
        "modules": module_data,
        "states": states,
        "issue_count": issue_count,
        "is_system": template.is_system,
    }


def is_system_template_project(project: Project) -> bool:
    if not project.is_template:
        return False
    return WorkspaceProjectTemplate.objects.filter(
        project=project,
        is_system=True,
        deleted_at__isnull=True,
        archived_at__isnull=True,
    ).exists()


def is_template_state_change_blocked(project: Project, data: dict, issue) -> bool:
    if not project.is_template or "state_id" not in data:
        return False

    requested_state_id = data.get("state_id")
    if requested_state_id is None:
        return False

    return str(requested_state_id) != str(issue.state_id)
