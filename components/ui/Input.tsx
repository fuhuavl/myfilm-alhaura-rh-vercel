import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-noir-500 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full bg-noir-800 border text-white placeholder-noir-600 rounded-lg px-4 py-3 text-sm transition-all outline-none",
            error
              ? "border-crimson-500/60 focus:border-crimson-400"
              : "border-noir-700 focus:border-gold-400/60 hover:border-noir-600",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-crimson-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
