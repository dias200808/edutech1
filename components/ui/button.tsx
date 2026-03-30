"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-white shadow-lg shadow-blue-200/60 hover:-translate-y-0.5 hover:bg-[#0f4cab]",
        secondary: "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[#d7e4fb]",
        outline: "border bg-white/70 text-[var(--foreground)] hover:bg-white",
        ghost: "text-[var(--foreground)] hover:bg-slate-100/80",
        danger: "bg-[var(--danger)] text-white hover:bg-[#9a3412]",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-12 px-5",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
