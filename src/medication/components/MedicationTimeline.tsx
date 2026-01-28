// src/components/MedicationTimeline.tsx

import React, { useState, useMemo } from 'react';
import { useMedication } from '../context/MedicationContext';
import { Medication, DoseTime, MedicationPriority } from '../types/medication.types';
import { Clock, AlertCircle, CheckCircle, X, Bell, ChevronRight } from 'lucide-react';

interface TimelineGroupProps {
  time: string;
  medications: Array<{ medication: Medication; dose: DoseTime }>;
  onTakeDose: (medId: string, doseId: string) => void;
  onSkipDose: (medId: string, doseId: string) => void;
  onViewDetails: (medId: string) => void;
}

const TimelineGroup: React.FC<TimelineGroupProps> = ({
  time,
  medications,
  onTakeDose,
  onSkipDose,
  onViewDetails
}) => {
  const [expandedMed, setExpandedMed] = useState<string | null>(null);

  const getPriorityColor = (priority: MedicationPriority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500';
      case 'IMPORTANT': return 'bg-orange-500';
      case 'ROUTINE': return 'bg-blue-500';
      case 'PRN': return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: MedicationPriority) => {
    switch (priority) {
      case 'CRITICAL': return { bg: 'bg-red-50', text: 'text-red-700', label: 'Critical' };
      case 'IMPORTANT': return { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Important' };
      case 'ROUTINE': return { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Routine' };
      case 'PRN': return { bg: 'bg-gray-50', text: 'text-gray-700', label: 'As Needed' };
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'DOCTOR_PRESCRIBED': return { bg: 'bg-green-50', text: 'text-green-700', icon: '👨‍⚕️', label: 'Doctor' };
      case 'AI_RECOMMENDED': return { bg: 'bg-purple-50', text: 'text-purple-700', icon: '🤖', label: 'AI' };
      case 'USER_ADDED': return { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '👤', label: 'Self' };
      case 'EMERGENCY_PROTOCOL': return { bg: 'bg-red-50', text: 'text-red-700', icon: '🚨', label: 'Emergency' };
      case 'HOSPITAL_ORDER': return { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: '🏥', label: 'Hospital' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', icon: '💊', label: 'Other' };
    }
  };

  return (
    <div className="mb-6">
      {/* Time Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-1 h-8 rounded-full ${getPriorityColor(medications[0].medication.priority)}`} />
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="font-semibold text-gray-900">{time}</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Medication Cards */}
      <div className="space-y-3 ml-7">
        {medications.map(({ medication, dose }) => {
          const isExpanded = expandedMed === medication.id;
          const priorityBadge = getPriorityBadge(medication.priority);
          const sourceBadge = getSourceBadge(medication.source);

          return (
            <div
              key={medication.id}
              className={`
                bg-white rounded-xl shadow-sm border-2 transition-all
                ${dose.status === 'taken' ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}
                ${dose.status === 'missed' ? 'border-red-200 bg-red-50/30' : ''}
                ${dose.status === 'skipped' ? 'border-yellow-200 bg-yellow-50/30' : ''}
              `}
            >
              {/* Main Card Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{medication.name}</h3>
                      <span className="text-sm text-gray-500">{medication.dosage}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{medication.purpose}</p>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${priorityBadge.bg} ${priorityBadge.text} font-medium`}>
                        {priorityBadge.label}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${sourceBadge.bg} ${sourceBadge.text} font-medium`}>
                        {sourceBadge.icon} {sourceBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Status Icon */}
                  {dose.status === 'taken' && (
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  )}
                  {dose.status === 'missed' && (
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  )}
                  {dose.status === 'skipped' && (
                    <X className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                  )}
                </div>

                {/* Context Tags */}
                <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    🍽️ {dose.context.replace('_', ' ')}
                  </span>
                  {medication.condition && (
                    <span className="flex items-center gap-1">
                      🩺 For: {medication.condition}
                    </span>
                  )}
                </div>

                {/* Actions */}
                {dose.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onTakeDose(medication.id, dose.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      ✅ Mark as Taken
                    </button>
                    <button
                      onClick={() => setExpandedMed(isExpanded ? null : medication.id)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {isExpanded ? 'Less' : 'More'}
                    </button>
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    {/* Instructions */}
                    {medication.instructions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">📋 Instructions</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {medication.instructions.map((inst, idx) => (
                            <li key={idx}>• {inst}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {medication.warnings.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-orange-700 mb-1">⚠️ Warnings</h4>
                        <ul className="text-sm text-orange-600 space-y-1">
                          {medication.warnings.map((warn, idx) => (
                            <li key={idx}>• {warn}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Prescription Info */}
                    {medication.prescription.prescribedBy && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">👨‍⚕️ Prescribed By</h4>
                        <p className="text-sm text-gray-600">{medication.prescription.prescribedBy}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(medication.prescription.prescribedDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => onSkipDose(medication.id, dose.id)}
                        className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Skip Dose
                      </button>
                      <button
                        onClick={() => onViewDetails(medication.id)}
                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        View Full Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Taken Status */}
              {dose.status === 'taken' && dose.takenAt && (
                <div className="bg-green-50 px-4 py-2 border-t border-green-100">
                  <p className="text-xs text-green-700">
                    ✓ Taken at {new Date(dose.takenAt).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {/* Skipped Status */}
              {dose.status === 'skipped' && dose.skippedReason && (
                <div className="bg-yellow-50 px-4 py-2 border-t border-yellow-100">
                  <p className="text-xs text-yellow-700">
                    ⊘ Skipped: {dose.skippedReason}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MedicationTimeline: React.FC = () => {
  const { getTodayMedications, markDoseTaken, skipDose } = useMedication();
  const [skipModalOpen, setSkipModalOpen] = useState<{ medId: string; doseId: string } | null>(null);
  const [skipReason, setSkipReason] = useState('');

  const todayMeds = getTodayMedications();

  // Group medications by time
  const groupedByTime = useMemo(() => {
    const groups = new Map<string, Array<{ medication: Medication; dose: DoseTime }>>();

    todayMeds.forEach(medication => {
      medication.schedule.times.forEach(dose => {
        if (!groups.has(dose.time)) {
          groups.set(dose.time, []);
        }
        groups.get(dose.time)!.push({ medication, dose });
      });
    });

    // Sort by time
    return Array.from(groups.entries())
      .sort(([timeA], [timeB]) => timeA.localeCompare(timeB));
  }, [todayMeds]);

  const handleTakeDose = async (medId: string, doseId: string) => {
    await markDoseTaken(medId, doseId);
  };

  const handleSkipDoseClick = (medId: string, doseId: string) => {
    setSkipModalOpen({ medId, doseId });
  };

  const confirmSkip = async () => {
    if (skipModalOpen && skipReason) {
      await skipDose(skipModalOpen.medId, skipModalOpen.doseId, skipReason);
      setSkipModalOpen(null);
      setSkipReason('');
    }
  };

  const handleViewDetails = (medId: string) => {
    // Navigate to detail page
    window.location.href = `/medications/${medId}`;
  };

  if (todayMeds.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Medications Today</h3>
        <p className="text-gray-500">You don't have any medications scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedByTime.map(([time, medications]) => (
        <TimelineGroup
          key={time}
          time={time}
          medications={medications}
          onTakeDose={handleTakeDose}
          onSkipDose={handleSkipDoseClick}
          onViewDetails={handleViewDetails}
        />
      ))}

      {/* Skip Dose Modal */}
      {skipModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Why are you skipping this dose?</h3>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="e.g., Feeling nauseous, Already took earlier, Side effects..."
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSkipModalOpen(null);
                  setSkipReason('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSkip}
                disabled={!skipReason.trim()}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
