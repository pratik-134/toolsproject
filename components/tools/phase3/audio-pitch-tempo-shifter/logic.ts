/**
 * In-Browser Audio Pitch & Tempo Shifter — Pure Domain Logic
 * 100% In-Browser Audio Resampling & Playback Rate Calculations
 * Zero External Network Calls, Zero Server Uploads (Qwertygen Invariant #1)
 */

export interface PitchTempoSettings {
  playbackRate: number; // 0.5 to 2.0 (tempo multiplier)
  pitchSemitones: number; // -12 to +12 semitones
  volume: number; // 0.0 to 1.0
}

/**
 * Calculates effective playback rate corresponding to pitch semitone offset
 */
export function semitonesToPlaybackRate(semitones: number): number {
  return Math.pow(2, semitones / 12);
}

/**
 * Generates valid standard WAV file headers for audio buffer export
 */
export function encodeWav(
  samples: Float32Array,
  sampleRate: number = 44100
): Uint8Array {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + samples.length * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt subchunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data subchunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, samples.length * 2, true);

  // PCM samples (16-bit integer conversion)
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] || 0));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Uint8Array(buffer);
}
