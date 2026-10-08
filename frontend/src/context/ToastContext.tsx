import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showActionToast: (message: string, action: ToastAction, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const showActionToast = (
    message: string,
    action: ToastAction,
    type: ToastType = 'info',
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, action, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, showActionToast }}>
      {children}
      <div 
        className="toast-container"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 9999,
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: 'var(--bg-walnut-surface)',
              border: `1px solid ${
                toast.type === 'success'
                  ? 'var(--pine-emerald)'
                  : toast.type === 'error'
                  ? 'var(--crimson-rose)'
                  : 'var(--border-copper-subtle)'
              }`,
              boxShadow: 'var(--shadow-warm-md)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--text-kehwa-cream)',
              fontSize: '0.9rem',
              minWidth: '280px',
              maxWidth: '440px',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} color="#4ADE80" style={{ flexShrink: 0 }} />}
            {toast.type === 'error' && <AlertCircle size={18} color="#F87171" style={{ flexShrink: 0 }} />}
            {toast.type === 'info' && <Info size={18} color="var(--saffron-ember)" style={{ flexShrink: 0 }} />}
            
            <span style={{ flex: 1, wordBreak: 'break-word' }}>{toast.message}</span>

            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick();
                  removeToast(toast.id);
                }}
                style={{
                  background: 'rgba(226, 149, 59, 0.2)',
                  border: '1px solid var(--saffron-ember)',
                  color: 'var(--saffron-ember)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'var(--transition-smooth)',
                }}
              >
                {toast.action.label}
              </button>
            )}

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-tweed-dim)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
