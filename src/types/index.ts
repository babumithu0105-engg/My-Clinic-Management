/**
 * Application-level types
 * Derived from database types, extended with computed properties
 */

// User with their business memberships
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

// User's business membership with role
export interface BusinessMembership {
  business_id: string;
  role: "admin" | "doctor" | "receptionist";
}

// JWT token payload
export interface JWTPayload {
  sub: string; // user_id
  email: string;
  name: string;
  business_ids: { id: string; role: string }[];
  iat: number;
  exp: number;
}

// Authenticated user context (after login)
export interface AuthContext {
  user: User;
  business_ids: { id: string; role: string }[];
}

// Business context (after business selection)
export interface BusinessContext {
  business_id: string;
  role: "admin" | "doctor" | "receptionist";
  user_id: string;
}

// API error response
export interface APIError {
  code: string;
  message: string;
  status: number;
}

// Appointment with related patient info
export interface AppointmentWithPatient {
  id: string;
  business_id: string;
  patient_id: string;
  patient?: {
    id: string;
    name: string;
    phone_number: string;
    age?: number;
    sex?: string;
  };
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: "scheduled" | "checked-in" | "completed" | "no-show" | "cancelled";
  is_walk_in: boolean;
  receptionist_notes?: string;
  created_at: string;
  updated_at: string;
}

// Visit with structured fields
export interface VisitWithFields {
  id: string;
  business_id: string;
  appointment_id: string;
  check_in_time?: string;
  completion_time?: string;
  free_text_notes?: string;
  field_values: Record<string, string | null>;
  created_at: string;
  updated_at: string;
}

// Available time slot for booking
export interface TimeSlot {
  time: string; // HH:MM format
  available: boolean;
  reason?: string; // conflict, holiday, etc.
}

// Queue response (booked + walk-in)
export interface QueueResponse {
  booked: AppointmentWithPatient[];
  walk_ins: AppointmentWithPatient[];
}

// Visit documentation field configuration
export interface VisitDocumentationField {
  id: string;
  business_id: string;
  field_name: string;
  field_type: "text" | "dropdown" | "checkbox" | "date" | "number";
  is_required: boolean;
  field_order: number;
  dropdown_options?: string[];
  created_at: string;
  updated_at: string;
}

// Business working hours
export interface WorkingHours {
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  is_open: boolean;
  start_time?: string; // HH:MM format
  end_time?: string; // HH:MM format
}

// Health check response
export interface HealthCheckResponse {
  status: "ok" | "error";
  message: string;
  database_connection: boolean;
  timestamp: string;
}
