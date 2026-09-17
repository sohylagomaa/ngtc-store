import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

export default function Field({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
}: FieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-sm font-bold text-slate-800"
        >
          {label}
          {required && (
            <span className="mr-1 text-red-500" aria-hidden>
              *
            </span>
          )}
        </label>

        {hint && (
          <span className="text-xs text-slate-400">{hint}</span>
        )}
      </div>

      {children}

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}