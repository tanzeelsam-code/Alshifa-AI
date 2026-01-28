
import { PatientSummary, MedicalHistory } from '../types';

export function validateDoctorSubmission(summary: PatientSummary, history?: MedicalHistory): string | null {
  // RULE: All AI suggestions must be resolved (either Approved or Rejected)
  const pendingAI = (summary.suggestedItems || []).some(item => item.status === 'Pending');

  if (pendingAI) {
    return "Action Required: Please Approve or Reject all AI-suggested tests and medications before finalizing.";
  }

  // Safety check: Allergies vs Approved Medications
  const approvedMeds = (summary.medications || []).filter(m => m.status === 'approved');
  if (history?.allergies?.length) {
    for (const med of approvedMeds) {
      const isAllergic = history.allergies.some(allergy => 
        med.name.toLowerCase().includes(allergy.toLowerCase()) || 
        (med.genericName && med.genericName.toLowerCase().includes(allergy.toLowerCase()))
      );
      if (isAllergic) {
        return `SAFETY ALERT: Patient is allergic to ${med.name}. Please review current prescriptions.`;
      }
    }
  }

  return null; 
}
