import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  selectClassName?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      wrapperClassName,
      selectClassName,
      disabled = false,
      id,
      placeholder = "Seleccionar...",
      ...props
    },
    ref
  ) => {
    const selectId =
      id || label?.toLowerCase()?.replace(/\s+/g, "-") || undefined;

    return (
      <div className={wrapperClassName}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500",
              disabled && "bg-gray-100 cursor-not-allowed",
              selectClassName
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error || helperText ? `${selectId}-description` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              "mt-1 text-sm",
              error ? "text-red-600" : "text-gray-500"
            )}
            id={`${selectId}-description`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
