"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import { ToolWorkbenchShell } from "@/components/tools/ToolWorkbenchShell";
import { ConverterPreset } from "@/lib/registry/converter-presets";

export interface DataTransformEngineProps {
  preset: ConverterPreset;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseCsv(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/);
  const result: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let insideQuotes = false;
    let currentCell = "";

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if ((char === "," || char === "\t" || char === ";") && !insideQuotes) {
        row.push(currentCell);
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    row.push(currentCell);
    result.push(row);
  }

  return result;
}

function colName(n: number): string {
  let s = "";
  while (n >= 0) {
    s = String.fromCharCode((n % 26) + 65) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

async function csvToXlsxBlob(csvText: string): Promise<Blob> {
  const rows = parseCsv(csvText);
  const zip = new JSZip();

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`
  );

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  );

  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`
  );

  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`
  );

  let sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>`;

  rows.forEach((row, rIdx) => {
    const rowNum = rIdx + 1;
    sheetXml += `<row r="${rowNum}">`;
    row.forEach((cell, cIdx) => {
      const cellRef = `${colName(cIdx)}${rowNum}`;
      const escaped = escapeXml(cell);
      const isNum = !isNaN(Number(cell)) && cell.trim() !== "";
      if (isNum) {
        sheetXml += `<c r="${cellRef}"><v>${cell.trim()}</v></c>`;
      } else {
        sheetXml += `<c r="${cellRef}" t="inlineStr"><is><t>${escaped}</t></is></c>`;
      }
    });
    sheetXml += `</row>`;
  });

  sheetXml += `</sheetData></worksheet>`;

  zip.file("xl/worksheets/sheet1.xml", sheetXml);

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function markdownToHtml(md: string): string {
  let html = md;
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${escapeXml(code.trim())}</code></pre>`);

  // Headers
  html = html.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
  html = html.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>");

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Unordered lists
  html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/gim, "<ul>$1</ul>");
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // Paragraphs
  const paragraphs = html.split(/\n\n+/);
  return paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<blockquote")
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n\n");
}

function htmlToMarkdown(html: string): string {
  if (typeof window === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  function nodeToMd(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const childrenMd = Array.from(el.childNodes)
      .map((c) => nodeToMd(c))
      .join("");

    switch (tag) {
      case "h1":
        return `# ${childrenMd.trim()}\n\n`;
      case "h2":
        return `## ${childrenMd.trim()}\n\n`;
      case "h3":
        return `### ${childrenMd.trim()}\n\n`;
      case "h4":
        return `#### ${childrenMd.trim()}\n\n`;
      case "h5":
        return `##### ${childrenMd.trim()}\n\n`;
      case "h6":
        return `###### ${childrenMd.trim()}\n\n`;
      case "p":
        return `${childrenMd.trim()}\n\n`;
      case "strong":
      case "b":
        return `**${childrenMd}**`;
      case "em":
      case "i":
        return `*${childrenMd}*`;
      case "code":
        return el.parentElement?.tagName.toLowerCase() === "pre"
          ? childrenMd
          : `\`${childrenMd}\``;
      case "pre":
        return `\`\`\`\n${childrenMd.trim()}\n\`\`\`\n\n`;
      case "a":
        const href = el.getAttribute("href") || "";
        return `[${childrenMd}](${href})`;
      case "ul":
        return `${childrenMd.trim()}\n\n`;
      case "ol":
        return `${childrenMd.trim()}\n\n`;
      case "li":
        return `- ${childrenMd.trim()}\n`;
      case "blockquote":
        return `> ${childrenMd.trim()}\n\n`;
      case "br":
        return "\n";
      default:
        return childrenMd;
    }
  }

  return nodeToMd(doc.body).trim();
}

function xmlToCsv(xmlText: string): string {
  if (typeof window === "undefined") return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error(`XML Parsing Error: ${parserError.textContent}`);
  }

  const root = doc.documentElement;
  const children = Array.from(root.children);

  if (children.length === 0) {
    throw new Error("XML contains no child records to convert.");
  }

  const headersSet = new Set<string>();
  const records: Record<string, string>[] = [];

  for (const child of children) {
    const record: Record<string, string> = {};
    if (child.children.length === 0) {
      record[child.tagName] = child.textContent || "";
      headersSet.add(child.tagName);
    } else {
      for (const field of Array.from(child.children)) {
        record[field.tagName] = field.textContent || "";
        headersSet.add(field.tagName);
      }
    }
    records.push(record);
  }

  const headers = Array.from(headersSet);
  const csvLines: string[] = [];

  csvLines.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","));

  for (const rec of records) {
    const row = headers.map((h) => {
      const val = rec[h] || "";
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvLines.push(row.join(","));
  }

  return csvLines.join("\n");
}

function parseTsv(tsvText: string): string[][] {
  const lines = tsvText.split(/\r?\n/);
  const result: string[][] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    result.push(line.split("\t"));
  }
  return result;
}

function tsvToCsv(tsvText: string): string {
  const rows = parseTsv(tsvText);
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export { escapeXml, parseCsv, parseTsv, colName, csvToXlsxBlob, markdownToHtml, htmlToMarkdown, xmlToCsv, tsvToCsv };

export function DataTransformEngine({ preset }: DataTransformEngineProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [textInput, setTextInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const transformContent = async (sourceText: string, slug: string): Promise<Blob> => {
    if (slug === "markdown-to-html") {
      const html = markdownToHtml(sourceText);
      return new Blob([html], { type: "text/html;charset=utf-8" });
    } else if (slug === "html-to-markdown") {
      const md = htmlToMarkdown(sourceText);
      return new Blob([md], { type: "text/markdown;charset=utf-8" });
    } else if (slug === "csv-to-excel") {
      return await csvToXlsxBlob(sourceText);
    } else if (slug === "xml-to-csv") {
      const csv = xmlToCsv(sourceText);
      return new Blob([csv], { type: "text/csv;charset=utf-8" });
    } else if (slug === "tsv-to-csv") {
      const csv = tsvToCsv(sourceText);
      return new Blob([csv], { type: "text/csv;charset=utf-8" });
    } else {
      throw new Error(`Unsupported data transform slug: ${slug}`);
    }
  };

  const handleProcess = async () => {
    if (files.length === 0 && !textInput.trim()) {
      setErrorMessage("Please upload a file or enter text to convert.");
      return;
    }

    setIsProcessing(true);
    setProgressPercent(10);
    setErrorMessage(null);

    try {
      const targetExt = preset.downloadFilenameExtension;

      if (files.length <= 1) {
        let sourceText = textInput;
        let baseFilename = "converted";

        if (files[0]) {
          sourceText = await files[0].text();
          baseFilename = files[0].name.substring(0, files[0].name.lastIndexOf(".")) || files[0].name;
        }

        if (!sourceText.trim()) {
          setErrorMessage("Input data is empty.");
          return;
        }

        const outputBlob = await transformContent(sourceText, preset.slug);
        setProgressPercent(100);
        const url = URL.createObjectURL(outputBlob);
        setDownloadUrl(url);
        setDownloadFilename(`${baseFilename}${targetExt}`);
      } else {
        // Multi-file batch
        const zip = new JSZip();
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) continue;
          const text = await file.text();
          const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          const blob = await transformContent(text, preset.slug);
          zip.file(`${baseName}${targetExt}`, blob);
          setProgressPercent(Math.round(((i + 1) / files.length) * 85));
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        setProgressPercent(100);
        const url = URL.createObjectURL(zipBlob);
        setDownloadUrl(url);
        setDownloadFilename(`${preset.slug}-batch.zip`);
      }
    } catch (err: unknown) {
      console.error("[DataTransformEngine Error]:", err);
      const msg = err instanceof Error ? err.message : "Failed to transform data.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFiles([]);
    setTextInput("");
    setDownloadUrl(null);
    setDownloadFilename(null);
    setProgressPercent(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      <ToolWorkbenchShell
        acceptTypes={preset.inputFormats}
        maxFileSizeMB={preset.maxFileSizeMB}
        multipleFiles={preset.multiFile}
        files={files}
        onFilesSelected={handleFilesSelected}
        onRemoveFile={handleRemoveFile}
        actionLabel={preset.actionLabel}
        onAction={handleProcess}
        isProcessing={isProcessing}
        progressPercent={progressPercent}
        downloadUrl={downloadUrl}
        downloadFilename={downloadFilename}
        errorMessage={errorMessage}
        onReset={handleReset}
      >
        {files.length === 0 && (
          <div className="mt-4 space-y-2 text-left">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Or paste / type input data below:
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste raw data here..."
              rows={6}
              className="w-full p-3 font-mono text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </ToolWorkbenchShell>
    </div>
  );
}
