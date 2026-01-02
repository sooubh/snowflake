'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
  };

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-xl border shadow-lg
        animate-in slide-in-from-top-5 fade-in duration-300
        ${colors[type]}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-neutral-dark dark:text-white">
          {title}
        </h4>
        {message && (
          <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
            {message}
          </p>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 text-neutral-400" />
      </button>
    </div>
  );
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
