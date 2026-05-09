import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { ClockIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function TimePicker({
  value,
  onChange,
  label,
  error,
  helperText,
  disabled = false,
  placeholder = "Select a time",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hours, setHours] = React.useState<string>(
    value ? value.split(":")[0] : "09"
  );
  const [minutes, setMinutes] = React.useState<string>(
    value ? value.split(":")[1] : "00"
  );

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHour = e.target.value.padStart(2, "0");
    setHours(newHour);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinute = e.target.value.padStart(2, "0");
    setMinutes(newMinute);
  };

  const handleApply = () => {
    const timeValue = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    onChange(timeValue);
    setOpen(false);
  };

  const handleHourIncrement = () => {
    const newHour = (parseInt(hours) + 1) % 24;
    setHours(String(newHour).padStart(2, "0"));
  };

  const handleHourDecrement = () => {
    const newHour = (parseInt(hours) - 1 + 24) % 24;
    setHours(String(newHour).padStart(2, "0"));
  };

  const handleMinuteIncrement = () => {
    const newMinute = (parseInt(minutes) + 15) % 60;
    setMinutes(String(newMinute).padStart(2, "0"));
  };

  const handleMinuteDecrement = () => {
    const newMinute = (parseInt(minutes) - 15 + 60) % 60;
    setMinutes(String(newMinute).padStart(2, "0"));
  };

  const formatTime12Hour = (time24: string) => {
    if (!time24) return placeholder;
    const [h, m] = time24.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const displayValue = formatTime12Hour(value);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
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
            <span className={clsx("font-medium", !value ? "text-slate-400 opacity-50" : "text-slate-900")}>
              {displayValue}
            </span>
            <ClockIcon className="h-4 w-4 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            {/* Time Display */}
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 tracking-tight">
                {(() => {
                  const hour = parseInt(hours);
                  const ampm = hour >= 12 ? "PM" : "AM";
                  const hour12 = hour % 12 || 12;
                  return `${hour12}:${minutes.padStart(2, "0")} ${ampm}`;
                })()}
              </div>
            </div>

            {/* Hour & Minute Selectors */}
            <div className="flex items-center justify-center gap-1">
              {/* Hour Selector */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleHourIncrement}
                  className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                  title="Increment hour"
                >
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={handleHourChange}
                  className="w-16 h-16 text-center text-xl font-semibold border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 bg-slate-50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ MozAppearance: "textfield" }}
                />
                <button
                  type="button"
                  onClick={handleHourDecrement}
                  className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                  title="Decrement hour"
                >
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="text-xs text-slate-500 mt-1 font-medium">Hour</div>
              </div>

              {/* Separator */}
              <div className="text-2xl font-bold text-slate-300">:</div>

              {/* Minute Selector */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleMinuteIncrement}
                  className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                  title="Increment minutes (+15)"
                >
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="15"
                  value={minutes}
                  onChange={handleMinuteChange}
                  className="w-16 h-16 text-center text-xl font-semibold border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 bg-slate-50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ MozAppearance: "textfield" }}
                />
                <button
                  type="button"
                  onClick={handleMinuteDecrement}
                  className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                  title="Decrement minutes (-15)"
                >
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="text-xs text-slate-500 mt-1 font-medium">Minute</div>
              </div>
            </div>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setHours("09");
                  setMinutes("00");
                }}
                className="px-3 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700"
              >
                9 AM
              </button>
              <button
                type="button"
                onClick={() => {
                  setHours("12");
                  setMinutes("00");
                }}
                className="px-3 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700"
              >
                12 PM
              </button>
              <button
                type="button"
                onClick={() => {
                  setHours("18");
                  setMinutes("00");
                }}
                className="px-3 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700"
              >
                6 PM
              </button>
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={handleApply}
              className="w-full px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
            >
              Apply
            </button>
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
