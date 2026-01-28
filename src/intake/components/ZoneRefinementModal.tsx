import React from 'react';
import { ZoneRefinement, ZoneRefinementOption } from '../logic/zoneResolver';

interface ZoneRefinementModalProps {
    refinement: ZoneRefinement;
    onSelect: (zoneId: string) => void;
    onCancel: () => void;
    language?: 'en' | 'ur';
}

/**
 * Modal for refining broad body zone selections
 * Shows clickable options for specific sub-zones
 */
export const ZoneRefinementModal: React.FC<ZoneRefinementModalProps> = ({
    refinement,
    onSelect,
    onCancel,
    language = 'en'
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                            {language === 'en' ? 'Specify Location' : 'مقام کی تفصیل'}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                            aria-label={language === 'en' ? 'Close' : 'بند کریں'}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm mt-1 opacity-90">
                        {refinement.message}
                    </p>
                </div>

                {/* Options Grid */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {refinement.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => onSelect(option.id)}
                                className="group relative bg-gradient-to-br from-slate-50 to-slate-100 hover:from-primary-50 hover:to-primary-100 border-2 border-slate-200 hover:border-primary-400 rounded-2xl p-4 transition-all duration-200 text-left shadow-sm hover:shadow-md active:scale-95"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    {option.icon && (
                                        <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                            {option.icon}
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-800 group-hover:text-primary-700 leading-snug">
                                            {option.label}
                                        </div>
                                        {option.clinical && (
                                            <div className="text-xs text-slate-500 mt-1 italic">
                                                {option.clinical}
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrow indicator */}
                                    <div className="flex-shrink-0 text-slate-400 group-hover:text-primary-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
                    <button
                        onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-2 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium"
                    >
                        {language === 'en' ? 'Go Back' : 'واپس جائیں'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ZoneRefinementModal;
