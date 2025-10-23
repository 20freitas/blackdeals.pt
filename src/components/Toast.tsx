"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: "success" | "error";
}

export default function Toast({ message, onClose, duration = 3000, type = "success" }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === "success" ? "bg-black" : "bg-red-600";
  const iconColor = type === "success" ? "text-green-400" : "text-white";
  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px]`}>
        <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0`} />
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
