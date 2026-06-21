# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import uuid

import pytest

from plane.utils.page_links import extract_internal_page_links, parse_internal_page_href

SOURCE_PAGE_ID = "11111111-1111-1111-1111-111111111111"
TARGET_PAGE_ID = "22222222-2222-2222-2222-222222222222"
PROJECT_ID = "33333333-3333-3333-3333-333333333333"


@pytest.mark.unit
class TestParseInternalPageHref:
    def test_parses_relative_path(self):
        href = f"/workspace/projects/{PROJECT_ID}/pages/{TARGET_PAGE_ID}/"
        result = parse_internal_page_href(href)
        assert result == {"project_id": PROJECT_ID, "page_id": TARGET_PAGE_ID}

    def test_parses_absolute_url(self):
        href = f"https://plane.example.com/ws/projects/{PROJECT_ID}/pages/{TARGET_PAGE_ID}"
        result = parse_internal_page_href(href)
        assert result == {"project_id": PROJECT_ID, "page_id": TARGET_PAGE_ID}

    def test_returns_none_for_external_url(self):
        assert parse_internal_page_href("https://example.com/docs") is None

    def test_returns_none_for_empty_href(self):
        assert parse_internal_page_href("") is None


@pytest.mark.unit
class TestExtractInternalPageLinks:
    def test_extracts_internal_links(self):
        html = f'<p>See <a href="/ws/projects/{PROJECT_ID}/pages/{TARGET_PAGE_ID}/">Target page</a></p>'
        links = extract_internal_page_links(html, SOURCE_PAGE_ID)

        assert len(links) == 1
        assert links[0]["target_page_id"] == uuid.UUID(TARGET_PAGE_ID)
        assert isinstance(links[0]["transaction_id"], uuid.UUID)

    def test_ignores_self_links(self):
        html = f'<a href="/ws/projects/{PROJECT_ID}/pages/{SOURCE_PAGE_ID}/">Self</a>'
        links = extract_internal_page_links(html, SOURCE_PAGE_ID)
        assert links == []

    def test_returns_empty_for_no_html(self):
        assert extract_internal_page_links(None, SOURCE_PAGE_ID) == []
        assert extract_internal_page_links("", SOURCE_PAGE_ID) == []

    def test_stable_transaction_id_with_data_link_id(self):
        html = (
            f'<a data-link-id="link-1" href="/ws/projects/{PROJECT_ID}/pages/{TARGET_PAGE_ID}/">'
            f"Target</a>"
        )
        first = extract_internal_page_links(html, SOURCE_PAGE_ID)
        second = extract_internal_page_links(html, SOURCE_PAGE_ID)
        assert first[0]["transaction_id"] == second[0]["transaction_id"]
