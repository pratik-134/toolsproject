import React from "react";
import { ResumeData } from "@/lib/schema";

import { ModernTemplate } from "./ModernTemplate";
import { ClassicTemplate } from "./ClassicTemplate";
import { MinimalTemplate } from "./MinimalTemplate";
import { AtsSafeTemplate } from "./AtsSafeTemplate";
import { TechTemplate } from "./TechTemplate";
import { ExecutiveTemplate } from "./ExecutiveTemplate";
import { TwoColumnTemplate } from "./TwoColumnTemplate";
import { CompactTemplate } from "./CompactTemplate";
import { CreativeTemplate } from "./CreativeTemplate";
import { AcademicTemplate } from "./AcademicTemplate";
import { TimelineTemplate } from "./TimelineTemplate";
import { ElegantTemplate } from "./ElegantTemplate";
import { BoldTemplate } from "./BoldTemplate";
import { StartupTemplate } from "./StartupTemplate";
import { InfographicLightTemplate } from "./InfographicLightTemplate";
import { SimpleTemplate } from "./SimpleTemplate";
import { CorporateTemplate } from "./CorporateTemplate";
import { NordicTemplate } from "./NordicTemplate";
import { SwissTemplate } from "./SwissTemplate";
import { HybridTemplate } from "./HybridTemplate";

export type TemplateCategory = "all" | "ats-safe" | "modern" | "professional" | "specialized";

export interface TemplateInfo {
  id: string;
  name: string;
  category: "ats-safe" | "modern" | "professional" | "specialized";
  description: string;
  atsScore: number; // 0 to 100
  badges: string[];
  fontName: string;
  fontFamilyClass: string;
  component: React.FC<{ data: ResumeData }>;
}

export const TEMPLATES_LIST: TemplateInfo[] = [
  {
    id: "modern",
    name: "Modern",
    category: "modern",
    description: "Clean contemporary layout with icon headers and balanced spacing. Ideal for modern corporate and tech roles.",
    atsScore: 96,
    badges: ["Popular", "High ATS"],
    fontName: "Inter",
    fontFamilyClass: "font-sans",
    component: ModernTemplate,
  },
  {
    id: "ats-safe",
    name: "ATS-Safe Standard",
    category: "ats-safe",
    description: "Strict single-column text layout guaranteed to parse through 100% of applicant tracking systems without error.",
    atsScore: 100,
    badges: ["100% ATS-Safe", "Parser Optimized"],
    fontName: "Arial / System",
    fontFamilyClass: "font-sans",
    component: AtsSafeTemplate,
  },
  {
    id: "classic",
    name: "Classic Serif",
    category: "professional",
    description: "Timeless centered serif design with traditional formal rules. Perfect for legal, finance, and academia.",
    atsScore: 98,
    badges: ["Formal", "Traditional"],
    fontName: "Lora / Georgia",
    fontFamilyClass: "font-serif",
    component: ClassicTemplate,
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    category: "modern",
    description: "High-whitespace layout focusing purely on typography and content clarity with subtle accents.",
    atsScore: 97,
    badges: ["Minimalist", "High Clarity"],
    fontName: "Inter",
    fontFamilyClass: "font-sans",
    component: MinimalTemplate,
  },
  {
    id: "tech",
    name: "Tech & Developer",
    category: "specialized",
    description: "Developer-focused design featuring monospace accents, terminal styling, and tech badge highlights.",
    atsScore: 94,
    badges: ["Engineers", "Git & Tech"],
    fontName: "JetBrains Mono",
    fontFamilyClass: "font-mono",
    component: TechTemplate,
  },
  {
    id: "executive",
    name: "Executive Leadership",
    category: "professional",
    description: "Authoritative header banner and leadership profile section tailored for directors, VPs, and C-suite.",
    atsScore: 92,
    badges: ["Leadership", "C-Suite"],
    fontName: "Playfair Display",
    fontFamilyClass: "font-serif",
    component: ExecutiveTemplate,
  },
  {
    id: "two-column",
    name: "Two-Column Split",
    category: "modern",
    description: "Structured split layout with sidebar for rapid scanning of skills, contact, and education.",
    atsScore: 88,
    badges: ["Sidebar", "Skills Heavy"],
    fontName: "Inter",
    fontFamilyClass: "font-sans",
    component: TwoColumnTemplate,
  },
  {
    id: "compact",
    name: "Compact One-Page",
    category: "ats-safe",
    description: "Space-optimized layout engineered to fit extensive career achievements onto a single page.",
    atsScore: 97,
    badges: ["Fits 1 Page", "Dense"],
    fontName: "Inter",
    fontFamilyClass: "font-sans",
    component: CompactTemplate,
  },
  {
    id: "creative",
    name: "Creative Designer",
    category: "specialized",
    description: "Dynamic layout with pill badges, asymmetrical accents, and high visual appeal for design and marketing.",
    atsScore: 89,
    badges: ["Designers", "Visual"],
    fontName: "Poppins",
    fontFamilyClass: "font-sans",
    component: CreativeTemplate,
  },
  {
    id: "academic",
    name: "Academic CV",
    category: "professional",
    description: "Designed for researchers, professors, and doctors with extensive publications, grants, and teaching.",
    atsScore: 98,
    badges: ["Publications", "Multi-Page CV"],
    fontName: "Lora / Cambria",
    fontFamilyClass: "font-serif",
    component: AcademicTemplate,
  },
  {
    id: "timeline",
    name: "Career Timeline",
    category: "specialized",
    description: "Vertical timeline connecting roles and promotions into a compelling career progression narrative.",
    atsScore: 91,
    badges: ["Visual Timeline", "Promotions"],
    fontName: "Inter",
    fontFamilyClass: "font-sans",
    component: TimelineTemplate,
  },
  {
    id: "elegant",
    name: "Elegant Luxury",
    category: "professional",
    description: "Refined editorial typography with warm background tones and delicate dividers for executive prestige.",
    atsScore: 95,
    badges: ["Refined", "Editorial"],
    fontName: "Playfair Display",
    fontFamilyClass: "font-serif",
    component: ElegantTemplate,
  },
  {
    id: "bold",
    name: "Bold Contrast",
    category: "modern",
    description: "High-contrast typography with heavy weights and impactful section dividers that command attention.",
    atsScore: 94,
    badges: ["High Impact", "Bold"],
    fontName: "Poppins Bold",
    fontFamilyClass: "font-sans",
    component: BoldTemplate,
  },
  {
    id: "startup",
    name: "Startup Operator",
    category: "specialized",
    description: "High-energy layout focusing on growth metrics, fast execution, and cross-functional ownership.",
    atsScore: 93,
    badges: ["High Growth", "Metrics"],
    fontName: "Inter",
    fontFamilyClass: "font-sans",
    component: StartupTemplate,
  },
  {
    id: "infographic-light",
    name: "Infographic Light",
    category: "specialized",
    description: "Clean visual skill rating indicators and metric callouts without compromising ATS parseability.",
    atsScore: 90,
    badges: ["Visual Ratings", "Modern"],
    fontName: "Inter",
    fontFamilyClass: "font-sans",
    component: InfographicLightTemplate,
  },
  {
    id: "simple",
    name: "Simple Clean",
    category: "ats-safe",
    description: "No-frills layout that lets your qualifications speak directly. Universally approved by recruiters.",
    atsScore: 100,
    badges: ["Universal", "Clean"],
    fontName: "Inter",
    fontFamilyClass: "font-sans",
    component: SimpleTemplate,
  },
  {
    id: "corporate",
    name: "Enterprise Corporate",
    category: "professional",
    description: "Formal structured layout trusted across Fortune 500 enterprises, consulting, and finance firms.",
    atsScore: 98,
    badges: ["Fortune 500", "Consulting"],
    fontName: "Inter / Segoe",
    fontFamilyClass: "font-sans",
    component: CorporateTemplate,
  },
  {
    id: "nordic",
    name: "Nordic Minimalist",
    category: "modern",
    description: "Scandinavian-inspired airy layout with light font weights, muted tones, and thoughtful breathing room.",
    atsScore: 96,
    badges: ["Scandinavian", "Airy"],
    fontName: "Inter Light",
    fontFamilyClass: "font-sans",
    component: NordicTemplate,
  },
  {
    id: "swiss",
    name: "Swiss High-Grid",
    category: "modern",
    description: "Rigorous Swiss design principles featuring strong left-aligned titles and crisp sans-serif hierarchy.",
    atsScore: 96,
    badges: ["Helvetica Grid", "Structured"],
    fontName: "Helvetica / Inter",
    fontFamilyClass: "font-sans",
    component: SwissTemplate,
  },
  {
    id: "hybrid",
    name: "Hybrid Dual-Tone",
    category: "modern",
    description: "Deep-tone header block paired with a clean white body for a polished modern appearance.",
    atsScore: 93,
    badges: ["Dual Tone", "Contemporary"],
    fontName: "Inter",
    fontFamilyClass: "font-sans",
    component: HybridTemplate,
  },
];

export const TEMPLATES_REGISTRY: Record<string, TemplateInfo> = TEMPLATES_LIST.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, TemplateInfo>
);

export function getTemplateComponent(templateId: string): React.FC<{ data: ResumeData }> {
  return TEMPLATES_REGISTRY[templateId]?.component || ModernTemplate;
}
