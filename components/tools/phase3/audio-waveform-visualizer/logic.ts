/**
 * Audio Waveform & Speech Visualizer — Pure Domain Logic
 * 100% In-Browser Audio Peak Normalization & SVG Waveform Generation
 * Zero External Network Calls, Zero Server Uploads (Cleartrix Invariant #1)
 */

export type WaveformStyle = "bars" | "wave" | "circular" | "glow";

export interface WaveformOptions {
  style: WaveformStyle;
  barWidth: number;
  barGap: number;
  height: number;
  width: number;
  primaryColor: string;
  secondaryColor: string;
  glowEffect: boolean;
}

/**
 * Normalizes raw audio buffer PCM samples into fixed count of peak values [0.0 - 1.0]
 */
export function normalizeAudioPeaks(
  channelData: Float32Array,
  sampleCount: number = 64
): number[] {
  if (channelData.length === 0 || sampleCount <= 0) return [];
  const blockSize = Math.floor(channelData.length / sampleCount);
  const peaks: number[] = [];

  for (let i = 0; i < sampleCount; i++) {
    const start = i * blockSize;
    let max = 0;
    for (let j = 0; j < blockSize; j++) {
      const val = Math.abs(channelData[start + j] || 0);
      if (val > max) max = val;
    }
    peaks.push(Math.min(1, Math.max(0.05, max)));
  }

  return peaks;
}

/**
 * Generates standalone SVG vector markup for the audio waveform
 */
export function generateWaveformSvg(
  peaks: number[],
  options: WaveformOptions
): string {
  const { width, height, primaryColor, secondaryColor, barWidth, barGap, style } = options;

  if (style === "circular") {
    // Radial circular soundburst
    const cx = width / 2;
    const cy = height / 2;
    const innerRadius = Math.min(cx, cy) * 0.35;
    const maxRadius = Math.min(cx, cy) * 0.85;
    const total = peaks.length;

    const lines = peaks
      .map((peak, idx) => {
        const angle = (idx / total) * Math.PI * 2;
        const r1 = innerRadius;
        const r2 = innerRadius + peak * (maxRadius - innerRadius);
        const x1 = cx + Math.cos(angle) * r1;
        const y1 = cy + Math.sin(angle) * r1;
        const x2 = cx + Math.cos(angle) * r2;
        const y2 = cy + Math.sin(angle) * r2;
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${primaryColor}" stroke-width="${barWidth}" stroke-linecap="round" />`;
      })
      .join("\n    ");

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#0f172a" rx="16" />
  <g>
    ${lines}
  </g>
</svg>`;
  }

  if (style === "wave") {
    // Continuous smooth bezier wave path
    const centerY = height / 2;
    const step = width / (peaks.length - 1 || 1);
    let pathD = `M 0 ${centerY}`;

    for (let i = 0; i < peaks.length; i++) {
      const x = i * step;
      const peakVal = peaks[i] ?? 0;
      const peakHeight = peakVal * (height * 0.45);
      const y = i % 2 === 0 ? centerY - peakHeight : centerY + peakHeight;
      pathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#0f172a" rx="16" />
  <path d="${pathD}" fill="none" stroke="${primaryColor}" stroke-width="${barWidth + 1}" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;
  }

  // Default bars style
  const barCount = peaks.length;
  const totalBarWidth = barWidth + barGap;
  const startX = Math.max(10, (width - barCount * totalBarWidth) / 2);
  const centerY = height / 2;

  const rects = peaks
    .map((peak, idx) => {
      const x = startX + idx * totalBarWidth;
      const barH = Math.max(4, peak * (height * 0.8));
      const y = centerY - barH / 2;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth}" height="${barH.toFixed(1)}" rx="${barWidth / 2}" fill="${primaryColor}" />`;
    })
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#0f172a" rx="16" />
  <g>
    ${rects}
  </g>
</svg>`;
}
