import { Patient, Visit, PatientBaseline } from '../types/MedicalRecord';

// ============================================
// LOCAL STORAGE DATABASE SERVICE
// (Simulating Firestore for immediate testing)
// ============================================

// Keys for local storage
const DB_KEYS = {
    PATIENTS: 'alshifa_db_patients',
    VISITS: 'alshifa_db_visits',
    DOCTORS: 'alshifa_db_doctors'
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to read DB
function readDB(collection: string): Record<string, any> {
    const json = localStorage.getItem(collection);
    return json ? JSON.parse(json) : {};
}

// Helper to write DB
function writeDB(collection: string, data: Record<string, any>) {
    localStorage.setItem(collection, JSON.stringify(data));
}

// ============================================
// PATIENT OPERATIONS
// ============================================

export async function getPatient(patientId: string): Promise<Patient | null> {
    await delay(200); // Simulate network
    const patients = readDB(DB_KEYS.PATIENTS);
    const data = patients[patientId];

    if (!data) {
        return null;
    }

    // Load visits linked to this patient
    const visits = await getPatientVisits(patientId);

    return {
        id: patientId,
        baseline: data.baseline,
        visits: visits,
        lastVisit: visits.length > 0 ? visits[visits.length - 1] : undefined,
        activeVisit: visits.find((v: Visit) => v.status === 'active'),
        email: data.email,
        phoneNumber: data.phoneNumber,
        createdAt: data.createdAt
    };
}

export async function savePatient(patient: Patient): Promise<void> {
    await delay(300);
    const patients = readDB(DB_KEYS.PATIENTS);

    patients[patient.id] = {
        id: patient.id,
        baseline: patient.baseline,
        email: patient.email,
        phoneNumber: patient.phoneNumber,
        createdAt: patient.createdAt
    };

    writeDB(DB_KEYS.PATIENTS, patients);
    console.log('[DB] Patient saved:', patient.id);
}

export async function updatePatientBaseline(
    patientId: string,
    baseline: Partial<PatientBaseline>
): Promise<void> {
    await delay(200);
    const patients = readDB(DB_KEYS.PATIENTS);
    const patient = patients[patientId];

    if (!patient) throw new Error('Patient not found');

    patient.baseline = { ...patient.baseline, ...baseline, lastUpdated: new Date().toISOString() };
    writeDB(DB_KEYS.PATIENTS, patients);

    console.log('[DB] Baseline updated for patient:', patientId);
}

// ============================================
// VISIT OPERATIONS
// ============================================

export async function getVisit(visitId: string): Promise<Visit | null> {
    await delay(100);
    const visits = readDB(DB_KEYS.VISITS);
    return visits[visitId] || null;
}

export async function saveVisit(visit: Visit): Promise<void> {
    await delay(200);
    const visits = readDB(DB_KEYS.VISITS);

    visits[visit.id] = visit;
    writeDB(DB_KEYS.VISITS, visits);

    console.log('[DB] Visit saved:', visit.id);
}

export async function updateVisit(
    visitId: string,
    updates: Partial<Visit>
): Promise<void> {
    await delay(200);
    const visits = readDB(DB_KEYS.VISITS);

    if (!visits[visitId]) throw new Error('Visit not found');

    visits[visitId] = { ...visits[visitId], ...updates };
    writeDB(DB_KEYS.VISITS, visits);

    console.log('[DB] Visit updated:', visitId);
}

export async function getPatientVisits(patientId: string): Promise<Visit[]> {
    await delay(200);
    const allVisits = readDB(DB_KEYS.VISITS);

    const userVisits = Object.values(allVisits).filter((v: any) => v.patientId === patientId) as Visit[];

    // Sort by date (newest first)
    userVisits.sort((a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    return userVisits;
}

export async function completeVisit(
    visitId: string,
    diagnosis: string,
    prescriptions: any[],
    followUpNeeded: boolean
): Promise<void> {
    await updateVisit(visitId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        diagnosis,
        prescriptions,
        followUpNeeded
    });

    console.log('[DB] Visit completed:', visitId);
}
