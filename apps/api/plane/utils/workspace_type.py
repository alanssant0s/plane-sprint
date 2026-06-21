# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import models


class WorkspaceType(models.TextChoices):
    DEFAULT = "default", "Default"
    CIVIL_ENGINEERING = "civil_engineering", "Civil Engineering"
    DIGITAL_LAUNCHES = "digital_launches", "Digital Launches"
    SOFTWARE_DEVELOPMENT = "software_development", "Software Development"
    MARKETING_AGENCY = "marketing_agency", "Marketing Agency"
    CUSTOMER_SUCCESS = "customer_success", "Customer Success"
    LEGAL = "legal", "Legal"
    EDUCATION = "education", "Education"
    EVENTS = "events", "Events"
    DESIGN_CREATIVE = "design_creative", "Design Creative"


WORKSPACE_TYPE_VALUES = frozenset(choice.value for choice in WorkspaceType)


def is_valid_workspace_type(value: str) -> bool:
    return value in WORKSPACE_TYPE_VALUES
