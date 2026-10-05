/**
 * Unit Tests for In-Browser Audio Pitch & Tempo Shifter
 */

import { semitonesToPlaybackRate, encodeWav } from "./logic";

export function runAudioPitchTempoTests(): boolean {
  console.log("Testing [audio-pitch-tempo-shifter] logic...");

  // 1. Octave calculation
  const octaveUp = semitonesToPlaybackRate(12);
  if (Math.round(octaveUp) !== 2) {
    throw new Error(`12 semitones up should double playback rate, got ${octaveUp}`);
  }

  const octaveDown = semitonesToPlaybackRate(-12);
  if (Math.round(octaveDown * 100) / 100 !== 0.5) {
    throw new Error(`-12 semitones down should halve playback rate, got ${octaveDown}`);
  }

  // 2. WAV encoding
  const samples = new Float32Array(100);
  const wavBytes = encodeWav(samples, 44100);

  if (wavBytes.length !== 44 + 100 * 2) {
    throw new Error(`encodeWav produced unexpected buffer size: ${wavBytes.length}`);
  }

  // Check RIFF header (0x52, 0x49, 0x46, 0x46)
  if (wavBytes[0] !== 0x52 || wavBytes[1] !== 0x49 || wavBytes[2] !== 0x46 || wavBytes[3] !== 0x46) {
    throw new Error(`encodeWav missing valid RIFF header bytes`);
  }

  console.log("✅ [audio-pitch-tempo-shifter] unit tests passed!");
  return true;
}
