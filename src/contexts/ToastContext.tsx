"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'neutral' | 'brand';
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const showSuccess = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: 'success'
    });
  }, [showToast]);

  const showError = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: 'error'
    });
  }, [showToast]);



  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}
      
      {/* Toast container */}
      <div 
        className="fixed top-4 right-4 z-50 flex flex-col gap-2"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '16px',
              minWidth: '300px',
              maxWidth: '400px',
              animation: 'slideInFromRight 0.3s ease-out',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: toast.variant === 'success' ? '#059669' : 
                         toast.variant === 'error' ? '#dc2626' : '#374151',
                  marginBottom: '4px'
                }}>
                  {toast.title}
                </div>
                {toast.description && (
                  <div style={{ 
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    {toast.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  marginLeft: '12px',
                  color: '#9ca3af',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{
              position: 'absolute',
              left: '0',
              top: '0',
              bottom: '0',
              width: '4px',
              borderTopLeftRadius: '8px',
              borderBottomLeftRadius: '8px',
              backgroundColor: toast.variant === 'success' ? '#10b981' : 
                               toast.variant === 'error' ? '#ef4444' : '#6b7280'
            }} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};