-- ============================================================================
-- MIGRATION: Add patient status field
-- Date: 2026-05-10
-- Description: Add active/inactive status to patients table
-- ============================================================================

-- Add status column to patients table
ALTER TABLE patients
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Add index for status filtering
CREATE INDEX idx_patients_status ON patients(business_id, status);

-- ============================================================================
-- Rollback (if needed):
-- DROP INDEX idx_patients_status;
-- ALTER TABLE patients DROP COLUMN status;
-- ============================================================================
