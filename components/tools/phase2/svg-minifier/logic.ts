/**
 * SVG Minifier & Vector Optimizer — Pure TypeScript Domain Logic
 * 100% In-Browser Vector Processing (Zero Network Leaks)
 */

export interface SvgMinifyOptions {
  removeComments?: boolean;
  removeMetadata?: boolean;
  removeDoctype?: boolean;
  removeEmptyTags?: boolean;
  removeEmptyAttrs?: boolean;
  collapseWhitespace?: boolean;
  roundNumbers?: boolean;
  precision?: number;
  removeUnusedNamespaces?: boolean;
}

export interface SvgMinifyResult {
  minifiedSvg: string;
  originalBytes: number;
  minifiedBytes: number;
  savingsBytes: number;
  savingsPercent: number;
  warnings: string[];
}

export const DEFAULT_SVG_MINIFY_OPTIONS: Required<SvgMinifyOptions> = {
  removeComments: true,
  removeMetadata: true,
  removeDoctype: true,
  removeEmptyTags: true,
  removeEmptyAttrs: true,
  collapseWhitespace: true,
  roundNumbers: true,
  precision: 2,
  removeUnusedNamespaces: true,
};

/**
 * Validate whether the string is an SVG document or snippet
 */
export function validateSvg(input: string): { valid: boolean; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "SVG input cannot be empty." };
  }

  const hasSvgTag = /<svg[\s>]/i.test(trimmed);
  if (!hasSvgTag) {
    return { valid: false, error: "Missing required <svg> root element." };
  }

  if (!/<\/svg>/i.test(trimmed) && !/<svg[^>]*\/>/i.test(trimmed)) {
    return { valid: false, error: "SVG tag is unclosed or malformed." };
  }

  return { valid: true };
}

/**
 * Round floating point numbers in SVG paths and coordinate strings
 */
export function roundCoordinates(text: string, precision: number = 2): string {
  if (precision < 0) return text;

  // Match numbers with decimal points (e.g., 12.34567, -0.9876)
  return text.replace(/-?\d+\.\d+/g, (match) => {
    const num = parseFloat(match);
    if (isNaN(num)) return match;
    const rounded = Number(num.toFixed(precision));
    return String(rounded);
  });
}

/**
 * Minify SVG text according to configured options
 */
export function minifySvg(
  svgString: string,
  options?: SvgMinifyOptions
): SvgMinifyResult {
  const opts: Required<SvgMinifyOptions> = {
    ...DEFAULT_SVG_MINIFY_OPTIONS,
    ...(options ?? {}),
  };

  const warnings: string[] = [];
  const validation = validateSvg(svgString);
  if (!validation.valid) {
    warnings.push(validation.error ?? "Invalid SVG format.");
    const utf8Encoder = new TextEncoder();
    const originalBytes = utf8Encoder.encode(svgString).length;
    return {
      minifiedSvg: svgString,
      originalBytes,
      minifiedBytes: originalBytes,
      savingsBytes: 0,
      savingsPercent: 0,
      warnings,
    };
  }

  const utf8Encoder = new TextEncoder();
  const originalBytes = utf8Encoder.encode(svgString).length;

  let out = svgString;

  // 1. Remove XML declaration and DOCTYPE
  if (opts.removeDoctype) {
    out = out.replace(/<\?xml[^>]*\?>/gi, "");
    out = out.replace(/<!DOCTYPE[^>]*>/gi, "");
  }

  // 2. Remove comments
  if (opts.removeComments) {
    out = out.replace(/<!--[\s\S]*?-->/g, "");
  }

  // 3. Remove metadata, title, and desc tags
  if (opts.removeMetadata) {
    out = out.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
    out = out.replace(/<sodipodi:[^>]*>/gi, "");
    out = out.replace(/<inkscape:[^>]*>/gi, "");
  }

  // 4. Remove unused editor namespaces (Inkscape, Illustrator, Sketch)
  if (opts.removeUnusedNamespaces) {
    out = out.replace(/\sxmlns:(sodipodi|inkscape|sketch|serif|adobe|i)="[^"]*"/gi, "");
    out = out.replace(/\s(sodipodi|inkscape|sketch|serif|adobe|i):[a-z0-9_-]+="[^"]*"/gi, "");
    out = out.replace(/\s(enable-background)="[^"]*"/gi, "");
  }

  // 5. Remove empty attributes like id="" or class=""
  if (opts.removeEmptyAttrs) {
    out = out.replace(/\s[a-z0-9_-]+=(["'])\s*\1/gi, "");
  }

  // 6. Round path coordinates in d="..." and points="..."
  if (opts.roundNumbers) {
    // Process attributes known to contain series of coordinates
    out = out.replace(
      /\s(d|points|viewBox)=(["'])(.*?)\2/gi,
      (_full, attrName, quote, content) => {
        const rounded = roundCoordinates(content, opts.precision);
        // Also collapse redundant spaces within coordinate lists
        const cleanContent = rounded.replace(/\s{2,}/g, " ").trim();
        return ` ${attrName}=${quote}${cleanContent}${quote}`;
      }
    );
  }

  // 7. Remove empty tags (like <g></g> or <defs></defs>)
  if (opts.removeEmptyTags) {
    let prev = "";
    // Iteratively remove nested empty elements
    while (prev !== out) {
      prev = out;
      out = out.replace(/<(g|defs|clipPath|mask)[^>]*>\s*<\/\1>/gi, "");
    }
  }

  // 8. Collapse whitespace
  if (opts.collapseWhitespace) {
    // Replace multiple whitespace between tags with a single space or nothing
    out = out.replace(/>\s+</g, "><");
    // Normalize spaces within tags
    out = out.replace(/\s{2,}/g, " ");
  }

  out = out.trim();

  const minifiedBytes = utf8Encoder.encode(out).length;
  const savingsBytes = Math.max(0, originalBytes - minifiedBytes);
  const savingsPercent =
    originalBytes > 0
      ? Number(((savingsBytes / originalBytes) * 100).toFixed(1))
      : 0;

  return {
    minifiedSvg: out,
    originalBytes,
    minifiedBytes,
    savingsBytes,
    savingsPercent,
    warnings,
  };
}

/**
 * Format bytes to readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
