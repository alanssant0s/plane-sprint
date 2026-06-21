/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { getAttributes } from "@tiptap/core";
import type { MarkType } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";

type ClickHandlerOptions = {
  type: MarkType;
  onLinkClick?: (href: string, event: MouseEvent) => boolean | void;
  isInternalPageLink?: (href: string) => boolean;
};

const findAnchorElement = (target: EventTarget | null): HTMLAnchorElement | null => {
  let element = target as HTMLElement | null;

  while (element && element.nodeName !== "DIV") {
    if (element.nodeName === "A") {
      return element as HTMLAnchorElement;
    }
    element = element.parentNode as HTMLElement | null;
  }

  return null;
};

export function clickHandler(options: ClickHandlerOptions): Plugin {
  const { onLinkClick, isInternalPageLink } = options;

  return new Plugin({
    key: new PluginKey("handleClickLink"),
    props: {
      handleClick: (view, pos, event) => {
        if (event.button !== 0) {
          return false;
        }

        const anchor = findAnchorElement(event.target);
        if (!anchor) {
          return false;
        }

        const attrs = getAttributes(view.state, options.type.name);
        const href = anchor.getAttribute("href") ?? attrs.href;

        if (!href) {
          return false;
        }

        event.preventDefault();

        const isInternal = Boolean(isInternalPageLink?.(href));
        const openInNewTab = event.metaKey || event.ctrlKey || event.shiftKey;

        if (isInternal) {
          if (onLinkClick) {
            const handled = onLinkClick(href, event);
            if (handled) {
              return true;
            }
          }

          window.open(href, openInNewTab ? "_blank" : "_self");
          return true;
        }

        const target = anchor.getAttribute("target") ?? attrs.target ?? undefined;
        window.open(href, openInNewTab || target === "_blank" ? "_blank" : "_self");

        return true;
      },
    },
  });
}
