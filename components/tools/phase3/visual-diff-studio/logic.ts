/**
 * Multi-Format Visual Diff Studio — Pure Domain Logic
 * Synchronized side-by-side & unified diff calculation with character-level micro-diffs
 * 100% In-Browser Deterministic Diff Algorithm (Cleartrix Invariant #1)
 */

export interface DiffLine {
  lineNumLeft?: number;
  lineNumRight?: number;
  textLeft?: string;
  textRight?: string;
  type: "unchanged" | "added" | "removed" | "modified";
  charDiffsLeft?: Array<{ text: string; isChanged: boolean }>;
  charDiffsRight?: Array<{ text: string; isChanged: boolean }>;
}

export interface VisualDiffResult {
  lines: DiffLine[];
  additions: number;
  deletions: number;
  modifications: number;
  similarityRatio: number;
}

/**
 * Computes character-level differences between two strings for micro-highlighting
 */
export function computeCharDiff(
  str1: string,
  str2: string
): {
  left: Array<{ text: string; isChanged: boolean }>;
  right: Array<{ text: string; isChanged: boolean }>;
} {
  // Simple word/token segmentation for micro diff
  const words1 = str1.split(/(\s+|[^\w\s])/);
  const words2 = str2.split(/(\s+|[^\w\s])/);

  const left = words1.map((w) => ({
    text: w,
    isChanged: !str2.includes(w) && w.trim().length > 0,
  }));

  const right = words2.map((w) => ({
    text: w,
    isChanged: !str1.includes(w) && w.trim().length > 0,
  }));

  return { left, right };
}

/**
 * Computes line-by-line visual diff with side-by-side synchronization
 */
export function computeVisualDiff(
  originalText: string,
  modifiedText: string,
  options: { ignoreWhitespace?: boolean; ignoreCase?: boolean } = {}
): VisualDiffResult {
  let linesOrig = originalText.split(/\r?\n/);
  let linesMod = modifiedText.split(/\r?\n/);

  const normalize = (line: string) => {
    let s = line;
    if (options.ignoreWhitespace) s = s.replace(/\s+/g, " ").trim();
    if (options.ignoreCase) s = s.toLowerCase();
    return s;
  };

  const lines: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  let modifications = 0;

  const maxLen = Math.max(linesOrig.length, linesMod.length);
  let i = 0;
  let j = 0;

  while (i < linesOrig.length || j < linesMod.length) {
    const orig = linesOrig[i];
    const mod = linesMod[j];

    if (orig !== undefined && mod !== undefined) {
      if (normalize(orig) === normalize(mod)) {
        lines.push({
          lineNumLeft: i + 1,
          lineNumRight: j + 1,
          textLeft: orig,
          textRight: mod,
          type: "unchanged",
        });
        i++;
        j++;
      } else {
        // Line modified with char-level micro diff
        const charDiff = computeCharDiff(orig, mod);
        lines.push({
          lineNumLeft: i + 1,
          lineNumRight: j + 1,
          textLeft: orig,
          textRight: mod,
          type: "modified",
          charDiffsLeft: charDiff.left,
          charDiffsRight: charDiff.right,
        });
        modifications++;
        i++;
        j++;
      }
    } else if (orig !== undefined) {
      // Line removed
      lines.push({
        lineNumLeft: i + 1,
        textLeft: orig,
        type: "removed",
      });
      deletions++;
      i++;
    } else if (mod !== undefined) {
      // Line added
      lines.push({
        lineNumRight: j + 1,
        textRight: mod,
        type: "added",
      });
      additions++;
      j++;
    }
  }

  const totalLines = Math.max(1, lines.length);
  const unchangedCount = lines.filter((l) => l.type === "unchanged").length;
  const similarityRatio = Math.round((unchangedCount / totalLines) * 100);

  return {
    lines,
    additions,
    deletions,
    modifications,
    similarityRatio,
  };
}

/**
 * Generates unified Git-style patch string
 */
export function generateUnifiedPatch(result: VisualDiffResult, filename: string = "file.txt"): string {
  const header = `--- a/${filename}\n+++ b/${filename}\n@@ -1,${result.lines.length} +1,${result.lines.length} @@\n`;
  const body = result.lines
    .map((l) => {
      if (l.type === "added") return `+ ${l.textRight ?? ""}`;
      if (l.type === "removed") return `- ${l.textLeft ?? ""}`;
      if (l.type === "modified") return `- ${l.textLeft ?? ""}\n+ ${l.textRight ?? ""}`;
      return `  ${l.textLeft ?? ""}`;
    })
    .join("\n");
  return header + body;
}
