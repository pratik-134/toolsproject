import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-xs hover:bg-blue-700 hover:shadow-sm active:bg-blue-800",
        secondary:
          "bg-slate-900 text-white shadow-xs hover:bg-slate-800 active:bg-slate-950",
        outline:
          "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 shadow-2xs",
        glass:
          "bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200 hover:bg-white active:bg-slate-50",
        destructive:
          "bg-red-600 text-white shadow-xs hover:bg-red-700 active:bg-red-800",
        ghost:
          "text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200/70",
        link:
          "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 font-semibold",
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
