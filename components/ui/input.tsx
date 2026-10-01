import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 sm:h-10 w-full rounded-lg border bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-body text-slate-900 dark:text-slate-100 shadow-2xs transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-600",
          hasError
            ? "border-red-300 dark:border-red-800 focus-visible:border-red-600 focus-visible:ring-red-600/15 text-red-900 dark:text-red-300"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/15",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
