import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-gold-400 text-noir-950 font-semibold hover:bg-gold-300 active:bg-gold-500",
      secondary:
        "bg-noir-700 text-white hover:bg-noir-600 border border-noir-600",
      ghost: "text-noir-500 hover:text-white hover:bg-noir-800",
      danger:
        "bg-crimson-500/10 text-crimson-400 border border-crimson-500/30 hover:bg-crimson-500/20",
      outline:
        "border border-noir-600 text-white hover:bg-noir-800 hover:border-noir-500",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-md",
      md: "px-5 py-2.5 text-sm rounded-lg",
      lg: "px-7 py-3.5 text-base rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed select-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
