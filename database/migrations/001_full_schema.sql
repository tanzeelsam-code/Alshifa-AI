-- Alshifa AI Medical Assistant - Database Schema
-- PostgreSQL Migration Script
-- Creates all tables for patient intake, clinical data, and AI decision support

-- ==========================
-- PATIENTS & DEMOGRAPHICS
-- ==========================

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE NOT NULL,
    sex VARCHAR(10) CHECK (sex IN ('male', 'female', 'intersex', 'prefer_not_to_say')),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    preferred_language VARCHAR(10) DEFAULT 'en',
    has_completed_baseline BOOLEAN DEFAULT FALSE,
    baseline_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_auth_id ON patients(auth_id);
CREATE INDEX idx_patients_email ON patients(email);

-- ==========================
-- EMERGENCY CONTACTS
-- ==========================

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emergency_contacts_patient ON emergency_contacts(patient_id);

-- ==========================
-- MEDICAL HISTORY
-- ==========================

CREATE TABLE IF NOT EXISTS medical_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    diagnosed_date DATE,
    status VARCHAR(50) CHECK (status IN ('active', 'resolved', 'chronic')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medical_conditions_patient ON medical_conditions(patient_id);

-- ==========================
-- MEDICATIONS
-- ==========================

CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    route VARCHAR(50),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    prescriber VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medications_patient ON medications(patient_id);
CREATE INDEX idx_medications_current ON medications(patient_id, is_current);

-- ==========================
-- ALLERGIES
-- ==========================

CREATE TABLE IF NOT EXISTS allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    reaction VARCHAR(255) NOT NULL,
    severity VARCHAR(50) CHECK (severity IN ('mild', 'moderate', 'severe', 'life-threatening')),
    verified BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_allergies_patient ON allergies(patient_id);

-- ==========================
-- VISITS & ENCOUNTERS
-- ==========================

CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    visit_type VARCHAR(50) CHECK (visit_type IN ('illness', 'checkup', 'followup', 'emergency')),
    visit_reason TEXT,
    status VARCHAR(50) CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    doctor_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_scheduled ON visits(scheduled_at);

-- ==========================
-- SYMPTOMS & PAIN POINTS
-- ==========================

CREATE TABLE IF NOT EXISTS symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    -- Main symptom data
    body_zones TEXT[] NOT NULL, -- Array of body zone IDs
    primary_complaint TEXT,
    -- Pain details  
    pain_data JSONB, -- Stores: { zoneId, severity, onset, quality, radiation, etc. }
    -- Timeline
    symptom_onset VARCHAR(100),
    duration VARCHAR(100),
    progression VARCHAR(100) CHECK (progression IN ('improving', 'worsening', 'stable')),
    -- Associated symptoms
    associated_symptoms TEXT[],
    -- Red flags
    has_red_flags BOOLEAN DEFAULT FALSE,
    red_flags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_symptoms_visit ON symptoms(visit_id);
CREATE INDEX idx_symptoms_patient ON symptoms(patient_id);
CREATE INDEX idx_symptoms_red_flags ON symptoms(has_red_flags);

-- ==========================
-- CLINICAL DECISIONS (AI)
-- ==========================

CREATE TABLE IF NOT EXISTS clinical_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    symptom_id UUID REFERENCES symptoms(id) ON DELETE CASCADE,
    -- Urgency Assessment
    urgency_level VARCHAR(50) CHECK (urgency_level IN ('emergency', 'urgent', 'semi-urgent', 'routine')),
    urgency_score INTEGER,
    urgency_factors TEXT[],
    timeframe_recommendation VARCHAR(255),
    -- Differential Diagnosis
    possible_conditions JSONB, -- Array of { condition, probability, supporting_features, contra_features }
    -- Recommendations
    recommendations JSONB, -- Array of { priority, recommendation, rationale, timeframe }
    specialty_referral VARCHAR(100),
    diagnostic_tests_suggested TEXT[],
    -- AI Metadata
    engine_version VARCHAR(50),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clinical_decisions_visit ON clinical_decisions(visit_id);
CREATE INDEX idx_clinical_decisions_urgency ON clinical_decisions(urgency_level);

-- ==========================
-- APPOINTMENTS
-- ==========================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL,
    appointment_type VARCHAR(50) CHECK (appointment_type IN ('in-person', 'video', 'phone')),
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    status VARCHAR(50) CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),
    cancellation_reason TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_start);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ==========================
-- BASELINE DATA SNAPSHOTS
-- ==========================

CREATE TABLE IF NOT EXISTS baseline_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    snapshot_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    demographics JSONB,
    medications JSONB,
    allergies JSONB,
    medical_conditions JSONB,
    family_history JSONB
);

CREATE INDEX idx_baseline_snapshots_patient ON baseline_snapshots(patient_id);
CREATE INDEX idx_baseline_snapshots_date ON baseline_snapshots(snapshot_date DESC);

-- ==========================
-- UPDATE TRIGGERS
-- ==========================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_modtime BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_visits_modtime BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
