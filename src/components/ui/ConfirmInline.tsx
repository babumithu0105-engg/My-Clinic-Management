"use client";

import * as React from "react";
import { Button } from "./Button";
import { clsx } from "clsx";

export interface ConfirmInlineProps {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  isDangerous?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

const ConfirmInline = React.forwardRef<HTMLDivElement, ConfirmInlineProps>(
  (
    {
      trigger,
      children,
      title,
      description,
      confirmText = "Confirm",
      cancelText = "Cancel",
      onConfirm,
      isDangerous = true,
      isLoading = false,
      disabled = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading_internal, setIsLoading] = React.useState(false);

    const handleConfirm = async () => {
      setIsLoading(true);
      try {
        await onConfirm();
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isOpen) {
      return (
        <div
          ref={ref}
          onClick={() => !disabled && setIsOpen(true)}
          className={disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        >
          {trigger || children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(
          "flex flex-col space-y-3 rounded-lg border-2 border-slate-300 bg-slate-50 p-4",
          isDangerous && "border-red-300 bg-red-50"
        )}
      >
        <div className="space-y-1">
          <h4 className="font-medium text-slate-900">{title}</h4>
          {description && (
            <p className="text-sm text-slate-600">{description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOpen(false)}
            disabled={isLoading_internal}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? "danger" : "primary"}
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading_internal || isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    );
  }
);
ConfirmInline.displayName = "ConfirmInline";

export { ConfirmInline };
