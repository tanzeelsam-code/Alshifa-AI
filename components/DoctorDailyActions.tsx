import React, { useMemo } from 'react';
import { DoctorProfile, PatientSummary, Appointment } from '../types';
import { Calendar, Users, AlertCircle, Clock, FileText } from 'lucide-react';

interface DoctorDailyActionsProps {
    doctor: DoctorProfile;
    summaries: PatientSummary[];
    appointments?: Appointment[];
}

/**
 * DoctorDailyActions Component
 * 
 * Provides a quick overview of today's tasks and urgent alerts for doctors.
 * This component enhances the doctor dashboard with actionable insights.
 */
export const DoctorDailyActions: React.FC<DoctorDailyActionsProps> = ({
    doctor,
    summaries,
    appointments = []
}) => {
    const today = new Date().toISOString().split('T')[0];

    const dailyStats = useMemo(() => {
        // Filter summaries for this doctor
        const doctorSummaries = summaries.filter(s => s.doctorId === doctor.id);

        // Today's appointments
        const todayAppointments = doctorSummaries.filter(
            s => s.appointmentDate === today
        );

        // Pending reviews (summaries with 'Pending' status)
        const pendingReviews = doctorSummaries.filter(
            s => s.status === 'Pending'
        );

        // Urgent cases (high risk classification)
        const urgentCases = doctorSummaries.filter(
            s => s.riskClassification === 'Urgent' && s.status === 'Pending'
        );

        // Unread messages (simulated - would come from messaging system)
        const unreadMessages = 0; // Placeholder for future messaging feature

        return {
            todayAppointments: todayAppointments.length,
            pendingReviews: pendingReviews.length,
            urgentCases: urgentCases.length,
            unreadMessages,
            urgentPatients: urgentCases.map(c => ({
                name: c.patientName,
                complaint: c.conditionFocus || 'Not specified',
                time: c.appointmentTime
            }))
        };
    }, [doctor.id, summaries, today]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Today's Actions
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Today's Appointments */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Today's Appointments</p>
                            <p className="text-3xl font-bold text-blue-700">{dailyStats.todayAppointments}</p>
                        </div>
                        <Calendar className="w-10 h-10 text-blue-400" />
                    </div>
                </div>

                {/* Pending Reviews */}
                <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-amber-600 font-medium">Pending Reviews</p>
                            <p className="text-3xl font-bold text-amber-700">{dailyStats.pendingReviews}</p>
                        </div>
                        <FileText className="w-10 h-10 text-amber-400" />
                    </div>
                </div>

                {/* Urgent Cases */}
                <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600 font-medium">Urgent Cases</p>
                            <p className="text-3xl font-bold text-red-700">{dailyStats.urgentCases}</p>
                        </div>
                        <AlertCircle className="w-10 h-10 text-red-400" />
                    </div>
                </div>

                {/* Unread Messages */}
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Messages</p>
                            <p className="text-3xl font-bold text-green-700">{dailyStats.unreadMessages}</p>
                        </div>
                        <Users className="w-10 h-10 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Urgent Patients List */}
            {dailyStats.urgentPatients.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Requires Immediate Attention
                    </h3>
                    <div className="space-y-2">
                        {dailyStats.urgentPatients.map((patient, index) => (
                            <div
                                key={index}
                                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-red-900">{patient.name}</p>
                                    <p className="text-sm text-red-700">{patient.complaint}</p>
                                </div>
                                <div className="text-sm text-red-600 font-medium">
                                    {patient.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Urgent Cases Message */}
            {dailyStats.urgentCases === 0 && dailyStats.pendingReviews === 0 && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-700 font-medium">✅ All caught up! No urgent items.</p>
                </div>
            )}
        </div>
    );
};
