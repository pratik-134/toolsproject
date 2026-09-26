/**
 * Pure URL Encoding, Decoding, and Query Parameter Parsing Logic
 * Zero external dependencies, pure browser/runtime JS.
 */

export type UrlEncodeMode = "component" | "full";

export interface QueryParamItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

/**
 * Encode a string or URL
 */
export function encodeUrl(input: string, mode: UrlEncodeMode = "component"): string {
  if (!input) return "";
  try {
    if (mode === "component") {
      return encodeURIComponent(input);
    } else {
      return encodeURI(input);
    }
  } catch (err: unknown) {
    return input;
  }
}

/**
 * Decode a URL or encoded component
 */
export function decodeUrl(input: string): { result: string; error?: string } {
  if (!input) return { result: "" };
  try {
    // Replace '+' with space first if it looks like query string form encoding
    return { result: decodeURIComponent(input.replace(/\+/g, "%20")) };
  } catch (err: unknown) {
    try {
      // Fallback to decodeURI
      return { result: decodeURI(input) };
    } catch {
      return {
        result: input,
        error: "Malformed URL encoding or invalid escape sequences.",
      };
    }
  }
}

/**
 * Parse a URL or query string into structured key-value pairs
 */
export function parseUrlQuery(input: string): {
  baseUrl: string;
  params: QueryParamItem[];
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { baseUrl: "", params: [] };
  }

  let baseUrl = trimmed;
  let queryString = "";

  const qIndex = trimmed.indexOf("?");
  const hashIndex = trimmed.indexOf("#");

  if (qIndex !== -1) {
    baseUrl = trimmed.slice(0, qIndex);
    queryString = hashIndex !== -1 && hashIndex > qIndex
      ? trimmed.slice(qIndex + 1, hashIndex)
      : trimmed.slice(qIndex + 1);
  } else if (trimmed.includes("=") || trimmed.includes("&")) {
    // String appears to be raw query parameters without base URL
    baseUrl = "";
    queryString = trimmed;
  }

  const params: QueryParamItem[] = [];
  if (queryString) {
    const pairs = queryString.split("&");
    pairs.forEach((pair, idx) => {
      if (!pair) return;
      const eqIdx = pair.indexOf("=");
      let key = pair;
      let val = "";
      if (eqIdx !== -1) {
        key = pair.slice(0, eqIdx);
        val = pair.slice(eqIdx + 1);
      }
      try {
        key = decodeURIComponent(key.replace(/\+/g, " "));
        val = decodeURIComponent(val.replace(/\+/g, " "));
      } catch {
        // use raw if decoding fails
      }
      params.push({
        id: `param-${idx}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        key,
        value: val,
        enabled: true,
      });
    });
  }

  return { baseUrl, params };
}

/**
 * Reassemble base URL and query parameters into a full URL
 */
export function buildUrlWithParams(baseUrl: string, params: QueryParamItem[]): string {
  const activeParams = params.filter((p) => p.enabled && p.key.trim().length > 0);
  if (activeParams.length === 0) {
    return baseUrl;
  }

  const queryParts = activeParams.map((p) => {
    const k = encodeURIComponent(p.key.trim());
    const v = encodeURIComponent(p.value);
    return `${k}=${v}`;
  });

  const query = queryParts.join("&");
  if (!baseUrl.trim()) {
    return query;
  }

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl.trim()}${separator}${query}`;
}
