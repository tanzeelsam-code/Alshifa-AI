import { IntakeResult, TriageLevel } from '../types/recommendation';
import { Specialty } from '../types/doctor_v2';
import { EncounterIntake } from '../src/intake/models/EncounterIntake';

/**
 * Maps the internal EncounterIntake model to the Recommendation Engine's IntakeResult
 */
export const mapEncounterToIntakeResult = (encounter: EncounterIntake): IntakeResult => {
    // 1. Map Triage Level
    let triageLevel: TriageLevel = 'ROUTINE';
    if (encounter.emergencyScreening?.anyPositive || encounter.redFlagsDetected?.some(f => f.severity === 'CRITICAL')) {
        triageLevel = 'EMERGENCY';
    } else if (encounter.redFlagsDetected?.length > 0) {
        triageLevel = 'URGENT';
    }

    // 2. Map Recommended Specialty (Placeholder mapping)
    // In a real app, this would use a more sophisticated lookup table or AI classification
    let recommendedSpecialty: Specialty = 'GENERAL_MEDICINE';

    const complaint = encounter.chiefComplaint?.toLowerCase() || encounter.complaintText?.toLowerCase() || '';

    if (complaint.includes('chest') || complaint.includes('heart')) recommendedSpecialty = 'CARDIOLOGY';
    else if (complaint.includes('child') || complaint.includes('baby') || (encounter.demographics?.age && encounter.demographics.age < 18)) recommendedSpecialty = 'PEDIATRICS';
    else if (complaint.includes('skin') || complaint.includes('rash')) recommendedSpecialty = 'DERMATOLOGY';
    else if (complaint.includes('stomach') || complaint.includes('abdomen') || complaint.includes('digestion')) recommendedSpecialty = 'GASTROENTEROLOGY';
    else if (complaint.includes('bone') || complaint.includes('joint') || complaint.includes('fracture')) recommendedSpecialty = 'ORTHOPEDICS';
    else if (complaint.includes('ear') || complaint.includes('nose') || complaint.includes('throat')) recommendedSpecialty = 'ENT';
    else if (complaint.includes('brain') || complaint.includes('nerve') || complaint.includes('numbness')) recommendedSpecialty = 'NEUROLOGY';
    else if (complaint.includes('anxiety') || complaint.includes('depress') || complaint.includes('mental')) recommendedSpecialty = 'PSYCHIATRY';

    // 3. Allowed Modes
    // We start with both, and let the onlineSafety utility prune it if necessary
    const allowedModes: any[] = ['PHYSICAL', 'ONLINE'];

    return {
        intakeId: encounter.encounterId,
        chiefComplaint: mapToComplaintType(encounter),
        triageLevel,
        patientAge: encounter.demographics?.age || 30,
        patientGender: encounter.demographics?.gender?.toUpperCase() === 'FEMALE' ? 'FEMALE' : 'MALE',
        redFlags: encounter.redFlagsDetected?.map(f => f.description) || [],
        recommendedSpecialty,
        allowedModes,
        createdAt: new Date()
    };
};

/** Precise mapping to ComplaintType enum */
function mapToComplaintType(encounter: EncounterIntake): any {
    const text = (encounter.chiefComplaint || encounter.complaintText || '').toLowerCase();
    if (text.includes('chest pain')) return 'CHEST_PAIN';
    if (text.includes('fever')) return 'FEVER';
    if (text.includes('headache')) return 'HEADACHE';
    if (text.includes('stomach') || text.includes('abdominal')) return 'ABDOMINAL_PAIN';
    if (text.includes('breath') || text.includes('shortness')) return 'SHORTNESS_OF_BREATH';
    return 'COLD_FLU'; // Default
}
