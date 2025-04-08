import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "outline" | "danger" | "link";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "default",
      size = "md",
      loading = false,
      disabled,
      icon,
      ...props
    },
    ref
  ) => {
    const variants = {
      default:
        "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
      outline:
        "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      link: "bg-transparent text-primary-600 hover:text-primary-700 hover:underline focus:ring-primary-500 p-0",
    };

    const sizes = {
      sm: "px-2.5 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variant !== "link" && variants[variant],
          variant !== "link" && sizes[size],
          variant === "link" && "p-0",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Spinner className="mr-2" />
            {children}
          </>
        ) : (
          <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
