/**
 * Pure Duplicate Line Remover and List Sorter Logic
 * Zero dependencies, pure client-side execution.
 */

export type SortOrder = "none" | "asc" | "desc" | "length-asc" | "length-desc" | "reverse";

export interface DeduplicateOptions {
  caseSensitive?: boolean;
  trimWhitespace?: boolean;
  removeEmptyLines?: boolean;
  sortOrder?: SortOrder;
}

export interface DeduplicateResult {
  output: string;
  originalCount: number;
  uniqueCount: number;
  duplicatesRemoved: number;
  emptyLinesRemoved: number;
}

export function deduplicateLines(
  input: string,
  options: DeduplicateOptions = {}
): DeduplicateResult {
  if (!input) {
    return {
      output: "",
      originalCount: 0,
      uniqueCount: 0,
      duplicatesRemoved: 0,
      emptyLinesRemoved: 0,
    };
  }

  const {
    caseSensitive = true,
    trimWhitespace = true,
    removeEmptyLines = true,
    sortOrder = "none",
  } = options;

  // Split lines (handling \r\n and \n)
  const rawLines = input.split(/\r?\n/);
  const originalCount = rawLines.length;

  let emptyLinesRemoved = 0;
  const processedLines: string[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i] ?? "";
    if (trimWhitespace) {
      line = line.trim();
    }

    if (!line) {
      if (removeEmptyLines) {
        emptyLinesRemoved++;
        continue;
      }
    }

    const key = caseSensitive ? line : line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      processedLines.push(line);
    }
  }

  // Apply sorting if requested
  if (sortOrder === "asc") {
    processedLines.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: caseSensitive ? "case" : "base" }));
  } else if (sortOrder === "desc") {
    processedLines.sort((a, b) => b.localeCompare(a, undefined, { sensitivity: caseSensitive ? "case" : "base" }));
  } else if (sortOrder === "length-asc") {
    processedLines.sort((a, b) => a.length - b.length || a.localeCompare(b));
  } else if (sortOrder === "length-desc") {
    processedLines.sort((a, b) => b.length - a.length || a.localeCompare(b));
  } else if (sortOrder === "reverse") {
    processedLines.reverse();
  }

  const uniqueCount = processedLines.length;
  const duplicatesRemoved = originalCount - uniqueCount - emptyLinesRemoved;

  return {
    output: processedLines.join("\n"),
    originalCount,
    uniqueCount,
    duplicatesRemoved: Math.max(0, duplicatesRemoved),
    emptyLinesRemoved,
  };
}
