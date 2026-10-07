/**
 * Client-Side AI Background Remover — Core Processing Logic
 * 100% In-Browser MODNet Segmentation, Mask Upscaling & Multi-Format Canvas Export
 * Zero External Network Calls, Zero Server Uploads (Qwertygen Invariant #1)
 */

export const MAX_INFERENCE_DIMENSION = 1600;

export const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export const SUPPORTED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

export interface ReplacementFill {
  type: 'transparent' | 'solid' | 'gradient';
  solidColor?: string; // hex
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number; // degrees
}

export interface DimensionResult {
  width: number;
  height: number;
  scaled: boolean;
}

/**
 * Validates whether an uploaded file is a supported image format (JPG, PNG, WebP)
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const mime = file.type?.toLowerCase();
  const ext = file.name?.split('.').pop()?.toLowerCase() || '';

  const isMimeValid = mime ? SUPPORTED_MIME_TYPES.has(mime) : false;
  const isExtValid = SUPPORTED_EXTENSIONS.has(ext);

  if (!isMimeValid && !isExtValid) {
    return {
      valid: false,
      error: `Unsupported image format (${ext || 'unknown'}). Please upload a JPG, PNG, or WebP photo.`,
    };
  }

  return { valid: true };
}

/**
 * Calculates inference dimensions with longest side capped to maxLongestSide (1600px)
 * preserving original aspect ratio.
 */
export function calculateInferenceDimensions(
  width: number,
  height: number,
  maxLongestSide: number = MAX_INFERENCE_DIMENSION
): DimensionResult {
  if (width <= 0 || height <= 0) {
    return { width: 1, height: 1, scaled: false };
  }

  const longestSide = Math.max(width, height);
  if (longestSide <= maxLongestSide) {
    return { width, height, scaled: false };
  }

  const ratio = maxLongestSide / longestSide;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
    scaled: true,
  };
}

/**
 * Extracts the alpha mask channel from an RGBA buffer
 */
export function extractAlphaChannel(rgbaData: Uint8ClampedArray): Uint8Array {
  const pixelCount = Math.floor(rgbaData.length / 4);
  const alpha = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    alpha[i] = rgbaData[i * 4 + 3] ?? 255;
  }
  return alpha;
}

/**
 * Downscales an HTMLImageElement onto an HTMLCanvasElement for model inference
 */
export function downscaleImageForInference(
  img: HTMLImageElement,
  maxLongestSide: number = MAX_INFERENCE_DIMENSION
): { canvas: HTMLCanvasElement; width: number; height: number; scaled: boolean } {
  const { width, height, scaled } = calculateInferenceDimensions(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    maxLongestSide
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Failed to get 2D canvas context for inference downscaling.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return { canvas, width, height, scaled };
}

/**
 * Creates an HTMLCanvasElement from an RGBA buffer
 */
export function createCanvasFromRgba(
  data: Uint8ClampedArray,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create canvas context from RGBA buffer.');
  }

  const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Composes the segmented result.
 * If highQuality is true, the mask is bi-linearly applied to the original full-res image.
 */
export function applyMaskToOriginalImage(
  originalImg: HTMLImageElement,
  inferenceResultCanvas: HTMLCanvasElement,
  highQuality: boolean = true
): HTMLCanvasElement {
  const origW = originalImg.naturalWidth || originalImg.width;
  const origH = originalImg.naturalHeight || originalImg.height;

  if (!highQuality) {
    // Return direct inference canvas without upscaling
    return inferenceResultCanvas;
  }

  // High-Quality: Apply inference matte onto full-resolution original
  const fullCanvas = document.createElement('canvas');
  fullCanvas.width = origW;
  fullCanvas.height = origH;
  const ctx = fullCanvas.getContext('2d');
  if (!ctx) {
    return inferenceResultCanvas;
  }

  // 1. Draw original full-res image
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(originalImg, 0, 0, origW, origH);

  // 2. Composite destination-in with scaled mask
  // The inferenceResultCanvas has the RGBA with alpha channel set
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(inferenceResultCanvas, 0, 0, origW, origH);

  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';

  return fullCanvas;
}

/**
 * Applies custom background fill (transparent, solid color, or gradient)
 */
export function renderCompositeImage(
  subjectCanvas: HTMLCanvasElement,
  fill: ReplacementFill
): HTMLCanvasElement {
  if (fill.type === 'transparent') {
    return subjectCanvas;
  }

  const width = subjectCanvas.width;
  const height = subjectCanvas.height;

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) return subjectCanvas;

  if (fill.type === 'solid') {
    ctx.fillStyle = fill.solidColor || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else if (fill.type === 'gradient') {
    const angle = (fill.gradientAngle || 135) * (Math.PI / 180);
    const x1 = Math.round(width / 2 - (Math.cos(angle) * width) / 2);
    const y1 = Math.round(height / 2 - (Math.sin(angle) * height) / 2);
    const x2 = Math.round(width / 2 + (Math.cos(angle) * width) / 2);
    const y2 = Math.round(height / 2 + (Math.sin(angle) * height) / 2);

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, fill.gradientStart || '#3b82f6');
    grad.addColorStop(1, fill.gradientEnd || '#ec4899');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw subject on top of custom background
  ctx.drawImage(subjectCanvas, 0, 0);
  return outputCanvas;
}

/**
 * Exports canvas to Blob as PNG or JPEG
 */
export function exportCanvasBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg',
  quality: number = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let exportCanvas = canvas;

    // If exporting to JPEG and canvas has transparent regions, fill background with white
    if (format === 'jpeg') {
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = canvas.width;
      bgCanvas.height = canvas.height;
      const ctx = bgCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvas, 0, 0);
        exportCanvas = bgCanvas;
      }
    }

    exportCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`Failed to encode image to ${format.toUpperCase()}`));
        }
      },
      format === 'png' ? 'image/png' : 'image/jpeg',
      quality
    );
  });
}

/**
 * Formats byte counts into human-readable strings (MB, KB)
 */
export function formatByteSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
