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
        default: "h-10 px-5 py-2.5",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "px-7 py-3.5 rounded-lg min-h-[48px] text-base font-bold",
        icon: "h-8 w-8 rounded-lg",
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
