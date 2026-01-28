-- ==========================================================================
-- FILE: database/schema.sql
-- PostgreSQL database schema for Alshifa Doctor Recommendation System
-- ==========================================================================

CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  experience_years INTEGER NOT NULL,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  gender_care VARCHAR(10) DEFAULT 'ALL',
  age_groups TEXT[] DEFAULT ARRAY['ALL'],
  languages TEXT[] DEFAULT ARRAY['en'],
  online_schedule JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctor_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialty VARCHAR(50) NOT NULL,
  UNIQUE(doctor_id, specialty)
);

CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  consultation_fee DECIMAL(10, 2) NOT NULL,
  schedule JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE intake_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_age INTEGER NOT NULL,
  patient_gender VARCHAR(10) NOT NULL,
  chief_complaint VARCHAR(50) NOT NULL,
  triage_level VARCHAR(20) NOT NULL,
  recommended_specialty VARCHAR(50) NOT NULL,
  red_flags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clinical_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES intake_results(id),
  action VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
