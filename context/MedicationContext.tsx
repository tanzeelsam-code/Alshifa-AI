import React, { createContext, useContext, useState } from 'react';
import { Medication } from '../types';

interface MedicationContextType {
    medications: Medication[];
    addMedication: (med: Medication) => void;
    updateMedication: (med: Medication) => void;
    removeMedication: (id: string) => void;
}

const MedicationContext = createContext<MedicationContextType | null>(null);

export const MedicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [medications, setMedications] = useState<Medication[]>([]);

    const addMedication = (med: Medication) => {
        setMedications(prev => [...prev, med]);
    };

    const updateMedication = (updated: Medication) => {
        setMedications(prev =>
            prev.map(m => (m.id === updated.id ? updated : m))
        );
    };

    const removeMedication = (id: string) => {
        setMedications(prev => prev.filter(m => m.id !== id));
    };

    return (
        <MedicationContext.Provider value={{ medications, addMedication, updateMedication, removeMedication }}>
            {children}
        </MedicationContext.Provider>
    );
};

export const useMedications = () => {
    const ctx = useContext(MedicationContext);
    if (!ctx) throw new Error('useMedications must be used inside MedicationProvider');
    return ctx;
};
