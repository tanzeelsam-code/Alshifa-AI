import React from 'react';
import { CheckCircle, Circle, Clock, Calendar, FileText, UserCheck } from 'lucide-react';

interface TimelineStep {
    id: string;
    label: string;
    status: 'completed' | 'current' | 'pending';
    description?: string;
    date?: string;
    icon: React.ReactNode;
}

interface PatientTimelineProps {
    currentStep?: 'intake' | 'doctor-selection' | 'appointment' | 'consultation' | 'follow-up';
    hasIntake?: boolean;
    hasDoctorSelected?: boolean;
    hasAppointment?: boolean;
    hasConsultation?: boolean;
    appointmentDate?: string;
    nextAppointmentDate?: string;
}

/**
 * PatientTimeline Component
 * 
 * Displays a vertical timeline showing the patient's journey through the medical system.
 * Helps patients understand what they've completed and what's next.
 */
export const PatientTimeline: React.FC<PatientTimelineProps> = ({
    currentStep = 'intake',
    hasIntake = false,
    hasDoctorSelected = false,
    hasAppointment = false,
    hasConsultation = false,
    appointmentDate,
    nextAppointmentDate
}) => {
    const getStepStatus = (stepId: string): 'completed' | 'current' | 'pending' => {
        const steps = ['intake', 'doctor-selection', 'appointment', 'consultation', 'follow-up'];
        const currentIndex = steps.indexOf(currentStep);
        const stepIndex = steps.indexOf(stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    const timelineSteps: TimelineStep[] = [
        {
            id: 'intake',
            label: 'Medical Intake',
            status: hasIntake ? 'completed' : getStepStatus('intake'),
            description: hasIntake ? 'Intake completed' : 'Complete your medical intake form',
            icon: <FileText className="w-5 h-5" />
        },
        {
            id: 'doctor-selection',
            label: 'Doctor Selection',
            status: hasDoctorSelected ? 'completed' : getStepStatus('doctor-selection'),
            description: hasDoctorSelected ? 'Doctor selected' : 'Choose your preferred doctor',
            icon: <UserCheck className="w-5 h-5" />
        },
        {
            id: 'appointment',
            label: 'Appointment Scheduled',
            status: hasAppointment ? 'completed' : getStepStatus('appointment'),
            description: hasAppointment && appointmentDate ? `Scheduled for ${appointmentDate}` : 'Book your appointment',
            date: appointmentDate,
            icon: <Calendar className="w-5 h-5" />
        },
        {
            id: 'consultation',
            label: 'Consultation',
            status: hasConsultation ? 'completed' : getStepStatus('consultation'),
            description: hasConsultation ? 'Consultation completed' : 'Attend your consultation',
            icon: <UserCheck className="w-5 h-5" />
        },
        {
            id: 'follow-up',
            label: 'Follow-up',
            status: nextAppointmentDate ? 'completed' : 'pending',
            description: nextAppointmentDate ? `Next: ${nextAppointmentDate}` : 'Schedule follow-up if needed',
            icon: <Clock className="w-5 h-5" />
        }
    ];

    const getStatusColor = (status: 'completed' | 'current' | 'pending') => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100 border-green-600';
            case 'current':
                return 'text-blue-600 bg-blue-100 border-blue-600';
            case 'pending':
                return 'text-slate-400 bg-slate-100 border-slate-300';
        }
    };

    const getLineColor = (status: 'completed' | 'current' | 'pending') => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'current':
                return 'bg-blue-500';
            case 'pending':
                return 'bg-slate-300';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Your Medical Journey</h2>

            <div className="relative">
                {timelineSteps.map((step, index) => {
                    const isLast = index === timelineSteps.length - 1;
                    const statusColor = getStatusColor(step.status);
                    const lineColor = getLineColor(step.status);

                    return (
                        <div key={step.id} className="relative pb-8">
                            {/* Timeline */}
                            <div className="flex items-start">
                                {/* Icon Circle */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 ${statusColor} flex items-center justify-center z-10 relative`}>
                                    {step.status === 'completed' ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : step.status === 'current' ? (
                                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                                    ) : (
                                        <Circle className="w-6 h-6" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="ml-4 flex-1">
                                    <h3 className={`font-bold text-lg ${step.status === 'completed' ? 'text-green-700' :
                                            step.status === 'current' ? 'text-blue-700' :
                                                'text-slate-500'
                                        }`}>
                                        {step.label}
                                    </h3>
                                    <p className={`text-sm mt-1 ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-600'
                                        }`}>
                                        {step.description}
                                    </p>
                                    {step.date && (
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {step.date}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Connecting Line */}
                            {!isLast && (
                                <div className={`absolute left-6 top-12 w-0.5 h-full -ml-px ${lineColor}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Next Steps Card */}
            {currentStep !== 'follow-up' && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">What's Next?</h4>
                    <p className="text-sm text-blue-700">
                        {!hasIntake && 'Complete your medical intake to get started.'}
                        {hasIntake && !hasDoctorSelected && 'Select a doctor for your consultation.'}
                        {hasDoctorSelected && !hasAppointment && 'Schedule your appointment.'}
                        {hasAppointment && !hasConsultation && 'Attend your scheduled consultation.'}
                        {hasConsultation && 'Your consultation is complete! Schedule a follow-up if needed.'}
                    </p>
                </div>
            )}
        </div>
    );
};
