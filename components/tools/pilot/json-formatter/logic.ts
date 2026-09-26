export interface JsonFormatOptions {
  indent: number | "tab" | "minify";
  sortKeys?: boolean;
}

export interface JsonFormatResult {
  success: boolean;
  output: string;
  error?: string;
  stats?: {
    sizeBytes: number;
    keysCount: number;
    depth: number;
  };
}

function calculateDepthAndKeys(obj: unknown, currentDepth = 1): { depth: number; keys: number } {
  if (obj === null || typeof obj !== "object") {
    return { depth: currentDepth, keys: 0 };
  }

  let maxDepth = currentDepth;
  let totalKeys = 0;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const res = calculateDepthAndKeys(item, currentDepth + 1);
      if (res.depth > maxDepth) maxDepth = res.depth;
      totalKeys += res.keys;
    }
  } else {
    const keys = Object.keys(obj as Record<string, unknown>);
    totalKeys += keys.length;
    for (const key of keys) {
      const res = calculateDepthAndKeys((obj as Record<string, unknown>)[key], currentDepth + 1);
      if (res.depth > maxDepth) maxDepth = res.depth;
      totalKeys += res.keys;
    }
  }

  return { depth: maxDepth, keys: totalKeys };
}

function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);

  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  for (const key of keys) {
    sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
  }
  return sorted;
}

export function formatJson(input: string, options: JsonFormatOptions): JsonFormatResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: true, output: "", stats: { sizeBytes: 0, keysCount: 0, depth: 0 } };
  }

  try {
    let parsed = JSON.parse(trimmed);
    if (options.sortKeys) {
      parsed = sortObjectKeys(parsed);
    }

    let indentVal: string | number = 2;
    if (options.indent === "tab") indentVal = "\t";
    else if (options.indent === "minify") indentVal = 0;
    else indentVal = options.indent;

    const output = indentVal === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indentVal);
    const { depth, keys } = calculateDepthAndKeys(parsed);

    return {
      success: true,
      output,
      stats: {
        sizeBytes: new TextEncoder().encode(output).length,
        keysCount: keys,
        depth,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid JSON format";
    return {
      success: false,
      output: input,
      error: msg,
    };
  }
}
