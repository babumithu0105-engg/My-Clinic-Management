import * as React from "react";
import { clsx } from "clsx";

interface Country {
  code: string;
  name: string;
  dial_code: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: "IN", name: "India", dial_code: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dial_code: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial_code: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dial_code: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dial_code: "+61", flag: "🇦🇺" },
  { code: "SG", name: "Singapore", dial_code: "+65", flag: "🇸🇬" },
  { code: "AE", name: "United Arab Emirates", dial_code: "+971", flag: "🇦🇪" },
  { code: "NZ", name: "New Zealand", dial_code: "+64", flag: "🇳🇿" },
];

interface PhoneInputProps {
  value: string; // Phone number without country code
  onChange: (phone: string) => void;
  countryCode?: string; // Country code (e.g., "IN")
  onCountryChange?: (code: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function PhoneInput({
  value,
  onChange,
  countryCode = "IN",
  onCountryChange,
  label,
  error,
  helperText,
  disabled = false,
  placeholder = "XXXXX XXXXX",
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleCountrySelect = (code: string) => {
    onCountryChange?.(code);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <div className="flex gap-2 relative">
        {/* Country Code Selector */}
        <div className="relative w-24">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={clsx(
              "w-full px-2 py-2.5 border rounded-lg text-left text-sm font-medium transition-colors",
              "flex items-center justify-between gap-1",
              "bg-white",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              error
                ? "border-red-500"
                : "border-clinic-border",
              disabled && "opacity-50 bg-slate-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-xs font-semibold text-slate-600 truncate">
                {selectedCountry.dial_code}
              </span>
            </div>
            <svg
              className={clsx(
                "w-4 h-4 text-slate-400 transition-transform flex-shrink-0",
                isOpen && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {/* Country Dropdown */}
          {isOpen && !disabled && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-clinic-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country.code)}
                  className={clsx(
                    "w-full px-3 py-2.5 text-sm text-left transition-colors hover:bg-slate-50",
                    "flex items-center gap-2 border-b border-slate-100 last:border-b-0",
                    selectedCountry.code === country.code &&
                      "bg-primary-50 font-medium text-primary-700"
                  )}
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {country.name}
                    </div>
                    <div className="text-xs text-slate-500">{country.dial_code}</div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <svg
                      className="w-4 h-4 text-primary-600 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            "flex-1 px-3 py-2.5 border rounded-lg text-sm font-normal transition-colors",
            "bg-white placeholder-slate-400 placeholder-opacity-50",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            error
              ? "border-red-500 text-red-500"
              : "border-clinic-border text-slate-900",
            disabled && "opacity-50 bg-slate-50 cursor-not-allowed"
          )}
        />
      </div>

      {/* Display full number */}
      {value && (
        <div className="text-xs text-slate-500">
          {selectedCountry.dial_code} {value}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
