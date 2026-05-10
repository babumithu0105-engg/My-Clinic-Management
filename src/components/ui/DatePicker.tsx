import * as React from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  error,
  helperText,
  disabled = false,
  required = false,
  min,
  placeholder = "Select a date",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = value ? new Date(value) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      onChange(formattedDate);
      setOpen(false);
    }
  };

  const displayValue = value
    ? format(new Date(value), "MMM dd, yyyy")
    : placeholder;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={clsx(
              "w-full px-3 py-2.5 border rounded-lg text-left text-sm font-normal transition-colors",
              "flex items-center justify-between",
              "bg-white",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              error
                ? "border-red-500 text-red-500"
                : "border-clinic-border",
              disabled && "opacity-50 bg-slate-50 cursor-not-allowed"
            )}
          >
            <span className={!value ? "text-slate-400 opacity-50" : "text-slate-900"}>
              {displayValue}
            </span>
            <CalendarIcon className="h-4 w-4 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              disabled={(date) => {
                if (min) {
                  return date < new Date(min);
                }
                return false;
              }}
              showOutsideDays={true}
              className="rdp"
              classNames={{
                months: "flex flex-col space-y-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center w-full px-8",
                caption_label: "text-sm font-medium",
                nav: "absolute inset-x-0 flex justify-between px-1 top-0",
                nav_button: clsx(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  "inline-flex items-center justify-center rounded-md"
                ),
                nav_button_previous: "",
                nav_button_next: "",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: clsx(
                  "text-slate-600 rounded-md w-9 font-normal text-[0.8rem]",
                  "flex items-center justify-center"
                ),
                row: "flex w-full mt-2",
                cell: clsx(
                  "h-9 w-9 text-center text-sm p-0 relative",
                  "[&:has([aria-selected].day-range-end)]:rounded-r-md",
                  "[&:has([aria-selected].day-outside)]:bg-slate-100/50",
                  "[&:has([aria-selected])]:bg-slate-100",
                  "first:[&:has([aria-selected])]:rounded-l-md",
                  "last:[&:has([aria-selected])]:rounded-r-md",
                  "focus-within:relative focus-within:z-20"
                ),
                day: clsx(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                  "hover:bg-slate-100 rounded-md",
                  "aria-selected:bg-primary-500 aria-selected:text-white aria-selected:font-medium hover:aria-selected:bg-primary-600"
                ),
                day_range_end: "day-range-end",
                day_selected: clsx(
                  "bg-primary-500 text-white hover:bg-primary-600 hover:text-white focus:bg-primary-500 focus:text-white"
                ),
                day_today: "font-bold text-primary-600",
                day_outside: "day-outside text-slate-500 opacity-50",
                day_disabled: "text-slate-500 opacity-50 cursor-not-allowed",
                day_hidden: "invisible",
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
