import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  onChange?: (value: string) => void;
  minDate?: string;
  maxDate?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      label,
      error,
      helperText,
      wrapperClassName,
      inputClassName,
      onChange,
      value,
      disabled = false,
      id,
      minDate,
      maxDate,
      ...props
    },
    ref
  ) => {
    const inputId =
      id || label?.toLowerCase()?.replace(/\s+/g, "-") || undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className={wrapperClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            {...props}
            ref={ref}
            id={inputId}
            type="date"
            value={value || ""}
            onChange={handleChange}
            disabled={disabled}
            min={minDate}
            max={maxDate}
            className={cn(
              "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500",
              disabled && "bg-gray-100 cursor-not-allowed",
              inputClassName
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error || helperText ? `${inputId}-description` : undefined
            }
          />
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              "mt-1 text-sm",
              error ? "text-red-600" : "text-gray-500"
            )}
            id={`${inputId}-description`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";
