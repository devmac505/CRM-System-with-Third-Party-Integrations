import React, { useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const Alert = ({
  type = 'info',
  message,
  title,
  dismissible = true,
  onDismiss,
  className = '',
  ...props
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const alertStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const iconComponents = {
    success: <FaCheckCircle className={`h-5 w-5 ${iconColors[type]}`} />,
    error: <FaExclamationCircle className={`h-5 w-5 ${iconColors[type]}`} />,
    warning: <FaExclamationTriangle className={`h-5 w-5 ${iconColors[type]}`} />,
    info: <FaInfoCircle className={`h-5 w-5 ${iconColors[type]}`} />,
  };

  return (
    <div
      className={`rounded-md border p-4 ${alertStyles[type]} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {iconComponents[type]}
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-base font-medium">{title}</h3>}
          <div className={`text-sm ${title ? 'mt-2' : ''}`}>
            {message}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div>
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 ${iconColors[type]} hover:bg-opacity-20 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue'}-500`}
                onClick={handleDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
