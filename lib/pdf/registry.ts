import React from "react";
import { ResumeData } from "@/lib/schema";

import { ModernPdf } from "./templates/ModernPdf";
import { AtsSafePdf } from "./templates/AtsSafePdf";
import { ClassicPdf } from "./templates/ClassicPdf";
import { MinimalPdf } from "./templates/MinimalPdf";
import { TechPdf } from "./templates/TechPdf";
import { ExecutivePdf } from "./templates/ExecutivePdf";
import { TwoColumnPdf } from "./templates/TwoColumnPdf";
import { CompactPdf } from "./templates/CompactPdf";
import { CreativePdf } from "./templates/CreativePdf";
import { AcademicPdf } from "./templates/AcademicPdf";
import { TimelinePdf } from "./templates/TimelinePdf";
import { ElegantPdf } from "./templates/ElegantPdf";
import { BoldPdf } from "./templates/BoldPdf";
import { StartupPdf } from "./templates/StartupPdf";
import { InfographicLightPdf } from "./templates/InfographicLightPdf";
import { SimplePdf } from "./templates/SimplePdf";
import { CorporatePdf } from "./templates/CorporatePdf";
import { NordicPdf } from "./templates/NordicPdf";
import { SwissPdf } from "./templates/SwissPdf";
import { HybridPdf } from "./templates/HybridPdf";

export type PdfTemplateComponent = React.FC<{ data: ResumeData }>;

export const PDF_TEMPLATES_REGISTRY: Record<string, PdfTemplateComponent> = {
  modern: ModernPdf,
  "ats-safe": AtsSafePdf,
  classic: ClassicPdf,
  minimal: MinimalPdf,
  tech: TechPdf,
  executive: ExecutivePdf,
  "two-column": TwoColumnPdf,
  compact: CompactPdf,
  creative: CreativePdf,
  academic: AcademicPdf,
  timeline: TimelinePdf,
  elegant: ElegantPdf,
  bold: BoldPdf,
  startup: StartupPdf,
  "infographic-light": InfographicLightPdf,
  simple: SimplePdf,
  corporate: CorporatePdf,
  nordic: NordicPdf,
  swiss: SwissPdf,
  hybrid: HybridPdf,
};

export function getPdfTemplateComponent(templateId?: string): PdfTemplateComponent {
  if (!templateId || !PDF_TEMPLATES_REGISTRY[templateId]) {
    return ModernPdf;
  }
  return PDF_TEMPLATES_REGISTRY[templateId];
}
