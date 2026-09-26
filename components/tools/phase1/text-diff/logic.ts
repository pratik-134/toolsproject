/**
 * Pure Text & Code Diff Comparison Engine (LCS Line Diff)
 * Zero external libraries, in-browser Myers/LCS diff algorithm.
 */

export type DiffLineType = "unchanged" | "added" | "removed";

export interface DiffLine {
  type: DiffLineType;
  text: string;
  originalLineNum?: number;
  modifiedLineNum?: number;
}

export interface DiffOptions {
  ignoreWhitespace?: boolean;
  caseSensitive?: boolean;
}

export interface DiffResult {
  lines: DiffLine[];
  additions: number;
  deletions: number;
  unchanged: number;
}

/**
 * Standard Longest Common Subsequence (LCS) line diff algorithm
 */
export function computeDiff(
  originalText: string,
  modifiedText: string,
  options: DiffOptions = {}
): DiffResult {
  const { ignoreWhitespace = false, caseSensitive = true } = options;

  const origLines = originalText.split(/\r?\n/);
  const modLines = modifiedText.split(/\r?\n/);

  const normalize = (line: string): string => {
    let s = line;
    if (ignoreWhitespace) s = s.trim();
    if (!caseSensitive) s = s.toLowerCase();
    return s;
  };

  const n = origLines.length;
  const m = modLines.length;

  // LCS DP Matrix
  // Use flat typed or 2D array
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const oLine = normalize(origLines[i - 1] ?? "");
    for (let j = 1; j <= m; j++) {
      const mLine = normalize(modLines[j - 1] ?? "");
      if (oLine === mLine) {
        dp[i]![j] = (dp[i - 1]![j - 1] ?? 0) + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j] ?? 0, dp[i]![j - 1] ?? 0);
      }
    }
  }

  // Backtrack to build diff lines
  let i = n;
  let j = m;
  const reversedDiff: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalize(origLines[i - 1] ?? "") === normalize(modLines[j - 1] ?? "")) {
      reversedDiff.push({
        type: "unchanged",
        text: origLines[i - 1] ?? "",
        originalLineNum: i,
        modifiedLineNum: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || (dp[i]![j - 1] ?? 0) >= (dp[i - 1]![j] ?? 0))) {
      reversedDiff.push({
        type: "added",
        text: modLines[j - 1] ?? "",
        modifiedLineNum: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || (dp[i]![j - 1] ?? 0) < (dp[i - 1]![j] ?? 0))) {
      reversedDiff.push({
        type: "removed",
        text: origLines[i - 1] ?? "",
        originalLineNum: i,
      });
      i--;
    }
  }

  const lines = reversedDiff.reverse();

  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  for (const line of lines) {
    if (line.type === "added") additions++;
    else if (line.type === "removed") deletions++;
    else unchanged++;
  }

  return {
    lines,
    additions,
    deletions,
    unchanged,
  };
}
