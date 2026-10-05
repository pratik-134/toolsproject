/**
 * Unit Tests for Audio Waveform & Speech Visualizer
 */

import { normalizeAudioPeaks, generateWaveformSvg } from "./logic";

export function runAudioWaveformTests(): boolean {
  console.log("Testing [audio-waveform-visualizer] logic...");

  // 1. Synthetic PCM channel data
  const pcm = new Float32Array(1000);
  for (let i = 0; i < pcm.length; i++) {
    pcm[i] = Math.sin((i / 100) * Math.PI);
  }

  const peaks = normalizeAudioPeaks(pcm, 32);
  if (peaks.length !== 32) {
    throw new Error(`normalizeAudioPeaks expected 32 peaks, got ${peaks.length}`);
  }
  for (const p of peaks) {
    if (p < 0 || p > 1) {
      throw new Error(`Peak value out of normalized range: ${p}`);
    }
  }

  // 2. SVG Bar Rendering
  const svgBars = generateWaveformSvg(peaks, {
    style: "bars",
    barWidth: 4,
    barGap: 2,
    height: 200,
    width: 600,
    primaryColor: "#38bdf8",
    secondaryColor: "#818cf8",
    glowEffect: false,
  });

  if (!svgBars.startsWith("<svg") || !svgBars.includes("<rect")) {
    throw new Error(`generateWaveformSvg failed to render bars SVG`);
  }

  // 3. SVG Circular Rendering
  const svgCircular = generateWaveformSvg(peaks, {
    style: "circular",
    barWidth: 3,
    barGap: 2,
    height: 400,
    width: 400,
    primaryColor: "#38bdf8",
    secondaryColor: "#818cf8",
    glowEffect: true,
  });

  if (!svgCircular.includes("<line")) {
    throw new Error(`generateWaveformSvg circular missing radial lines`);
  }

  console.log("✅ [audio-waveform-visualizer] unit tests passed!");
  return true;
}
