/**
 * Web Tab Recorder — Pure Domain Logic
 * 100% In-Browser Media Capture (Zero Network Uploads)
 */

export interface TabRecorderOptions {
  captureAudio: boolean;
  captureMic: boolean;
  videoFps: number;
}

export const DEFAULT_TAB_RECORDER_OPTIONS: TabRecorderOptions = {
  captureAudio: true,
  captureMic: false,
  videoFps: 30,
};

/**
 * Computes recording constraints object for tab capture
 */
export function getTabCaptureDisplayMediaConstraints(options: Partial<TabRecorderOptions> = {}): DisplayMediaStreamOptions {
  const fps = options.videoFps || 30;
  return {
    video: {
      displaySurface: "browser",
      frameRate: { ideal: fps, max: 60 },
    },
    audio: options.captureAudio ?? true,
    // @ts-expect-error preferCurrentTab is a standard modern Chrome/Edge spec
    preferCurrentTab: true,
  };
}

/**
 * Validates selected tab recording mime type
 */
export function getPreferredMimeType(typesSupported: (mime: string) => boolean): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  return candidates.find(typesSupported) || "video/webm";
}
