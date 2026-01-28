/**
 * ClinicalZoneAnalyzer.ts
 * Intelligent pattern recognition and clinical decision support
 * Analyzes body zone selections to detect patterns, red flags, and provide clinical insights
 */

import {
    BodyZoneDefinition,
    IClinicalZoneAnalyzer,
    ClinicalInsight,
    PainPattern,
    RedFlag,
    RedFlagSeverity
} from '../data/BodyZoneRegistry';

// ============================================================================
// CLINICAL PATTERN DEFINITIONS
// ============================================================================

/**
 * Known pain radiation patterns
 */
const RADIATION_PATTERNS = [
    {
        primary: 'LEFT_PRECORDIAL',
        radiates_to: ['LEFT_ARM', 'JAW_LEFT', 'INTERSCAPULAR', 'EPIGASTRIC'],
        condition: 'Acute Coronary Syndrome',
        condition_ur: 'شدید کارڈیک سنڈروم (ہارٹ اٹیک)',
        urgency: 'immediate' as RedFlagSeverity,
        confidence: 0.9
    },
    {
        primary: 'RIGHT_HYPOCHONDRIAC',
        radiates_to: ['RIGHT_SHOULDER', 'INTERSCAPULAR'],
        condition: 'Cholecystitis',
        condition_ur: 'پتے کی سوزش',
        urgency: 'urgent' as RedFlagSeverity,
        confidence: 0.85
    },
    {
        primary: 'EPIGASTRIC',
        radiates_to: ['POSTERIOR_THORACIC', 'LEFT_SHOULDER'],
        condition: 'Pancreatitis',
        condition_ur: 'لبلبہ کی سوزش',
        urgency: 'urgent' as RedFlagSeverity,
        confidence: 0.8
    },
    {
        primary: 'UMBILICAL',
        radiates_to: ['RIGHT_ILIAC'],
        condition: 'Appendicitis (classic migration)',
        condition_ur: 'اپینڈکس (درد کی منتقلی)',
        urgency: 'urgent' as RedFlagSeverity,
        confidence: 0.75
    }
];

/**
 * Referred pain patterns (Kehr's sign, etc.)
 */
const REFERRED_PAIN_PATTERNS = [
    {
        presenting_zone: 'LEFT_SHOULDER',
        source_organ: 'Spleen',
        source_zone: 'LEFT_HYPOCHONDRIAC',
        sign_name: 'Kehr\'s sign',
        condition: 'Splenic rupture',
        condition_ur: 'تلی کا پھٹ جانا',
        urgency: 'immediate' as RedFlagSeverity
    },
    {
        presenting_zone: 'RIGHT_SHOULDER',
        source_organ: 'Gallbladder',
        source_zone: 'RIGHT_HYPOCHONDRIAC',
        condition: 'Cholecystitis',
        condition_ur: 'پتے کی سوزش',
        urgency: 'urgent' as RedFlagSeverity
    },
    {
        presenting_zone: 'JAW_LEFT',
        source_organ: 'Heart',
        source_zone: 'LEFT_PRECORDIAL',
        condition: 'Myocardial Infarction with atypical presentation',
        condition_ur: 'ہارٹ اٹیک (غیر معمولی علامات)',
        urgency: 'immediate' as RedFlagSeverity
    }
];

/**
 * Dermatomal patterns (nerve root distribution)
 */
const DERMATOMAL_PATTERNS = [
    {
        dermatome: 'C5',
        zones: ['ANTERIOR_SHOULDER', 'LATERAL_ARM'],
        condition: 'C5 radiculopathy',
        condition_ur: 'سی 5 مہرہ کی تکلیف',
        urgency: 'monitor' as RedFlagSeverity
    },
    {
        dermatome: 'C6',
        zones: ['LATERAL_FOREARM', 'THUMB'],
        condition: 'C6 radiculopathy',
        condition_ur: 'سی 6 مہرہ کی تکلیف',
        urgency: 'monitor' as RedFlagSeverity
    },
    {
        dermatome: 'L5',
        zones: ['LATERAL_LEG', 'DORSAL_FOOT'],
        condition: 'L5 radiculopathy',
        condition_ur: 'ایل 5 مہرہ کی تکلیف (عرق النساء)',
        urgency: 'monitor' as RedFlagSeverity
    },
    {
        dermatome: 'T10',
        zones: ['UMBILICAL'],
        condition: 'T10 radiculopathy or visceral referred pain',
        condition_ur: 'ٹی 10 مہرہ کی تکلیف یا اندرونی اعضاء کا درد',
        urgency: 'monitor' as RedFlagSeverity
    }
];

// ============================================================================
// CLINICAL ZONE ANALYZER CLASS
// ============================================================================

export class ClinicalZoneAnalyzer implements IClinicalZoneAnalyzer {

    /**
     * Analyze selected zones for clinical patterns
     */
    analyzePattern(selectedZones: BodyZoneDefinition[]): ClinicalInsight | null {
        if (selectedZones.length === 0) return null;

        // Check for radiation pattern
        const radiationPattern = this.detectRadiationPattern(selectedZones);
        if (radiationPattern) {
            return this.createInsight(radiationPattern, selectedZones);
        }

        // Check for referred pain
        const referredPattern = this.detectReferredPainPattern(selectedZones);
        if (referredPattern) {
            return this.createInsight(referredPattern, selectedZones);
        }

        // Check for dermatomal pattern
        const dermatomalPattern = this.detectDermatomalPattern(selectedZones);
        if (dermatomalPattern) {
            return this.createInsight(dermatomalPattern, selectedZones);
        }

        // Check for multi-system involvement
        const multiSystemPattern = this.detectMultiSystemPattern(selectedZones);
        if (multiSystemPattern) {
            return this.createInsight(multiSystemPattern, selectedZones);
        }

        return null;
    }

    /**
     * Detect red flags from selected zones and symptoms
     */
    detectRedFlags(zones: BodyZoneDefinition[], symptoms: string[]): RedFlag[] {
        const allRedFlags: RedFlag[] = [];

        // Collect red flags from zone definitions
        zones.forEach(zone => {
            if (zone.clinical?.red_flags) {
                allRedFlags.push(...zone.clinical.red_flags);
            }
        });

        // Additional pattern-based red flags
        const patternRedFlags = this.detectPatternRedFlags(zones, symptoms);
        allRedFlags.push(...patternRedFlags);

        // Sort by severity
        return this.sortRedFlagsBySeverity(allRedFlags);
    }

    /**
     * Check if pain pattern matches radiation
     */
    isRadiatingPain(zones: BodyZoneDefinition[]): boolean {
        return this.detectRadiationPattern(zones) !== null;
    }

    /**
     * Check if pain pattern matches referred pain
     */
    isReferredPain(zones: BodyZoneDefinition[]): boolean {
        return this.detectReferredPainPattern(zones) !== null;
    }

    /**
     * Check if zone pattern matches dermatome
     */
    isDermatomalPattern(zones: BodyZoneDefinition[]): boolean {
        return this.detectDermatomalPattern(zones) !== null;
    }

    /**
     * Get differential diagnoses from selected zones
     */
    getDifferentialDiagnoses(zones: BodyZoneDefinition[]): string[] {
        const allDiagnoses = new Set<string>();

        zones.forEach(zone => {
            if (zone.clinical?.common_diagnoses) {
                zone.clinical.common_diagnoses.forEach(dx => allDiagnoses.add(dx));
            }
        });

        // Add pattern-based diagnoses
        const pattern = this.analyzePattern(zones);
        if (pattern?.pattern.differential) {
            pattern.pattern.differential.forEach(dx => allDiagnoses.add(dx));
        }

        return Array.from(allDiagnoses);
    }

    /**
     * Recommend next assessment steps based on zones
     */
    recommendNextSteps(zones: BodyZoneDefinition[]): string[] {
        const steps: string[] = [];

        // Check for emergency conditions
        const redFlags = this.detectRedFlags(zones, []);
        if (redFlags.some(rf => rf.severity === 'immediate')) {
            steps.push('🚨 IMMEDIATE: Call emergency services');
            steps.push('Perform ABCDE assessment');
        }

        if (redFlags.some(rf => rf.severity === 'urgent')) {
            steps.push('⚠️ URGENT: Seek emergency department evaluation within 1 hour');
        }

        // System-specific recommendations
        const systems = new Set(zones.flatMap(z => z.systems));

        if (systems.has('cardiovascular')) {
            steps.push('Obtain ECG');
            steps.push('Check troponin levels');
            steps.push('Assess vital signs (BP, HR, O2 sat)');
        }

        if (systems.has('gastrointestinal')) {
            steps.push('Perform abdominal examination');
            steps.push('Check for peritoneal signs');
            steps.push('Consider imaging (ultrasound or CT)');
        }

        if (systems.has('respiratory')) {
            steps.push('Auscultate chest');
            steps.push('Check oxygen saturation');
            steps.push('Consider chest X-ray');
        }

        if (systems.has('neurological')) {
            steps.push('Perform neurological examination');
            steps.push('Assess cranial nerves and reflexes');
        }

        // Pattern-specific recommendations
        const pattern = this.analyzePattern(zones);
        if (pattern) {
            steps.push(...pattern.next_steps);
        }

        return steps;
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    private detectRadiationPattern(zones: BodyZoneDefinition[]): PainPattern | null {
        const zoneIds = zones.map(z => z.id);

        for (const pattern of RADIATION_PATTERNS) {
            const hasPrimary = zoneIds.includes(pattern.primary);
            const matchedTargets = pattern.radiates_to.filter(target =>
                zoneIds.includes(target)
            );

            // If primary  + at least one radiation target
            if (hasPrimary && matchedTargets.length > 0) {
                return {
                    type: 'radiation',
                    primary_zone: pattern.primary,
                    secondary_zones: matchedTargets,
                    differential: [pattern.condition],
                    urgency: pattern.urgency,
                    recommendation: `Evaluate for ${pattern.condition}`,
                    recommendation_ur: `${pattern.condition_ur} کے لیے معائنہ کریں`,
                    confidence: pattern.confidence
                };
            }
        }

        return null;
    }

    private detectReferredPainPattern(zones: BodyZoneDefinition[]): PainPattern | null {
        const zoneIds = zones.map(z => z.id);

        for (const pattern of REFERRED_PAIN_PATTERNS) {
            if (zoneIds.includes(pattern.presenting_zone)) {
                return {
                    type: 'referred',
                    primary_zone: pattern.source_zone,
                    secondary_zones: [pattern.presenting_zone],
                    differential: [pattern.condition],
                    urgency: pattern.urgency,
                    recommendation: `Consider ${pattern.source_organ} pathology (${pattern.sign_name || 'referred pain'})`,
                    recommendation_ur: `${pattern.source_organ} کی بیماری پر غور کریں (${pattern.condition_ur})`,
                    confidence: 0.7
                };
            }
        }

        return null;
    }

    private detectDermatomalPattern(zones: BodyZoneDefinition[]): PainPattern | null {
        const zoneIds = zones.map(z => z.id);

        for (const pattern of DERMATOMAL_PATTERNS) {
            const matches = pattern.zones.filter(z => zoneIds.includes(z));

            if (matches.length >= 2) {
                return {
                    type: 'dermatomal',
                    primary_zone: pattern.zones[0],
                    secondary_zones: matches.slice(1),
                    differential: [pattern.condition],
                    urgency: pattern.urgency,
                    recommendation: `Evaluate for ${pattern.dermatome} nerve root involvement`,
                    recommendation_ur: `${pattern.dermatome} اعصابی جڑ کی تکلیف کے لیے معائنہ کریں`,
                    confidence: 0.65
                };
            }
        }

        return null;
    }

    private detectMultiSystemPattern(zones: BodyZoneDefinition[]): PainPattern | null {
        const systemCounts = new Map<string, number>();

        zones.forEach(zone => {
            zone.systems.forEach(system => {
                systemCounts.set(system, (systemCounts.get(system) || 0) + 1);
            });
        });

        // If multiple systems involved (>2 zones per system)
        const multiSystems = Array.from(systemCounts.entries())
            .filter(([, count]) => count >= 2)
            .map(([system]) => system);

        if (multiSystems.length >= 2) {
            return {
                type: 'diffuse',
                primary_zone: zones[0].id,
                secondary_zones: zones.slice(1).map(z => z.id),
                differential: ['Systemic inflammatory condition', 'Fibromyalgia', 'Polymyalgia'],
                urgency: 'monitor',
                recommendation: 'Consider systemic etiology given multi-system involvement',
                confidence: 0.5
            };
        }

        return null;
    }

    private detectPatternRedFlags(zones: BodyZoneDefinition[], symptoms: string[]): RedFlag[] {
        const redFlags: RedFlag[] = [];

        // Cardiac red flag combination
        const hasCardiacZone = zones.some(z =>
            ['LEFT_PRECORDIAL', 'RETROSTERNAL'].includes(z.id)
        );

        const hasCardiacSymptoms = symptoms.some(s =>
            ['diaphoresis', 'dyspnea', 'nausea', 'syncope'].includes(s.toLowerCase())
        );

        if (hasCardiacZone && hasCardiacSymptoms) {
            redFlags.push({
                symptom: 'Chest pain with associated cardiac symptoms',
                symptom_ur: 'سینے کا درد اور دل کی دیگر علامات (سانس پھولنا، ٹپسینہ آنا)',
                severity: 'immediate',
                action: 'Activate cardiac protocol: ECG, troponin, aspirin, emergency evaluation',
                action_ur: 'فوری کارڈیک پروٹوکول شروع کریں: ای سی جی، اسپرین اور ہنگامی معائنہ',
                condition: 'Acute Coronary Syndrome',
                condition_ur: 'دل کا دورہ (ہارٹ اٹیک)'
            });
        }

        // Acute abdomen red flag
        const hasAbdominalZone = zones.some(z => z.category === 'abdomen');
        const hasPeritonealSymptoms = symptoms.some(s =>
            ['rebound', 'rigidity', 'guarding'].includes(s.toLowerCase())
        );

        if (hasAbdominalZone && hasPeritonealSymptoms) {
            redFlags.push({
                symptom: 'Abdominal pain with peritoneal signs',
                symptom_ur: 'پیٹ کا درد اور سخت پہلو (پیریٹونیئل نشانات)',
                severity: 'immediate',
                action: 'Emergency surgical consult',
                action_ur: 'فوری طور پر سرجری کے ڈاکٹر سے رجوع کریں',
                condition: 'Surgical abdomen',
                condition_ur: 'سرجیکل پیٹ (ہنگامی جراحی کی ضرورت)'
            });
        }

        // Neurological emergency
        const hasHeadZone = zones.some(z => z.category === 'head_neck');
        const hasNeuroSymptoms = symptoms.some(s =>
            ['altered_mental_status', 'focal_weakness', 'vision_loss', 'thunderclap'].includes(s.toLowerCase())
        );

        if (hasHeadZone && hasNeuroSymptoms) {
            redFlags.push({
                symptom: 'Headache with neurological symptoms',
                symptom_ur: 'سر درد اور اعصابی علامات (فالج جیسی کمزوری)',
                severity: 'immediate',
                action: 'Emergency neurological evaluation, consider CT head',
                action_ur: 'فوری اعصابی معائنہ اور سی ٹی اسکین کروائیں',
                condition: 'Stroke, SAH, or other CNS emergency',
                condition_ur: 'فالج یا دماغ کی رگ کا پھٹ جانا'
            });
        }

        return redFlags;
    }

    private sortRedFlagsBySeverity(redFlags: RedFlag[]): RedFlag[] {
        const severityOrder = {
            'immediate': 0,
            'urgent': 1,
            'monitor': 2
        };

        return redFlags.sort((a, b) =>
            severityOrder[a.severity] - severityOrder[b.severity]
        );
    }

    private createInsight(pattern: PainPattern, zones: BodyZoneDefinition[]): ClinicalInsight {
        const redFlags = this.detectRedFlags(zones, []);
        const nextSteps: string[] = [];

        // Add pattern-specific recommendations
        if (pattern.type === 'radiation') {
            nextSteps.push('Assess characteristics of radiation (quality, timing, triggers)');
            nextSteps.push('Evaluate primary pain source first');
        }

        if (pattern.type === 'referred') {
            nextSteps.push('Examine suspected source organ');
            nextSteps.push('Consider imaging of source region');
        }

        if (pattern.urgency === 'immediate') {
            nextSteps.unshift('Call emergency services immediately');
        } else if (pattern.urgency === 'urgent') {
            nextSteps.unshift('Seek emergency evaluation within 1 hour');
        }

        // Add Urdu recommendations if available
        const nextStepsUr: string[] = [];
        if (pattern.urgency === 'immediate') {
            nextStepsUr.unshift('فوری طور پر ایمرجنسی سروسز (1122) کو کال کریں');
        } else if (pattern.urgency === 'urgent') {
            nextStepsUr.unshift('ایک گھنٹے کے اندر ہنگامی معائنہ کرائیں');
        }

        return {
            pattern,
            alerts: redFlags,
            next_steps: nextSteps,
            next_steps_ur: nextStepsUr,
            notes: `Pattern confidence: ${Math.round((pattern.confidence || 0.5) * 100)}%`
        };
    }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const clinicalAnalyzer = new ClinicalZoneAnalyzer();
