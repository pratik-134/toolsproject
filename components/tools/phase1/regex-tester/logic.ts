/**
 * Client-Side JavaScript Regular Expression Engine & Debugger
 * Zero network dependencies, pure client-side regex evaluation.
 */

export interface RegexMatchItem {
  index: number;
  match: string;
  groups?: Record<string, string>;
  captured: string[];
}

export interface RegexEvaluationResult {
  isValid: boolean;
  errorMessage?: string;
  matches: RegexMatchItem[];
  matchCount: number;
  replaceResult?: string;
  executionTimeMs: number;
}

export interface RegexOptions {
  pattern: string;
  flags: string; // e.g. "gimsuy"
  testString: string;
  replacementPattern?: string;
}

export function testRegex(options: RegexOptions): RegexEvaluationResult {
  const { pattern, flags, testString, replacementPattern } = options;

  if (!pattern) {
    return {
      isValid: true,
      matches: [],
      matchCount: 0,
      replaceResult: testString,
      executionTimeMs: 0,
    };
  }

  const startTime = performance.now();

  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatchItem[] = [];

    if (flags.includes("g")) {
      let match: RegExpExecArray | null;
      let iterations = 0;
      const MAX_ITERATIONS = 5000;

      while ((match = regex.exec(testString)) !== null && iterations < MAX_ITERATIONS) {
        iterations++;
        const captured = match.slice(1);
        matches.push({
          index: match.index,
          match: match[0],
          groups: match.groups ? { ...match.groups } : undefined,
          captured,
        });

        // Zero-length match safeguard
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } else {
      const match = regex.exec(testString);
      if (match) {
        matches.push({
          index: match.index,
          match: match[0],
          groups: match.groups ? { ...match.groups } : undefined,
          captured: match.slice(1),
        });
      }
    }

    let replaceResult: string | undefined;
    if (replacementPattern !== undefined) {
      const replaceRegex = new RegExp(pattern, flags);
      replaceResult = testString.replace(replaceRegex, replacementPattern);
    }

    const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

    return {
      isValid: true,
      matches,
      matchCount: matches.length,
      replaceResult,
      executionTimeMs,
    };
  } catch (err: unknown) {
    const executionTimeMs = Number((performance.now() - startTime).toFixed(2));
    const msg = err instanceof Error ? err.message : "Invalid regular expression";
    return {
      isValid: false,
      errorMessage: msg,
      matches: [],
      matchCount: 0,
      executionTimeMs,
    };
  }
}
