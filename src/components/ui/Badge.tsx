"use client";

import * as React from "react";
import { clsx } from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "walk-in"
    | "scheduled"
    | "completed";
  size?: "sm" | "md";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" && "px-2 py-1 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        variant === "default" && "bg-slate-100 text-slate-800",
        variant === "success" && "bg-green-100 text-green-800",
        variant === "danger" && "bg-red-100 text-red-800",
        variant === "warning" && "bg-amber-100 text-amber-800",
        variant === "info" && "bg-sky-100 text-sky-800",
        variant === "walk-in" && "bg-violet-100 text-violet-800",
        variant === "scheduled" && "bg-blue-100 text-blue-800",
        variant === "completed" && "bg-green-100 text-green-800",
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge };
