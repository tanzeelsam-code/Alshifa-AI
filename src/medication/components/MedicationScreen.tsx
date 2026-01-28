// src/screens/MedicationScreen.tsx

import React, { useState, useEffect } from 'react';
import { useMedication } from '../context/MedicationContext';
import { MedicationTimeline } from '../components/MedicationTimeline';
import { AlertTriangle, TrendingUp, Plus, Settings, Calendar, Bell, ArrowLeft } from 'lucide-react';

import { AddMedicationModal } from './AddMedicationModal';

interface MedicationScreenProps {
  onBack?: () => void;
}

export const MedicationScreen: React.FC<MedicationScreenProps> = ({ onBack }) => {
  const {
    medications,
    getTodayMedications,
    getUpcomingDoses,
    checkInteractions,
    adherenceStats,
    reminderConfig,
    updateReminderConfig
  } = useMedication();

  const [view, setView] = useState<'today' | 'all' | 'history'>('today');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // New State

  const todayMeds = getTodayMedications();
  const upcoming = getUpcomingDoses(2); // Next 2 hours
  const interactions = checkInteractions();

  // Calculate overall adherence
  const overallAdherence = React.useMemo(() => {
    if (adherenceStats.size === 0) return 0;

    let total = 0;
    let count = 0;
    adherenceStats.forEach(stats => {
      total += stats.adherenceRate;
      count++;
    });

    return count > 0 ? Math.round(total / count) : 0;
  }, [adherenceStats]);

  // Count pending doses today
  const pendingDoses = React.useMemo(() => {
    let count = 0;
    todayMeds.forEach(med => {
      med.schedule.times.forEach(dose => {
        if (dose.status === 'pending') count++;
      });
    });
    return count;
  }, [todayMeds]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Today's Treatment</h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-blue-600">{todayMeds.length}</div>
              <div className="text-xs text-blue-700">Medications</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-600">{overallAdherence}%</div>
              <div className="text-xs text-green-700">Adherence</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-purple-600">{pendingDoses}</div>
              <div className="text-xs text-purple-700">Pending Today</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Interaction Warnings */}
        {interactions.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-2">Drug Interaction Alert</h3>
                {interactions.map((interaction, idx) => (
                  <div key={idx} className="mb-3 last:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full font-medium
                        ${interaction.severity === 'SEVERE' ? 'bg-red-200 text-red-800' : ''}
                        ${interaction.severity === 'MODERATE' ? 'bg-orange-200 text-orange-800' : ''}
                        ${interaction.severity === 'MILD' ? 'bg-yellow-200 text-yellow-800' : ''}
                      `}>
                        {interaction.severity}
                      </span>
                      <span className="text-sm font-semibold text-red-900">
                        {interaction.medication1} + {interaction.medication2}
                      </span>
                    </div>
                    <p className="text-sm text-red-700 mb-1">{interaction.description}</p>
                    <p className="text-xs text-red-600 italic">→ {interaction.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Doses */}
        {upcoming.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-purple-500" />
              <h2 className="font-bold text-gray-900">Coming Up (Next 2 Hours)</h2>
            </div>
            <div className="space-y-2">
              {upcoming.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-700">{item.time}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{item.medication.name}</div>
                      <div className="text-sm text-gray-600">{item.medication.dosage}</div>
                    </div>
                  </div>
                  <Bell className="w-5 h-5 text-purple-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-1 flex gap-1">
          <button
            onClick={() => setView('today')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${view === 'today'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Today
          </button>
          <button
            onClick={() => setView('all')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${view === 'all'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            All Medications
          </button>
          <button
            onClick={() => setView('history')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${view === 'history'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            History
          </button>
        </div>

        {/* Main Content */}
        {view === 'today' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <MedicationTimeline />
          </div>
        )}

        {view === 'all' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4">All Medications</h2>
            <div className="space-y-3">
              {medications.map(med => (
                <div key={med.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{med.name}</h3>
                      <p className="text-sm text-gray-600">{med.purpose}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {med.schedule.frequency}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${med.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {med.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {adherenceStats.get(med.id) && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {adherenceStats.get(med.id)!.adherenceRate}%
                        </div>
                        <div className="text-xs text-gray-500">Adherence</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Medication History
            </h2>
            <p className="text-gray-600 text-center py-8">
              History view coming soon...
            </p>
          </div>
        )}

      </div>

      {/* Add Medication Button - Moved out of Header */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-50 pointer-events-auto"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Medication Modal */}
      {showAddModal && (
        <AddMedicationModal onClose={() => setShowAddModal(false)} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Reminder Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Enable Reminders</span>
                <input
                  type="checkbox"
                  checked={reminderConfig.enabled}
                  onChange={(e) => updateReminderConfig({ enabled: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Sound</span>
                <input
                  type="checkbox"
                  checked={reminderConfig.soundEnabled}
                  onChange={(e) => updateReminderConfig({ soundEnabled: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Vibration</span>
                <input
                  type="checkbox"
                  checked={reminderConfig.vibrationEnabled}
                  onChange={(e) => updateReminderConfig({ vibrationEnabled: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700 block mb-2">
                  Remind me (minutes before):
                </label>
                <select
                  value={reminderConfig.advanceNotice}
                  onChange={(e) => updateReminderConfig({ advanceNotice: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value={0}>At dose time</option>
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Persistent alerts for critical meds</span>
                <input
                  type="checkbox"
                  checked={reminderConfig.persistentForCritical}
                  onChange={(e) => updateReminderConfig({ persistentForCritical: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
