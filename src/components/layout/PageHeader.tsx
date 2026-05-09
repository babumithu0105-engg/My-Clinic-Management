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
        "mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && (
          <p className="text-base text-slate-600 font-normal">{description}</p>
        )}
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  )
);
PageHeader.displayName = "PageHeader";

export { PageHeader };
