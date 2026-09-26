import React from "react";
import { CategoryColorKey } from "../design-tokens";

export type CategoryId =
  | "document-pdf"
  | "image"
  | "security"
  | "url-cloud"
  | "codes"
  | "video"
  | "audio"
  | "builders"
  | "developer"
  | "utilities"
  | "calculators";

export type Runtime = "client" | "client-worker" | "server";

export type HeavyDep =
  | "react-pdf"
  | "docx"
  | "pdfjs"
  | "pdf-lib"
  | "ffmpeg"
  | "tesseract"
  | "konva";

export interface ToolFaqItem {
  q: string;
  a: string;
}

export interface ToolSeo {
  title: string;
  description: string;
  h1: string;
  intro: string;
  faq: ToolFaqItem[];
}

export interface ToolDefinition {
  slug: string; // kebab-case, unique, immutable
  name: string;
  category: CategoryId;
  phase: 1 | 2 | 3 | 4 | 5;
  status: "planned" | "in-progress" | "live";
  runtime: Runtime;
  heavyDeps?: HeavyDep[];
  seo: ToolSeo;
  related: string[]; // array of tool slugs
  disclaimer?: string; // legal, financial, or medical disclaimer
}

export type ToolMetadata = ToolDefinition;

export interface CategoryDefinition {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  expectedToolCount: number;
  colorKey: CategoryColorKey;
}

