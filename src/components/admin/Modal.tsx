"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

const sizeClasses = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-2xl",
};

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  closeable?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof sizeClasses;
}

export default function Modal({
  title,
  subtitle,
  onClose,
  closeable = true,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!closeable || !onClose) return;

    const handleClose = onClose;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () =>
      document.removeEventListener("keydown", handleKeyDown);
  }, [closeable, onClose]);

  // Prevent the background from scrolling while the modal is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (closeable && onClose && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl ${sizeClasses[size]}`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">{title}</h2>

            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>

          {closeable && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق النافذة"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer && (
          <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}