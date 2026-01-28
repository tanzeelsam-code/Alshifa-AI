import React from 'react';
import { StorageService } from '../src/services/StorageService';
import { RotateCcw } from 'lucide-react';

export const ResetDataButton: React.FC = () => {
    return (
        <button
            onClick={() => {
                if (window.confirm('This will clear all your clinical history and reset to defaults. Continue?')) {
                    StorageService.resetToDefaults();
                }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full text-xs font-bold transition-all border border-slate-700/50 hover:border-slate-600 backdrop-blur-sm shadow-lg group"
            title="Reset to Demo Defaults"
        >
            <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>Reset Demo Data</span>
        </button>
    );
};
