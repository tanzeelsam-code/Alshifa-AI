
import { callAI } from '../../../services/aiService';
import { Language } from '../types';
import { IntakeState } from '../types/intake.types';
import { BODY_ZONE_TREE } from '../data/BodyZoneHierarchy';

/**
 * AI Intake Response Structure
 */
export interface AIIntakeResponse {
    intake_state: {
        chief_complaint: string;
        location: {
            primary: {
                region: string;
                subregion: string;
                body_part: string;
                side: 'left' | 'right' | 'midline' | 'both' | 'unknown';
                orientation: 'front' | 'back' | 'side' | 'diffuse' | 'internal' | 'unknown';
                depth: 'skin' | 'muscle' | 'joint' | 'bone' | 'deep_internal' | 'unknown';
            };
            secondary: any[];
            radiation: {
                present: boolean;
                to: string[];
            };
        };
        confidence: {
            location_confidence_0_to_1: number;
            missing_fields: string[];
        };
    };
    next_question: string;
}

/**
 * Service to handle real-time medical intake using AI
 */
export class RealTimeAIIntakeService {
    private systemPrompt: string;

    constructor() {
        this.systemPrompt = `
You are Alshifa AI Intake Assistant. Your task is to collect body location precisely during intake (no diagnosis).
Every user message must update location in real time using a 3-step hierarchy:
1) REGION (must be from the approved list)
2) SUBREGION (must be from the approved list for that region)
3) BODY_PART (a very specific anatomical spot, patient-friendly + anatomical)

You must always return:
- Valid JSON only
- location.primary.region must never be empty after the first location mention
- Ask exactly ONE follow-up question when any location field is uncertain.

1) Approved REGIONS:
HEAD_FACE, EYES, EARS, NOSE_SINUSES, THROAT_NECK, CHEST, UPPER_BACK, MID_BACK, LOWER_BACK, ABDOMEN, PELVIS_GROIN, GENITAL_URINARY, BUTTOCKS_HIPS, SHOULDER, UPPER_ARM, ELBOW, FOREARM, WRIST, HAND_FINGERS, THIGH, KNEE, SHIN_CALF, ANKLE, FOOT_TOES, SKIN_GENERAL, WHOLE_BODY_GENERAL

2) SUBREGIONS:
- ABDOMEN: RUQ, LUQ, RLQ, LLQ, CENTRAL, EPIGASTRIC, DIFFUSE
- CHEST: CENTER_STERNUM, LEFT_CHEST, RIGHT_CHEST, RIBS_LEFT, RIBS_RIGHT, UPPER_CHEST, LOWER_CHEST, DIFFUSE
- BACK: LEFT, RIGHT, MIDLINE, DIFFUSE
- THROAT_NECK: FRONT_NECK, SIDE_NECK_LEFT, SIDE_NECK_RIGHT, BACK_NECK, THROAT_INTERNAL, DIFFUSE
- Extremities: FRONT, BACK, INNER, OUTER, TOP, BOTTOM (as applicable)

Mandatory location attributes:
- side: left | right | midline | both | unknown
- orientation: front | back | side | diffuse | internal | unknown
- depth: skin | muscle | joint | bone | deep_internal | unknown

Output JSON format (STRICT):
{
  "intake_state": {
    "chief_complaint": "",
    "location": {
      "primary": {
        "region": "",
        "subregion": "",
        "body_part": "",
        "side": "left|right|midline|both|unknown",
        "orientation": "front|back|side|diffuse|internal|unknown",
        "depth": "skin|muscle|joint|bone|deep_internal|unknown"
      },
      "secondary": [],
      "radiation": {
        "present": false,
        "to": []
      }
    },
    "confidence": {
      "location_confidence_0_to_1": 0.0,
      "missing_fields": []
    }
  },
  "next_question": ""
}
    `;
    }

    /**
     * Process user response and get next question + updated state from AI
     */
    async processResponse(
        userMessage: string,
        history: { sender: 'user' | 'bot', text: string }[],
        language: Language = 'en'
    ): Promise<AIIntakeResponse> {
        const transcript = history.map(h => `${h.sender}: ${h.text}`).join('\n');

        const prompt = `
Current Conversation:
${transcript}
User: ${userMessage}

Patient Language: ${language}

Update the intake state and provide the next question.
Return ONLY valid JSON.
    `;

        try {
            const response = await callAI(prompt, {
                temperature: 0.1, // Low temperature for consistent JSON
                model: 'gpt-4o' // Use GPT-4o for complex reasoning if available
            });

            // Simple JSON extraction
            let cleaned = response.trim();
            if (cleaned.startsWith('```json')) {
                cleaned = cleaned.replace(/```json\n?/, '').replace(/\n?```/, '');
            }

            const parsed: AIIntakeResponse = JSON.parse(cleaned);

            // Validate response structure
            if (!parsed.intake_state || !parsed.next_question) {
                throw new Error('Invalid AI response structure');
            }

            return parsed;

        } catch (error) {
            console.error('RealTimeAIIntakeService Error:', error);
            throw error;
        }
    }

    /**
     * Map AI region/part to existing BodyZoneHierarchy IDs
     */
    mapToInternalZone(aiResponse: AIIntakeResponse): string | undefined {
        const { region, subregion, side } = aiResponse.intake_state.location.primary;

        // Logic to bridge AI terminology with our constants in BodyZoneHierarchy.ts
        // This will be expanded as we refine the mapping.

        if (region === 'ABDOMEN') {
            if (subregion === 'RLQ') return 'ABDOMEN_RLQ';
            if (subregion === 'LLQ') return 'ABDOMEN_LLQ';
            if (subregion === 'RUQ') return 'ABDOMEN_RUQ';
            if (subregion === 'LUQ') return 'ABDOMEN_LUQ';
            return 'ABDOMEN';
        }

        if (region === 'CHEST') {
            if (side === 'left') return 'CHEST_LEFT';
            if (side === 'right') return 'CHEST_RIGHT';
            return 'CHEST';
        }

        // Fallback: search for a zone ID that matches region
        // More complex mapping logic will be implemented here

        return region;
    }
}

export const realTimeAIIntakeService = new RealTimeAIIntakeService();
