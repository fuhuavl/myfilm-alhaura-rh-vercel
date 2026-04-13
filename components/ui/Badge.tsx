import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "crimson" | "neutral" | "green";
  className?: string;
}

export default function Badge({ children, variant = "neutral", className }: BadgeProps) {
  const variants = {
    gold: "bg-gold-400/15 text-gold-400 border-gold-400/30",
    crimson: "bg-crimson-400/15 text-crimson-400 border-crimson-400/30",
    neutral: "bg-noir-700 text-noir-500 border-noir-600",
    green: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
