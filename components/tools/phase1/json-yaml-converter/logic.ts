/**
 * Pure Client-Side JSON <-> YAML Converter Logic
 * Zero external libraries, robust recursive YAML serializer and line-indent parser.
 */

export interface YamlOptions {
  indentSize?: 2 | 4;
}

/**
 * Serialize JS object / value to YAML string
 */
export function jsonToYaml(input: unknown, options: YamlOptions = {}): string {
  const { indentSize = 2 } = options;
  const indent = " ".repeat(indentSize);

  let data = input;
  if (typeof input === "string") {
    try {
      data = JSON.parse(input);
    } catch {
      throw new Error("Invalid JSON: unable to parse input syntax.");
    }
  }

  function serialize(val: unknown, depth: number): string {
    const curIndent = indent.repeat(depth);

    if (val === null || val === undefined) {
      return "null";
    }

    if (typeof val === "boolean" || typeof val === "number") {
      return String(val);
    }

    if (typeof val === "string") {
      if (val.includes("\n")) {
        const lines = val.split("\n").map((l) => `${curIndent}${indent}${l}`).join("\n");
        return `|\n${lines}`;
      }
      if (
        val === "" ||
        val === "true" ||
        val === "false" ||
        val === "null" ||
        /^[\d.]+$/.test(val) ||
        /[\s:#\{\}\[\],&*?|<>=!%@`]/.test(val)
      ) {
        return JSON.stringify(val);
      }
      return val;
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return "[]";
      return val
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            const inner = serialize(item, depth + 1).trimStart();
            return `${curIndent}- ${inner}`;
          }
          return `${curIndent}- ${serialize(item, depth + 1)}`;
        })
        .join("\n");
    }

    if (typeof val === "object") {
      const keys = Object.keys(val as Record<string, unknown>);
      if (keys.length === 0) return "{}";

      return keys
        .map((k) => {
          const itemVal = (val as Record<string, unknown>)[k];
          if (typeof itemVal === "object" && itemVal !== null) {
            const isArr = Array.isArray(itemVal);
            if (isArr && itemVal.length === 0) {
              return `${curIndent}${k}: []`;
            }
            if (!isArr && Object.keys(itemVal).length === 0) {
              return `${curIndent}${k}: {}`;
            }
            return `${curIndent}${k}:\n${serialize(itemVal, depth + 1)}`;
          }
          return `${curIndent}${k}: ${serialize(itemVal, depth)}`;
        })
        .join("\n");
    }

    return String(val);
  }

  return serialize(data, 0);
}

/**
 * Lightweight YAML parser for common YAML configurations & datasets
 */
export function yamlToJson(yamlString: string, options: YamlOptions = {}): string {
  const { indentSize = 2 } = options;
  const trimmed = yamlString.trim();
  if (!trimmed) return "{}";

  // First check if it's already JSON
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, indentSize);
    } catch {
      // continue to YAML parser
    }
  }

  const lines = trimmed.split(/\r?\n/).filter((l) => {
    const t = l.trim();
    return t.length > 0 && !t.startsWith("#");
  });

  interface LineToken {
    indent: number;
    text: string;
  }

  const tokens: LineToken[] = lines.map((line) => {
    const match = line.match(/^(\s*)(.*)$/);
    const indent = match ? match[1]!.length : 0;
    const text = match ? match[2]! : line;
    return { indent, text };
  });

  let lineIdx = 0;

  function parseBlock(baseIndent: number): unknown {
    if (lineIdx >= tokens.length) return null;

    const firstToken = tokens[lineIdx]!;
    const isArray = firstToken.text.startsWith("-");

    if (isArray) {
      const arr: unknown[] = [];
      while (lineIdx < tokens.length) {
        const token = tokens[lineIdx]!;
        if (token.indent < baseIndent) break;

        if (token.text.startsWith("-")) {
          const subText = token.text.slice(1).trim();
          lineIdx++;

          if (!subText) {
            // Nested structure under list item
            if (lineIdx < tokens.length && tokens[lineIdx]!.indent > token.indent) {
              arr.push(parseBlock(tokens[lineIdx]!.indent));
            } else {
              arr.push(null);
            }
          } else if (subText.includes(":") && !subText.startsWith("{") && !subText.startsWith("[")) {
            // Inline object under list item: "- key: val"
            const obj: Record<string, unknown> = {};
            const [k, ...rest] = subText.split(":");
            const key = k!.trim();
            const val = rest.join(":").trim();
            obj[key] = parseScalar(val);

            // check if following lines belong to this object
            while (lineIdx < tokens.length && tokens[lineIdx]!.indent > token.indent) {
              const cur = tokens[lineIdx]!;
              if (cur.text.includes(":")) {
                const [ck, ...crest] = cur.text.split(":");
                obj[ck!.trim()] = parseScalar(crest.join(":").trim());
                lineIdx++;
              } else {
                break;
              }
            }
            arr.push(obj);
          } else {
            arr.push(parseScalar(subText));
          }
        } else {
          break;
        }
      }
      return arr;
    } else {
      // Object mapping
      const obj: Record<string, unknown> = {};
      while (lineIdx < tokens.length) {
        const token = tokens[lineIdx]!;
        if (token.indent < baseIndent) break;

        const colonIdx = token.text.indexOf(":");
        if (colonIdx === -1) {
          lineIdx++;
          continue;
        }

        const key = token.text.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, "");
        const rawVal = token.text.slice(colonIdx + 1).trim();
        lineIdx++;

        if (!rawVal) {
          // Nested block
          if (lineIdx < tokens.length && tokens[lineIdx]!.indent > token.indent) {
            obj[key] = parseBlock(tokens[lineIdx]!.indent);
          } else {
            obj[key] = null;
          }
        } else {
          obj[key] = parseScalar(rawVal);
        }
      }
      return obj;
    }
  }

  function parseScalar(val: string): unknown {
    if (val === "true" || val === "True") return true;
    if (val === "false" || val === "False") return false;
    if (val === "null" || val === "~" || val === "") return null;
    if (/^-?\d+$/.test(val)) return parseInt(val, 10);
    if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      return val.slice(1, -1);
    }
    return val;
  }

  const parsed = parseBlock(0);
  return JSON.stringify(parsed, null, indentSize);
}
