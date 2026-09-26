export type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB";
export type SpeedUnit = "Kbps" | "Mbps" | "Gbps" | "KB/s" | "MB/s" | "GB/s";

export interface TransferTimeResult {
  totalSeconds: number;
  formatted: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  actualBytes: number;
  overheadBytes: number;
  effectiveSpeedMbps: number;
}

const FILE_SIZE_MULTIPLIERS: Record<FileSizeUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
};

// Bits per second multipliers
const SPEED_MULTIPLIERS: Record<SpeedUnit, number> = {
  Kbps: 1000,
  Mbps: 1000 * 1000,
  Gbps: 1000 * 1000 * 1000,
  "KB/s": 8 * 1024,
  "MB/s": 8 * 1024 * 1024,
  "GB/s": 8 * 1024 * 1024 * 1024,
};

export function toBytes(size: number, unit: FileSizeUnit): number {
  return Math.max(0, size) * (FILE_SIZE_MULTIPLIERS[unit] ?? 1);
}

export function toBitsPerSecond(speed: number, unit: SpeedUnit): number {
  return Math.max(0, speed) * (SPEED_MULTIPLIERS[unit] ?? 1);
}

export function calculateTransferTime(
  fileSize: number,
  sizeUnit: FileSizeUnit,
  speed: number,
  speedUnit: SpeedUnit,
  overheadPercent: number = 0 // e.g. 5% or 10% TCP/IP packet overhead
): TransferTimeResult {
  const bytes = toBytes(fileSize, sizeUnit);
  const overheadFactor = 1 + Math.max(0, overheadPercent) / 100;
  const totalBits = bytes * 8 * overheadFactor;

  const speedBps = toBitsPerSecond(speed, speedUnit);
  if (speedBps <= 0 || totalBits <= 0) {
    return {
      totalSeconds: 0,
      formatted: "0 seconds",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      actualBytes: bytes,
      overheadBytes: Math.round(bytes * (overheadFactor - 1)),
      effectiveSpeedMbps: 0,
    };
  }

  const totalSeconds = totalBits / speedBps;

  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return {
    totalSeconds: Math.round(totalSeconds * 100) / 100,
    formatted: parts.join(" "),
    days: d,
    hours: h,
    minutes: m,
    seconds: s,
    actualBytes: bytes,
    overheadBytes: Math.round(bytes * (overheadFactor - 1)),
    effectiveSpeedMbps: Math.round((speedBps / (1000 * 1000)) * 100) / 100,
  };
}

export function calculateDataVolume(
  speed: number,
  speedUnit: SpeedUnit,
  durationHours: number
): { gigabytes: number; terabytes: number } {
  const speedBps = toBitsPerSecond(speed, speedUnit);
  const totalSeconds = Math.max(0, durationHours) * 3600;
  const totalBits = speedBps * totalSeconds;
  const totalBytes = totalBits / 8;

  const gb = totalBytes / (1024 * 1024 * 1024);
  const tb = gb / 1024;

  return {
    gigabytes: Math.round(gb * 100) / 100,
    terabytes: Math.round(tb * 1000) / 1000,
  };
}
