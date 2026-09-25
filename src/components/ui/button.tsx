import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-200 ease-out focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-[#c46a45] text-[#171614] shadow-[0_8px_24px_rgba(196,106,69,0.18)] hover:bg-[#d9825d] hover:shadow-[0_8px_24px_rgba(196,106,69,0.18)]",
                secondary: "border border-[rgba(232,225,213,0.18)] bg-transparent text-[#e8e1d5] hover:border-[#e8e1d5] hover:bg-[#e8e1d5] hover:text-[#171614]",
                ghost: "bg-transparent text-[#d8d1c5] hover:bg-[#211f1c] hover:text-[#e8e1d5]",
            },
            size: {
                default: "h-11 px-5",
                sm: "h-9 px-4 text-[11px]",
                lg: "h-12 px-6",
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
