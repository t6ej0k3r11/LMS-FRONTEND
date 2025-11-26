import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[hsl(var(--brand-green))] via-[hsl(var(--brand-green-bright))] to-[hsl(var(--brand-red))] text-primary-foreground shadow-[0_15px_40px_rgba(3,106,78,0.3)] hover:shadow-[0_25px_55px_rgba(3,106,78,0.35)] hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_10px_25px_rgba(244,42,65,0.3)] hover:bg-destructive/90 hover:-translate-y-0.5",
        outline:
          "border border-[hsla(var(--brand-green)/0.35)] bg-transparent text-foreground hover:text-primary hover:border-[hsla(var(--brand-green)/0.6)] hover:bg-[hsla(var(--brand-mist)/0.35)]",
        secondary:
          "bg-white/80 text-foreground shadow-[0_14px_30px_rgba(0,0,0,0.08)] border border-white/60 hover:text-primary hover:-translate-y-0.5",
        ghost:
          "text-muted-foreground hover:text-primary hover:bg-[hsla(var(--brand-green)/0.08)]",
        link: "text-primary underline-offset-4 hover:underline",
        soft: "bg-[hsla(var(--brand-green)/0.12)] text-primary shadow-none hover:bg-[hsla(var(--brand-green)/0.2)]",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export { buttonVariants };
