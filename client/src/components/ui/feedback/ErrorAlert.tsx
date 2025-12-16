"use client";

import React from "react";
import { X } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  title?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onDismiss,
  title = "Error",
}) => {
  return (
    <div className="p-3 bg-red-50 border border-red-300 rounded-md flex items-start justify-between gap-2">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-red-800">{title}</h3>
        <p className="text-sm text-red-700 mt-1">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 flex-shrink-0"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
