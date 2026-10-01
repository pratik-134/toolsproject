import {
  formatRecordingTime,
  estimateRecordingSize,
  formatFileSize,
  isValidStateTransition,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Timer format
  if (formatRecordingTime(65) !== "01:05") {
    throw new Error(`Expected "01:05", got ${formatRecordingTime(65)}`);
  }
  if (formatRecordingTime(3665) !== "01:01:05") {
    throw new Error(`Expected "01:01:05", got ${formatRecordingTime(3665)}`);
  }

  // Test 2: File size estimation
  const estimated = estimateRecordingSize(10, 2400); // 10s * 300,000 B/s = 3,000,000 B
  if (estimated !== 3000000) {
    throw new Error(`Expected 3000000 bytes, got ${estimated}`);
  }

  // Test 3: File size formatting
  if (formatFileSize(1048576) !== "1.0 MB") {
    throw new Error(`Expected "1.0 MB", got ${formatFileSize(1048576)}`);
  }

  // Test 4: State machine transitions
  if (!isValidStateTransition("idle", "recording")) {
    throw new Error("idle -> recording should be valid");
  }
  if (!isValidStateTransition("recording", "paused")) {
    throw new Error("recording -> paused should be valid");
  }
  if (isValidStateTransition("idle", "paused")) {
    throw new Error("idle -> paused should be invalid");
  }

  return true;
}
