# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Python imports
import logging

# Django imports
from django.utils import timezone

# Third-party imports
from bs4 import BeautifulSoup

# App imports
from celery import shared_task
from plane.db.models import Page, PageLog
from plane.utils.exception_logger import log_exception
from plane.utils.page_links import extract_internal_page_links

logger = logging.getLogger("plane.worker")

COMPONENT_MAP = {
    "mention-component": {
        "attributes": ["id", "entity_identifier", "entity_name", "entity_type"],
        "extract": lambda m: {
            "entity_name": m.get("entity_name"),
            "entity_type": None,
            "entity_identifier": m.get("entity_identifier"),
        },
    },
    "image-component": {
        "attributes": ["id", "src"],
        "extract": lambda m: {
            "entity_name": "image",
            "entity_type": None,
            "entity_identifier": m.get("src"),
        },
    },
}

component_map = {
    **COMPONENT_MAP,
}


def extract_all_components(description_html):
    """
    Extracts all component types from the HTML value in a single pass.
    Returns a dict mapping component_type -> list of extracted entities.
    """
    try:
        if not description_html:
            return {component: [] for component in component_map.keys()}

        soup = BeautifulSoup(description_html, "html.parser")
        results = {}

        for component, config in component_map.items():
            attributes = config.get("attributes", ["id"])
            component_tags = soup.find_all(component)

            entities = []
            for tag in component_tags:
                entity = {attr: tag.get(attr) for attr in attributes}
                entities.append(entity)

            results[component] = entities

        return results

    except Exception:
        return {component: [] for component in component_map.keys()}


def get_entity_details(component: str, mention: dict):
    """
    Normalizes mention attributes into entity_name, entity_type, entity_identifier.
    """
    config = component_map.get(component)
    if not config:
        return {"entity_name": None, "entity_type": None, "entity_identifier": None}
    return config["extract"](mention)


def sync_internal_page_links(new_description_html, page_id):
    """
    Sync forward/back page link logs based on internal <a href> tags in page content.
    """
    page = Page.objects.get(pk=page_id)
    new_links = extract_internal_page_links(new_description_html, page_id)
    new_transactions = {link["transaction_id"]: link["target_page_id"] for link in new_links}

    existing_forward_links = PageLog.objects.filter(page_id=page_id, entity_name="forward_link").values_list(
        "transaction", "entity_identifier"
    )
    existing_transactions = {transaction: target_page_id for transaction, target_page_id in existing_forward_links}

    removed_transactions = set(existing_transactions.keys()) - set(new_transactions.keys())
    added_transactions = set(new_transactions.keys()) - set(existing_transactions.keys())

    if removed_transactions:
        PageLog.objects.filter(transaction__in=removed_transactions).delete()

    if not added_transactions:
        return

    current_time = timezone.now()
    new_logs = []

    for transaction_id in added_transactions:
        target_page_id = new_transactions[transaction_id]

        new_logs.append(
            PageLog(
                transaction=transaction_id,
                page_id=page_id,
                entity_identifier=target_page_id,
                entity_name="forward_link",
                entity_type=None,
                workspace_id=page.workspace_id,
                created_at=current_time,
                updated_at=current_time,
            )
        )
        new_logs.append(
            PageLog(
                transaction=transaction_id,
                page_id=target_page_id,
                entity_identifier=page_id,
                entity_name="back_link",
                entity_type=None,
                workspace_id=page.workspace_id,
                created_at=current_time,
                updated_at=current_time,
            )
        )

    PageLog.objects.bulk_create(new_logs, batch_size=50, ignore_conflicts=True)


@shared_task
def page_transaction(new_description_html, old_description_html, page_id):
    """
    Tracks changes in page content (mentions, embeds, etc.)
    and logs them in PageLog for audit and reference.
    """
    try:
        page = Page.objects.get(pk=page_id)

        has_existing_logs = PageLog.objects.filter(page_id=page_id).exists()

        # Extract all components in a single pass (optimized)
        old_components = extract_all_components(old_description_html)
        new_components = extract_all_components(new_description_html)

        new_transactions = []
        deleted_transaction_ids = set()

        for component in component_map.keys():
            old_entities = old_components[component]
            new_entities = new_components[component]

            old_ids = {m.get("id") for m in old_entities if m.get("id")}
            new_ids = {m.get("id") for m in new_entities if m.get("id")}
            deleted_transaction_ids.update(old_ids - new_ids)

            for mention in new_entities:
                mention_id = mention.get("id")
                if not mention_id or (mention_id in old_ids and has_existing_logs):
                    continue

                details = get_entity_details(component, mention)
                current_time = timezone.now()

                new_transactions.append(
                    PageLog(
                        transaction=mention_id,
                        page_id=page_id,
                        entity_identifier=details["entity_identifier"],
                        entity_name=details["entity_name"],
                        entity_type=details["entity_type"],
                        workspace_id=page.workspace_id,
                        created_at=current_time,
                        updated_at=current_time,
                    )
                )

        # Bulk insert and cleanup
        if new_transactions:
            PageLog.objects.bulk_create(new_transactions, batch_size=50, ignore_conflicts=True)

        if deleted_transaction_ids:
            PageLog.objects.filter(transaction__in=deleted_transaction_ids).delete()

        sync_internal_page_links(new_description_html, page_id)

    except Page.DoesNotExist:
        return
    except Exception as e:
        log_exception(e)
        return
