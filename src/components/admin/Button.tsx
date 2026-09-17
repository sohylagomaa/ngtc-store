import type { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./Spinner";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#1b7e41] text-white hover:bg-[#146031] focus-visible:outline-[#1b7e41] shadow-sm",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 shadow-sm",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400",
};

const sizeClasses = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof sizeClasses;
  loading?: boolean;
  icon?: ReactNode;
}

export default function AdminButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: AdminButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}