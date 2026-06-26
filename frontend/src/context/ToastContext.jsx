import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, PhoneCall } from 'lucide-react';
import Avatar from '../components/ui/Avatar';

const ToastContext = createContext(null);

const TOAST_DURATION = 4500;

function ToastItem({ toast, onDismiss, onNavigate }) {
  const { id, type, title, message, avatarSrc } = toast;

  const handleClick = () => {
    if (toast.convoId && onNavigate) onNavigate(toast.convoId);
    onDismiss(id);
  };

  return (
    <div
      role="alert"
      className="pointer-events-auto flex items-start gap-3 w-full max-w-sm p-4
                 bg-elevated/95 backdrop-blur-heavy border border-border-mid rounded-2xl
                 shadow-float animate-toast-in cursor-pointer
                 hover:border-border-accent transition-colors duration-200"
      onClick={handleClick}
    >
      {type === 'call' ? (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-soft flex items-center justify-center">
          <PhoneCall size={18} className="text-emerald" />
        </div>
      ) : (
        <Avatar src={avatarSrc} name={title} size="sm" />
      )}

      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-text-bright truncate">{title}</p>
        <p className="text-xs text-text-second mt-0.5 line-clamp-2">{message}</p>
      </div>

      <button
        type="button"
        aria-label="Dismiss"
        className="flex-shrink-0 p-1 rounded-lg text-text-muted hover:text-text-primary
                   hover:bg-overlay transition-colors"
        onClick={(e) => { e.stopPropagation(); onDismiss(id); }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss, onNavigate }) {
  if (!toasts.length) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-auto pointer-events-none pt-safe">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onNavigate={onNavigate}
        />
      ))}
    </div>,
    document.body
  );
}

export function ToastProvider({ children, onNavigateToConvo }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const navigateRef = useRef(onNavigateToConvo);
  navigateRef.current = onNavigateToConvo;

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback((toast) => {
    const id = toast.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const entry = { ...toast, id };

    setToasts(prev => {
      const filtered = toast.tag
        ? prev.filter(t => t.tag !== toast.tag)
        : prev;
      return [...filtered.slice(-4), entry];
    });

    const existing = timersRef.current.get(id);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => dismissToast(id), toast.duration ?? TOAST_DURATION);
    timersRef.current.set(id, timer);

    return id;
  }, [dismissToast]);

  const handleNavigate = useCallback((convoId) => {
    navigateRef.current?.(convoId);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        onNavigate={handleNavigate}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
