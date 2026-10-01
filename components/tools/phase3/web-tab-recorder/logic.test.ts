import {
  getTabCaptureDisplayMediaConstraints,
  getPreferredMimeType,
  DEFAULT_TAB_RECORDER_OPTIONS,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Constraints generation
  const constraints = getTabCaptureDisplayMediaConstraints({ videoFps: 60, captureAudio: true });
  if (!constraints.video || (constraints.video as MediaTrackConstraints).frameRate !== undefined && typeof constraints.video !== "boolean") {
    // valid structure
  }
  if (constraints.audio !== true) {
    throw new Error("Expected audio to be enabled");
  }

  // Test 2: Preferred mime type
  const mime = getPreferredMimeType((m) => m === "video/webm");
  if (mime !== "video/webm") {
    throw new Error(`Expected "video/webm", got ${mime}`);
  }

  // Test 3: Default options validity
  if (DEFAULT_TAB_RECORDER_OPTIONS.videoFps < 15) {
    throw new Error("Video FPS should be at least 15");
  }

  return true;
}
