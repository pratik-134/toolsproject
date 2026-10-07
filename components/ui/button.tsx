import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30 focus-visible:border-[#3B82F6] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#3B82F6] to-[#0EA5E9] text-white shadow-xs hover:opacity-95 hover:shadow-sm active:scale-[0.99]",
        secondary:
          "bg-[#0F172A] text-white shadow-xs hover:bg-[#1E293B] active:bg-[#0F172A] dark:bg-slate-800 dark:hover:bg-slate-700",
        outline:
          "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:bg-slate-100 dark:active:bg-slate-800 shadow-2xs",
        glass:
          "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:bg-slate-50 dark:active:bg-slate-900",
        destructive:
          "bg-red-600 text-white shadow-xs hover:bg-red-700 active:bg-red-800",
        ghost:
          "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200/70 dark:active:bg-slate-700",
        link:
          "text-[#3B82F6] dark:text-blue-400 underline-offset-4 hover:underline hover:text-[#2563EB] dark:hover:text-blue-300 font-semibold",
      },
      size: {
        default: "h-10 sm:h-11 min-h-[40px] sm:min-h-[44px] rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold",
        sm: "h-8.5 sm:h-9 min-h-[34px] sm:min-h-[36px] rounded-lg px-3 sm:px-3.5 text-xs font-semibold",
        md: "h-10 sm:h-11 min-h-[40px] sm:min-h-[44px] rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold",
        lg: "h-11 sm:h-12 md:h-[50px] min-h-[44px] sm:min-h-[48px] rounded-xl px-5 sm:px-6 md:px-7 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base font-bold",
        icon: "h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] rounded-xl",
        "icon-sm": "h-8 w-8 sm:h-8.5 sm:w-8.5 min-h-[32px] min-w-[32px] rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
