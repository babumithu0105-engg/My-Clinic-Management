"use client";

import * as React from "react";
import { clsx } from "clsx";
import { Spinner } from "./Spinner";

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  fullScreen?: boolean;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, message = "Loading...", fullScreen = true, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "flex items-center justify-center bg-black/20 backdrop-blur-sm",
        fullScreen
          ? "fixed inset-0 z-50"
          : "absolute inset-0 rounded-lg"
      )}
      {...props}
    >
      <div className="flex flex-col items-center justify-center space-y-4 rounded-xl bg-white p-8 shadow-xl">
        <Spinner size="lg" />
        <p className="text-lg font-medium text-slate-900">{message}</p>
        <p className="text-sm text-slate-500">Please wait...</p>
      </div>
    </div>
  )
);
LoadingOverlay.displayName = "LoadingOverlay";

export { LoadingOverlay };
