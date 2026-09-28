import React from "react";
import { BRAND } from "@/lib/brand";

/* =========================================================================
   1. CLEARTRIX OFFICIAL BRAND ICON
   ========================================================================= */

export interface CleartrixIconProps {
  size?: number;
  className?: string;
  hasContainer?: boolean;
}

/**
 * Official Logomark for ClearTrix
 * Aligned with official ClearTrix Brand Guidelines asset specs:
 * Interlocking Blue (#3B82F6) curve and Teal (#06D6A0) stem geometry.
 */
export const CleartrixIcon: React.FC<CleartrixIconProps> = ({
  size = 36,
  className = "",
  hasContainer = false,
}) => {
  if (hasContainer) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative shrink-0 flex items-center justify-center select-none rounded-[22%] bg-[#0F172A] p-[10%] shadow-xs ${className}`}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ct-blue-grad-ic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="ct-teal-grad-ic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06D6A0" />
              <stop offset="100%" stopColor="#00D2FF" />
            </linearGradient>
          </defs>

          <g transform="translate(10, 10) scale(0.8)">
            <path
              d="M72 15 C55 4 28 8 15 25 C2 42 4 68 20 84 C36 100 62 98 78 86 C82 82 76 75 70 78 C57 88 38 88 26 75 C14 62 12 42 22 28 C32 14 55 12 70 21 C74 24 78 19 72 15 Z"
              fill="url(#ct-blue-grad-ic)"
            />
            <path
              d="M48 40 H78 C82 40 84 45 80 49 L58 75 C54 80 46 78 46 72 V42 C46 41 47 40 48 40 Z"
              fill="url(#ct-teal-grad-ic)"
            />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 flex items-center justify-center select-none ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="ct-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="ct-teal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06D6A0" />
            <stop offset="100%" stopColor="#00D2FF" />
          </linearGradient>
        </defs>

        <path
          d="M72 15 C55 4 28 8 15 25 C2 42 4 68 20 84 C36 100 62 98 78 86 C82 82 76 75 70 78 C57 88 38 88 26 75 C14 62 12 42 22 28 C32 14 55 12 70 21 C74 24 78 19 72 15 Z"
          fill="url(#ct-blue-grad)"
        />
        <path
          d="M48 40 H78 C82 40 84 45 80 49 L58 75 C54 80 46 78 46 72 V42 C46 41 47 40 48 40 Z"
          fill="url(#ct-teal-grad)"
        />
      </svg>
    </div>
  );
};

/* =========================================================================
   2. CLEARTRIX BRAND LOGO WITH EXACT COLOR TOKEN WORDMARK & TAGLINE
   ========================================================================= */

export interface CleartrixLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
  isLight?: boolean;
  variant?: "horizontal" | "icon-only" | "compact" | "stacked" | "umbrella-lockup" | "dark" | "monochrome";
  productTag?: string;
}

export const CleartrixLogo: React.FC<CleartrixLogoProps> = ({
  size = 36,
  className = "",
  showText = true,
  subtitle = "",
  isLight = false,
  variant = "horizontal",
  productTag,
}) => {
  if (variant === "icon-only" || !showText) {
    return <CleartrixIcon size={size} className={className} />;
  }

  // Wordmark color logic: Clear (#0F172A) + Tr (#3B82F6) + ix (#06D6A0)
  const clearTextColor = isLight || variant === "dark" ? "text-white" : "text-[#0F172A]";

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        <CleartrixIcon size={Math.round(size * 1.5)} />
        <div className="flex flex-col items-center">
          <div className="flex items-baseline font-headings font-bold tracking-tight text-2xl sm:text-3xl leading-none">
            <span className={clearTextColor}>Clear</span>
            <span className="text-[#3B82F6]">Tr</span>
            <span className="text-[#06D6A0]">ix</span>
          </div>
          <span className="mt-1 text-[9px] sm:text-[10px] font-medium font-body uppercase tracking-[0.2em] text-[#94A3B8]">
            {BRAND.tagline}
          </span>
          {productTag && (
            <span className="mt-1.5 text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200/70 px-2 py-0.5 rounded-full">
              {productTag}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <CleartrixIcon size={size} />
        <div className="flex flex-col text-left justify-center">
          <div className="flex items-baseline font-headings text-base sm:text-lg font-bold tracking-tight leading-none">
            <span className={clearTextColor}>Clear</span>
            <span className="text-[#3B82F6]">Tr</span>
            <span className="text-[#06D6A0]">ix</span>
          </div>
          <span className="text-[9.5px] font-body font-medium tracking-[0.15em] uppercase text-[#94A3B8] mt-0.5">
            {BRAND.tagline}
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal Lockup (Icon + ClearTrix + Tagline / Subtitle)
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3.5 ${className}`}>
      <CleartrixIcon size={size} />

      <div className="flex flex-col text-left justify-center">
        <div className="flex items-baseline font-headings text-lg sm:text-xl font-bold tracking-tight leading-none">
          <span className={clearTextColor}>Clear</span>
          <span className="text-[#3B82F6]">Tr</span>
          <span className="text-[#06D6A0]">ix</span>

          {productTag && (
            <span className="ml-2 font-body text-xs font-semibold text-slate-500 hidden sm:inline">
              / {productTag}
            </span>
          )}
        </div>

        {subtitle ? (
          <span className="text-xs font-medium font-body text-slate-500 mt-0.5">
            {subtitle}
          </span>
        ) : (
          <span className="text-[10px] sm:text-[11px] font-medium font-body tracking-[0.18em] uppercase text-[#94A3B8] mt-0.5">
            {BRAND.tagline}
          </span>
        )}
      </div>
    </div>
  );
};

/* Backward compatible alias for product icons */
export const ResumeBuilderIcon = CleartrixIcon;
export const ResumeBuilderLogo = CleartrixLogo;

export interface BrandLogoProps extends CleartrixLogoProps {
  product?: "cleartrix" | "resume-builder";
}

export const BrandLogo: React.FC<BrandLogoProps> = (props) => {
  return <CleartrixLogo {...props} />;
};

export default BrandLogo;
