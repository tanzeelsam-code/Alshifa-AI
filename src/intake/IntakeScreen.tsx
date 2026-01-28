/**
 * IntakeScreen.tsx
 * SINGLE ENTRY POINT for all medical intake
 */

import React from 'react';
import UnifiedIntakeOrchestrator from './components/UnifiedIntakeOrchestrator';
import { PatientAccount } from './models/PatientAccount';
import { EncounterIntake } from './models/EncounterIntake';

interface Props {
    patientAccount: PatientAccount;
    currentLanguage?: 'en' | 'ur';
    onComplete: (encounter: EncounterIntake) => void;
    onExit: () => void;
}


interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class IntakeErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false, error: null };
    props!: ErrorBoundaryProps;

    constructor(props: ErrorBoundaryProps) {
        super(props);
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-900 border border-red-200 m-4 rounded-xl">
                    <h2 className="text-2xl font-bold mb-4">⚠️ Intake Error</h2>
                    <pre className="bg-white p-4 rounded border border-red-100 overflow-auto text-sm">
                        {this.state.error?.toString()}
                        <br />
                        {this.state.error?.stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

export const IntakeScreen: React.FC<Props> = ({
    patientAccount,
    currentLanguage = 'en',
    onComplete,
    onExit
}) => {
    // Safety check: Don't initialize if no authentication exists
    const currentUserId = localStorage.getItem('alshifa_current_user');

    // Check if it's a JSON string or a plain string
    let effectiveUserId = currentUserId;
    if (currentUserId && currentUserId.startsWith('{')) {
        try {
            const parsed = JSON.parse(currentUserId);
            effectiveUserId = parsed.id || parsed.uid;
        } catch (e) {
            console.error('Failed to parse current user ID from JSON', e);
        }
    }

    if (!effectiveUserId || !patientAccount) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h3>
                <p className="text-slate-500 mb-6">Please log in to proceed with the medical intake.</p>
                <button
                    onClick={onExit}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold"
                >
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <IntakeErrorBoundary>
            <UnifiedIntakeOrchestrator
                patientAccount={patientAccount}
                language={currentLanguage}
                onComplete={(encounter) => {
                    // Call parent onComplete with full encounter 
                    onComplete(encounter);
                }}

                onExit={onExit}
            />
        </IntakeErrorBoundary>
    );
};

export default IntakeScreen;
