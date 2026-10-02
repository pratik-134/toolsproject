import {
  isValidAudioStateTransition,
  formatAudioTime,
  formatAudioFileSize,
  estimateWavSize,
  encodeAudioBufferToWav,
} from "./logic";

export function runTests(): boolean {
  // 1. State Transitions
  if (!isValidAudioStateTransition("idle", "recording")) {
    throw new Error("idle -> recording should be valid");
  }
  if (!isValidAudioStateTransition("idle", "error")) {
    throw new Error("idle -> error should be valid");
  }
  if (isValidAudioStateTransition("idle", "paused")) {
    throw new Error("idle -> paused should be invalid");
  }
  if (!isValidAudioStateTransition("recording", "paused")) {
    throw new Error("recording -> paused should be valid");
  }
  if (!isValidAudioStateTransition("recording", "stopped")) {
    throw new Error("recording -> stopped should be valid");
  }
  if (!isValidAudioStateTransition("paused", "recording")) {
    throw new Error("paused -> recording should be valid");
  }
  if (!isValidAudioStateTransition("stopped", "idle")) {
    throw new Error("stopped -> idle should be valid");
  }

  // 2. Time Formatting
  if (formatAudioTime(0) !== "00:00") {
    throw new Error(`Expected "00:00", got ${formatAudioTime(0)}`);
  }
  if (formatAudioTime(65) !== "01:05") {
    throw new Error(`Expected "01:05", got ${formatAudioTime(65)}`);
  }
  if (formatAudioTime(3665) !== "01:01:05") {
    throw new Error(`Expected "01:01:05", got ${formatAudioTime(3665)}`);
  }
  if (formatAudioTime(-5) !== "00:00") {
    throw new Error(`Expected "00:00", got ${formatAudioTime(-5)}`);
  }

  // 3. File Size Formatting & Estimation
  if (formatAudioFileSize(0) !== "0 B") {
    throw new Error(`Expected "0 B", got ${formatAudioFileSize(0)}`);
  }
  if (formatAudioFileSize(1048576) !== "1.0 MB") {
    throw new Error(`Expected "1.0 MB", got ${formatAudioFileSize(1048576)}`);
  }
  if (estimateWavSize(1, 44100, 1) !== 88200) {
    throw new Error(`Expected 88200 bytes, got ${estimateWavSize(1, 44100, 1)}`);
  }
  if (estimateWavSize(1, 44100, 2) !== 176400) {
    throw new Error(`Expected 176400 bytes, got ${estimateWavSize(1, 44100, 2)}`);
  }

  // 4. WAV Header & PCM Encoding
  const sampleRate = 44100;
  const length = 100;
  const channelData = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    channelData[i] = Math.sin((i / length) * Math.PI * 2);
  }

  const mockAudioBuffer = {
    numberOfChannels: 1,
    sampleRate,
    length,
    duration: length / sampleRate,
    getChannelData: () => channelData,
  } as unknown as AudioBuffer;

  const wavBuffer = encodeAudioBufferToWav(mockAudioBuffer);
  if (!(wavBuffer instanceof ArrayBuffer)) {
    throw new Error("Expected ArrayBuffer output from encodeAudioBufferToWav");
  }

  const view = new DataView(wavBuffer);
  const riff = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );
  if (riff !== "RIFF") {
    throw new Error(`Expected "RIFF", got "${riff}"`);
  }

  const wave = String.fromCharCode(
    view.getUint8(8),
    view.getUint8(9),
    view.getUint8(10),
    view.getUint8(11)
  );
  if (wave !== "WAVE") {
    throw new Error(`Expected "WAVE", got "${wave}"`);
  }

  if (view.getUint16(20, true) !== 1) {
    throw new Error("Expected PCM format code 1");
  }
  if (view.getUint16(22, true) !== 1) {
    throw new Error("Expected 1 channel");
  }
  if (view.getUint32(24, true) !== 44100) {
    throw new Error("Expected 44100 sample rate");
  }
  if (view.getUint16(34, true) !== 16) {
    throw new Error("Expected 16 bits per sample");
  }
  if (wavBuffer.byteLength !== 44 + 200) {
    throw new Error(`Expected buffer length ${44 + 200}, got ${wavBuffer.byteLength}`);
  }

  return true;
}
