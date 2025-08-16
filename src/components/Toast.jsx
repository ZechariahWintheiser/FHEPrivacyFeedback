import React, { useEffect } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';

function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-500 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <ToastPrimitive.Root
        className={`fixed bottom-8 right-8 z-50 rounded-lg border-2 p-4 shadow-lg max-w-md animate-slideIn ${getStyles()}`}
        open={true}
        onOpenChange={(open) => !open && onClose()}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{getIcon()}</span>
          <div className="flex-1">
            <ToastPrimitive.Description className="font-medium">
              {message}
            </ToastPrimitive.Description>
          </div>
          <ToastPrimitive.Close
            className="ml-2 text-gray-500 hover:text-gray-700 font-bold text-xl"
            onClick={onClose}
          >
            ×
          </ToastPrimitive.Close>
        </div>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport />
    </ToastPrimitive.Provider>
  );
}

export default Toast;
