import { AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 8000 }: ToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] transform transition-all duration-300 translate-y-0 opacity-100 animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-white border-l-4 border-red-500 shadow-2xl rounded-r-xl p-4 pr-12 min-w-[300px] max-w-md relative flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-gray-800 leading-relaxed">{message}</p>
        <button 
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
