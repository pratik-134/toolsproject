import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-badge border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#3B82F6] text-white shadow-2xs hover:bg-[#2563EB]",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200/80 border border-slate-200",
        navy:
          "bg-[#0F172A] text-white hover:bg-[#1E293B]",
        active:
          "bg-[#06D6A0] text-[#0F172A] font-bold hover:bg-[#05b88a]",
        alert:
          "bg-red-600 text-white hover:bg-red-700",
        gold:
          "bg-amber-100 text-amber-900 border border-amber-300 font-bold",
        outline:
          "border border-blue-200 text-[#3B82F6] bg-blue-50 hover:bg-blue-100 hover:border-blue-300",
        pill:
          "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-xs sm:text-[13px] font-medium sm:font-semibold",
        section:
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200/90 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs sm:text-[13px] font-medium sm:font-semibold shadow-2xs backdrop-blur-md",
        eyebrow:
          "font-body text-xs sm:text-[13px] font-medium sm:font-semibold text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1 shadow-2xs",
        ai:
          "bg-sky-50 text-sky-700 border border-sky-200 font-medium",
        success:
          "bg-[#06D6A0]/15 text-[#047a5a] border border-[#06D6A0]/40 font-semibold",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200 font-medium",
        destructive:
          "bg-red-50 text-red-700 border border-red-200 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
