import { Document } from "docx";
import { ResumeData } from "../schema";
import { DocxTemplateBuilder } from "./types";

import { buildModernDocx } from "./templates/ModernDocx";
import { buildAtsSafeDocx } from "./templates/AtsSafeDocx";
import { buildClassicDocx } from "./templates/ClassicDocx";
import { buildMinimalDocx } from "./templates/MinimalDocx";
import { buildTechDocx } from "./templates/TechDocx";
import { buildExecutiveDocx } from "./templates/ExecutiveDocx";
import { buildTwoColumnDocxTemplate } from "./templates/TwoColumnDocx";
import { buildCompactDocx } from "./templates/CompactDocx";
import { buildCreativeDocx } from "./templates/CreativeDocx";
import { buildAcademicDocx } from "./templates/AcademicDocx";
import { buildTimelineDocx } from "./templates/TimelineDocx";
import { buildElegantDocx } from "./templates/ElegantDocx";
import { buildBoldDocx } from "./templates/BoldDocx";
import { buildStartupDocx } from "./templates/StartupDocx";
import { buildInfographicLightDocx } from "./templates/InfographicLightDocx";
import { buildSimpleDocx } from "./templates/SimpleDocx";
import { buildCorporateDocx } from "./templates/CorporateDocx";
import { buildNordicDocx } from "./templates/NordicDocx";
import { buildSwissDocx } from "./templates/SwissDocx";
import { buildHybridDocx } from "./templates/HybridDocx";

export const DOCX_TEMPLATES_REGISTRY: Record<string, DocxTemplateBuilder> = {
  modern: buildModernDocx,
  "ats-safe": buildAtsSafeDocx,
  classic: buildClassicDocx,
  minimal: buildMinimalDocx,
  tech: buildTechDocx,
  executive: buildExecutiveDocx,
  "two-column": buildTwoColumnDocxTemplate,
  compact: buildCompactDocx,
  creative: buildCreativeDocx,
  academic: buildAcademicDocx,
  timeline: buildTimelineDocx,
  elegant: buildElegantDocx,
  bold: buildBoldDocx,
  startup: buildStartupDocx,
  "infographic-light": buildInfographicLightDocx,
  simple: buildSimpleDocx,
  corporate: buildCorporateDocx,
  nordic: buildNordicDocx,
  swiss: buildSwissDocx,
  hybrid: buildHybridDocx,
};

export function getDocxTemplateBuilder(templateId?: string): DocxTemplateBuilder {
  if (!templateId || !DOCX_TEMPLATES_REGISTRY[templateId]) {
    return buildModernDocx;
  }
  return DOCX_TEMPLATES_REGISTRY[templateId];
}
