/**
 * Triage Scoring System
 * 
 * Calculates patient priority score (0-100) based on symptoms,
 * severity, duration, and red flags to prioritize urgent cases.
 * 
 * Phase 1 - Critical Safety Implementation
 */

import { IntakeState } from '../types';

export interface TriageScore {
    totalScore: number; // 0-100
    category: 'immediate' | 'urgent' | 'semi-urgent' | 'non-urgent';
    waitTimeRecommendation: string;
    reasoning: string[];
    priorityLevel: 1 | 2 | 3 | 4; // 1 = highest priority
}

/**
 * Calculate triage priority score based on intake responses
 * @param state - Current intake state with patient answers
 * @returns Triage score with category and recommendations
 */
export function calculateTriageScore(state: IntakeState): TriageScore {
    let score = 0;
    const reasoning: string[] = [];

    // 1. Emergency Indicators (40 points)
    if (state.isEmergency || state.redFlags?.critical) {
        score += 40;
        reasoning.push('Critical emergency indicators detected');
    } else if (state.redFlags?.present) {
        score += 25;
        reasoning.push('Red flag symptoms present');
    }

    // 2. Severity Score (20 points max)
    // Check multiple possible locations for severity
    const severityStr =
        state.symptomDetails?.severity ||
        state.hpi?.severity?.toString() ||
        state.answers?.severity ||
        state.answers?.pain_severity ||
        '0';

    const severity = typeof severityStr === 'number' ?
        severityStr :
        parseInt(severityStr) || 0;

    if (severity >= 8) {
        score += 20;
        reasoning.push(`High pain severity: ${severity}/10`);
    } else if (severity >= 5) {
        score += 15;
        reasoning.push(`Moderate pain severity: ${severity}/10`);
    } else if (severity >= 3) {
        score += 10;
    } else {
        score += (severity / 10) * 20;
    }

    // 3. Duration - Acute onset scores higher (15 points max)
    const duration = (
        state.symptomDetails?.duration ||
        state.hpi?.duration ||
        state.answers?.duration ||
        ''
    ).toLowerCase();

    if (duration.includes('hour') || duration.includes('گھنٹے') ||
        duration.includes('today') || duration.includes('آج')) {
        score += 15;
        reasoning.push('Acute onset (hours)');
    } else if (duration.includes('day') || duration.includes('دن') ||
        duration.includes('yesterday') || duration.includes('کل')) {
        score += 12;
        reasoning.push('Recent onset (days)');
    } else if (duration.includes('week') || duration.includes('ہفتہ')) {
        score += 8;
        reasoning.push('Subacute (weeks)');
    } else if (duration.includes('month') || duration.includes('مہینہ')) {
        score += 5;
    }

    // 4. Associated Symptoms (10 points max)
    const associated = (
        state.symptomDetails?.associatedSymptoms ||
        state.hpi?.associatedSymptoms ||
        state.answers?.associated ||
        []
    );

    if (Array.isArray(associated) && associated.length > 0) {
        const symptomCount = associated.length;
        score += Math.min(10, symptomCount * 2);
        reasoning.push(`${symptomCount} associated symptoms`);
    } else if (typeof associated === 'string' && associated.length > 20) {
        score += 8;
        reasoning.push('Multiple associated symptoms');
    }

    // 5. Age Considerations (5 points max)
    // Very young (<5) or elderly (>70) get priority
    const demographics = state.hpi?.demographics || {};
    const age = demographics.age || 0;

    if (age > 0) {
        if (age < 5 || age > 70) {
            score += 5;
            reasoning.push(`Age consideration: ${age} years`);
        } else if (age < 12 || age > 60) {
            score += 3;
        }
    }

    // 6. Chief Complaint Keywords (10 points max)
    const complaint = (state.chiefComplaint || '').toLowerCase();
    const urgentKeywords = [
        'severe', 'acute', 'sudden', 'worsening', 'can\'t', 'unable',
        'شدید', 'اچانک', 'بگڑ', 'نہیں'
    ];

    const matchedKeywords = urgentKeywords.filter(keyword =>
        complaint.includes(keyword)
    );

    if (matchedKeywords.length > 0) {
        score += Math.min(10, matchedKeywords.length * 3);
        reasoning.push('Urgent descriptors in complaint');
    }

    // Cap score at 100
    score = Math.min(100, score);

    // Determine category and priority
    let category: TriageScore['category'];
    let priorityLevel: TriageScore['priorityLevel'];
    let waitTime: string;

    if (score >= 70) {
        category = 'immediate';
        priorityLevel = 1;
        waitTime = 'See immediately or call 1122';
    } else if (score >= 50) {
        category = 'urgent';
        priorityLevel = 2;
        waitTime = 'See within 1-2 hours';
    } else if (score >= 30) {
        category = 'semi-urgent';
        priorityLevel = 3;
        waitTime = 'See within 4-6 hours';
    } else {
        category = 'non-urgent';
        priorityLevel = 4;
        waitTime = 'Can schedule regular appointment';
    }

    return {
        totalScore: Math.round(score),
        category,
        priorityLevel,
        waitTimeRecommendation: waitTime,
        reasoning
    };
}

/**
 * Get color code for triage category (for UI display)
 * @param category - Triage category
 * @returns Tailwind CSS color class
 */
export function getTriageColor(category: TriageScore['category']): string {
    switch (category) {
        case 'immediate':
            return 'text-red-600 bg-red-50';
        case 'urgent':
            return 'text-orange-600 bg-orange-50';
        case 'semi-urgent':
            return 'text-yellow-600 bg-yellow-50';
        case 'non-urgent':
            return 'text-green-600 bg-green-50';
    }
}

/**
 * Get icon for triage category
 * @param category - Triage category
 * @returns Unicode emoji icon
 */
export function getTriageIcon(category: TriageScore['category']): string {
    switch (category) {
        case 'immediate':
            return '🚨';
        case 'urgent':
            return '⚠️';
        case 'semi-urgent':
            return '⏰';
        case 'non-urgent':
            return '📋';
    }
}

/**
 * Format triage score for display
 * @param triage - Triage score object
 * @param language - Display language
 * @returns Formatted string
 */
export function formatTriageDisplay(
    triage: TriageScore,
    language: 'en' | 'ur'
): string {
    const icon = getTriageIcon(triage.category);
    const categoryText = language === 'ur' ? {
        'immediate': 'فوری',
        'urgent': 'ضروری',
        'semi-urgent': 'نیم ضروری',
        'non-urgent': 'عام'
    }[triage.category] : triage.category.toUpperCase();

    const waitText = language === 'ur' ? {
        'immediate': 'فوری طور پر یا 1122 پر کال کریں',
        'urgent': '1-2 گھنٹوں میں',
        'semi-urgent': '4-6 گھنٹوں میں',
        'non-urgent': 'باقاعدہ اپائنٹمنٹ'
    }[triage.category] : triage.waitTimeRecommendation;

    return `${icon} ${categoryText} - ${waitText}`;
}
