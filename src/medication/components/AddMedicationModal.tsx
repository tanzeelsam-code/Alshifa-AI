// src/medication/components/AddMedicationModal.tsx

import React, { useState } from 'react';
import { X, Save, Clock, AlertTriangle, Pill } from 'lucide-react';
import { useMedication } from '../context/MedicationContext';
import { MedicationHelper } from '../utils/MedicationHelper';

interface AddMedicationModalProps {
    onClose: () => void;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ onClose }) => {
    const { addMedication } = useMedication();

    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: 'ONCE', // ONCE, TWICE, THRICE, FOUR_TIMES, PRN
        purpose: '',
        priority: 'ROUTINE' as const,
        duration: 7,
        instructions: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Infer Schedule
            let timings: string[] = ['08:00'];
            if (formData.frequency === 'TWICE') timings = ['08:00', '20:00'];
            if (formData.frequency === 'THRICE') timings = ['08:00', '14:00', '20:00'];
            if (formData.frequency === 'FOUR_TIMES') timings = ['08:00', '12:00', '16:00', '20:00'];

            // Use Helper to construct the object
            const medObject = MedicationHelper.fromAIIntake({
                diagnosis: formData.purpose || 'Self-reported condition',
                symptoms: [],
                aiConfidence: 1.0,
                suggestedMedications: [{
                    name: formData.name,
                    dosage: formData.dosage,
                    frequency: formData.frequency,
                    duration: formData.duration,
                    instructions: [formData.instructions],
                    priority: formData.priority === 'CRITICAL' ? 'high' : formData.priority === 'IMPORTANT' ? 'medium' : 'low'
                }]
            })[0];

            // Override source to USER_ADDED
            const finalMed = {
                ...medObject,
                source: 'USER_ADDED' as const,
                priority: formData.priority,
                prescription: {
                    prescribedDate: new Date(),
                    prescribedBy: 'Self',
                    reviewedBy: 'User'
                }
            };

            await addMedication(finalMed);
            onClose();
        } catch (error) {
            console.error('Failed to add medication:', error);
            alert('Failed to save medication. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Pill className="text-blue-500" />
                            Add Medication
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 space-y-6">

                        {/* Name & Dosage */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Panadol"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 500mg"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.dosage}
                                    onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Purpose */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose / Condition</label>
                            <input
                                type="text"
                                placeholder="e.g. Headache"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.purpose}
                                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                            />
                        </div>

                        {/* Frequency & Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                    value={formData.frequency}
                                    onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                                >
                                    <option value="ONCE">Once Daily (1x)</option>
                                    <option value="TWICE">Twice Daily (2x)</option>
                                    <option value="THRICE">Three Times (3x)</option>
                                    <option value="FOUR_TIMES">Four Times (4x)</option>
                                    <option value="PRN">As Needed (PRN)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                >
                                    <option value="ROUTINE">Routine</option>
                                    <option value="IMPORTANT">Important</option>
                                    <option value="CRITICAL">Critical</option>
                                    <option value="PRN">As Needed</option>
                                </select>
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 7 })}
                            />
                        </div>

                        {/* Instructions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
                            <textarea
                                rows={3}
                                placeholder="e.g. Take after food..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.instructions}
                                onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                            />
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.name || !formData.dosage}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {isLoading ? 'Saving...' : 'Save Medication'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
