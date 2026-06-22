# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("db", "0133_project_template"),
    ]

    operations = [
        migrations.AddField(
            model_name="workspaceprojecttemplate",
            name="is_hidden",
            field=models.BooleanField(default=False),
        ),
    ]
