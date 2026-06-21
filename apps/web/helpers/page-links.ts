/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

const INTERNAL_PAGE_HREF_PATTERN = /^\/([^/]+)\/projects\/([^/]+)\/pages\/([^/]+)\/?$/;

export type TInternalPageHref = {
  workspaceSlug: string;
  projectId: string;
  pageId: string;
};

export type TInternalPageLinkHandlers = {
  isInternalPageLink: (href: string) => boolean;
  onLinkClick: (href: string, event: MouseEvent) => boolean;
};

export const buildInternalPageHref = (workspaceSlug: string, projectId: string, pageId: string) =>
  `/${workspaceSlug}/projects/${projectId}/pages/${pageId}`;

export const parseInternalPageHref = (href: string): TInternalPageHref | null => {
  try {
    const pathname = href.startsWith("http") ? new URL(href).pathname : href;
    const match = pathname.match(INTERNAL_PAGE_HREF_PATTERN);
    if (!match) return null;

    return {
      workspaceSlug: match[1],
      projectId: match[2],
      pageId: match[3],
    };
  } catch {
    return null;
  }
};

export const createInternalPageLinkHandlers = (navigate: (href: string) => void): TInternalPageLinkHandlers => ({
  isInternalPageLink: (href: string) => Boolean(parseInternalPageHref(href)),
  onLinkClick: (href: string, event: MouseEvent) => {
    const internalLink = parseInternalPageHref(href);
    if (!internalLink) {
      return false;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      return false;
    }

    navigate(buildInternalPageHref(internalLink.workspaceSlug, internalLink.projectId, internalLink.pageId));
    return true;
  },
});

const ANCHOR_OPEN_TAG_PATTERN = /<a\s+([^>]+)>/gi;

const stripLinkAttribute = (attributes: string, attributeName: string) =>
  attributes.replace(new RegExp(`\\s*\\b${attributeName}=(["'])[^"']*\\1`, "gi"), "");

export const normalizeInternalPageLinksInHtml = (html: string): string =>
  html.replace(ANCHOR_OPEN_TAG_PATTERN, (match, attributeString: string) => {
    const hrefMatch = attributeString.match(/\bhref=(["'])([^"']+)\1/i);
    if (!hrefMatch) {
      return match;
    }

    const href = hrefMatch[2];
    const internalLink = parseInternalPageHref(href);
    if (!internalLink) {
      return match;
    }

    const normalizedHref = buildInternalPageHref(
      internalLink.workspaceSlug,
      internalLink.projectId,
      internalLink.pageId
    );
    const existingLinkIdMatch = attributeString.match(/\bdata-link-id=(["'])([^"']+)\1/i);
    const dataLinkId = existingLinkIdMatch?.[2] ?? crypto.randomUUID();

    let attributes = stripLinkAttribute(attributeString, "href");
    attributes = stripLinkAttribute(attributes, "target");
    attributes = stripLinkAttribute(attributes, "rel");
    attributes = stripLinkAttribute(attributes, "data-link-id");
    attributes = attributes.trim();

    const attributePrefix = attributes ? `${attributes} ` : "";

    return `<a ${attributePrefix}href="${normalizedHref}" data-link-id="${dataLinkId}">`;
  });
