/**
 * Direct Markdown Editor — In-Browser Pure Logic
 * High-fidelity Markdown compiler to HTML, task checklist analyzer, table generator, and format inserters.
 */

export interface TaskProgress {
  total: number;
  completed: number;
  percentage: number;
}

/**
 * Calculate checklist completion statistics from markdown text
 */
export function computeTaskProgress(markdown: string): TaskProgress {
  if (!markdown) {
    return { total: 0, completed: 0, percentage: 0 };
  }

  const taskRegex = /^\s*-\s*\[([ xX])\]\s+(.*)$/gm;
  let total = 0;
  let completed = 0;
  let match;

  while ((match = taskRegex.exec(markdown)) !== null) {
    total++;
    if (match[1]?.toLowerCase() === "x") {
      completed++;
    }
  }

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percentage };
}

/**
 * Generate a clean markdown table snippet with headers
 */
export function generateMarkdownTable(rows: number = 3, cols: number = 3): string {
  const headerCols = Array.from({ length: cols }, (_, i) => `Header ${i + 1}`).join(" | ");
  const separatorCols = Array.from({ length: cols }, () => "---").join(" | ");
  
  let table = `| ${headerCols} |\n| ${separatorCols} |\n`;
  for (let r = 0; r < rows; r++) {
    const rowCols = Array.from({ length: cols }, (_, c) => `Row ${r + 1} Col ${c + 1}`).join(" | ");
    table += `| ${rowCols} |\n`;
  }
  return table;
}

/**
 * Insert markdown formatting tokens around or at cursor position
 */
export function insertMarkdownFormat(
  currentText: string,
  start: number,
  end: number,
  type:
    | "bold"
    | "italic"
    | "strike"
    | "h1"
    | "h2"
    | "h3"
    | "quote"
    | "code"
    | "codeblock"
    | "ul"
    | "ol"
    | "task"
    | "link"
    | "hr"
): { newText: string; newCursor: number } {
  const selected = currentText.substring(start, end);
  const before = currentText.substring(0, start);
  const after = currentText.substring(end);

  switch (type) {
    case "bold": {
      const wrapped = `**${selected || "bold text"}**`;
      return {
        newText: before + wrapped + after,
        newCursor: start + wrapped.length,
      };
    }
    case "italic": {
      const wrapped = `*${selected || "italic text"}*`;
      return {
        newText: before + wrapped + after,
        newCursor: start + wrapped.length,
      };
    }
    case "strike": {
      const wrapped = `~~${selected || "strikethrough"}~~`;
      return {
        newText: before + wrapped + after,
        newCursor: start + wrapped.length,
      };
    }
    case "h1": {
      const replacement = `\n# ${selected || "Heading 1"}\n`;
      return {
        newText: before + replacement + after,
        newCursor: start + replacement.length,
      };
    }
    case "h2": {
      const replacement = `\n## ${selected || "Heading 2"}\n`;
      return {
        newText: before + replacement + after,
        newCursor: start + replacement.length,
      };
    }
    case "h3": {
      const replacement = `\n### ${selected || "Heading 3"}\n`;
      return {
        newText: before + replacement + after,
        newCursor: start + replacement.length,
      };
    }
    case "quote": {
      const replacement = `\n> ${selected || "Quote text"}\n`;
      return {
        newText: before + replacement + after,
        newCursor: start + replacement.length,
      };
    }
    case "code": {
      const wrapped = `\`${selected || "code"}\``;
      return {
        newText: before + wrapped + after,
        newCursor: start + wrapped.length,
      };
    }
    case "codeblock": {
      const replacement = `\n\`\`\`javascript\n${selected || "// Code goes here"}\n\`\`\`\n`;
      return {
        newText: before + replacement + after,
        newCursor: start + replacement.length,
      };
    }
    case "ul": {
      const replacement = `\n- ${selected || "List item"}\n- List item 2\n`;
      return {
        newText: before + replacement + after,
        newCursor: start + replacement.length,
      };
    }
    case "ol": {
      const replacement = `\n1. ${selected || "First item"}\n2. Second item\n`;
      return {
        newText: before + replacement + after,
        newCursor: start + replacement.length,
      };
    }
    case "task": {
      const replacement = `\n- [ ] ${selected || "New task item"}\n- [x] Completed task\n`;
      return {
        newText: before + replacement + after,
        newCursor: start + replacement.length,
      };
    }
    case "link": {
      const replacement = `[${selected || "Link title"}](https://mindkit.dev)`;
      return {
        newText: before + replacement + after,
        newCursor: start + replacement.length,
      };
    }
    case "hr": {
      const replacement = `\n\n---\n\n`;
      return {
        newText: before + replacement + after,
        newCursor: start + replacement.length,
      };
    }
    default:
      return { newText: currentText, newCursor: start };
  }
}

/**
 * Pure client-side HTML renderer for markdown text
 * Safely parses formatting, code, lists, checklists, tables, blockquotes, and links
 */
export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  // Normalize line endings
  const lines = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const htmlParts: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let inTable = false;
  let tableRows: string[] = [];

  const flushList = () => {
    if (inList) {
      htmlParts.push(`</${inList}>`);
      inList = null;
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      let tableHtml = `<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-slate-300 dark:border-slate-700 text-sm">`;
      // Check if row 1 is header and row 2 is separator
      const row0 = tableRows[0];
      const row1 = tableRows[1];
      if (tableRows.length >= 2 && row0 && row1 && row1.includes("---")) {
        const headers = row0
          .split("|")
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map((h) => `<th class="border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2 font-semibold text-left">${renderInline(h.trim())}</th>`)
          .join("");
        tableHtml += `<thead><tr>${headers}</tr></thead><tbody>`;

        for (let i = 2; i < tableRows.length; i++) {
          const row = tableRows[i];
          if (!row) continue;
          const cells = row
            .split("|")
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            .map((c) => `<td class="border border-slate-300 dark:border-slate-700 p-2">${renderInline(c.trim())}</td>`)
            .join("");
          tableHtml += `<tr>${cells}</tr>`;
        }
        tableHtml += `</tbody>`;
      } else {
        tableHtml += `<tbody>`;
        for (const row of tableRows) {
          if (!row) continue;
          const cells = row
            .split("|")
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            .map((c) => `<td class="border border-slate-300 dark:border-slate-700 p-2">${renderInline(c.trim())}</td>`)
            .join("");
          tableHtml += `<tr>${cells}</tr>`;
        }
        tableHtml += `</tbody>`;
      }
      tableHtml += `</table></div>`;
      htmlParts.push(tableHtml);
      tableRows = [];
      inTable = false;
    }
  };

  const renderInline = (str: string): string => {
    return str
      // HTML escape basic
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Strikethrough
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      // Inline Code
      .replace(/`([^`]+)`/g, "<code class=\"px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-rose-500\">$1</code>")
      // Links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;

    // Code blocks ```
    if (line.trim().startsWith("```")) {
      flushList();
      flushTable();
      if (inCodeBlock) {
        // End code block
        const codeContent = codeBuffer.join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        htmlParts.push(`<pre class="bg-slate-900 text-slate-100 p-4 rounded-lg my-3 overflow-x-auto text-xs font-mono"><code>${codeContent}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Tables: lines starting and ending with |
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      flushList();
      inTable = true;
      tableRows.push(line.trim());
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    if (line.startsWith("# ")) {
      flushList();
      htmlParts.push(`<h1 class="text-2xl font-bold mt-6 mb-3 pb-2 border-b text-slate-900 dark:text-slate-100">${renderInline(line.substring(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      htmlParts.push(`<h2 class="text-xl font-bold mt-5 mb-2 pb-1 border-b text-slate-900 dark:text-slate-100">${renderInline(line.substring(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      htmlParts.push(`<h3 class="text-lg font-bold mt-4 mb-2 text-slate-900 dark:text-slate-100">${renderInline(line.substring(4))}</h3>`);
      continue;
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      flushList();
      htmlParts.push(`<hr class="my-6 border-slate-300 dark:border-slate-700" />`);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      flushList();
      htmlParts.push(`<blockquote class="border-l-4 border-blue-500 pl-4 py-1 my-3 italic text-slate-600 dark:text-slate-300 bg-blue-50/30 dark:bg-blue-950/20 rounded-r">${renderInline(line.substring(2))}</blockquote>`);
      continue;
    }

    // Checklist task item: - [ ] or - [x]
    const taskMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s+(.*)$/);
    if (taskMatch && taskMatch[2] && taskMatch[3]) {
      if (inList !== "ul") {
        flushList();
        htmlParts.push(`<ul class="space-y-1.5 my-3 list-none">`);
        inList = "ul";
      }
      const isChecked = taskMatch[2].toLowerCase() === "x";
      htmlParts.push(`
        <li class="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
          <input type="checkbox" ${isChecked ? "checked" : ""} disabled class="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" />
          <span class="${isChecked ? "line-through text-slate-400 dark:text-slate-500" : ""}">${renderInline(taskMatch[3])}</span>
        </li>
      `);
      continue;
    }

    // Bullet List: - item or * item
    if (line.match(/^(\s*)[-*]\s+(.*)$/)) {
      if (inList !== "ul") {
        flushList();
        htmlParts.push(`<ul class="list-disc pl-6 space-y-1 my-3 text-slate-800 dark:text-slate-200 text-sm">`);
        inList = "ul";
      }
      const content = line.replace(/^(\s*)[-*]\s+/, "");
      htmlParts.push(`<li>${renderInline(content)}</li>`);
      continue;
    }

    // Numbered List: 1. item
    if (line.match(/^(\s*)\d+\.\s+(.*)$/)) {
      if (inList !== "ol") {
        flushList();
        htmlParts.push(`<ol class="list-decimal pl-6 space-y-1 my-3 text-slate-800 dark:text-slate-200 text-sm">`);
        inList = "ol";
      }
      const content = line.replace(/^(\s*)\d+\.\s+/, "");
      htmlParts.push(`<li>${renderInline(content)}</li>`);
      continue;
    }

    // Blank line
    if (!line.trim()) {
      flushList();
      continue;
    }

    // Normal Paragraph
    flushList();
    htmlParts.push(`<p class="my-2 leading-relaxed text-sm text-slate-800 dark:text-slate-200">${renderInline(line)}</p>`);
  }

  flushList();
  flushTable();

  return htmlParts.join("\n");
}

