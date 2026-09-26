import { Document } from "docx";
import { ResumeData } from "../schema";
import { ComputedResumeLayout } from "../resume-layout";

export type DocxTemplateBuilder = (data: ResumeData) => Document;

export interface DocxTemplateOptions {
  name: string;
  headerAlign?: "left" | "center" | "right";
  headerVariant?: "standard" | "banner" | "boxed" | "terminal" | "serif" | "minimal";
  sectionHeadingStyle?: "bottom-line" | "double-line" | "thick-line" | "accent-block" | "clean" | "terminal";
  fontFamily?: string;
  headingFontFamily?: string;
  sidebarSections?: string[]; // Section types to put in sidebar if two-column
  isTwoColumn?: boolean;
  sidebarWidthPercent?: number; // e.g. 32
}

export interface SectionRenderContext {
  data: ResumeData;
  layout: ComputedResumeLayout;
  options: DocxTemplateOptions;
  accentHex: string;
  fontFamily: string;
  headingFontFamily: string;
}
