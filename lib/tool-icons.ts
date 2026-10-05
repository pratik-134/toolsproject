import React from "react";
import {
  FileText,
  Image as ImageIcon,
  Lock,
  QrCode,
  Video,
  Mic,
  Layers,
  Code2,
  Wrench,
  Calculator,
  FileJson,
  Binary,
  FileSpreadsheet,
  KeyRound,
  Link as LinkIcon,
  Code,
  GitCompare,
  Regex,
  FileCode,
  FileType,
  Hash,
  ShieldAlert,
  Archive,
  ScanBarcode,
  Barcode,
  Crop,
  Maximize2,
  Minimize2,
  Palette,
  Sparkles,
  Sliders,
  Type,
  FileDiff,
  Calendar,
  Clock,
  Coins,
  Receipt,
  Scale,
  Percent,
  Activity,
  Heart,
  Droplet,
  Globe,
  Film,
  Scissors,
  Volume2,
  Music,
  Shield,
  EyeOff,
  Sparkle,
  FileCheck,
  FileCheck2,
  Cloud,
  Terminal,
  LucideIcon,
} from "lucide-react";
import { ToolDefinition } from "@/lib/registry/types";
import { CATEGORIES } from "@/lib/registry/categories";

/**
 * Fallback Lucide Icon Map per Category ID
 */
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  "document-pdf": FileText,
  image: ImageIcon,
  security: Lock,
  "url-cloud": Cloud,
  codes: QrCode,
  video: Video,
  audio: Mic,
  builders: Layers,
  developer: Code2,
  utilities: Wrench,
  calculators: Calculator,
};

/**
 * Smart tool icon resolver based on tool slug keyword matching.
 * Returns a specific relevant Lucide icon or falls back to the category hero icon.
 */
export function getToolIcon(tool: ToolDefinition): LucideIcon {
  const slug = tool.slug.toLowerCase();

  // Developer & Data Tools
  if (slug.includes("json")) return FileJson;
  if (slug.includes("base64") || slug.includes("base-converter")) return Binary;
  if (slug.includes("csv") || slug.includes("excel") || slug.includes("sql")) return FileSpreadsheet;
  if (slug.includes("hash") || slug.includes("hmac")) return Hash;
  if (slug.includes("url-encoder") || slug.includes("url")) return LinkIcon;
  if (slug.includes("html") || slug.includes("css") || slug.includes("beautifier")) return Code;
  if (slug.includes("diff") || slug.includes("compare")) return GitCompare;
  if (slug.includes("regex")) return Regex;
  if (slug.includes("jwt") || slug.includes("token")) return KeyRound;
  if (slug.includes("snapshot") || slug.includes("carbon")) return FileCode;
  if (slug.includes("cron")) return Clock;
  if (slug.includes("curl")) return Terminal;

  // Everyday Utilities
  if (slug.includes("word-counter") || slug.includes("character")) return Type;
  if (slug.includes("password")) return KeyRound;
  if (slug.includes("case")) return FileType;
  if (slug.includes("archive") || slug.includes("zip") || slug.includes("tar")) return Archive;

  // Codes & Barcodes
  if (slug.includes("barcode-scanner") || slug.includes("qr-scanner")) return ScanBarcode;
  if (slug.includes("barcode")) return Barcode;
  if (slug.includes("qr")) return QrCode;

  // Security & Privacy
  if (slug.includes("steganography")) return EyeOff;
  if (slug.includes("metadata") || slug.includes("exif")) return ShieldAlert;
  if (slug.includes("encrypt") || slug.includes("lock")) return Shield;

  // Image & Optimizers
  if (slug.includes("crop")) return Crop;
  if (slug.includes("resize") || slug.includes("canvas")) return Maximize2;
  if (slug.includes("compress") || slug.includes("minifier")) return Minimize2;
  if (slug.includes("filter") || slug.includes("retouch")) return Palette;
  if (slug.includes("watermark") || slug.includes("pattern") || slug.includes("wave")) return Sparkles;

  // PDF & Documents
  if (slug.includes("ats") || slug.includes("keyword")) return FileCheck;
  if (slug.includes("merge") || slug.includes("split") || slug.includes("organize")) return FileDiff;
  if (slug.includes("numberer") || slug.includes("bates")) return Hash;
  if (slug.includes("form") || slug.includes("signer")) return FileCheck2;

  // Calculators
  if (slug.includes("bmi") || slug.includes("bmr") || slug.includes("calorie") || slug.includes("body-fat")) return Activity;
  if (slug.includes("heart")) return Heart;
  if (slug.includes("water")) return Droplet;
  if (slug.includes("mortgage") || slug.includes("interest") || slug.includes("loan") || slug.includes("sip") || slug.includes("401k") || slug.includes("tax") || slug.includes("payroll")) return Coins;
  if (slug.includes("date") || slug.includes("age") || slug.includes("time")) return Calendar;
  if (slug.includes("clock") || slug.includes("timezone")) return Clock;
  if (slug.includes("percentage") || slug.includes("discount") || slug.includes("profit") || slug.includes("margin") || slug.includes("roi") || slug.includes("break-even")) return Percent;

  // Media (Video & Audio)
  if (slug.includes("recorder") || slug.includes("screen")) return Film;
  if (slug.includes("trim") || slug.includes("cut")) return Scissors;
  if (slug.includes("booster") || slug.includes("volume")) return Volume2;
  if (slug.includes("audio") || slug.includes("voice") || slug.includes("pitch")) return Music;

  // Fallback to Category Icon
  return CATEGORY_ICON_MAP[tool.category] || FileText;
}
