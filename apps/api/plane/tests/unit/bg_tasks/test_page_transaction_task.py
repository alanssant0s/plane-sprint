# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import uuid
from unittest.mock import MagicMock, patch

import pytest

from plane.bgtasks.page_transaction_task import sync_internal_page_links

SOURCE_PAGE_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
TARGET_PAGE_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")
PROJECT_ID = "33333333-3333-3333-3333-333333333333"
WORKSPACE_ID = uuid.UUID("44444444-4444-4444-4444-444444444444")


def _link_html(target_page_id: str, link_id: str = "link-1") -> str:
    return (
        f'<p>See <a data-link-id="{link_id}" '
        f'href="/ws/projects/{PROJECT_ID}/pages/{target_page_id}/">Target</a></p>'
    )


@pytest.mark.unit
class TestSyncInternalPageLinks:
    @patch("plane.bgtasks.page_transaction_task.PageLog.objects")
    @patch("plane.bgtasks.page_transaction_task.Page.objects")
    def test_creates_forward_and_back_links(self, mock_page_objects, mock_page_log_objects):
        mock_page = MagicMock()
        mock_page.workspace_id = WORKSPACE_ID
        mock_page_objects.get.return_value = mock_page

        mock_page_log_objects.filter.return_value.values_list.return_value = []
        bulk_create = mock_page_log_objects.bulk_create

        sync_internal_page_links(_link_html(str(TARGET_PAGE_ID)), SOURCE_PAGE_ID)

        assert bulk_create.called
        created_logs = bulk_create.call_args[0][0]
        assert len(created_logs) == 2

        forward_log = next(log for log in created_logs if log.page_id == SOURCE_PAGE_ID)
        back_log = next(log for log in created_logs if log.page_id == TARGET_PAGE_ID)

        assert forward_log.entity_name == "forward_link"
        assert forward_log.entity_identifier == TARGET_PAGE_ID
        assert back_log.entity_name == "back_link"
        assert back_log.entity_identifier == SOURCE_PAGE_ID
        assert forward_log.transaction == back_log.transaction

    @patch("plane.bgtasks.page_transaction_task.PageLog.objects")
    @patch("plane.bgtasks.page_transaction_task.Page.objects")
    def test_removes_stale_links(self, mock_page_objects, mock_page_log_objects):
        mock_page = MagicMock()
        mock_page.workspace_id = WORKSPACE_ID
        mock_page_objects.get.return_value = mock_page

        stale_transaction = uuid.uuid4()
        mock_filter = mock_page_log_objects.filter
        mock_filter.return_value.values_list.return_value = [(stale_transaction, TARGET_PAGE_ID)]

        sync_internal_page_links("<p></p>", SOURCE_PAGE_ID)

        mock_page_log_objects.filter.assert_any_call(transaction__in={stale_transaction})
        delete_call = mock_page_log_objects.filter.return_value.delete
        assert delete_call.called
