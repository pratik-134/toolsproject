import React from "react";
import { BRAND } from "@/lib/brand";

/* =========================================================================
   1. CLEARTRIX OFFICIAL HIGH-RES PNG BRAND ICON
   ========================================================================= */

export interface CleartrixIconProps {
  size?: number;
  className?: string;
  hasContainer?: boolean;
}

/**
 * Official Logomark for ClearTrix (PNG Format)
 */
export const CleartrixIcon: React.FC<CleartrixIconProps> = ({
  size = 36,
  className = "",
  hasContainer = false,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 flex items-center justify-center select-none rounded-full overflow-hidden ${
        hasContainer ? "bg-[#0F172A] p-[10%] shadow-xs" : ""
      } ${className}`}
    >
      <img
        src="/brand/logo-icon.png"
        width={size}
        height={size}
        alt={BRAND.name}
        className="w-full h-full object-contain rounded-full pointer-events-none"
        draggable={false}
      />
    </div>
  );
};

/* =========================================================================
   2. CLEARTRIX BRAND LOGO WITH HIGH-RES PNG ICON & GRADIENT WORDMARK
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

  // Wordmark colors per spec: Clear (#0F172A/white) + Trix gradient (#0EA5E9 to #06D6A0)
  const clearTextColor = isLight || variant === "dark" ? "text-white" : "text-[#0F172A] dark:text-white";

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        <CleartrixIcon size={Math.round(size * 1.5)} />
        <div className="flex flex-col items-center">
          <div className="flex items-baseline font-headings font-bold tracking-[-0.02em] text-2xl sm:text-3xl leading-none">
            <span className={clearTextColor}>{BRAND.brandPrefix}</span>
            <span className="bg-gradient-to-r from-[#0EA5E9] to-[#06D6A0] bg-clip-text text-transparent">
              {BRAND.brandSuffix}
            </span>
          </div>
          <span className="mt-1 text-[9px] sm:text-[10px] font-medium font-body uppercase tracking-[0.22em] text-[#94A3B8]">
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
          <div className="flex items-baseline font-headings text-base sm:text-lg font-bold tracking-[-0.02em] leading-none">
            <span className={clearTextColor}>{BRAND.brandPrefix}</span>
            <span className="bg-gradient-to-r from-[#0EA5E9] to-[#06D6A0] bg-clip-text text-transparent">
              {BRAND.brandSuffix}
            </span>
          </div>
          <span className="text-[9.5px] font-body font-medium tracking-[0.22em] uppercase text-[#94A3B8] mt-0.5">
            {BRAND.tagline}
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal Lockup (Icon + ClearTrix Wordmark)
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <CleartrixIcon size={size} />

      <div className="flex flex-col text-left justify-center">
        <div className="flex items-baseline font-headings text-lg sm:text-xl font-bold tracking-[-0.02em] leading-none">
          <span className={clearTextColor}>{BRAND.brandPrefix}</span>
          <span className="bg-gradient-to-r from-[#0EA5E9] to-[#06D6A0] bg-clip-text text-transparent">
            {BRAND.brandSuffix}
          </span>

          {productTag && (
            <span className="ml-2 font-body text-xs font-semibold text-slate-500 hidden sm:inline">
              / {productTag}
            </span>
          )}
        </div>
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
