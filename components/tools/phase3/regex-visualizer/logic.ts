/**
 * Interactive RegEx Visualizer & Rail Diagram — Pure Domain Logic
 * 100% In-Browser AST tokenization, rail diagram nodes & live regex match evaluation
 * Zero External Network Calls, Zero Server Uploads (Cleartrix Invariant #1)
 */

export interface RegexNode {
  id: string;
  type: "literal" | "character-class" | "group" | "quantifier" | "anchor" | "alternation";
  label: string;
  description: string;
  raw: string;
}

export interface RegexMatch {
  index: number;
  match: string;
  groups: string[];
}

/**
 * Tokenizes regex string into structured railroad explanation nodes
 */
export function parseRegexExplanation(pattern: string): RegexNode[] {
  const nodes: RegexNode[] = [];
  if (!pattern) return nodes;

  let i = 0;
  while (i < pattern.length) {
    const char = pattern[i];

    if (char === "^") {
      nodes.push({ id: `n_${i}`, type: "anchor", label: "Start Anchor", description: "Matches beginning of line/string", raw: "^" });
      i++;
    } else if (char === "$") {
      nodes.push({ id: `n_${i}`, type: "anchor", label: "End Anchor", description: "Matches end of line/string", raw: "$" });
      i++;
    } else if (char === "(") {
      const close = pattern.indexOf(")", i);
      const groupContent = close !== -1 ? pattern.substring(i, close + 1) : char;
      nodes.push({ id: `n_${i}`, type: "group", label: "Capture Group", description: "Groups sub-expressions for backreferencing", raw: groupContent });
      i = close !== -1 ? close + 1 : i + 1;
    } else if (char === "[") {
      const close = pattern.indexOf("]", i);
      const classContent = close !== -1 ? pattern.substring(i, close + 1) : char;
      nodes.push({ id: `n_${i}`, type: "character-class", label: "Character Set", description: "Matches any single character in brackets", raw: classContent });
      i = close !== -1 ? close + 1 : i + 1;
    } else if (char === "+" || char === "*" || char === "?") {
      const quantMap: Record<string, string> = {
        "+": "One or more times (1+)",
        "*": "Zero or more times (0+)",
        "?": "Optional / zero or once (0-1)",
      };
      nodes.push({ id: `n_${i}`, type: "quantifier", label: "Quantifier", description: quantMap[char] || "Repeats preceding item", raw: char });
      i++;
    } else if (char === "|") {
      nodes.push({ id: `n_${i}`, type: "alternation", label: "Alternation (OR)", description: "Matches expression before OR after", raw: "|" });
      i++;
    } else if (char === "\\") {
      const next = pattern[i + 1] || "";
      const escaped = `\\${next}`;
      nodes.push({ id: `n_${i}`, type: "character-class", label: "Escaped Token", description: `Matches escaped token ${escaped}`, raw: escaped });
      i += 2;
    } else if (char) {
      nodes.push({ id: `n_${i}`, type: "literal", label: `Literal "${char}"`, description: `Matches exact character '${char}'`, raw: char });
      i++;
    } else {
      i++;
    }
  }

  return nodes;
}

/**
 * Executes safe evaluation of RegExp against sample string
 */
export function executeRegexMatch(
  pattern: string,
  flags: string,
  testString: string
): { isValid: boolean; error?: string; matches: RegexMatch[] } {
  try {
    const rx = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    const matches: RegexMatch[] = [];
    let match: RegExpExecArray | null;

    let iterations = 0;
    while ((match = rx.exec(testString)) !== null && iterations < 500) {
      matches.push({
        index: match.index,
        match: match[0],
        groups: match.slice(1),
      });
      if (!rx.global) break;
      if (match.index === rx.lastIndex) rx.lastIndex++;
      iterations++;
    }

    return { isValid: true, matches };
  } catch (err: any) {
    return { isValid: false, error: err.message || "Invalid regular expression", matches: [] };
  }
}
