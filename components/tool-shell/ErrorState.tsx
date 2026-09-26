import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  message: string;
  suggestion?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  suggestion = "Please check your input file or formatting and try again.",
  onRetry,
}) => {
  return (
    <div
      className="rounded-xl border border-[#FECACA] bg-[#FEF2F2]
        px-5 py-6 text-center space-y-4"
    >
      {/* Icon */}
      <div
        className="mx-auto flex h-10 w-10 items-center justify-center
          rounded-full bg-red-100 text-red-600"
      >
        <AlertCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </div>

      {/* Text */}
      <div className="space-y-1.5">
        <h4 className="text-[15px] font-semibold text-red-900">{title}</h4>
        <p className="text-[13px] leading-[1.5] text-red-700 max-w-md mx-auto">
          {message}
        </p>
        {suggestion && (
          <p className="text-[13px] text-red-600/80 pt-0.5">{suggestion}</p>
        )}
      </div>

      {/* Retry */}
      {onRetry && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5
              h-[40px] px-[18px] rounded-[8px]
              border border-red-300 bg-white
              text-[13px] font-medium text-red-800
              hover:bg-red-50
              transition-colors duration-150"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
