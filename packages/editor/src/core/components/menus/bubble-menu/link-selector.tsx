/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { Editor } from "@tiptap/core";

import { useCallback, useEffect, useRef, useState } from "react";
import { LinkIcon, TrashIcon, CheckIcon } from "@plane/propel/icons";
// plane imports
import { cn } from "@plane/utils";
// constants
import { CORE_EXTENSIONS } from "@/constants/extension";
// helpers
import { isValidHttpUrl } from "@/helpers/common";
import { setLinkEditor, unsetLinkEditor } from "@/helpers/editor-commands";
import type { IEditorPropsExtended, TPageLinkSearchResult } from "@/types";
import { FloatingMenuRoot } from "../floating-menu/root";
import { useFloatingMenu } from "../floating-menu/use-floating-menu";

type Props = {
  editor: Editor;
  extendedEditorProps?: Partial<IEditorPropsExtended>;
};

type LinkTab = "url" | "page";

export function BubbleMenuLinkSelector(props: Props) {
  const { editor, extendedEditorProps = {} } = props;
  const { searchPages, buildPageLink } = extendedEditorProps;
  const hasPageLinkSupport = Boolean(searchPages && buildPageLink);
  // states
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<LinkTab>("url");
  const [pageQuery, setPageQuery] = useState("");
  const [pageResults, setPageResults] = useState<TPageLinkSearchResult[]>([]);
  const [isSearchingPages, setIsSearchingPages] = useState(false);
  // floating ui
  const { options, getReferenceProps, getFloatingProps } = useFloatingMenu({});
  const { context } = options;
  // refs
  const inputRef = useRef<HTMLInputElement>(null);
  const pageSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!context.open) return;

    if (activeTab === "url") {
      inputRef.current?.focus();
      return;
    }

    pageSearchRef.current?.focus();
  }, [activeTab, context.open]);

  useEffect(() => {
    if (!hasPageLinkSupport || activeTab !== "page" || !searchPages) {
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(() => {
      setIsSearchingPages(true);
      searchPages(pageQuery)
        .then((results: TPageLinkSearchResult[]) => {
          if (!isCancelled) {
            setPageResults(results);
          }
          return results;
        })
        .finally(() => {
          if (!isCancelled) {
            setIsSearchingPages(false);
          }
        });
    }, 250);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeTab, hasPageLinkSupport, pageQuery, searchPages]);

  const handleLinkSubmit = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    const url = input.value;
    if (!url) return;
    const { isValid, url: validatedUrl } = isValidHttpUrl(url);
    if (isValid) {
      setLinkEditor(editor, validatedUrl);
      context.onOpenChange(false);
      setError(false);
    } else {
      setError(true);
    }
  }, [editor, context]);

  const handlePageSelect = useCallback(
    (page: TPageLinkSearchResult) => {
      if (!buildPageLink) return;

      const href = buildPageLink(page.id, page.project_id);
      setLinkEditor(editor, href, page.name, { isInternal: true });
      context.onOpenChange(false);
      setError(false);
      setPageQuery("");
      setPageResults([]);
    },
    [buildPageLink, context, editor]
  );

  return (
    <FloatingMenuRoot
      classNames={{
        buttonContainer: "h-full",
        button: cn(
          "flex h-full items-center gap-1 rounded-sm px-3 text-13 font-medium whitespace-nowrap text-tertiary transition-colors hover:bg-layer-1 active:bg-layer-1",
          {
            "bg-layer-1": context.open,
            "text-primary": editor.isActive(CORE_EXTENSIONS.CUSTOM_LINK),
          }
        ),
      }}
      getFloatingProps={getFloatingProps}
      getReferenceProps={getReferenceProps}
      menuButton={
        <>
          Link
          <LinkIcon className="size-3 shrink-0" />
        </>
      }
      options={options}
    >
      <div className="mt-1 w-72 rounded-md bg-surface-1 shadow-raised-200">
        {hasPageLinkSupport && (
          <div className="flex border-b border-subtle px-2 pt-2">
            <button
              type="button"
              className={cn("rounded-sm px-2 py-1 text-11 transition-colors", {
                "bg-layer-1 text-primary": activeTab === "url",
                "text-tertiary hover:text-primary": activeTab !== "url",
              })}
              onClick={() => setActiveTab("url")}
            >
              URL
            </button>
            <button
              type="button"
              className={cn("rounded-sm px-2 py-1 text-11 transition-colors", {
                "bg-layer-1 text-primary": activeTab === "page",
                "text-tertiary hover:text-primary": activeTab !== "page",
              })}
              onClick={() => setActiveTab("page")}
            >
              Page
            </button>
          </div>
        )}

        {activeTab === "url" || !hasPageLinkSupport ? (
          <div className="p-2">
            <div
              className={cn("flex rounded-sm border-[0.5px] border-strong transition-colors", {
                "border-danger-strong": error,
              })}
            >
              <input
                ref={inputRef}
                type="url"
                placeholder="Enter or paste a link"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 rounded-sm border-r-[0.5px] border-strong bg-surface-1 px-1.5 py-2 text-11 outline-none placeholder:text-placeholder"
                defaultValue={editor.getAttributes("link").href || ""}
                onKeyDown={(e) => {
                  setError(false);
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLinkSubmit();
                  }
                }}
                onFocus={() => setError(false)}
              />
              {editor.getAttributes("link").href ? (
                <button
                  type="button"
                  className="grid place-items-center rounded-xs p-1 text-danger-primary transition-all hover:bg-danger-subtle-hover"
                  onClick={(e) => {
                    unsetLinkEditor(editor);
                    e.stopPropagation();
                    context.onOpenChange(false);
                  }}
                >
                  <TrashIcon className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  className="grid aspect-square h-full place-items-center rounded-xs p-1 text-tertiary transition-all hover:bg-layer-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLinkSubmit();
                  }}
                >
                  <CheckIcon className="size-4" />
                </button>
              )}
            </div>
            {error && (
              <p className="animate-in fade-in slide-in-from-top-0 pointer-events-none my-1 px-2 text-11 text-danger-primary">
                Please enter a valid URL
              </p>
            )}
          </div>
        ) : (
          <div className="p-2">
            <input
              ref={pageSearchRef}
              type="text"
              value={pageQuery}
              placeholder="Search pages"
              onClick={(e) => e.stopPropagation()}
              className="mb-2 w-full rounded-sm border-[0.5px] border-strong bg-surface-1 px-2 py-2 text-11 outline-none placeholder:text-placeholder"
              onChange={(e) => setPageQuery(e.target.value)}
            />
            <div className="max-h-40 overflow-y-auto">
              {isSearchingPages && <p className="px-2 py-1 text-11 text-tertiary">Searching...</p>}
              {!isSearchingPages && pageResults.length === 0 && (
                <p className="px-2 py-1 text-11 text-tertiary">No pages found</p>
              )}
              {pageResults.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  className="flex w-full rounded-sm px-2 py-1.5 text-left text-11 text-primary transition-colors hover:bg-layer-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePageSelect(page);
                  }}
                >
                  {page.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </FloatingMenuRoot>
  );
}
