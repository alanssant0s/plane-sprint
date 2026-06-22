# Generated manually for project templates feature

import uuid

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0132_workspace_workspace_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="is_template",
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AddField(
            model_name="project",
            name="template_source",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="derived_templates",
                to="db.project",
            ),
        ),
        migrations.CreateModel(
            name="WorkspaceProjectTemplate",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True, verbose_name="Deleted At")),
                (
                    "id",
                    models.UUIDField(
                        db_index=True,
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                        unique=True,
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("seed_id", models.CharField(blank=True, db_index=True, max_length=255, null=True)),
                ("workspace_type", models.CharField(blank=True, max_length=64, null=True)),
                ("is_system", models.BooleanField(default=False)),
                ("is_default_for_type", models.BooleanField(default=False)),
                ("sort_order", models.FloatField(default=65535)),
                ("logo_props", models.JSONField(default=dict)),
                ("archived_at", models.DateTimeField(null=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="workspaceprojecttemplate_created_by",
                        to="db.user",
                        verbose_name="Created By",
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="workspace_template",
                        to="db.project",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="workspaceprojecttemplate_updated_by",
                        to="db.user",
                        verbose_name="Last Modified By",
                    ),
                ),
                (
                    "workspace",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="project_templates",
                        to="db.workspace",
                    ),
                ),
            ],
            options={
                "verbose_name": "Workspace Project Template",
                "verbose_name_plural": "Workspace Project Templates",
                "db_table": "workspace_project_templates",
                "ordering": ("sort_order", "-created_at"),
            },
        ),
        migrations.AddConstraint(
            model_name="workspaceprojecttemplate",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted_at__isnull", True), ("seed_id__isnull", False)),
                fields=("workspace", "seed_id"),
                name="workspace_project_template_unique_seed",
            ),
        ),
    ]
