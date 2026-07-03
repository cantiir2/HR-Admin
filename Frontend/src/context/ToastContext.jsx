// Name Function : ToastContext
// Author : Iyan.FID
// Description : Global context for toast notification system across the app

import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ type = 'info', title, message, duration }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    
    let defaultDuration = 3000;
    if (type === 'error' || type === 'warning') defaultDuration = 4500;
    if (type === 'info') defaultDuration = 3500;

    const hideDuration = duration !== undefined ? duration : defaultDuration;

    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (hideDuration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, hideDuration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        className="fixed left-3 right-3 z-[9999] flex flex-col gap-3 sm:left-auto sm:right-4 sm:w-full sm:max-w-sm pointer-events-none"
        style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const { type, title, message } = toast;

  const typeConfig = {
    success: {
      icon: <CheckCircle size={20} className="shrink-0" />,
      classes: 'border-green-200 bg-green-50 text-green-800'
    },
    error: {
      icon: <AlertCircle size={20} className="shrink-0" />,
      classes: 'border-red-200 bg-red-50 text-red-800'
    },
    warning: {
      icon: <AlertTriangle size={20} className="shrink-0" />,
      classes: 'border-yellow-200 bg-yellow-50 text-yellow-800'
    },
    info: {
      icon: <Info size={20} className="shrink-0" />,
      classes: 'border-blue-200 bg-blue-50 text-blue-800'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`flex items-start gap-3 w-full rounded-xl border p-4 shadow-lg pointer-events-auto ${config.classes} animate-slide-down`}>
      {config.icon}
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-sm break-words">{title}</h4>}
        {message && <p className="text-sm mt-0.5 break-words">{message}</p>}
      </div>
      <button onClick={onRemove} className="shrink-0 hover:opacity-70 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};
