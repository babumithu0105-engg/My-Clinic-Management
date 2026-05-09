import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse } from "date-fns";

/**
 * Merge Tailwind classes safely
 * Resolves conflicts (e.g., px-4 + px-8 → px-8)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "yyyy-MM-dd");
}

/**
 * Format date as readable format (e.g., "May 9, 2026")
 */
export function formatDateReadable(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy");
}

/**
 * Format time as HH:MM
 */
export function formatTime(time: string | Date): string {
  if (typeof time === "string") {
    // If already HH:MM format, return as-is
    if (/^\d{2}:\d{2}$/.test(time)) return time;
    // If it's a time string, parse and format
    const parsed = parse(time, "HH:mm:ss", new Date());
    return format(parsed, "HH:mm");
  }
  return format(time, "HH:mm");
}

/**
 * Format datetime as readable (e.g., "May 9, 2026 at 2:30 PM")
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format phone number (simple formatting for Indian numbers)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Validate phone number (basic check for 10 digits)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 && /^[6-9]/.test(cleaned);
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get day name from day_of_week (0 = Sunday)
 */
export function getDayName(dayOfWeek: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayOfWeek % 7];
}

/**
 * Get abbreviated day name (Mon, Tue, etc.)
 */
export function getDayAbbr(dayOfWeek: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayOfWeek % 7];
}

/**
 * Convert 24h time string to 12h format (HH:MM → h:MM AM/PM)
 */
export function formatTime12h(time: string): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

/**
 * Get current time in HH:MM format
 */
export function getCurrentTime(): string {
  const now = new Date();
  return format(now, "HH:mm");
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  return formatDate(new Date());
}

/**
 * Parse time string (HH:MM or h:MM AM/PM) to 24h format
 */
export function parseTime(timeStr: string): string {
  try {
    if (!timeStr) return "";

    // If already in HH:MM format, return
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }

    // Parse 12h format
    const parsed = parse(timeStr, "h:mm a", new Date());
    return format(parsed, "HH:mm");
  } catch {
    return timeStr; // Return as-is if parsing fails
  }
}

/**
 * Check if date is in the past
 */
export function isDateInPast(date: string | Date): boolean {
  const checkDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Check if time is before another time
 */
export function isTimeBefore(time1: string, time2: string): boolean {
  const [h1, m1] = time1.split(":").map(Number);
  const [h2, m2] = time2.split(":").map(Number);
  return h1 * 60 + m1 < h2 * 60 + m2;
}

/**
 * Generate time slots between start and end time with given interval (minutes)
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    currentMinutes += intervalMinutes;
  }

  return slots;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate UUID (client-side only - for temporary IDs)
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Debounce function for search and other frequent calls
 */
export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
