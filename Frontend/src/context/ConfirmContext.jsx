import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2, AlertCircle, X } from 'lucide-react';

const ConfirmContext = createContext(null);

const VARIANT_CONFIG = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-600 dark:text-red-500',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    confirmBg: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-yellow-600 dark:text-yellow-500',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    confirmBg: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    confirmBg: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-600 dark:text-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    confirmBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
};

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        title: 'Konfirmasi',
        message: '',
        confirmText: 'Ya',
        cancelText: 'Batal',
        variant: 'warning',
        ...options
      });
    });
  }, []);

  const close = useCallback((value) => {
    if (resolverRef.current) {
      resolverRef.current(value);
      resolverRef.current = null;
    }
    setDialog(null);
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && (
        <ConfirmDialogUI
          dialog={dialog}
          onConfirm={() => close(true)}
          onCancel={() => close(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialogUI({ dialog, onConfirm, onCancel }) {
  const config = VARIANT_CONFIG[dialog.variant] || VARIANT_CONFIG.warning;
  const Icon = config.icon;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0" 
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-800 p-6 animate-in zoom-in-95 duration-200 mx-4">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center text-center mt-2">
          <div className={`shrink-0 p-4 rounded-full mb-4 ${config.iconBg} ${config.iconColor}`}>
            <Icon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
            {dialog.title}
          </h3>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            {dialog.message}
          </p>
        </div>

        <div className="flex justify-center gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 font-medium text-surface-700 bg-surface-100 hover:bg-surface-200 dark:text-surface-300 dark:bg-surface-800 dark:hover:bg-surface-700 rounded-xl transition-colors"
          >
            {dialog.cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 font-medium rounded-xl transition-colors ${config.confirmBg}`}
          >
            {dialog.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used inside ConfirmProvider');
  }
  return context;
}
