# Generated manually for workspace_type feature

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("db", "0131_workspaceuserproperties_navigation_squad_limit"),
    ]

    operations = [
        migrations.AddField(
            model_name="workspace",
            name="workspace_type",
            field=models.CharField(
                choices=[
                    ("default", "Default"),
                    ("civil_engineering", "Civil Engineering"),
                    ("digital_launches", "Digital Launches"),
                    ("software_development", "Software Development"),
                    ("marketing_agency", "Marketing Agency"),
                    ("customer_success", "Customer Success"),
                    ("legal", "Legal"),
                    ("education", "Education"),
                    ("events", "Events"),
                    ("design_creative", "Design Creative"),
                ],
                default="default",
                max_length=50,
            ),
        ),
    ]
