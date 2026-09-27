import React, { useState } from "react";
import { Download, Copy, Check, RotateCcw } from "lucide-react";
import { getCategoryTheme } from "@/lib/category-theme";
import { useToolContext } from "@/lib/tool-context";

export interface ResultPanelProps {
  title?: string;
  onDownload?: () => void;
  downloadLabel?: string;
  onCopy?: () => void;
  onReset?: () => void;
  children: React.ReactNode;
  /** CategoryId — drives Download button accent */
  categoryId?: string;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  title = "Result",
  onDownload,
  downloadLabel = "Download",
  onCopy,
  onReset,
  children,
  categoryId: categoryIdProp,
}) => {
  const [copied, setCopied] = useState(false);
  // Resolve: explicit prop wins; fallback to ToolContext
  const { categoryId: ctxCategoryId } = useToolContext();
  const resolvedId = categoryIdProp ?? ctxCategoryId ?? null;
  const theme = resolvedId ? getCategoryTheme(resolvedId) : null;

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Primary download button uses category accent; fallback navy
  const dlBgStyle = theme
    ? { backgroundColor: theme.primary }
    : { backgroundColor: "#1D4ED8" };

  return (
    <div
      className="rounded-[12px] border border-[#E2E8F0] bg-white overflow-hidden
        shadow-[0_1px_3px_rgba(15,23,42,0.05)]"
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between border-b border-[#E2E8F0]
          px-4 sm:px-5 py-3 flex-wrap gap-2"
      >
        <h3
          className="text-[11px] font-semibold text-[#475569] uppercase tracking-[0.05em]"
        >
          {title}
        </h3>

        <div className="flex items-center gap-2">
          {/* Copy — Secondary button */}
          {onCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5
                h-[34px] px-3 rounded-[8px]
                border border-[#CBD5E1] bg-white
                text-[13px] font-medium text-[#0F172A]
                hover:bg-[#F8F9FA] hover:border-[#94A3B8]
                transition-colors duration-150"
            >
              {copied ? (
                <>
                  <Check
                    className="h-3.5 w-3.5 text-emerald-600"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          {/* Download — Primary accent button */}
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5
                h-[34px] px-3 rounded-[8px]
                text-[13px] font-semibold text-white
                border border-black/10
                transition-all duration-150
                hover:brightness-95 hover:shadow-[0_2px_6px_rgba(0,0,0,0.12)]
                active:brightness-90 active:translate-y-px"
              style={dlBgStyle}
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              <span>{downloadLabel}</span>
            </button>
          )}

          {/* Reset — Secondary ghost */}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5
                h-[34px] px-3 rounded-[8px]
                border border-[#CBD5E1] bg-white
                text-[13px] font-medium text-[#475569]
                hover:bg-[#F8F9FA] hover:text-[#0F172A] hover:border-[#94A3B8]
                transition-colors duration-150"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
};
