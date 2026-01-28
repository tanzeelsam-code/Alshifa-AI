-- Alshifa AI Medical Assistant - Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- PATIENTS TABLE
-- ==============================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  -- Auto-calculated age (stored as generated column)
  age INTEGER GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))
  ) STORED,
  sex VARCHAR(20), -- 'male', 'female', 'other'
  gender_identity VARCHAR(50),
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  blood_type VARCHAR(5), -- 'A+', 'O-', etc.
  phone_number VARCHAR(20),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  preferred_language VARCHAR(10) DEFAULT 'en', -- 'en', 'ur'
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- EMERGENCY CONTACTS TABLE
-- ==============================================
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  relationship VARCHAR(50), -- 'spouse', 'parent', 'sibling', etc.
  phone_number VARCHAR(20) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- MEDICAL CONDITIONS TABLE (Chronic/Ongoing)
-- ==============================================
CREATE TABLE medical_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  condition_name VARCHAR(200) NOT NULL,
  icd_code VARCHAR(20), -- ICD-10 code
  diagnosis_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- MEDICATIONS TABLE
-- ==============================================
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication_name VARCHAR(200) NOT NULL,
  dosage VARCHAR(100), -- '500mg', '10mg', etc.
  frequency VARCHAR(100), -- 'twice daily', 'as needed', etc.
  route VARCHAR(50), -- 'oral', 'topical', 'injection', etc.
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  prescribing_doctor VARCHAR(200),
  pharmacy VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- ALLERGIES TABLE
-- ==============================================
CREATE TABLE allergies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  allergen VARCHAR(200) NOT NULL,
  allergy_type VARCHAR(50) NOT NULL, -- 'drug', 'food', 'environmental', 'other'
  reaction VARCHAR(200), -- 'rash', 'anaphylaxis', 'nausea', etc.
  severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
  verified_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- DOCTORS TABLE
-- ==============================================
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialties JSONB, -- Array of specialties: ["Neurology", "Headache Medicine"]
  license_number VARCHAR(100) UNIQUE,
  phone_number VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  office_address TEXT,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  accepts_new_patients BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- VISITS TABLE
-- ==============================================
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  visit_reason VARCHAR(100) NOT NULL CHECK (
    visit_reason IN ('pain', 'follow-up', 'new-symptom', 'medication', 'general', 'express')
  ),
  chief_complaint TEXT,
  -- Emergency triage results stored as JSON
  emergency_triage_result JSONB,
  urgency_level VARCHAR(20) CHECK (
    urgency_level IN ('emergency', 'urgent', 'semi-urgent', 'routine')
  ),
  status VARCHAR(50) DEFAULT 'in-progress' CHECK (
    status IN ('in-progress', 'completed', 'cancelled')
  ),
  intake_duration_seconds INTEGER, -- Time to complete intake
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- SYMPTOMS TABLE
-- ==============================================
CREATE TABLE symptoms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  symptom_type VARCHAR(100) NOT NULL, -- 'pain', 'fever', 'cough', etc.
  
  -- Pain-specific fields
  body_location VARCHAR(100), -- 'head', 'chest', 'abdomen', etc.
  body_subzone VARCHAR(100), -- 'frontal', 'ruq', etc.
  body_view VARCHAR(10) CHECK (body_view IN ('front', 'back')),
  onset VARCHAR(50) CHECK (onset IN ('suddenly', 'gradually', 'after-trauma')),
  duration VARCHAR(50), -- 'today', 'this-week', 'this-month', 'longer'
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  
  -- Quality, radiation, associated symptoms stored as JSON arrays
  quality JSONB, -- ["throbbing", "sharp"]
  radiation JSONB, -- ["left-arm", "jaw"]
  associated_symptoms JSONB, -- ["nausea", "photophobia"]
  
  -- Additional flexible data
  additional_details JSONB, -- Location-specific questions
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- CLINICAL DECISIONS TABLE (AI Analysis)
-- ==============================================
CREATE TABLE clinical_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  
  -- Urgency assessment
  urgency_level VARCHAR(20) NOT NULL,
  urgency_score INTEGER NOT NULL,
  urgency_factors JSONB, -- Array of contributing factors
  
  -- Differential diagnosis
  possible_conditions JSONB NOT NULL, -- Array of conditions with probabilities
  
  -- Red flags
  red_flags JSONB, -- Array of identified red flags
  
  -- Recommendations
  recommendations JSONB NOT NULL, -- Array of recommendations
  next_steps JSONB, -- Array of next steps
  
  -- AI metadata
  ai_model_version VARCHAR(50),
  confidence_score DECIMAL(3,2),
  processing_time_ms INTEGER,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- APPOINTMENTS TABLE
-- ==============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  
  appointment_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  appointment_type VARCHAR(50) NOT NULL CHECK (
    appointment_type IN ('in-person', 'video', 'phone')
  ),
  
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'confirmed', 'checked-in', 'in-progress', 
               'completed', 'cancelled', 'no-show')
  ),
  
  cancellation_reason TEXT,
  cancelled_by VARCHAR(50), -- 'patient', 'doctor', 'system'
  cancelled_at TIMESTAMP,
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- AUDIT LOG TABLE (for security & compliance)
-- ==============================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Could be patient_id or admin user
  user_type VARCHAR(50), -- 'patient', 'doctor', 'admin'
  action VARCHAR(100) NOT NULL, -- 'login', 'view_record', 'update_patient', etc.
  resource_type VARCHAR(50), -- 'patient', 'visit', 'appointment', etc.
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB, -- Additional context
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Patients
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);
CREATE INDEX idx_patients_active ON patients(is_active);

-- Visits
CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_date ON visits(visit_date DESC);
CREATE INDEX idx_visits_urgency ON visits(urgency_level);
CREATE INDEX idx_visits_status ON visits(status);

-- Symptoms
CREATE INDEX idx_symptoms_visit ON symptoms(visit_id);
CREATE INDEX idx_symptoms_location ON symptoms(body_location);

-- Appointments
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Clinical Decisions
CREATE INDEX idx_clinical_visit ON clinical_decisions(visit_id);
CREATE INDEX idx_clinical_urgency ON clinical_decisions(urgency_level);

-- Medications
CREATE INDEX idx_medications_patient ON medications(patient_id);
CREATE INDEX idx_medications_active ON medications(is_active);

-- Allergies
CREATE INDEX idx_allergies_patient ON allergies(patient_id);
CREATE INDEX idx_allergies_active ON allergies(is_active);

-- Audit Log
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action);

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_conditions_updated_at BEFORE UPDATE ON medical_conditions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allergies_updated_at BEFORE UPDATE ON allergies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- VIEWS FOR COMMON QUERIES
-- ==============================================

-- View: Patient Summary
CREATE VIEW patient_summary AS
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.age,
    p.email,
    p.phone_number,
    COUNT(DISTINCT v.id) as visit_count,
    COUNT(DISTINCT a.id) as appointment_count,
    MAX(v.visit_date) as last_visit_date
FROM patients p
LEFT JOIN visits v ON p.id = v.patient_id
LEFT JOIN appointments a ON p.id = a.patient_id
WHERE p.is_active = true
GROUP BY p.id;

-- View: Urgent Visits (for dashboard)
CREATE VIEW urgent_visits AS
SELECT 
    v.id as visit_id,
    v.visit_date,
    v.urgency_level,
    p.first_name,
    p.last_name,
    p.phone_number,
    s.body_location,
    s.intensity,
    cd.red_flags
FROM visits v
JOIN patients p ON v.patient_id = p.id
LEFT JOIN symptoms s ON v.id = s.visit_id
LEFT JOIN clinical_decisions cd ON v.id = cd.visit_id
WHERE v.urgency_level IN ('emergency', 'urgent')
  AND v.status = 'in-progress'
ORDER BY v.visit_date DESC;

-- ==============================================
-- INITIAL DATA / SEEDS
-- ==============================================

-- Insert sample doctors
INSERT INTO doctors (first_name, last_name, specialties, email, phone_number, rating, review_count) VALUES
('Ali', 'Khan', '["Neurology", "Headache Medicine"]', 'ali.khan@hospital.com', '+92-300-1234567', 4.8, 127),
('Fatima', 'Ahmed', '["Cardiology"]', 'fatima.ahmed@hospital.com', '+92-300-7654321', 4.9, 215),
('Hassan', 'Malik', '["General Surgery"]', 'hassan.malik@hospital.com', '+92-300-9876543', 4.7, 98),
('Aisha', 'Rahman', '["Internal Medicine", "Primary Care"]', 'aisha.rahman@hospital.com', '+92-300-5555555', 4.9, 342),
('Omar', 'Siddiqui', '["Gastroenterology"]', 'omar.siddiqui@hospital.com', '+92-300-4444444', 4.6, 156);

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO alshifa_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO alshifa_app;

COMMENT ON DATABASE alshifa IS 'Alshifa AI Medical Assistant Database';
