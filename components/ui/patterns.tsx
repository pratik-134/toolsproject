import React from "react";

interface GridPatternProps {
  size?: number;
  className?: string;
  strokeColor?: string;
  strokeOpacity?: number;
}

/**
 * Blueprint-style technical grid pattern using lightweight inline SVG.
 * Pointer-events-none and absolute by default for zero interaction overhead.
 */
export const GridPattern: React.FC<GridPatternProps> = ({
  size = 40,
  className = "",
  strokeColor = "currentColor",
  strokeOpacity = 0.04,
}) => {
  const patternId = React.useId();

  return (
    <svg
      className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1"
            strokeOpacity={strokeOpacity}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
};

interface DotPatternProps {
  size?: number;
  dotSize?: number;
  className?: string;
  dotColor?: string;
  dotOpacity?: number;
}

/**
 * Modern tech dot pattern for subtle texture behind cards or sections.
 */
export const DotPattern: React.FC<DotPatternProps> = ({
  size = 24,
  dotSize = 1.25,
  className = "",
  dotColor = "currentColor",
  dotOpacity = 0.06,
}) => {
  const patternId = React.useId();

  return (
    <svg
      className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={dotSize}
            fill={dotColor}
            fillOpacity={dotOpacity}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
};

interface GlowProps {
  color?: "blue" | "indigo" | "sky" | "emerald" | "amber" | "slate";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Soft radial glow backdrop element for modern hero and CTA depth.
 */
export const Glow: React.FC<GlowProps> = ({
  color = "blue",
  size = "md",
  className = "",
}) => {
  const colorMap = {
    blue: "from-blue-500/15 via-blue-500/5 to-transparent",
    indigo: "from-blue-500/15 via-blue-500/5 to-transparent",
    emerald: "from-blue-500/15 via-blue-500/5 to-transparent",
    sky: "from-sky-500/15 via-sky-500/5 to-transparent",
    amber: "from-amber-500/15 via-amber-500/5 to-transparent",
    slate: "from-slate-400/10 via-slate-400/3 to-transparent",
  };

  const sizeMap = {
    sm: "w-[260px] h-[260px]",
    md: "w-[440px] h-[440px]",
    lg: "w-[640px] h-[640px]",
    xl: "w-[880px] h-[880px]",
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full bg-gradient-to-br blur-3xl ${colorMap[color]} ${sizeMap[size]} ${className}`}
    />
  );
};

interface SectionDividerProps {
  variant?: "subtle-line" | "angled" | "wave";
  fromBg?: string;
  toBg?: string;
  className?: string;
}

/**
 * Smooth transition divider between landing page sections to eliminate abrupt cuts.
 */
export const SectionDivider: React.FC<SectionDividerProps> = ({
  variant = "subtle-line",
  className = "",
}) => {
  if (variant === "angled") {
    return (
      <div
        className={`w-full overflow-hidden leading-none pointer-events-none ${className}`}
        aria-hidden="true"
      >
        <svg
          className="relative block w-full h-8 sm:h-12 text-slate-50"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M1200 0L0 120V120H1200V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent ${className}`}
      aria-hidden="true"
    />
  );
};

interface FloatingBadgeProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  delay?: "none" | "slow" | "delayed";
}

/**
 * Floating badge for hero showcase and technical callouts with subtle float animation.
 */
export const FloatingBadge: React.FC<FloatingBadgeProps> = ({
  icon,
  title,
  subtitle,
  className = "",
  delay = "none",
}) => {
  const animClass =
    delay === "delayed"
      ? "animate-float-delayed"
      : delay === "slow"
      ? "animate-float-slow"
      : "";

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200/80 p-2.5 sm:p-3 shadow-md transition-transform hover:scale-105 ${animClass} ${className}`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 border border-blue-100 text-blue-600 shrink-0">
        {icon}
      </div>
      <div className="min-w-0 text-left">
        <span className="font-headings text-xs font-bold text-slate-900 block leading-tight truncate">
          {title}
        </span>
        {subtitle && (
          <span className="font-body text-[10px] text-slate-500 font-medium block leading-tight truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

interface DiagonalDividerProps {
  direction?: "left-to-right" | "right-to-left";
  fillColor?: string;
  accentTint?: "blue" | "emerald" | "indigo" | "sky" | "slate" | "none";
  className?: string;
  heightClass?: string;
}

/**
 * High-precision diagonal transition divider with layered subtle tints (4-8% opacity).
 * Zero horizontal overflow.
 */
export const DiagonalDivider: React.FC<DiagonalDividerProps> = ({
  direction = "left-to-right",
  fillColor = "text-slate-50",
  accentTint = "blue",
  className = "",
  heightClass = "h-6 sm:h-10 lg:h-12",
}) => {
  const isLtr = direction === "left-to-right";

  const accentColor = {
    blue: "rgba(37, 99, 235, 0.05)",
    emerald: "rgba(37, 99, 235, 0.05)",
    indigo: "rgba(37, 99, 235, 0.05)",
    sky: "rgba(8, 145, 178, 0.04)",
    slate: "rgba(15, 23, 42, 0.04)",
    none: "transparent",
  }[accentTint];

  return (
    <div
      className={`w-full overflow-hidden leading-none pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className={`relative block w-full ${heightClass} ${fillColor}`}
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
      >
        {/* Layer 1: Subtle low-opacity accent geometric wedge (4-8% opacity) */}
        {accentTint !== "none" && (
          <path
            d={isLtr ? "M0,0 L1440,30 L1440,60 L0,60 Z" : "M1440,0 L0,30 L0,60 L1440,60 Z"}
            fill={accentColor}
          />
        )}
        {/* Layer 2: Main crisp diagonal divider path */}
        <path
          d={isLtr ? "M0,20 L1440,60 L0,60 Z" : "M1440,20 L0,60 L1440,60 Z"}
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

interface DiagonalDecorationProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  color?: "blue" | "emerald" | "indigo" | "sky" | "slate";
  className?: string;
}

/**
 * Geometric accent wedge for corner depth without heavy decoration.
 */
export const DiagonalDecoration: React.FC<DiagonalDecorationProps> = ({
  position = "top-right",
  color = "blue",
  className = "",
}) => {
  const colorMap = {
    blue: "from-blue-500/8 to-transparent",
    emerald: "from-blue-500/8 to-transparent",
    indigo: "from-blue-500/8 to-transparent",
    sky: "from-cyan-500/6 to-transparent",
    slate: "from-slate-400/8 to-transparent",
  };

  const posClass = {
    "top-right": "-top-12 -right-12",
    "top-left": "-top-12 -left-12",
    "bottom-right": "-bottom-12 -right-12",
    "bottom-left": "-bottom-12 -left-12",
  }[position];

  return (
    <div
      className={`pointer-events-none absolute w-56 h-56 rounded-full bg-gradient-to-br ${colorMap[color]} blur-xl ${posClass} ${className}`}
      aria-hidden="true"
    />
  );
};

interface PatternBackgroundProps {
  pattern?: "grid" | "dots" | "none";
  gridSize?: number;
  glowColor?: "blue" | "indigo" | "sky" | "emerald" | "amber" | "slate" | "none";
  glowPosition?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Reusable composite background container for section-level patterns and glows.
 */
export const PatternBackground: React.FC<PatternBackgroundProps> = ({
  pattern = "grid",
  gridSize = 48,
  glowColor = "none",
  glowPosition = "-top-32 -left-32",
  className = "",
  children,
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {pattern === "grid" && <GridPattern size={gridSize} />}
      {pattern === "dots" && <DotPattern size={24} />}
      {glowColor !== "none" && <Glow color={glowColor} className={glowPosition} />}
      {children}
    </div>
  );
};
