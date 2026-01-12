import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-brand-green text-neutral-900 hover:bg-lime-500",
    secondary: "bg-brand-red text-white hover:bg-red-600",
    dark: "bg-brand-dark text-white hover:bg-black",
    outline: "border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg font-bold"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-brand transition-all active:scale-95 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
