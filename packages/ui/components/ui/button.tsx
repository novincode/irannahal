import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@ui/lib/utils"

const buttonVariants = cva(
  "inline-flex cursor-pointer active:scale-90 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border  shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        primary_outline:
          "border border-primary text-primary bg-transparent hover:bg-primary/10 ",
        primary_ghost:
          "bg-primary/10 hover:bg-primary/15 ",
        info:
          "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
        success:
          "bg-green-500/10 text-green-700 hover:bg-green-500/20",
        warning:
          "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20",
        danger:
          "bg-red-500/10 text-red-700 hover:bg-red-500/20",
        info_outline:
          "border border-blue-500 text-blue-700 bg-transparent hover:bg-blue-500/10",
        success_outline:
          "border border-green-500 text-green-700 bg-transparent hover:bg-green-500/10",
        warning_outline:
          "border border-yellow-500 text-yellow-700 bg-transparent hover:bg-yellow-500/10",
        danger_outline:
          "border border-red-500 text-red-700 bg-transparent hover:bg-red-500/10",
        info_ghost:
          "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
        success_ghost:
          "bg-green-500/10 text-green-700 hover:bg-green-500/20",
        warning_ghost:
          "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20",
        danger_ghost:
          "bg-red-500/10 text-red-700 hover:bg-red-500/20",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        icon_sm: "size-6",
        icon_md: "size-8",
        icon_lg: "size-10",
        icon_xl: "size-12",
        auto: 'w-auto h-auto',
        full: 'w-full h-full',
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
