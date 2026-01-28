import React from 'react';
import { SOAPNote } from '../types';

interface Props {
    aiSoap: SOAPNote;
    doctorSoap: SOAPNote;
    onChangeSoap: (newSoap: SOAPNote) => void;
    doctorNotes: string;
    onChangeNotes: (notes: string) => void;
    finalDiagnosis: string;
    onChangeDiagnosis: (diagnosis: string) => void;
    assessmentConfirmation: boolean;
    onToggleConfirmation: (confirmed: boolean) => void;
}

export function SoapEditor({
    aiSoap,
    doctorSoap,
    onChangeSoap,
    doctorNotes,
    onChangeNotes,
    finalDiagnosis,
    onChangeDiagnosis,
    assessmentConfirmation,
    onToggleConfirmation
}: Props) {
    const fields: (keyof SOAPNote)[] = ['subjective', 'objective', 'assessment', 'plan'];

    const handleFieldChange = (field: keyof SOAPNote, value: string) => {
        onChangeSoap({
            ...doctorSoap,
            [field]: value
        });
    };

    return (
        <div className="space-y-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 gap-8">
                {fields.map((field) => (
                    <div key={field} className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                {field}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400">Section: {field.charAt(0).toUpperCase()}</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* AI Suggestion (Read Only) */}
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm opacity-60">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Suggestion</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                                    {aiSoap[field] || 'No suggestion...'}
                                </p>
                            </div>

                            {/* Doctor Override */}
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900 shadow-sm">
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Physician Review</p>
                                <textarea
                                    value={doctorSoap[field]}
                                    onChange={(e) => handleFieldChange(field, e.target.value)}
                                    placeholder={`Edit ${field}...`}
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-800 dark:text-slate-100 min-h-[100px] resize-none"
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {/* New sections for Clinical Ownership */}
                <div className="pt-6 border-t dark:border-slate-800 space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600">Final Diagnosis</h3>
                        <input
                            type="text"
                            value={finalDiagnosis}
                            onChange={(e) => onChangeDiagnosis(e.target.value)}
                            placeholder="Enter final clinical diagnosis..."
                            className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-emerald-100 dark:border-emerald-900 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600">Doctor Notes (Clinical Observations)</h3>
                        <textarea
                            value={doctorNotes}
                            onChange={(e) => onChangeNotes(e.target.value)}
                            placeholder="Detailed clinical findings..."
                            className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900 rounded-2xl text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                        />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                        <input
                            type="checkbox"
                            checked={assessmentConfirmation}
                            onChange={(e) => onToggleConfirmation(e.target.checked)}
                            className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500 border-indigo-200 cursor-pointer"
                            id="assessment-confirm"
                        />
                        <label htmlFor="assessment-confirm" className="text-sm font-bold text-indigo-900 dark:text-indigo-100 cursor-pointer">
                            I clinically confirm this assessment and take legal ownership of the diagnostic notes.
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
