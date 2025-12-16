"use client";

import React, { useState, forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== "";

    const isFloating = isFocused || hasValue;

    return (
      <div className="w-full">
        <div className="relative">
          <input
            ref={ref}
            {...props}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              w-full
              px-3
              pt-5
              pb-2
              text-sm
              text-gray-700
              bg-white
              border
              ${error ? "border-red-500" : "border-gray-300"}
              rounded-md
              outline-none
              transition-all
              duration-200
              focus:border-blue-500
              ${className}
            `}
          />
          <label
            className={`
              absolute
              left-3
              transition-all
              duration-200
              pointer-events-none
              ${
                isFloating
                  ? "top-1.5 text-xs text-gray-500"
                  : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
              }
            `}
          >
            {label}
          </label>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
