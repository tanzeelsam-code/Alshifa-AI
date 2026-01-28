import { Role, User, PatientAccount, MedicalBaseline, DoctorProfile } from '../../../types';

/**
 * Detailed Seed Data for Persistent Users
 * This ensures the app is "alive" with data upon first load.
 */

export const SEED_PATIENT_ID = 'AHMED-123';
export const SEED_DOCTOR_ID = 'DOC-SARAH';

export const SEED_PATIENT_ACCOUNT: PatientAccount = {
    id: SEED_PATIENT_ID,
    fullName: 'Ahmed Khan',
    dateOfBirth: '1979-05-15',
    sexAtBirth: 'male',
    country: 'Pakistan',
    language: 'ur',
    createdAt: new Date().toISOString(),
    phoneNumber: '+92-300-5551234',
    email: 'ahmed.khan@example.com'
};

export const SEED_MEDICAL_BASELINE: MedicalBaseline = {
    chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
    longTermMedications: [
        {
            id: 'med-1',
            name: 'Amlodipine',
            dosage: '5mg',
            frequency: 'Once daily',
            instructions: 'Take in the morning',
            type: 'tablet',
            source: 'doctor',
            status: 'active'
        },
        {
            id: 'med-2',
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            instructions: 'Take with meals',
            type: 'tablet',
            source: 'doctor',
            status: 'active'
        }
    ] as any,
    drugAllergies: [
        { substance: 'Penicillin', reaction: 'Skin rash' }
    ],
    highRiskFlags: {
        severeAllergy: true
    },
    lastReviewedAt: new Date().toISOString()
};

export const SEED_PATIENT_USER: User = {
    id: SEED_PATIENT_ID,
    name: 'Ahmed Khan',
    mobile: '03005551234',
    role: Role.PATIENT,
    language: 'ur',
    password: 'password123',
    account: SEED_PATIENT_ACCOUNT,
    baseline: SEED_MEDICAL_BASELINE
};

export const SEED_DOCTOR_PROFILE: DoctorProfile = {
    id: SEED_DOCTOR_ID,
    name: { en: 'Dr. Sara Ahmed', ur: 'ڈاکٹر سارہ احمد' },
    specialization: { en: 'Senior Cardiologist', ur: 'سینیئر ماہر امراض قلب' },
    availability: [
        { date: new Date().toISOString().split('T')[0], times: ['09:00', '10:00', '11:00', '14:00', '15:00'] }
    ],
    phone: '+92-300-1112223'
};

export const SEED_DOCTOR_USER: User = {
    id: SEED_DOCTOR_ID,
    name: 'Dr. Sara Ahmed',
    role: Role.PHYSICIAN,
    language: 'en',
    password: 'doctor123'
};
