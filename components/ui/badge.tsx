import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-badge border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none select-none",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-2xs hover:bg-blue-700",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200/80 border border-slate-200",
        navy:
          "bg-slate-900 text-white hover:bg-slate-800",
        active:
          "bg-blue-600 text-white hover:bg-blue-700",
        alert:
          "bg-red-600 text-white hover:bg-red-700",
        gold:
          "bg-amber-100 text-amber-900 border border-amber-300 font-bold",
        outline:
          "border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300",
        pill:
          "bg-slate-100 text-slate-700 hover:text-blue-600 px-2 py-0.5 rounded-full border border-slate-200",
        eyebrow:
          "font-body text-xs font-medium text-slate-600 bg-white border border-slate-200/80 rounded-full px-3 py-1",
        ai:
          "bg-sky-50 text-sky-700 border border-sky-200 font-medium",
        success:
          "bg-blue-50 text-blue-700 border border-blue-200 font-medium",
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
