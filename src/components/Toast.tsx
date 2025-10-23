"use client";

import { useEffect } from "react";
import { X, CheckCircle } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
      <div className="bg-black text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px]">
        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
        <span className="flex-1 font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
