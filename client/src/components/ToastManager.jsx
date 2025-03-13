import React, { useState, useEffect, createContext, useContext } from 'react';
import Toast from './Toast';
import { onTokenExpirationWarning } from '../lib/tokenManager';

// Create a context for the toast notifications
const ToastContext = createContext();

// Counter for unique toast IDs
let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Listen for token expiration warnings
  useEffect(() => {
    const unsubscribe = onTokenExpirationWarning(() => {
      addToast({
        message: 'Your session is about to expire. Please save your work and refresh the page.',
        type: 'warning',
        duration: 0 // 0 means it won't auto-dismiss
      });
    });

    return () => unsubscribe();
  }, []);

  const addToast = ({ message, type = 'info', duration = 5000 }) => {
    const id = toastIdCounter++;
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  const value = { addToast, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-wrapper">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Helper function to get toast context without using hooks (for use in non-React files)
let toastContextValue = null;
export const setToastContextForExternalUse = (contextValue) => {
  toastContextValue = contextValue;
};

export const showToast = ({ message, type = 'info', duration = 5000 }) => {
  if (toastContextValue) {
    return toastContextValue.addToast({ message, type, duration });
  }
  // Fallback to console if toast context is not available
  console.log(`Toast (${type}): ${message}`);
  return -1;
};
