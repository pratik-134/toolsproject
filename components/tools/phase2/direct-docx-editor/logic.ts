/**
 * Direct Word (.docx) Document Editor & Creator — Pure TypeScript Domain Logic
 * 100% In-Browser Document Generation using 'docx' OOXML Package Generator
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

export interface DocxBlock {
  id: string;
  type: "heading1" | "heading2" | "paragraph" | "bullet" | "callout";
  content: string;
}

export interface DocxDocumentConfig {
  title: string;
  subtitle?: string;
  author?: string;
  accentColorHex?: string; // e.g. "2563EB"
  blocks: DocxBlock[];
}

export const DOCX_TEMPLATES: Record<string, { title: string; subtitle: string; blocks: DocxBlock[] }> = {
  "Project Proposal": {
    title: "Enterprise Web Platform Proposal",
    subtitle: "High-Performance, Local-First Architecture Specification",
    blocks: [
      { id: "1", type: "heading1", content: "1. Executive Summary" },
      { id: "2", type: "paragraph", content: "This document outlines the engineering architecture for Cleartrix, a privacy-first web utility suite executing entirely within browser memory to eliminate server-side storage risks." },
      { id: "3", type: "heading1", content: "2. Key Objectives" },
      { id: "4", type: "bullet", content: "Zero server uploads for Phase 1-3 document and media processing." },
      { id: "5", type: "bullet", content: "High-fidelity export parity across Vector PDF, DOCX, and RTF formats." },
      { id: "6", type: "bullet", content: "Sub-second cold boot using Next.js App Router and Web Workers." },
      { id: "7", type: "callout", content: "Security Invariant: No user confidential information is ever transmitted over external network sockets." },
      { id: "8", type: "heading1", content: "3. Implementation Timeline" },
      { id: "9", type: "paragraph", content: "All Phase 1 developer and calculator utilities and Phase 2 document and security suites have been successfully delivered with automated testing." },
    ],
  },
  "Statement of Work": {
    title: "Statement of Work (SOW)",
    subtitle: "Software Development & Infrastructure Agreement",
    blocks: [
      { id: "1", type: "heading1", content: "1. Scope of Services" },
      { id: "2", type: "paragraph", content: "The Contractor agrees to design, implement, and verify in-browser file transformation tools adhering to strict AST privacy audits." },
      { id: "3", type: "heading1", content: "2. Deliverables & Acceptance Criteria" },
      { id: "4", type: "bullet", content: "Interactive web user interface with responsive dark and light mode themes." },
      { id: "5", type: "bullet", content: "Pure TypeScript mathematical and parsing algorithms with 100% unit test coverage." },
      { id: "6", type: "bullet", content: "One-click download of native Microsoft Word (.docx) documents." },
      { id: "7", type: "callout", content: "Confidentiality: Source code and proprietary algorithms shall remain strictly protected." },
    ],
  },
  "Meeting Minutes": {
    title: "Engineering Sprint Review",
    subtitle: "Milestone: 100+ Live Tools Shipped",
    blocks: [
      { id: "1", type: "heading1", content: "Meeting Overview" },
      { id: "2", type: "paragraph", content: "Date: October 2026 | Attendees: Core Architecture Team | Status: On Track" },
      { id: "3", type: "heading1", content: "Key Achievements" },
      { id: "4", type: "bullet", content: "Passed 100 live tools milestone with zero regressions in existing ATS Resume Builder." },
      { id: "5", type: "bullet", content: "Expanded Image, Security, and Document Creation tool suites." },
      { id: "6", type: "callout", content: "Action Required: Begin architecture design for Phase 3 media transcoding and video tools." },
    ],
  },
};

/**
 * Generates native Word (.docx) binary bytes from document config
 */
export async function buildDocxDocument(config: DocxDocumentConfig): Promise<Uint8Array> {
  const accent = (config.accentColorHex || "2563EB").replace("#", "");

  const children: (Paragraph | Table)[] = [];

  // Document Title
  if (config.title) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: config.title,
            bold: true,
            size: 44, // 22pt
            color: accent,
            font: "Calibri",
          }),
        ],
      })
    );
  }

  // Document Subtitle
  if (config.subtitle) {
    children.push(
      new Paragraph({
        spacing: { after: 280 },
        children: [
          new TextRun({
            text: config.subtitle,
            italics: true,
            size: 24, // 12pt
            color: "64748B",
            font: "Calibri",
          }),
        ],
      })
    );
  }

  // Document Blocks
  for (const block of config.blocks) {
    if (!block.content.trim()) continue;

    switch (block.type) {
      case "heading1":
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: block.content,
                bold: true,
                size: 32, // 16pt
                color: accent,
                font: "Calibri",
              }),
            ],
          })
        );
        break;

      case "heading2":
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: block.content,
                bold: true,
                size: 26, // 13pt
                color: "1E293B",
                font: "Calibri",
              }),
            ],
          })
        );
        break;

      case "bullet":
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: block.content,
                size: 22, // 11pt
                color: "334155",
                font: "Calibri",
              }),
            ],
          })
        );
        break;

      case "callout":
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              left: { style: BorderStyle.SINGLE, size: 24, color: accent },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F1F5F9" },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: block.content,
                            italics: true,
                            size: 22,
                            color: "1E293B",
                            font: "Calibri",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
        break;

      case "paragraph":
      default:
        children.push(
          new Paragraph({
            spacing: { after: 140, line: 280 },
            children: [
              new TextRun({
                text: block.content,
                size: 22, // 11pt
                color: "334155",
                font: "Calibri",
              }),
            ],
          })
        );
        break;
    }
  }

  const doc = new Document({
    creator: config.author || "Cleartrix Direct DOCX Creator",
    title: config.title || "Document",
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return new Uint8Array(buffer);
}
