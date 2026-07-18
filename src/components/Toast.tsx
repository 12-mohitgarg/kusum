import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (text: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 100000,
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => {
          let bgColor = '#1e3f20'; // success green-dark
          let icon = '🌾';
          if (toast.type === 'error') {
            bgColor = '#c62828';
            icon = '⚠️';
          } else if (toast.type === 'info') {
            bgColor = '#2b2b2b';
            icon = 'ℹ️';
          }

          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 24px',
                borderRadius: '8px',
                color: '#ffffff',
                backgroundColor: bgColor,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                pointerEvents: 'auto',
                animation: 'toastSlideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                maxWidth: '350px'
              }}
            >
              <span style={{ fontSize: '16px' }}>{icon}</span>
              <span style={{ flex: 1 }}>{toast.text}</span>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  lineHeight: 1,
                  padding: '2px',
                  marginLeft: '8px'
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%) translateY(0);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
