/**
 * Direct RTF Document Creator — Pure TypeScript Domain Logic
 * Generates standard RTF 1.5 specification documents with zero server uploads.
 * Fully compatible with Microsoft Word, Apple TextEdit, and LibreOffice.
 */

export interface RtfDocumentOptions {
  title: string;
  author?: string;
  body: string;
  fontFamily: "Arial" | "Calibri" | "Times New Roman";
  fontSizePt: number;
}

export const RTF_TEMPLATES: Record<string, { title: string; body: string }> = {
  "Business Proposal": {
    title: "Project Development Proposal",
    body: `PROJECT DEVELOPMENT PROPOSAL

1. EXECUTIVE SUMMARY
Cleartrix provides modern, high-speed, client-side web utility solutions designed for privacy and enterprise productivity. All operations execute strictly within local device memory.

2. OBJECTIVES & DELIVERABLES
• Deliver 100+ production-ready in-browser tools.
• Zero server-side data retention or upload dependencies.
• Parity across PDF, native Word (.docx), and Rich Text Format (.rtf).

3. TIMELINE & BUDGET
Phase 1 and Phase 2 delivery milestones are completed on schedule with 100% test coverage.`,
  },
  "Non-Disclosure Agreement": {
    title: "Mutual Confidentiality Agreement",
    body: `MUTUAL NON-DISCLOSURE AGREEMENT

This Confidentiality Agreement is entered into between the Disclosing Party and the Receiving Party.

1. CONFIDENTIAL INFORMATION
Confidential Information includes all technical architectures, algorithmic designs, software source code, and trade secrets disclosed by either party.

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees to:
• Protect and maintain strict confidentiality of all disclosed materials.
• Not disclose or distribute confidential files without prior written approval.
• Ensure zero unauthorized transmission across unsecured remote networks.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement.`,
  },
  "Meeting Minutes": {
    title: "Executive Architecture Meeting Minutes",
    body: `ARCHITECTURE REVIEW & SPRINT PLANNING

Date: October 2026
Attendees: Core Engineering & Product Architecture

AGENDA ITEMS DISCUSSED:
1. Reached the 100 Live Tools milestone across Developer, Security, Document, and Image suites.
2. Verified 100% automated test pass rate across TypeScript typecheck, PDF generator, and AST privacy scanners.
3. Finalized upcoming Phase 3 media and document generator specifications.

NEXT ACTION ITEMS:
• Continue Phase 2 & 3 roadmap rollout with strict privacy invariants.`,
  },
};

/**
 * Escapes characters for standard 7-bit ASCII RTF
 */
export function escapeRtfText(text: string): string {
  let escaped = "";
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    const code = text.charCodeAt(i);

    if (char === "\\") {
      escaped += "\\\\";
    } else if (char === "{") {
      escaped += "\\{";
    } else if (char === "}") {
      escaped += "\\}";
    } else if (char === "\n") {
      escaped += "\\par\n";
    } else if (code > 127) {
      // RTF Unicode escape sequence: \uN?
      escaped += `\\u${code}?`;
    } else {
      escaped += char;
    }
  }
  return escaped;
}

/**
 * Generates valid standard RTF 1.5 document string
 */
export function generateRtfDocument(options: RtfDocumentOptions): string {
  const fontMap: Record<string, number> = {
    Arial: 0,
    Calibri: 1,
    "Times New Roman": 2,
  };

  const fontIndex = fontMap[options.fontFamily] ?? 0;
  const halfPoints = Math.round((options.fontSizePt || 12) * 2);

  const header = [
    "{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1033",
    "{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}{\\f1\\fnil\\fcharset0 Calibri;}{\\f2\\fnil\\fcharset0 Times New Roman;}}",
    "{\\colortbl ;\\red0\\green0\\blue0;\\red79\\green70\\blue229;\\red15\\green23\\blue42;}",
    "{\\*\\generator Cleartrix Direct RTF Creator 1.0;}",
  ].join("\n");

  const titleBlock = options.title
    ? `{\\info{\\title ${escapeRtfText(options.title)}}{\\author ${escapeRtfText(options.author || "Cleartrix User")}}}\n`
    : "";

  const escapedBody = escapeRtfText(options.body);

  const bodyBlock = [
    `\\viewkind4\\uc1\\pard\\cf1\\f${fontIndex}\\fs${halfPoints}`,
    escapedBody,
    "\\par}",
  ].join("\n");

  return `${header}\n${titleBlock}${bodyBlock}`;
}
