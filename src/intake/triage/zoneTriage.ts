/**
 * Zone-Based Triage Service
 * 
 * Provides severity assessment for body zones and multi-point pain analysis
 */

import { BodyRegistry } from '../data/BodyZoneRegistry';
import { getTreeMetadata } from '../logic/AnatomicalResolver';
import { PainPoint } from '../models/EncounterIntake';

/**
 * Get severity rating for a specific zone
 */
export function getZoneSeverity(zoneId: string): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    const zone = BodyRegistry.getZone(zoneId);
    if (!zone) return 'LOW';

    const priority = zone.priority || 5;
    if (priority >= 8) return 'CRITICAL';
    if (priority >= 6) return 'HIGH';
    if (priority >= 4) return 'MODERATE';
    return 'LOW';
}

/**
 * Assess multiple pain points and determine overall severity
 */
export function assessPainPoints(painPoints: PainPoint[]): {
    maxSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    shouldEscalate: boolean;
    clinicalAlerts: string[];
} {
    if (!painPoints || painPoints.length === 0) {
        return {
            maxSeverity: 'LOW',
            shouldEscalate: false,
            clinicalAlerts: []
        };
    }

    const alerts: string[] = [];
    let maxSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';

    const severityOrder = { 'LOW': 1, 'MODERATE': 2, 'HIGH': 3, 'CRITICAL': 4 };

    // Assess each pain point
    for (const point of painPoints) {
        const zoneSeverity = getZoneSeverity(point.zoneId);

        // Track highest severity
        if (severityOrder[zoneSeverity] > severityOrder[maxSeverity]) {
            maxSeverity = zoneSeverity;
        }

        // Check for high-intensity pain (>= 8/10)
        if (point.intensity >= 8) {
            alerts.push(`Severe pain (${point.intensity}/10) in ${getZoneName(point.zoneId)}`);

            // Escalate if severe pain in HIGH severity zone
            if (zoneSeverity === 'HIGH' || zoneSeverity === 'CRITICAL') {
                maxSeverity = 'CRITICAL';
            }
        }

        // Check for radiation patterns that suggest serious conditions
        if (point.radiatesTo && point.radiatesTo.length > 0) {
            const radiationZones = point.radiatesTo.map(zId => getZoneName(zId)).join(', ');
            alerts.push(`Pain radiating to: ${radiationZones}`);
        }
    }

    // Check for concerning patterns
    if (painPoints.length >= 3) {
        alerts.push('Multiple pain locations reported - comprehensive evaluation needed');
    }

    // Determine if escalation needed
    const shouldEscalate = maxSeverity === 'CRITICAL' ||
        maxSeverity === 'HIGH' ||
        painPoints.some(p => p.intensity >= 9);

    return {
        maxSeverity,
        shouldEscalate,
        clinicalAlerts: alerts
    };
}

/**
 * Get zone display name (English)
 */
function getZoneName(zoneId: string): string {
    const zone = BodyRegistry.getZone(zoneId);
    return zone?.label_en ?? 'unknown area';
}

/**
 * Get primary pain point (highest severity + intensity)
 */
export function getPrimaryPainPoint(painPoints: PainPoint[]): PainPoint | null {
    if (!painPoints || painPoints.length === 0) return null;

    // Find explicitly marked primary
    const explicitPrimary = painPoints.find(p => p.isPrimary);
    if (explicitPrimary) return explicitPrimary;

    // Calculate score: severity weight + intensity
    const scoredPoints = painPoints.map(point => {
        const zoneSeverity = getZoneSeverity(point.zoneId);
        const severityScore = {
            'LOW': 1,
            'MODERATE': 2,
            'HIGH': 3,
            'CRITICAL': 4
        }[zoneSeverity];

        return {
            point,
            score: (severityScore * 10) + point.intensity
        };
    });

    // Return highest scoring point
    scoredPoints.sort((a, b) => b.score - a.score);
    return scoredPoints[0].point;
}
