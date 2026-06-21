/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { Editor, Range } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
// components
import type { PageLinkPickerOverlayProps } from "@/components/menus/page-link-picker-overlay";
import { PageLinkPickerOverlay } from "@/components/menus/page-link-picker-overlay";
// helpers
import { updateFloatingUIFloaterPosition } from "@/helpers/floating-ui";
import type { TPageLinkSearchResult } from "@/types";

type OpenPageLinkPickerArgs = {
  editor: Editor;
  range?: Range;
  searchPages: (query: string) => Promise<TPageLinkSearchResult[]>;
  buildPageLink: (pageId: string, projectId?: string) => string;
};

const noopCleanup = () => {};

const appendCharacterToInput = (input: HTMLInputElement, character: string) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  const nextValue = input.value + character;
  nativeInputValueSetter?.call(input, nextValue);
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

const getSearchInputFromElement = (element: HTMLElement | null) =>
  element?.querySelector("input") as HTMLInputElement | null;

export const openPageLinkPicker = ({ editor, range, searchPages, buildPageLink }: OpenPageLinkPickerArgs) => {
  if (range) {
    editor.chain().deleteRange(range).run();
  }

  let component: ReactRenderer<void, PageLinkPickerOverlayProps> | null = null;
  let cleanup: () => void = noopCleanup;
  let searchInput: HTMLInputElement | null = null;

  const previousEditable = editor.isEditable;
  const previousHandleKeyDown = editor.options.editorProps?.handleKeyDown;

  const restoreEditorState = () => {
    editor.setOptions({
      editorProps: {
        ...editor.options.editorProps,
        handleKeyDown: previousHandleKeyDown,
      },
    });
    editor.setEditable(previousEditable);
  };

  const getActiveSearchInput = () => searchInput ?? getSearchInputFromElement(component?.element as HTMLElement | null);

  const focusSearchInput = () => {
    getActiveSearchInput()?.focus({ preventScroll: true });
  };

  const handleClose = () => {
    component?.destroy();
    component = null;
    searchInput = null;
    restoreEditorState();
    cleanup();
  };

  editor.setEditable(false);
  editor.commands.blur();

  editor.setOptions({
    editorProps: {
      ...editor.options.editorProps,
      handleKeyDown: (view, event) => {
        if (event.key === "Escape") {
          handleClose();
          return true;
        }

        const input = getActiveSearchInput();

        if (input && document.activeElement !== input) {
          const isPrintableCharacter =
            event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.repeat;

          if (isPrintableCharacter) {
            appendCharacterToInput(input, event.key);
          }

          focusSearchInput();
          return true;
        }

        if (previousHandleKeyDown?.(view, event)) {
          return true;
        }

        return true;
      },
    },
  });

  component = new ReactRenderer<void, PageLinkPickerOverlayProps>(PageLinkPickerOverlay, {
    props: {
      editor,
      searchPages,
      buildPageLink,
      onClose: handleClose,
      registerSearchInput: (input: HTMLInputElement | null) => {
        searchInput = input;
        if (input) {
          focusSearchInput();
        }
      },
    },
    editor,
    className: "pointer-events-none fixed z-[100]",
  });

  const element = component.element as HTMLElement;
  cleanup = updateFloatingUIFloaterPosition(editor, element).cleanup;

  requestAnimationFrame(() => {
    focusSearchInput();
    window.setTimeout(focusSearchInput, 0);
  });
};
