"use client";

import * as React from "react";
import { clsx } from "clsx";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "mb-6 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center",
        className
      )}
      {...props}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {description && (
          <p className="text-slate-600">{description}</p>
        )}
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  )
);
PageHeader.displayName = "PageHeader";

export { PageHeader };
