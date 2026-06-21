/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { EWorkspaceType, type TWorkspaceTypeDefinition } from "@plane/types";
import { CIVIL_ENGINEERING_TERMINOLOGY } from "./terminology/civil-engineering";
import { CUSTOMER_SUCCESS_TERMINOLOGY } from "./terminology/customer-success";
import { DEFAULT_TERMINOLOGY } from "./terminology/default";
import { DESIGN_CREATIVE_TERMINOLOGY } from "./terminology/design-creative";
import { DIGITAL_LAUNCHES_TERMINOLOGY } from "./terminology/digital-launches";
import { EDUCATION_TERMINOLOGY } from "./terminology/education";
import { EVENTS_TERMINOLOGY } from "./terminology/events";
import { LEGAL_TERMINOLOGY } from "./terminology/legal";
import { MARKETING_AGENCY_TERMINOLOGY } from "./terminology/marketing-agency";
import { SOFTWARE_DEVELOPMENT_TERMINOLOGY } from "./terminology/software-development";

export const WORKSPACE_TYPE_REGISTRY: Record<EWorkspaceType, TWorkspaceTypeDefinition> = {
  [EWorkspaceType.DEFAULT]: {
    id: EWorkspaceType.DEFAULT,
    wave: 1,
    i18n_label: { en: "Default Plane", "pt-BR": "Padrão Plane" },
    i18n_description: {
      en: "Standard Plane terminology for any team.",
      "pt-BR": "Terminologia padrão do Plane para qualquer time.",
    },
    terminology: DEFAULT_TERMINOLOGY,
  },
  [EWorkspaceType.CIVIL_ENGINEERING]: {
    id: EWorkspaceType.CIVIL_ENGINEERING,
    wave: 1,
    i18n_label: { en: "Civil Engineering", "pt-BR": "Engenharia Civil" },
    i18n_description: {
      en: "Construction projects, stages and phases.",
      "pt-BR": "Obras, etapas e fases de execução.",
    },
    terminology: CIVIL_ENGINEERING_TERMINOLOGY,
  },
  [EWorkspaceType.DIGITAL_LAUNCHES]: {
    id: EWorkspaceType.DIGITAL_LAUNCHES,
    wave: 1,
    i18n_label: { en: "Digital Launches", "pt-BR": "Lançamentos Digitais" },
    i18n_description: {
      en: "Product launches, funnels and campaign weeks.",
      "pt-BR": "Lançamentos, funis e semanas de campanha.",
    },
    terminology: DIGITAL_LAUNCHES_TERMINOLOGY,
  },
  [EWorkspaceType.SOFTWARE_DEVELOPMENT]: {
    id: EWorkspaceType.SOFTWARE_DEVELOPMENT,
    wave: 1,
    i18n_label: { en: "Software Development", "pt-BR": "Desenvolvimento" },
    i18n_description: {
      en: "Products, sprints and components for dev teams.",
      "pt-BR": "Produtos, sprints e componentes para times de dev.",
    },
    terminology: SOFTWARE_DEVELOPMENT_TERMINOLOGY,
  },
  [EWorkspaceType.MARKETING_AGENCY]: {
    id: EWorkspaceType.MARKETING_AGENCY,
    wave: 2,
    i18n_label: { en: "Marketing & Agencies", "pt-BR": "Marketing e Agências" },
    i18n_description: {
      en: "Campaigns, deliverables and creative sprints.",
      "pt-BR": "Campanhas, entregas e sprints criativos.",
    },
    terminology: MARKETING_AGENCY_TERMINOLOGY,
  },
  [EWorkspaceType.CUSTOMER_SUCCESS]: {
    id: EWorkspaceType.CUSTOMER_SUCCESS,
    wave: 2,
    i18n_label: { en: "Customer Success", "pt-BR": "Customer Success" },
    i18n_description: {
      en: "Accounts, journeys and success plans.",
      "pt-BR": "Contas, jornadas e planos de sucesso.",
    },
    terminology: CUSTOMER_SUCCESS_TERMINOLOGY,
  },
  [EWorkspaceType.LEGAL]: {
    id: EWorkspaceType.LEGAL,
    wave: 2,
    i18n_label: { en: "Legal", "pt-BR": "Jurídico" },
    i18n_description: {
      en: "Cases, procedural phases and deadlines.",
      "pt-BR": "Casos, fases processuais e prazos.",
    },
    terminology: LEGAL_TERMINOLOGY,
  },
  [EWorkspaceType.EDUCATION]: {
    id: EWorkspaceType.EDUCATION,
    wave: 2,
    i18n_label: { en: "Education", "pt-BR": "Educação" },
    i18n_description: {
      en: "Courses, learning modules and academic terms.",
      "pt-BR": "Cursos, módulos didáticos e períodos letivos.",
    },
    terminology: EDUCATION_TERMINOLOGY,
  },
  [EWorkspaceType.EVENTS]: {
    id: EWorkspaceType.EVENTS,
    wave: 2,
    i18n_label: { en: "Events", "pt-BR": "Eventos" },
    i18n_description: {
      en: "Events, areas and production countdowns.",
      "pt-BR": "Eventos, áreas e countdowns de produção.",
    },
    terminology: EVENTS_TERMINOLOGY,
  },
  [EWorkspaceType.DESIGN_CREATIVE]: {
    id: EWorkspaceType.DESIGN_CREATIVE,
    wave: 2,
    i18n_label: { en: "Design & Creative", "pt-BR": "Design e Criativo" },
    i18n_description: {
      en: "Creative jobs, rounds and review sprints.",
      "pt-BR": "Jobs, rondas e sprints de revisão.",
    },
    terminology: DESIGN_CREATIVE_TERMINOLOGY,
  },
};

export const WORKSPACE_TYPE_LIST = Object.values(WORKSPACE_TYPE_REGISTRY);

export function isValidWorkspaceType(value: string): value is EWorkspaceType {
  return Object.values(EWorkspaceType).includes(value as EWorkspaceType);
}

export function getWorkspaceTypeDefinition(workspaceType: string): TWorkspaceTypeDefinition {
  if (isValidWorkspaceType(workspaceType)) {
    return WORKSPACE_TYPE_REGISTRY[workspaceType];
  }
  return WORKSPACE_TYPE_REGISTRY[EWorkspaceType.DEFAULT];
}
