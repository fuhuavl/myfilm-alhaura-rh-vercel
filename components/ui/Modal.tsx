"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-noir-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          "relative bg-noir-800 border border-noir-700 rounded-2xl shadow-2xl w-full max-w-lg animate-fade-up",
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-noir-700/60">
          <h2 className="font-display text-xl tracking-wider text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-noir-500 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
