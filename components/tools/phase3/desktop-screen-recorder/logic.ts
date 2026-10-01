/**
 * Desktop Screen Recorder — Pure Domain Logic
 * 100% In-Browser Media Capture (Zero Network Uploads)
 */

export type RecorderState = "idle" | "recording" | "paused" | "stopped" | "error";

export interface RecordingMeta {
  durationSeconds: number;
  mimeType: string;
  sizeBytes: number;
  timestamp: string;
}

/**
 * Formats elapsed seconds into HH:MM:SS or MM:SS
 */
export function formatRecordingTime(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds || 0));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Estimates recording file size based on time and average bitrate (in kbps)
 */
export function estimateRecordingSize(durationSeconds: number, bitrateKbps: number = 2500): number {
  const safeDuration = Math.max(0, durationSeconds || 0);
  // (kbps * 1000 / 8) bytes per second
  const bytesPerSecond = (bitrateKbps * 1000) / 8;
  return Math.round(safeDuration * bytesPerSecond);
}

/**
 * Formats byte size into human readable string (KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  const safeBytes = Math.max(0, bytes || 0);
  if (safeBytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(safeBytes) / Math.log(1024));
  return `${(safeBytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Validates recording state transition
 */
export function isValidStateTransition(from: RecorderState, to: RecorderState): boolean {
  switch (from) {
    case "idle":
      return to === "recording" || to === "error";
    case "recording":
      return to === "paused" || to === "stopped" || to === "error";
    case "paused":
      return to === "recording" || to === "stopped" || to === "error";
    case "stopped":
      return to === "idle" || to === "recording";
    case "error":
      return to === "idle";
    default:
      return false;
  }
}
