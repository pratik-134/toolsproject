/**
 * Pure Client-Side JSON <-> XML Converter Logic
 * Zero external libraries, robust recursive XML serializer and parser.
 */

export interface JsonToXmlOptions {
  rootName?: string;
  indent?: 2 | 4 | "minified";
  declaration?: boolean;
}

export interface XmlToJsonOptions {
  indent?: 2 | 4;
}

/**
 * Escapes XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Converts a JS/JSON value to XML string
 */
export function jsonToXml(
  jsonInput: unknown,
  options: JsonToXmlOptions = {}
): string {
  const { rootName = "root", indent = 2, declaration = true } = options;

  let parsed: unknown = jsonInput;
  if (typeof jsonInput === "string") {
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      throw new Error("Invalid JSON input: unable to parse syntax.");
    }
  }

  const space = indent === "minified" ? "" : " ".repeat(indent);
  const newline = indent === "minified" ? "" : "\n";

  function serializeNode(name: string, value: unknown, depth: number): string {
    const curIndent = indent === "minified" ? "" : space.repeat(depth);

    if (value === null || value === undefined) {
      return `${curIndent}<${name}/>`;
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => serializeNode(name, item, depth))
        .join(newline);
    }

    if (typeof value === "object") {
      const keys = Object.keys(value as Record<string, unknown>);
      if (keys.length === 0) {
        return `${curIndent}<${name}/>`;
      }

      const children = keys
        .map((k) =>
          serializeNode(k, (value as Record<string, unknown>)[k], depth + 1)
        )
        .join(newline);

      return `${curIndent}<${name}>${newline}${children}${newline}${curIndent}</${name}>`;
    }

    // Primitive value (string, number, boolean)
    return `${curIndent}<${name}>${escapeXml(String(value))}</${name}>`;
  }

  let xmlBody = "";
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    const rootKeys = Object.keys(parsed as Record<string, unknown>);
    if (rootKeys.length === 1 && typeof (parsed as Record<string, unknown>)[rootKeys[0]!] === "object") {
      // Natural single root
      const singleRoot = rootKeys[0]!;
      xmlBody = serializeNode(singleRoot, (parsed as Record<string, unknown>)[singleRoot], 0);
    } else {
      xmlBody = serializeNode(rootName, parsed, 0);
    }
  } else {
    xmlBody = serializeNode(rootName, parsed, 0);
  }

  const decl = declaration ? `<?xml version="1.0" encoding="UTF-8"?>${newline}` : "";
  return decl + xmlBody;
}

/**
 * Lightweight XML to JSON parser using standard DOMParser in browser
 * and pure regex fallback in Node.js test environment
 */
export function xmlToJson(
  xmlInput: string,
  options: XmlToJsonOptions = {}
): string {
  const { indent = 2 } = options;
  const trimmed = xmlInput.trim();
  if (!trimmed) return "{}";

  // Check if DOMParser is available (Browser)
  if (typeof window !== "undefined" && typeof window.DOMParser !== "undefined") {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(trimmed, "application/xml");

    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      throw new Error(`XML Parse Error: ${parserError.textContent?.slice(0, 150) ?? "Invalid XML"}`);
    }

    const domToObj = (node: Node): unknown => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        return text ? parseVal(text) : undefined;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node as Element;
        const obj: Record<string, unknown> = {};

        // Attributes
        if (elem.attributes.length > 0) {
          for (let i = 0; i < elem.attributes.length; i++) {
            const attr = elem.attributes[i];
            if (attr) {
              obj[`@_${attr.name}`] = attr.value;
            }
          }
        }

        // Child Nodes
        const childNodes = Array.from(elem.childNodes);
        const elementChildren = childNodes.filter((c) => c.nodeType === Node.ELEMENT_NODE);

        if (elementChildren.length === 0) {
          const textContent = elem.textContent?.trim();
          if (elem.attributes.length === 0) {
            return textContent ? parseVal(textContent) : "";
          } else {
            if (textContent) obj["#text"] = parseVal(textContent);
            return obj;
          }
        }

        for (const child of elementChildren) {
          const childElem = child as Element;
          const childName = childElem.nodeName;
          const childVal = domToObj(childElem);

          if (obj[childName] !== undefined) {
            if (Array.isArray(obj[childName])) {
              (obj[childName] as unknown[]).push(childVal);
            } else {
              obj[childName] = [obj[childName], childVal];
            }
          } else {
            obj[childName] = childVal;
          }
        }

        return obj;
      }

      return undefined;
    }

    const rootElem = doc.documentElement;
    const resultObj = { [rootElem.nodeName]: domToObj(rootElem) };
    return JSON.stringify(resultObj, null, indent);
  }

  // Fallback / Node test environment XML parser
  return fallbackXmlToJson(trimmed, indent);
}

function parseVal(val: string): unknown {
  if (val === "true") return true;
  if (val === "false") return false;
  if (val === "null") return null;
  const num = Number(val);
  if (!isNaN(num) && !val.includes(" ")) return num;
  return val;
}

/**
 * Robust Regex Tokenizer for XML to JSON in Node.js scripts / testing
 */
function fallbackXmlToJson(xml: string, indent: number): string {
  // Strip XML declaration and comments
  const clean = xml
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  // Simple token regex matching opening, closing tags and content
  function parseSimple(xmlChunk: string): unknown {
    const trimmedChunk = xmlChunk.trim();
    if (!trimmedChunk.startsWith("<")) {
      return parseVal(trimmedChunk);
    }

    const tagRegex = /<([a-zA-Z0-9_\-]+)([^>]*)>([\s\S]*?)<\/\1>|<([a-zA-Z0-9_\-]+)([^>]*)\/>/g;
    const res: Record<string, unknown> = {};
    let match: RegExpExecArray | null;
    let found = false;

    while ((match = tagRegex.exec(trimmedChunk)) !== null) {
      found = true;
      const tagName = match[1] || match[4] || "";
      const innerContent = match[3] ?? "";

      const childVal = innerContent.includes("<")
        ? parseSimple(innerContent)
        : parseVal(innerContent.trim());

      if (res[tagName] !== undefined) {
        if (Array.isArray(res[tagName])) {
          (res[tagName] as unknown[]).push(childVal);
        } else {
          res[tagName] = [res[tagName], childVal];
        }
      } else {
        res[tagName] = childVal;
      }
    }

    if (!found) {
      return parseVal(trimmedChunk);
    }

    return res;
  }

  const parsed = parseSimple(clean);
  return JSON.stringify(parsed, null, indent);
}
