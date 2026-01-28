import React, { useState, useEffect } from 'react';
import { IntakeSessionManager, IntakeSession } from './session/IntakeSessionManager';
import { BaselineModule } from './steps/BaselineModule';
import EmergencyScreen from './steps/EmergencyScreen';
import ComplaintSelectionScreen from './steps/ComplaintSelectionScreen';
import { BodyMapStep } from './steps/BodyMapStep';
import BaselineScreen from './steps/BaselineScreen';
import IntakeSummaryScreen from './steps/IntakeSummaryScreen';
import { createNewEncounter, IntakePhase } from './models/EncounterIntake';
import { PatientAccount } from './models/PatientAccount';

interface Props {
    patientAccount: PatientAccount;
    currentLanguage: 'en' | 'ur';
    onComplete: (encounterId: string) => void;
    onExit: () => void;
}

// MANDATORY INTAKE SEQUENCE - NO SKIPS ALLOWED
type UnifiedPhase = 'EMERGENCY' | 'COMPLAINT_SELECTION' | 'BODY_MAP' | 'BASELINE' | 'COMPLAINT_TREE' | 'SUMMARY' | 'COMPLETE';

const MANDATORY_STEPS: UnifiedPhase[] = [
    'EMERGENCY',
    'COMPLAINT_SELECTION',
    'BODY_MAP',      // ← MANDATORY - CANNOT BE SKIPPED
    'BASELINE',      // (first-time only)
    'COMPLAINT_TREE',
    'SUMMARY'
];

export const UnifiedIntakeFlow: React.FC<Props> = ({
    patientAccount,
    currentLanguage,
    onComplete,
    onExit,
}) => {
    const [session, setSession] = useState<IntakeSession | null>(null);
    const [currentPhase, setCurrentPhase] = useState<UnifiedPhase>('EMERGENCY');
    const [canGoBack, setCanGoBack] = useState(false);

    // Load or create session on mount
    useEffect(() => {
        const existingSession = IntakeSessionManager.loadSession();

        if (existingSession && !IntakeSessionManager.isSessionExpired(existingSession) && existingSession.patientId === patientAccount.id) {
            setSession(existingSession);
            setCurrentPhase(existingSession.currentPhase);
        } else {
            const isFirstTime = !localStorage.getItem(`alshifa_patient_${patientAccount.id}_history`);
            const encounter = createNewEncounter(patientAccount.id);
            const newSession = IntakeSessionManager.createSession(patientAccount.id, isFirstTime, encounter);
            setSession(newSession);
            setCurrentPhase('EMERGENCY');
        }
    }, [patientAccount.id]);

    useEffect(() => {
        if (session) {
            setCanGoBack(IntakeSessionManager.canGoBack(session));
        }
    }, [session, currentPhase]);

    const handleBack = () => {
        if (!session) return;
        const previousStep = IntakeSessionManager.popStep(session);
        if (previousStep) {
            setSession({ ...session });

            // Navigation logic
            if (session.navigationStack.length === 0) {
                setCurrentPhase('EMERGENCY');
            } else {
                const lastStep = session.navigationStack[session.navigationStack.length - 1];
                if (lastStep.stepType === 'emergency') setCurrentPhase('COMPLAINT_SELECTION');
                else if (lastStep.stepType === 'complaint') setCurrentPhase('BODY_MAP');
                else if (lastStep.stepType === 'bodyMap') {
                    setCurrentPhase(session.isFirstTimePatient ? 'BASELINE' : 'COMPLAINT_TREE');
                }
                else if (lastStep.stepId === 'baseline_history') setCurrentPhase('COMPLAINT_TREE');
            }
        }
    };

    const handleExit = () => {
        const msg = {
            en: 'Are you sure you want to exit? Your progress will be saved.',
            ur: 'کیا آپ واقعی باہر نکلنا چاہتے ہیں؟ آپ کی پیش رفت محفوظ ہو جائے گی۔',
        };

        if (confirm(msg[currentLanguage])) {
            onExit();
        }
    };

    const proceedToNextPhase = (nextPhase: UnifiedPhase) => {
        if (!session) return;

        // 🚨 CRITICAL: Enforce body map completion
        if (currentPhase === 'BODY_MAP' && nextPhase !== 'BODY_MAP') {
            // Check for painPoints (new system) or bodyLocation (backward compatibility)
            const hasPainPoints = session.encounter.painPoints && session.encounter.painPoints.length > 0;
            const hasBodyLocation = session.encounter.bodyLocation?.region;

            if (!hasPainPoints && !hasBodyLocation) {
                const errorMsg = {
                    en: 'Body mapping is required. Please select where you feel pain.',
                    ur: 'جسم کی نقشہ سازی ضروری ہے۔ براہ کرم منتخب کریں کہ آپ کو کہاں درد محسوس ہوتا ہے۔',
                };
                alert(errorMsg[currentLanguage]);
                return; // Block progression
            }
        }

        session.currentPhase = nextPhase;
        setCurrentPhase(nextPhase);
        IntakeSessionManager.saveSession(session);
    };

    if (!session) {
        if (!session) {
            return <div className="flex h-screen items-center justify-center text-4xl font-bold text-red-600">LOADING... (Check Console)</div>;
        }
    }

    const progress = calculateProgress(currentPhase);

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Header with Progress */}
            <div className="flex items-center justify-between p-4 bg-white shadow-md">
                <div className="flex items-center gap-4 flex-grow">
                    {canGoBack && (
                        <button
                            onClick={handleBack}
                            className="p-2 text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl transition-all"
                        >
                            ← {currentLanguage === 'ur' ? 'واپس' : 'Back'}
                        </button>
                    )}

                    <div className="flex-grow mx-4">
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleExit}
                        className="p-2 text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition-all"
                    >
                        {currentLanguage === 'ur' ? 'باہر نکلیں' : 'Exit'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow p-4 md:p-8 overflow-y-auto">
                {currentPhase === 'EMERGENCY' && (
                    <EmergencyScreen
                        currentLanguage={currentLanguage}
                        onContinue={(responses) => {
                            IntakeSessionManager.pushStep(session, {
                                stepId: 'emergency_check',
                                stepType: 'emergency',
                                data: responses
                            });
                            proceedToNextPhase('COMPLAINT_SELECTION');
                        }}
                        onEmergency={(checkpointId) => {
                            IntakeSessionManager.clearSession();

                            // Multilingual emergency warning (NOT falsely claiming we called emergency services)
                            const emergencyMessages = {
                                en: "⚠️ EMERGENCY DETECTED\n\nYou may need immediate medical attention.\n\nPlease:\n• Go to the nearest Emergency Room immediately\n• Or call 1122 (Pakistan Emergency Services)\n\nThis app CANNOT replace emergency care.",
                                ur: "⚠️ ایمرجنسی کا پتہ چلا\n\nآپ کو فوری طبی امداد کی ضرورت ہو سکتی ہے۔\n\nبراہ کرم:\n• فوری طور پر قریبی ایمرجنسی روم میں جائیں\n• یا 1122 (پاکستان ایمرجنسی سروسز) کو کال کریں\n\nیہ ایپ ایمرجنسی کیئر کی جگہ نہیں لے سکتی۔",
                            };

                            alert(emergencyMessages[currentLanguage]);
                            onExit();
                        }}
                    />
                )}

                {currentPhase === 'COMPLAINT_SELECTION' && (
                    <ComplaintSelectionScreen
                        currentLanguage={currentLanguage}
                        onComplaintSelected={(complaint) => {
                            session.encounter.complaintType = complaint;
                            IntakeSessionManager.pushStep(session, {
                                stepId: 'complaint_selection',
                                stepType: 'complaint',
                                data: complaint
                            });
                            IntakeSessionManager.saveSession(session);
                            proceedToNextPhase('BODY_MAP');
                        }}
                    />
                )}

                {/* 🚨 MANDATORY BODY MAP - CANNOT BE SKIPPED */}
                {currentPhase === 'BODY_MAP' && (
                    <BodyMapStep
                        state={{
                            language: currentLanguage,
                            bodyRegion: session.encounter.bodyLocation?.region as any,
                            painPoints: session.encounter.painPoints || [],
                            bodyVariant: session.encounter.bodyVariant || 'ADULT',
                            phase: 'BODY_MAP'
                        }}
                        onStateChange={(state) => {
                            // Update pain points (new system)
                            if (state.painPoints) {
                                session.encounter.painPoints = state.painPoints;
                            }
                            // Update body variant
                            if (state.bodyVariant) {
                                session.encounter.bodyVariant = state.bodyVariant;
                            }
                            // Keep backward compatibility with bodyLocation
                            if (state.bodyRegion) {
                                session.encounter.bodyLocation = { region: state.bodyRegion as any };
                            }
                        }}
                        onComplete={() => {
                            // Validate body map completion before allowing progression
                            const hasPainPoints = session.encounter.painPoints && session.encounter.painPoints.length > 0;
                            const hasBodyLocation = session.encounter.bodyLocation?.region;

                            if (!hasPainPoints && !hasBodyLocation) {
                                const errorMsg = {
                                    en: 'Please select at least one pain location to continue.',
                                    ur: 'جاری رکھنے کے لیے براہ کرم کم از کم ایک درد کا مقام منتخب کریں۔',
                                };
                                alert(errorMsg[currentLanguage]);
                                return;
                            }

                            IntakeSessionManager.pushStep(session, {
                                stepId: 'body_mapping',
                                stepType: 'bodyMap',
                                data: session.encounter.painPoints || session.encounter.bodyLocation
                            });

                            // Determine next phase
                            const nextPhase = session.isFirstTimePatient ? 'BASELINE' : 'COMPLAINT_TREE';
                            proceedToNextPhase(nextPhase);
                        }}
                    />
                )}

                {currentPhase === 'BASELINE' && session.isFirstTimePatient && (
                    <BaselineScreen
                        currentLanguage={currentLanguage}
                        patientAccount={patientAccount}
                        onComplete={(baselineData) => {
                            BaselineModule.processBaselineAnswers(session.encounter, baselineData);
                            IntakeSessionManager.pushStep(session, {
                                stepId: 'baseline_history',
                                stepType: 'baseline',
                                data: baselineData
                            });
                            proceedToNextPhase('COMPLAINT_TREE');
                        }}
                    />
                )}

                {currentPhase === 'COMPLAINT_TREE' && (
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold mb-4">
                            {currentLanguage === 'ur' ? 'شکایت کے سوالات' : 'Complaint Questions'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {currentLanguage === 'ur'
                                ? 'آپ کی شکایت کے بارے میں تفصیلی سوالات جلد آ رہے ہیں...'
                                : 'Detailed questions about your complaint coming soon...'}
                        </p>
                        <button
                            onClick={() => proceedToNextPhase('SUMMARY')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
                        >
                            {currentLanguage === 'ur' ? 'جاری رکھیں' : 'Continue'}
                        </button>
                    </div>
                )}

                {currentPhase === 'SUMMARY' && (
                    <IntakeSummaryScreen
                        encounter={session.encounter}
                        currentLanguage={currentLanguage}
                        onComplete={() => {
                            IntakeSessionManager.clearSession();
                            proceedToNextPhase('COMPLETE');
                            onComplete(session.encounter.encounterId);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

function calculateProgress(phase: UnifiedPhase): number {
    const phaseMap: Record<UnifiedPhase, number> = {
        'EMERGENCY': 16,
        'COMPLAINT_SELECTION': 32,
        'BODY_MAP': 48,          // Body map gets its own progress indicator
        'BASELINE': 64,
        'COMPLAINT_TREE': 80,
        'SUMMARY': 95,
        'COMPLETE': 100
    };
    return phaseMap[phase] || 0;
}

export default UnifiedIntakeFlow;
