"use client";

import * as React from "react";
import { clsx } from "clsx";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      {icon && <div className="text-slate-400">{icon}</div>}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="text-sm text-slate-600">{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
