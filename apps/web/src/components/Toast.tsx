'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: ReactNode;
  type: ToastType;
  duration?: number;
  isExiting?: boolean;
}

export interface ToastContextType {
  showToast: (message: ReactNode, type?: ToastType, duration?: number) => string;
  dismissToast: (id: string) => void;
  success: (message: ReactNode, duration?: number) => string;
  error: (message: ReactNode, duration?: number) => string;
  info: (message: ReactNode, duration?: number) => string;
  warning: (message: ReactNode, duration?: number) => string;
  toasts: ToastItem[];
}

const ToastContext = createContext<ToastContextType | null>(null);

const DEFAULT_DURATION = 3000; // 3 seconds

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100);
  const duration = toast.duration ?? DEFAULT_DURATION;
  const remainingTimeRef = useRef<number>(duration);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Trigger slide-in animation on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Timer & progress bar handling with pause-on-hover support
  useEffect(() => {
    if (toast.isExiting) return;

    if (!isHovered) {
      startTimeRef.current = Date.now();
      const currentRemaining = remainingTimeRef.current;

      timerRef.current = setTimeout(() => {
        onDismiss(toast.id);
      }, currentRemaining);

      const updateProgress = () => {
        const elapsedSinceResume = Date.now() - startTimeRef.current;
        const totalRemaining = Math.max(0, currentRemaining - elapsedSinceResume);
        const percent = Math.max(0, (totalRemaining / duration) * 100);
        setProgress(percent);

        if (totalRemaining > 0) {
          animFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };

      animFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isHovered, toast.id, toast.isExiting, duration, onDismiss]);

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      containerClasses:
        'border-emerald-200/80 bg-white/95 dark:bg-slate-900/95 dark:border-emerald-800/60 shadow-emerald-500/10',
      iconContainerClasses:
        'bg-emerald-100/80 text-brand-600 dark:bg-emerald-950/80 dark:text-brand-400 border border-emerald-200/60 dark:border-emerald-800/50',
      progressBarClasses: 'bg-brand-500',
      title: "Muvaffaqiyatli",
      badgeColor: 'text-brand-700 dark:text-brand-400',
    },
    error: {
      icon: XCircle,
      containerClasses:
        'border-red-200/80 bg-white/95 dark:bg-slate-900/95 dark:border-red-800/60 shadow-red-500/10',
      iconContainerClasses:
        'bg-red-100/80 text-red-600 dark:bg-red-950/80 dark:text-red-400 border border-red-200/60 dark:border-red-800/50',
      progressBarClasses: 'bg-red-500',
      title: "Xatolik",
      badgeColor: 'text-red-700 dark:text-red-400',
    },
    warning: {
      icon: AlertTriangle,
      containerClasses:
        'border-amber-200/80 bg-white/95 dark:bg-slate-900/95 dark:border-amber-800/60 shadow-amber-500/10',
      iconContainerClasses:
        'bg-amber-100/80 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50',
      progressBarClasses: 'bg-amber-500',
      title: "Diqqat",
      badgeColor: 'text-amber-700 dark:text-amber-400',
    },
    info: {
      icon: Info,
      containerClasses:
        'border-blue-200/80 bg-white/95 dark:bg-slate-900/95 dark:border-blue-800/60 shadow-blue-500/10',
      iconContainerClasses:
        'bg-blue-100/80 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50',
      progressBarClasses: 'bg-blue-500',
      title: "Ma'lumot",
      badgeColor: 'text-blue-700 dark:text-blue-400',
    },
  }[toast.type];

  const IconComponent = typeConfig.icon;
  const isVisible = isMounted && !toast.isExiting;

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative pointer-events-auto w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 ease-out transform select-none ${
        typeConfig.containerClasses
      } ${
        isVisible
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-12 opacity-0 scale-95'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Type Icon Badge */}
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${typeConfig.iconContainerClasses}`}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug break-words">
            {toast.message}
          </div>
        </div>

        {/* Dismiss Close Button */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 -mr-1 -mt-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          aria-label="Yopish"
          title="Yopish"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar (countdown indicator) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/60 dark:bg-slate-800/60 overflow-hidden">
        <div
          className={`h-full ${typeConfig.progressBarClasses} transition-all duration-75 ease-linear opacity-80`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    // 1. Mark as exiting for smooth slide-out animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );

    // 2. Remove completely from state after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback(
    (message: ReactNode, type: ToastType = 'info', duration: number = DEFAULT_DURATION): string => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const newToast: ToastItem = {
        id,
        message,
        type,
        duration,
        isExiting: false,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const success = useCallback(
    (message: ReactNode, duration?: number) => showToast(message, 'success', duration),
    [showToast]
  );

  const error = useCallback(
    (message: ReactNode, duration?: number) => showToast(message, 'error', duration),
    [showToast]
  );

  const info = useCallback(
    (message: ReactNode, duration?: number) => showToast(message, 'info', duration),
    [showToast]
  );

  const warning = useCallback(
    (message: ReactNode, duration?: number) => showToast(message, 'warning', duration),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        dismissToast,
        success,
        error,
        info,
        warning,
        toasts,
      }}
    >
      {children}

      {/* Floating Toast Viewport Container */}
      <aside
        aria-label="Bildirishnomalar"
        className="fixed top-4 right-4 z-[9999] pointer-events-none flex flex-col items-end gap-2.5 max-w-full p-4 sm:p-0"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
