-- ============================================================================
-- CLINIC MANAGEMENT APP - SUPABASE MIGRATIONS
-- Run this entire script in the Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. BUSINESSES TABLE
-- ============================================================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_businesses_name ON businesses(name);

-- ============================================================================
-- 2. USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- 3. BUSINESS_USERS (Junction Table - User belongs to Business with Role)
-- ============================================================================
CREATE TABLE business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'receptionist')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

CREATE INDEX idx_business_users_business ON business_users(business_id);
CREATE INDEX idx_business_users_user ON business_users(user_id);

-- ============================================================================
-- 4. PATIENTS TABLE
-- ============================================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  age INT,
  sex VARCHAR(10),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_patients_business_phone ON patients(business_id, phone_number);
CREATE INDEX idx_patients_business_name ON patients(business_id, name);

-- ============================================================================
-- 5. APPOINTMENTS TABLE
-- ============================================================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'checked-in', 'completed', 'no-show', 'cancelled')),
  is_walk_in BOOLEAN NOT NULL DEFAULT false,
  receptionist_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_business_date ON appointments(business_id, appointment_date);
CREATE INDEX idx_appointments_business_status ON appointments(business_id, status);
CREATE INDEX idx_appointments_business_patient ON appointments(business_id, patient_id);

-- ============================================================================
-- 6. VISITS TABLE (Doctor's Documentation)
-- ============================================================================
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  check_in_time TIMESTAMP,
  completion_time TIMESTAMP,
  free_text_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visits_business_appointment ON visits(business_id, appointment_id);
CREATE INDEX idx_visits_appointment ON visits(appointment_id);

-- ============================================================================
-- 7. VISIT_DOCUMENTATION_FIELDS (Admin Configurable)
-- ============================================================================
CREATE TABLE visit_documentation_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'dropdown', 'checkbox', 'date', 'number')),
  is_required BOOLEAN NOT NULL DEFAULT false,
  field_order INT NOT NULL,
  dropdown_options TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visit_fields_business ON visit_documentation_fields(business_id);
CREATE INDEX idx_visit_fields_business_order ON visit_documentation_fields(business_id, field_order);

-- ============================================================================
-- 8. VISIT_FIELD_VALUES (Dynamic structured field values)
-- ============================================================================
CREATE TABLE visit_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES visits(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES visit_documentation_fields(id) ON DELETE CASCADE NOT NULL,
  field_value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visit_field_values_visit ON visit_field_values(visit_id);

-- ============================================================================
-- 9. BUSINESS_CONFIG TABLE
-- ============================================================================
CREATE TABLE business_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE NOT NULL,
  appointment_duration_options TEXT[] NOT NULL DEFAULT ARRAY['15', '30', '45'],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_business_config_business ON business_config(business_id);

-- ============================================================================
-- 10. WORKING_HOURS TABLE (Per day per business)
-- ============================================================================
CREATE TABLE working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT true,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, day_of_week)
);

CREATE INDEX idx_working_hours_business ON working_hours(business_id);

-- ============================================================================
-- 11. HOLIDAYS TABLE
-- ============================================================================
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  holiday_date DATE NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, holiday_date)
);

CREATE INDEX idx_holidays_business_date ON holidays(business_id, holiday_date);

-- ============================================================================
-- 12. DOCTOR_UNAVAILABILITY TABLE
-- ============================================================================
CREATE TABLE doctor_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  unavailable_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doctor_unavailability_business_date ON doctor_unavailability(business_id, unavailable_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables that contain business-specific data

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_documentation_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_unavailability ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies: DENY ALL for anonymous role (defense-in-depth)
-- Service role bypasses RLS and can access everything
-- Authentication is handled at the API layer via JWT in Next.js middleware
-- ============================================================================

-- Patients: Deny all anon access
CREATE POLICY patients_deny_anon ON patients
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY patients_deny_anon_insert ON patients
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY patients_deny_anon_update ON patients
  AS PERMISSIVE
  FOR UPDATE
  TO anon
  USING (false);

CREATE POLICY patients_deny_anon_delete ON patients
  AS PERMISSIVE
  FOR DELETE
  TO anon
  USING (false);

-- Appointments: Deny all anon access
CREATE POLICY appointments_deny_anon ON appointments
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY appointments_deny_anon_insert ON appointments
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY appointments_deny_anon_update ON appointments
  AS PERMISSIVE
  FOR UPDATE
  TO anon
  USING (false);

CREATE POLICY appointments_deny_anon_delete ON appointments
  AS PERMISSIVE
  FOR DELETE
  TO anon
  USING (false);

-- Visits: Deny all anon access
CREATE POLICY visits_deny_anon ON visits
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY visits_deny_anon_insert ON visits
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY visits_deny_anon_update ON visits
  AS PERMISSIVE
  FOR UPDATE
  TO anon
  USING (false);

CREATE POLICY visits_deny_anon_delete ON visits
  AS PERMISSIVE
  FOR DELETE
  TO anon
  USING (false);

-- Visit Documentation Fields: Deny all anon access
CREATE POLICY visit_documentation_fields_deny_anon ON visit_documentation_fields
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY visit_documentation_fields_deny_anon_insert ON visit_documentation_fields
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (false);

-- Visit Field Values: Deny all anon access
CREATE POLICY visit_field_values_deny_anon ON visit_field_values
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY visit_field_values_deny_anon_insert ON visit_field_values
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (false);

-- Working Hours: Deny all anon access
CREATE POLICY working_hours_deny_anon ON working_hours
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY working_hours_deny_anon_insert ON working_hours
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (false);

-- Holidays: Deny all anon access
CREATE POLICY holidays_deny_anon ON holidays
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY holidays_deny_anon_insert ON holidays
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (false);

-- Doctor Unavailability: Deny all anon access
CREATE POLICY doctor_unavailability_deny_anon ON doctor_unavailability
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY doctor_unavailability_deny_anon_insert ON doctor_unavailability
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (false);

-- ============================================================================
-- SCHEMA COMMENTS (Documentation)
-- ============================================================================
COMMENT ON TABLE businesses IS 'Clinic/practice entities - top-level multi-tenant unit';
COMMENT ON TABLE users IS 'User accounts - can belong to multiple businesses with different roles';
COMMENT ON TABLE business_users IS 'Junction table mapping users to businesses with their role in each business';
COMMENT ON TABLE patients IS 'Patient records - completely isolated per business';
COMMENT ON TABLE appointments IS 'Scheduled appointments and walk-ins - linked to patient and business';
COMMENT ON TABLE visits IS 'Doctor visit documentation - one visit per appointment';
COMMENT ON TABLE visit_documentation_fields IS 'Configurable fields that doctors fill in during visits - per business';
COMMENT ON TABLE visit_field_values IS 'Actual values filled by doctor for each structured field in a visit';
COMMENT ON TABLE business_config IS 'Configuration per business (appointment durations, etc.)';
COMMENT ON TABLE working_hours IS 'Working hours per day of week per business';
COMMENT ON TABLE holidays IS 'Holiday dates when clinic is closed per business';
COMMENT ON TABLE doctor_unavailability IS 'Doctor unavailability (vacation, sick leave) per business';

-- ============================================================================
-- INITIALIZATION DATA (Optional - remove if not needed)
-- ============================================================================
-- You can add seed data here if needed during development
-- For production, seed data should be added separately

-- ============================================================================
-- END OF MIGRATIONS
-- ============================================================================
