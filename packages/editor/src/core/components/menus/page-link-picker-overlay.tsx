/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { Editor } from "@tiptap/core";
import { useCallback, useRef } from "react";
import { useOutsideClickDetector } from "@plane/hooks";
import { setLinkEditor } from "@/helpers/editor-commands";
import type { TPageLinkSearchResult } from "@/types";
import { PageLinkSearchPanel } from "./page-link-search-panel";

export type PageLinkPickerOverlayProps = {
  editor: Editor;
  searchPages: (query: string) => Promise<TPageLinkSearchResult[]>;
  buildPageLink: (pageId: string, projectId?: string) => string;
  onClose: () => void;
  registerSearchInput?: (input: HTMLInputElement | null) => void;
};

export function PageLinkPickerOverlay(props: PageLinkPickerOverlayProps) {
  const { editor, searchPages, buildPageLink, onClose, registerSearchInput } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClickDetector(containerRef, onClose);

  const handlePageSelect = useCallback(
    (page: TPageLinkSearchResult) => {
      editor.setEditable(true);
      const href = buildPageLink(page.id, page.project_id);
      setLinkEditor(editor, href, page.name, { isInternal: true });
      onClose();
    },
    [buildPageLink, editor, onClose]
  );

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-auto fixed inset-0"
        style={{
          zIndex: 99,
        }}
        onMouseDown={(event) => {
          event.preventDefault();
          onClose();
        }}
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-label="Search pages"
        data-prevent-outside-click
        className="pointer-events-auto relative w-72 rounded-md border-[0.5px] border-strong bg-surface-1 shadow-raised-200"
        style={{
          zIndex: 100,
        }}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <PageLinkSearchPanel
          searchPages={searchPages}
          onPageSelect={handlePageSelect}
          registerSearchInput={registerSearchInput}
        />
      </div>
    </>
  );
}
