# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import re
import uuid
from urllib.parse import urlparse

from bs4 import BeautifulSoup

PAGE_LINK_PATH_PATTERN = re.compile(
    r"/projects/(?P<project_id>[0-9a-f-]{36})/pages/(?P<page_id>[0-9a-f-]{36})/?",
    re.IGNORECASE,
)

PAGE_LINK_TRANSACTION_NAMESPACE = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")


def parse_internal_page_href(href: str) -> dict | None:
    """Parse a page href and return project_id/page_id when it matches an internal page URL."""
    if not href:
        return None

    path = href
    if href.startswith("http://") or href.startswith("https://"):
        path = urlparse(href).path

    match = PAGE_LINK_PATH_PATTERN.search(path)
    if not match:
        return None

    return {
        "project_id": match.group("project_id"),
        "page_id": match.group("page_id"),
    }


def extract_internal_page_links(description_html: str | None, source_page_id) -> list[dict]:
    """
    Extract internal page links from HTML content.
    Returns a list of {transaction_id, target_page_id} entries.
    """
    if not description_html:
        return []

    try:
        soup = BeautifulSoup(description_html, "html.parser")
    except Exception:
        return []

    source_page_id_str = str(source_page_id)
    links = []

    for index, tag in enumerate(soup.find_all("a", href=True)):
        href = tag.get("href")
        parsed = parse_internal_page_href(href)
        if not parsed:
            continue

        target_page_id = parsed["page_id"]
        if target_page_id.lower() == source_page_id_str.lower():
            continue

        link_id = tag.get("data-link-id") or tag.get("id") or f"{index}:{href}"
        transaction_key = f"{source_page_id_str}:{target_page_id}:{link_id}"
        transaction_id = uuid.uuid5(PAGE_LINK_TRANSACTION_NAMESPACE, transaction_key)

        links.append(
            {
                "transaction_id": transaction_id,
                "target_page_id": uuid.UUID(target_page_id),
            }
        )

    return links
