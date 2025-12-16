"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  variant = "primary",
  fullWidth = true,
  className = "",
  disabled,
  ...props
}) => {
  const variants = {
    primary:
      "bg-primaryColor hover:bg-[#3f905a] active:bg-[#3f905a] text-white",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`px-4 py-2.5 text-[15px] font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        variants[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
