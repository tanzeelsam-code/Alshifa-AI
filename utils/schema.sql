-- HOSPITAL-GRADE DATABASE SCHEMA
-- Compatible with PostgreSQL, MySQL, and can be adapted for MongoDB/Firestore

-- =============================================================================
-- DOCTORS TABLE
-- =============================================================================
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  full_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  
  -- Professional Details
  experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
  bio TEXT,
  profile_image VARCHAR(500),
  
  -- Ratings
  rating_average DECIMAL(3,2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for common queries
  INDEX idx_verified_active (verified, active),
  INDEX idx_license (license_number)
);

-- =============================================================================
-- DOCTOR SPECIALTIES (Many-to-Many)
-- =============================================================================
CREATE TABLE doctor_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialty VARCHAR(50) NOT NULL,
  
  UNIQUE(doctor_id, specialty),
  INDEX idx_specialty (specialty)
);

-- =============================================================================
-- DOCTOR CONSULTATION MODES
-- =============================================================================
CREATE TABLE doctor_consultation_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('ONLINE', 'PHYSICAL')),
  
  UNIQUE(doctor_id, mode),
  INDEX idx_mode (mode)
);

-- =============================================================================
-- DOCTOR AGE GROUPS
-- =============================================================================
CREATE TABLE doctor_age_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  age_group VARCHAR(20) NOT NULL CHECK (age_group IN ('ADULT', 'PEDIATRIC', 'ALL')),
  
  UNIQUE(doctor_id, age_group)
);

-- =============================================================================
-- DOCTOR LANGUAGES
-- =============================================================================
CREATE TABLE doctor_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  language VARCHAR(20) NOT NULL CHECK (language IN ('EN', 'UR', 'ROMAN_UR')),
  
  UNIQUE(doctor_id, language),
  INDEX idx_language (language)
);

-- =============================================================================
-- DOCTOR GENDER CARE PREFERENCE
-- =============================================================================
CREATE TABLE doctor_gender_care (
  doctor_id UUID PRIMARY KEY REFERENCES doctors(id) ON DELETE CASCADE,
  gender_care VARCHAR(10) CHECK (gender_care IN ('MALE', 'FEMALE', 'ALL'))
);

-- =============================================================================
-- CLINICS TABLE
-- =============================================================================
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  
  -- Geolocation for distance calculations
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  consultation_fee DECIMAL(10, 2) NOT NULL CHECK (consultation_fee >= 0),
  phone_number VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_doctor (doctor_id),
  INDEX idx_city (city),
  INDEX idx_geo (latitude, longitude)
);

-- =============================================================================
-- CLINIC SCHEDULES
-- =============================================================================
CREATE TABLE clinic_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  
  day_of_week VARCHAR(10) NOT NULL CHECK (
    day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')
  ),
  
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  UNIQUE(clinic_id, day_of_week, start_time),
  INDEX idx_clinic_day (clinic_id, day_of_week),
  
  CHECK (end_time > start_time)
);

-- =============================================================================
-- ONLINE SCHEDULES
-- =============================================================================
CREATE TABLE online_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  
  day_of_week VARCHAR(10) NOT NULL CHECK (
    day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')
  ),
  
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  UNIQUE(doctor_id, day_of_week, start_time),
  INDEX idx_doctor_day (doctor_id, day_of_week),
  
  CHECK (end_time > start_time)
);

-- =============================================================================
-- INTAKE RESULTS TABLE
-- =============================================================================
CREATE TABLE intake_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Patient Information (anonymized)
  patient_age INTEGER NOT NULL CHECK (patient_age >= 0 AND patient_age <= 150),
  patient_gender VARCHAR(10) NOT NULL CHECK (patient_gender IN ('MALE', 'FEMALE')),
  
  -- Clinical Assessment
  chief_complaint VARCHAR(50) NOT NULL,
  triage_level VARCHAR(20) NOT NULL CHECK (triage_level IN ('EMERGENCY', 'URGENT', 'ROUTINE')),
  recommended_specialty VARCHAR(50) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_triage (triage_level),
  INDEX idx_specialty (recommended_specialty),
  INDEX idx_created (created_at)
);

-- =============================================================================
-- INTAKE RED FLAGS
-- =============================================================================
CREATE TABLE intake_red_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intake_results(id) ON DELETE CASCADE,
  red_flag TEXT NOT NULL,
  
  INDEX idx_intake (intake_id)
);

-- =============================================================================
-- INTAKE ALLOWED MODES
-- =============================================================================
CREATE TABLE intake_allowed_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intake_results(id) ON DELETE CASCADE,
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('ONLINE', 'PHYSICAL')),
  
  UNIQUE(intake_id, mode)
);

-- =============================================================================
-- CLINICAL AUDIT LOG (CRITICAL FOR COMPLIANCE)
-- =============================================================================
CREATE TABLE clinical_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES intake_results(id),
  
  action VARCHAR(50) NOT NULL CHECK (
    action IN (
      'DOCTOR_ELIGIBILITY_FILTERED',
      'ONLINE_BLOCKED',
      'EMERGENCY_REDIRECT',
      'DOCTOR_RECOMMENDED',
      'SAFETY_RULE_APPLIED',
      'SPECIALTY_MATCHED'
    )
  ),
  
  reason TEXT NOT NULL,
  metadata JSONB, -- For PostgreSQL; use JSON for MySQL
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_intake (intake_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
);

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Complete doctor profile with all relationships
CREATE VIEW v_doctor_profiles AS
SELECT 
  d.id,
  d.full_name,
  d.license_number,
  d.verified,
  d.active,
  d.experience_years,
  d.rating_average,
  d.rating_count,
  
  -- Aggregate specialties
  ARRAY_AGG(DISTINCT ds.specialty) FILTER (WHERE ds.specialty IS NOT NULL) as specialties,
  
  -- Aggregate consultation modes
  ARRAY_AGG(DISTINCT dcm.mode) FILTER (WHERE dcm.mode IS NOT NULL) as consultation_modes,
  
  -- Aggregate languages
  ARRAY_AGG(DISTINCT dl.language) FILTER (WHERE dl.language IS NOT NULL) as languages,
  
  -- Aggregate age groups
  ARRAY_AGG(DISTINCT dag.age_group) FILTER (WHERE dag.age_group IS NOT NULL) as age_groups,
  
  -- Gender care
  dgc.gender_care,
  
  -- Count clinics
  COUNT(DISTINCT c.id) as clinic_count,
  
  -- Has online schedule
  COUNT(DISTINCT os.id) > 0 as has_online_schedule
  
FROM doctors d
LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
LEFT JOIN doctor_consultation_modes dcm ON d.id = dcm.doctor_id
LEFT JOIN doctor_languages dl ON d.id = dl.doctor_id
LEFT JOIN doctor_age_groups dag ON d.id = dag.doctor_id
LEFT JOIN doctor_gender_care dgc ON d.id = dgc.doctor_id
LEFT JOIN clinics c ON d.id = c.doctor_id
LEFT JOIN online_schedules os ON d.id = os.doctor_id

GROUP BY d.id, dgc.gender_care;

-- =============================================================================
-- SAMPLE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Composite index for common recommendation queries
CREATE INDEX idx_doctor_recommendation 
ON doctors(verified, active, experience_years DESC, rating_average DESC);

-- Geospatial index for finding nearby clinics (PostgreSQL with PostGIS)
-- CREATE INDEX idx_clinic_location ON clinics USING GIST(ll_to_earth(latitude, longitude));

-- Audit log retention (for compliance)
CREATE INDEX idx_audit_retention ON clinical_audit_logs(created_at DESC);
