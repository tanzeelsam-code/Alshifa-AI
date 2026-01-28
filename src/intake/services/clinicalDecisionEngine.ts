/**
 * Clinical Decision Engine
 * AI-powered urgency assessment, red flag detection, and recommendations
 */

interface EmergencyFlag {
    flag: string;
    significance: string;
    action: string;
}

interface UrgencyLevel {
    level: 'emergency' | 'urgent' | 'semi-urgent' | 'routine';
    score: number;
    factors: string[];
    message: string;
    timeframe: string;
}

interface PossibleCondition {
    condition: string;
    probability: 'high' | 'moderate' | 'consider';
    supportingFeatures: string[];
    contraFeatures: string[];
    urgency?: 'emergency' | 'urgent';
}

interface Recommendation {
    priority: 1 | 2 | 3;
    recommendation: string;
    rationale: string;
    timeframe?: string;
    details?: string;
}

interface ClinicalDecisionResult {
    urgency: UrgencyLevel;
    possibleConditions: PossibleCondition[];
    redFlags: EmergencyFlag[];
    recommendations: Recommendation[];
}

export class ClinicalDecisionEngine {
    /**
     * Analyze patient data and return clinical insights
     */
    analyze(patientData: any): ClinicalDecisionResult {
        const urgency = this.assessUrgency(patientData);
        const possibleConditions = this.generateDifferentialDiagnosis(patientData);
        const redFlags = this.identifyRedFlags(patientData);
        const recommendations = this.generateRecommendations(patientData, urgency);

        return {
            urgency,
            possibleConditions,
            redFlags,
            recommendations
        };
    }

    /**
     * Assess urgency level based on symptoms
     */
    private assessUrgency(patientData: any): UrgencyLevel {
        let urgencyScore = 0;
        let urgencyFactors: string[] = [];

        // Emergency red flags (automatically critical)
        if (patientData.emergencyFlags && patientData.emergencyFlags.length > 0) {
            return {
                level: 'emergency',
                score: 100,
                factors: patientData.emergencyFlags,
                message: 'Immediate medical attention required',
                timeframe: 'NOW - Call Emergency Services'
            };
        }

        // Pain-based urgency
        if (patientData.pain) {
            if (patientData.pain.intensity >= 8) {
                urgencyScore += 30;
                urgencyFactors.push('severe-pain');
            }

            // Location-specific concerns
            if (patientData.pain.location === 'chest') {
                urgencyScore += 25;
                urgencyFactors.push('chest-pain');

                if (patientData.pain.radiation?.includes('left-arm')) {
                    urgencyScore += 20;
                    urgencyFactors.push('cardiac-symptoms');
                }
            }

            if (patientData.pain.location === 'head') {
                if (patientData.pain.onset === 'suddenly' && patientData.pain.intensity >= 8) {
                    urgencyScore += 40;
                    urgencyFactors.push('thunderclap-headache');
                }
            }
        }

        // Associated symptoms
        if (patientData.associated) {
            const highRiskSymptoms = [
                'difficulty-breathing',
                'confusion',
                'severe-bleeding',
                'chest-pressure',
                'weakness',
                'numbness',
                'speech-problems',
                'fever-with-stiffness'
            ];

            patientData.associated.forEach((symptom: string) => {
                if (highRiskSymptoms.includes(symptom)) {
                    urgencyScore += 15;
                    urgencyFactors.push(symptom);
                }
            });
        }

        // Age factors
        if (patientData.age) {
            if (patientData.age > 65 || patientData.age < 2) {
                urgencyScore += 10;
                urgencyFactors.push('high-risk-age-group');
            }
        }

        // Determine urgency level
        if (urgencyScore >= 70) {
            return {
                level: 'urgent',
                score: urgencyScore,
                factors: urgencyFactors,
                message: 'Urgent medical attention needed',
                timeframe: 'Within 4-6 hours'
            };
        } else if (urgencyScore >= 40) {
            return {
                level: 'semi-urgent',
                score: urgencyScore,
                factors: urgencyFactors,
                message: 'Medical evaluation recommended soon',
                timeframe: 'Within 24-48 hours'
            };
        } else {
            return {
                level: 'routine',
                score: urgencyScore,
                factors: urgencyFactors,
                message: 'Routine medical evaluation',
                timeframe: 'Within 1-2 weeks'
            };
        }
    }

    /**
     * Generate differential diagnosis possibilities
     */
    private generateDifferentialDiagnosis(patientData: any): PossibleCondition[] {
        const possibleConditions: PossibleCondition[] = [];

        // Headache differentials
        if (patientData.pain?.location === 'head') {
            if (patientData.pain.quality?.includes('throbbing') &&
                patientData.pain.location_side === 'one-side' &&
                patientData.associated?.includes('nausea')) {
                possibleConditions.push({
                    condition: 'Migraine',
                    probability: 'high',
                    supportingFeatures: ['unilateral', 'throbbing', 'nausea'],
                    contraFeatures: []
                });
            }

            if (patientData.pain.quality?.includes('pressure') &&
                patientData.pain.location_side === 'both-sides') {
                possibleConditions.push({
                    condition: 'Tension-type headache',
                    probability: 'moderate',
                    supportingFeatures: ['bilateral', 'pressure-quality'],
                    contraFeatures: []
                });
            }

            if (patientData.pain.onset === 'suddenly' &&
                patientData.pain.intensity >= 8) {
                possibleConditions.push({
                    condition: 'Subarachnoid hemorrhage (URGENT)',
                    probability: 'consider',
                    supportingFeatures: ['thunderclap-onset', 'severe'],
                    contraFeatures: [],
                    urgency: 'emergency'
                });
            }
        }

        // Chest pain differentials
        if (patientData.pain?.location === 'chest') {
            if (patientData.pain.quality?.includes('crushing') ||
                patientData.pain.radiation?.includes('left-arm')) {
                possibleConditions.push({
                    condition: 'Acute coronary syndrome (URGENT)',
                    probability: 'consider',
                    supportingFeatures: ['crushing', 'radiation-to-arm'],
                    contraFeatures: [],
                    urgency: 'emergency'
                });
            }

            if (patientData.pain.quality?.includes('sharp') &&
                patientData.pain.worsened_by?.includes('deep-breath')) {
                possibleConditions.push({
                    condition: 'Pleuritic chest pain',
                    probability: 'moderate',
                    supportingFeatures: ['sharp', 'worse-with-breathing'],
                    contraFeatures: []
                });
            }

            if (patientData.pain.quality?.includes('burning') &&
                patientData.pain.timing === 'after-meals') {
                possibleConditions.push({
                    condition: 'GERD / Heartburn',
                    probability: 'moderate',
                    supportingFeatures: ['burning', 'meal-related'],
                    contraFeatures: []
                });
            }
        }

        // Abdominal pain differentials
        if (patientData.pain?.location === 'abdomen') {
            if (patientData.pain.quadrant === 'rlq') {
                possibleConditions.push({
                    condition: 'Appendicitis',
                    probability: 'consider',
                    supportingFeatures: ['rlq-pain'],
                    contraFeatures: [],
                    urgency: 'urgent'
                });
            }

            if (patientData.pain.quadrant === 'ruq' &&
                patientData.associated?.includes('nausea')) {
                possibleConditions.push({
                    condition: 'Cholecystitis',
                    probability: 'moderate',
                    supportingFeatures: ['ruq-pain', 'nausea'],
                    contraFeatures: []
                });
            }
        }

        return possibleConditions.sort((a, b) => {
            const probOrder = { 'high': 3, 'moderate': 2, 'consider': 1 };
            return probOrder[b.probability] - probOrder[a.probability];
        });
    }

    /**
     * Identify red flag symptoms
     */
    private identifyRedFlags(patientData: any): EmergencyFlag[] {
        const redFlags: EmergencyFlag[] = [];

        // Headache red flags
        if (patientData.pain?.location === 'head') {
            if (patientData.pain.onset === 'suddenly' &&
                patientData.pain.intensity >= 8) {
                redFlags.push({
                    flag: 'Thunderclap headache',
                    significance: 'May indicate subarachnoid hemorrhage',
                    action: 'Emergency evaluation required'
                });
            }

            if (patientData.associated?.includes('neck-stiffness') &&
                patientData.associated?.includes('fever')) {
                redFlags.push({
                    flag: 'Meningeal signs',
                    significance: 'May indicate meningitis',
                    action: 'Emergency evaluation required'
                });
            }
        }

        // Chest pain red flags
        if (patientData.pain?.location === 'chest') {
            if (patientData.pain.radiation?.includes('left-arm') ||
                patientData.pain.radiation?.includes('jaw')) {
                redFlags.push({
                    flag: 'Cardiac-pattern pain radiation',
                    significance: 'May indicate acute coronary syndrome',
                    action: 'Emergency evaluation required'
                });
            }
        }

        return redFlags;
    }

    /**
     * Generate recommendations for next steps
     */
    private generateRecommendations(patientData: any, urgencyLevel: UrgencyLevel): Recommendation[] {
        const recommendations: Recommendation[] = [];

        // Based on urgency
        if (urgencyLevel.level === 'emergency') {
            recommendations.push({
                priority: 1,
                recommendation: 'Call Emergency Services (911)',
                rationale: urgencyLevel.factors.join(', ')
            });
        }

        if (urgencyLevel.level === 'urgent') {
            recommendations.push({
                priority: 1,
                recommendation: 'Visit Emergency Department or Urgent Care',
                rationale: 'Symptoms require prompt evaluation',
                timeframe: 'Within 4-6 hours'
            });
        }

        if (urgencyLevel.level === 'semi-urgent' || urgencyLevel.level === 'routine') {
            recommendations.push({
                priority: 1,
                recommendation: 'Schedule appointment with primary care physician',
                rationale: 'Medical evaluation recommended',
                timeframe: urgencyLevel.timeframe
            });
        }

        // Specialty referrals
        if (patientData.pain?.location === 'head') {
            recommendations.push({
                priority: 2,
                recommendation: 'Consider Neurology consultation',
                rationale: 'For specialized headache evaluation'
            });
        }

        if (patientData.pain?.location === 'chest' &&
            !urgencyLevel.factors.includes('cardiac-symptoms')) {
            recommendations.push({
                priority: 2,
                recommendation: 'ECG and cardiac workup',
                rationale: 'Rule out cardiac causes'
            });
        }

        // Self-care recommendations
        recommendations.push({
            priority: 3,
            recommendation: 'Symptom diary',
            rationale: 'Track symptoms, triggers, and patterns',
            details: 'Note: intensity, duration, triggers, associated symptoms'
        });

        return recommendations;
    }
}

export const clinicalDecisionEngine = new ClinicalDecisionEngine();
