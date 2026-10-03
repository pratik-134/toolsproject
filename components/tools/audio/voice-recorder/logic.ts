/**
 * Voice & Podcast Audio Recorder — Pure Domain Logic
 * 100% In-Browser Media Capture & WAV Encoding (Zero Network Uploads)
 */

export type AudioRecorderState = "idle" | "recording" | "paused" | "stopped" | "error";

export interface AudioRecordingMeta {
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  sizeBytes: number;
  timestamp: string;
}

/**
 * Validates audio recording state transitions
 */
export function isValidAudioStateTransition(
  from: AudioRecorderState,
  to: AudioRecorderState
): boolean {
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
      return to === "idle" || to === "recording";
    default:
      return false;
  }
}

/**
 * Formats elapsed seconds into MM:SS or HH:MM:SS
 */
export function formatAudioTime(seconds: number): string {
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
 * Formats byte size into human readable string (B, KB, MB)
 */
export function formatAudioFileSize(bytes: number): string {
  const safeBytes = Math.max(0, bytes || 0);
  if (safeBytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(safeBytes) / Math.log(1024));
  const unitIndex = Math.min(i, units.length - 1);
  return `${(safeBytes / Math.pow(1024, unitIndex)).toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Estimates uncompressed 16-bit PCM WAV size given duration, sample rate, and channel count.
 * Formula: duration (s) * sampleRate (Hz) * channels * (16 bits / 8 bits/byte)
 */
export function estimateWavSize(
  durationSeconds: number,
  sampleRate: number = 44100,
  channels: number = 1
): number {
  const safeDuration = Math.max(0, durationSeconds || 0);
  const safeRate = Math.max(8000, sampleRate || 44100);
  const safeChannels = Math.max(1, channels || 1);
  return Math.round(safeDuration * safeRate * safeChannels * 2);
}

/**
 * Encodes an AudioBuffer into a standard 16-bit PCM WAV ArrayBuffer.
 * 100% self-contained, zero external dependencies, runs entirely in device RAM.
 */
export function encodeAudioBufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // 1 = PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  // Interleave channel data
  const length = audioBuffer.length;
  const dataByteLength = length * blockAlign;
  const headerByteLength = 44;
  const totalLength = headerByteLength + dataByteLength;

  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  // Helper to write ASCII strings into DataView
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF chunk descriptor */
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataByteLength, true); // file size - 8
  writeString(8, "WAVE");

  /* "fmt " sub-chunk */
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size for 16-bit PCM
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  /* "data" sub-chunk */
  writeString(36, "data");
  view.setUint32(40, dataByteLength, true); // Subchunk2Size

  // Write 16-bit interleaved PCM samples
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(audioBuffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const channel = channels[ch];
      const raw = channel ? channel[i] : 0;
      let sample = typeof raw === "number" ? raw : 0;
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return buffer;
}

/**
 * Slices an AudioBuffer from startSeconds to endSeconds, returning a trimmed AudioBuffer.
 */
export function sliceAudioBuffer(
  audioContext: AudioContext,
  sourceBuffer: AudioBuffer,
  startSeconds: number,
  endSeconds: number
): AudioBuffer {
  const duration = sourceBuffer.duration;
  const safeStart = Math.max(0, Math.min(startSeconds, duration));
  const safeEnd = Math.max(safeStart, Math.min(endSeconds, duration));

  const sampleRate = sourceBuffer.sampleRate;
  const startOffset = Math.floor(safeStart * sampleRate);
  const endOffset = Math.floor(safeEnd * sampleRate);
  const frameCount = Math.max(1, endOffset - startOffset);

  const trimmedBuffer = audioContext.createBuffer(
    sourceBuffer.numberOfChannels,
    frameCount,
    sampleRate
  );

  for (let ch = 0; ch < sourceBuffer.numberOfChannels; ch++) {
    const sourceData = sourceBuffer.getChannelData(ch);
    const targetData = trimmedBuffer.getChannelData(ch);
    const slice = sourceData.subarray(startOffset, endOffset);
    targetData.set(slice);
  }

  return trimmedBuffer;
}
