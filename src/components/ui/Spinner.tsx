"use client";

import * as React from "react";
import { clsx } from "clsx";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        sizeClasses[size],
        "animate-spin rounded-full border-4 border-slate-200 border-t-primary-500",
        className
      )}
      {...props}
    />
  )
);
Spinner.displayName = "Spinner";

export { Spinner };
