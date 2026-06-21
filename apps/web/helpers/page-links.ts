/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

const INTERNAL_PAGE_LINK_PATTERN = /\/projects\/(?<projectId>[0-9a-f-]{36})\/pages\/(?<pageId>[0-9a-f-]{36})\/?$/i;

export type TInternalPageHref = {
  projectId: string;
  pageId: string;
};

export const parseInternalPageHref = (href: string): TInternalPageHref | null => {
  if (!href) return null;

  let path = href;
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      path = new URL(href).pathname;
    } catch {
      return null;
    }
  }

  const match = path.match(INTERNAL_PAGE_LINK_PATTERN);
  if (!match?.groups?.projectId || !match.groups.pageId) {
    return null;
  }

  return {
    projectId: match.groups.projectId,
    pageId: match.groups.pageId,
  };
};

export const buildInternalPageHref = (workspaceSlug: string, projectId: string, pageId: string) =>
  `/${workspaceSlug}/projects/${projectId}/pages/${pageId}/`;
