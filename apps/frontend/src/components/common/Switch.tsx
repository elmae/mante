import React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

export function Switch({
  label,
  checked,
  onChange,
  disabled = false,
  className,
  labelClassName,
}: SwitchProps) {
  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          checked ? "bg-primary-600" : "bg-gray-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </div>
      {label && (
        <span
          className={cn(
            "ml-3 text-sm font-medium text-gray-900",
            disabled && "opacity-50",
            labelClassName
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}
