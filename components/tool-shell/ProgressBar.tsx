import React from "react";
import { XCircle } from "lucide-react";
import { getCategoryTheme } from "@/lib/category-theme";
import { useToolContext } from "@/lib/tool-context";

export interface ProgressBarProps {
  /** 0–100 */
  progress: number;
  label?: string;
  onCancel?: () => void;
  /** CategoryId — drives progress fill accent color */
  categoryId?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label = "Processing locally...",
  onCancel,
  categoryId: categoryIdProp,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));
  // Resolve: explicit prop wins; fallback to ToolContext
  const { categoryId: ctxCategoryId } = useToolContext();
  const resolvedId = categoryIdProp ?? ctxCategoryId ?? null;
  const theme = resolvedId ? getCategoryTheme(resolvedId) : null;

  // Solid accent fill — no glow
  const fillColor = theme ? theme.primary : "#1D4ED8";

  return (
    <div
      className="rounded-[12px] border border-[#E2E8F0] bg-white px-4 py-3.5 shadow-sm
        space-y-2.5"
    >
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#475569]">{label}</span>
        <span
          className="text-[13px] font-medium text-[#0F172A] tabular-nums"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {clamped}%
        </span>
      </div>

      {/* Track — 6px, radius 3px, no glow */}
      <div
        className="w-full bg-[#E2E8F0] overflow-hidden"
        style={{ height: 6, borderRadius: 3 }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${clamped}%`,
            borderRadius: 3,
            backgroundColor: fillColor,
          }}
        />
      </div>

      {/* Cancel */}
      {onCancel && (
        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5
              h-[30px] px-3 rounded-[8px]
              border border-[#CBD5E1] bg-white
              text-[12px] font-medium text-[#475569]
              hover:border-red-300 hover:text-red-600
              transition-colors duration-150"
          >
            <XCircle className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>Cancel</span>
          </button>
        </div>
      )}
    </div>
  );
};
