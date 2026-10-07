/**
 * Qwertygen Client-Side Pipeline Handoff Engine
 * Enables zero-upload, 100% in-browser data transfer between any tools in the suite.
 */

export interface PipelineHandoff {
  id: string;
  sourceSlug: string;
  sourceToolName: string;
  targetSlug: string;
  dataType: "text" | "file";
  title?: string;
  textData?: string;
  fileName?: string;
  fileType?: string;
  fileDataUrl?: string; // Base64 Data URL for files/images
  createdAt: number;
}

export const PIPELINE_STORAGE_KEY = "ct_pipeline_active_handoff";
export const PIPELINE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes TTL

// High-affinity tool pipeline matrix (Source Slug -> Downstream Target Slugs)
export const PIPELINE_WORKFLOW_MAP: Record<string, string[]> = {
  // Document & PDF workflows
  "camera-to-pdf-scanner": ["pdf-editor", "pdf-compressor", "image-to-text", "pdf-page-numberer"],
  "pdf-editor": ["pdf-compressor", "pdf-page-numberer", "pdf-to-docx", "burn-after-read-secret"],
  "image-to-text": ["word-counter", "markdown-to-pdf", "client-pastebin", "text-diff"],
  "pdf-to-text": ["word-counter", "markdown-to-pdf", "client-pastebin", "text-diff"],
  "markdown-to-html": ["direct-html-editor", "html-to-pdf", "client-pastebin"],
  "html-to-markdown": ["direct-markdown-editor", "markdown-to-pdf", "client-pastebin"],
  "direct-markdown-editor": ["markdown-to-pdf", "html-to-markdown", "client-pastebin"],
  "direct-html-editor": ["html-to-pdf", "markdown-to-html", "client-pastebin"],

  // Developer & Data workflows
  "json-formatter": ["json-yaml-converter", "json-to-typescript", "json-schema-validator", "json-graph-visualizer", "code-snapshot-studio", "client-pastebin"],
  "csv-json-converter": ["csv-to-excel", "excel-to-json-csv", "client-pastebin"],
  "tsv-to-csv": ["csv-to-excel", "excel-to-json-csv", "duplicate-line-remover"],
  "curl-to-code-converter": ["code-snapshot-studio", "client-pastebin", "burn-after-read-secret"],
  "jwt-decoder": ["json-formatter", "client-pastebin", "burn-after-read-secret"],
  "sql-formatter": ["code-snapshot-studio", "client-pastebin", "burn-after-read-secret", "text-diff"],
  "sql-dump-to-csv": ["csv-to-excel", "duplicate-line-remover"],
  "code-minifier": ["code-snapshot-studio", "client-pastebin", "burn-after-read-secret"],
  "code-snapshot-studio": ["client-pastebin", "burn-after-read-secret"],
  "json-graph-visualizer": ["json-formatter", "code-snapshot-studio", "client-pastebin"],
  "color-palette-generator": ["code-snapshot-studio", "svg-pattern-generator", "client-pastebin"],
  "visual-diff-studio": ["code-snapshot-studio", "client-pastebin", "burn-after-read-secret"],
  "regex-visualizer": ["code-snapshot-studio", "client-pastebin", "curl-to-code-converter"],

  // Image workflows
  "aspect-ratio-cropper": ["canvas-resizer", "batch-image-compressor", "photo-filter-studio", "image-watermarker"],
  "canvas-resizer": ["batch-image-compressor", "photo-filter-studio", "image-to-ico"],
  "photo-filter-studio": ["batch-image-compressor", "image-watermarker", "aspect-ratio-cropper"],
  "social-post-maker": ["batch-image-compressor", "image-converter"],
  "meme-caption-generator": ["batch-image-compressor", "image-converter"],
  "passport-photo-generator": ["batch-image-compressor", "image-converter"],
  "svg-pattern-generator": ["svg-minifier", "svg-to-png", "batch-image-compressor"],
  "css-mesh-gradient-generator": ["color-palette-generator", "svg-pattern-generator", "batch-image-compressor"],
  "image-background-remover": ["canvas-resizer", "batch-image-compressor", "image-converter"],
  "ai-background-remover": ["canvas-resizer", "batch-image-compressor", "image-converter"],

  // Document workflows
  "pdf-watermark-stamper": ["pdf-editor", "pdf-compressor", "pdf-merger"],
  "pdf-to-svg": ["svg-to-png", "svg-pattern-generator", "pdf-editor"],

  // Developer workflows
  "box-shadow-generator": ["css-mesh-gradient-generator", "code-snapshot-studio", "client-pastebin"],

  // Media workflows
  "desktop-screen-recorder": ["webm-to-mp4", "mp4-to-mp3"],
  "web-tab-recorder": ["webm-to-mp4", "mp4-to-mp3"],
  "webcam-overlay-recorder": ["webm-to-mp4", "mp4-to-mp3"],
  "audio-waveform-visualizer": ["audio-pitch-tempo-shifter", "desktop-screen-recorder", "mp4-to-mp3"],
  "audio-pitch-tempo-shifter": ["audio-waveform-visualizer", "wav-to-mp3", "mp4-to-mp3"],

  // Everyday Utility workflows
  "language-translator": ["word-counter", "client-pastebin", "burn-after-read-secret", "text-diff"],

  // Cloud & Security workflows
  "client-pastebin": ["burn-after-read-secret", "link-protector", "word-counter"],
  "password-generator": ["burn-after-read-secret", "link-protector", "client-pastebin"],
};

// General fallback targets by data type
export const DEFAULT_TEXT_TARGETS = [
  "client-pastebin",
  "burn-after-read-secret",
  "word-counter",
  "text-diff",
];

export const DEFAULT_FILE_TARGETS = [
  "pdf-compressor",
  "batch-image-compressor",
  "pdf-editor",
];

/**
 * Save an active handoff payload into browser localStorage.
 */
export function setPipelineHandoff(
  handoff: Omit<PipelineHandoff, "id" | "createdAt">,
  storage?: Storage
): PipelineHandoff {
  const store = storage || (typeof window !== "undefined" ? window.localStorage : null);
  if (!store) {
    throw new Error("Local storage is not available for pipeline handoff");
  }

  const payload: PipelineHandoff = {
    ...handoff,
    id: `ct_pipe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };

  try {
    store.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(payload));
  } catch (err: any) {
    // If quota exceeded due to large file base64, clean old key and throw helpful error
    store.removeItem(PIPELINE_STORAGE_KEY);
    throw new Error("Payload size exceeds local browser storage quota. Please use smaller file or text.");
  }

  return payload;
}

/**
 * Retrieve the active pipeline handoff for a given target tool.
 * Returns null if no handoff exists, target doesn't match, or TTL expired.
 */
export function getPipelineHandoff(targetSlug: string, storage?: Storage): PipelineHandoff | null {
  const store = storage || (typeof window !== "undefined" ? window.localStorage : null);
  if (!store) return null;

  try {
    const raw = store.getItem(PIPELINE_STORAGE_KEY);
    if (!raw) return null;

    const payload = JSON.parse(raw) as PipelineHandoff;
    if (!payload || !payload.targetSlug) return null;

    // Check expiration (15 minutes)
    if (Date.now() - payload.createdAt > PIPELINE_EXPIRY_MS) {
      store.removeItem(PIPELINE_STORAGE_KEY);
      return null;
    }

    if (payload.targetSlug !== targetSlug) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Clear the current active handoff from browser storage.
 */
export function clearPipelineHandoff(storage?: Storage): void {
  const store = storage || (typeof window !== "undefined" ? window.localStorage : null);
  if (!store) return;
  try {
    store.removeItem(PIPELINE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Get recommended downstream target slugs for a given source tool slug.
 */
export function getRecommendedPipelineTargets(sourceSlug: string, dataType: "text" | "file"): string[] {
  const mapped = PIPELINE_WORKFLOW_MAP[sourceSlug];
  if (mapped && mapped.length > 0) {
    return mapped;
  }
  return dataType === "text" ? DEFAULT_TEXT_TARGETS : DEFAULT_FILE_TARGETS;
}
