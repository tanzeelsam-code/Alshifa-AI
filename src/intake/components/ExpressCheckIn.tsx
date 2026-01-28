import React, { useState } from 'react';
import { CheckCircle2, Edit3, AlertCircle, Clock, User, Pill } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface ExpressCheckInProps {
    patientAccount: any;
    language: 'en' | 'ur';
    onConfirm: () => void;
    onUpdate: () => void;
    onCancel: () => void;
}

export const ExpressCheckIn: React.FC<ExpressCheckInProps> = ({
    patientAccount,
    language,
    onConfirm,
    onUpdate,
    onCancel
}) => {
    const [confirmed, setConfirmed] = useState(false);

    const lastVisit = patientAccount.lastVisitDate
        ? new Date(patientAccount.lastVisitDate)
        : null;

    const daysSinceLastVisit = lastVisit
        ? Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    const isStale = daysSinceLastVisit && daysSinceLastVisit > 180; // 6 months

    const handleConfirm = () => {
        setConfirmed(true);
        setTimeout(() => {
            onConfirm();
        }, 800);
    };

    return (
        <Card variant="bordered" padding="lg" className="max-w-2xl mx-auto overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-center mb-10 pt-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full mb-6 border-8 border-white shadow-2xl shadow-green-100 ring-4 ring-green-100/50">
                    <CheckCircle2 className="text-green-600 w-12 h-12" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">
                    {language === 'ur' ? 'تیز چیک ان' : 'Express Check-in'}
                </h1>
                <p className="text-slate-500 font-bold text-lg max-w-sm mx-auto leading-tight">
                    {language === 'ur'
                        ? 'اپنی پہلے سے موجود معلومات کی تصدیق کریں'
                        : 'Review and confirm your medical profile baseline'
                    }
                </p>
            </div>

            {/* Stale Data Warning */}
            {isStale && (
                <div className="mb-10 p-6 bg-orange-50/50 border-2 border-orange-200 rounded-3xl flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                        <AlertCircle className="text-orange-600" size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-orange-900 text-sm uppercase tracking-widest mb-1">
                            {language === 'ur' ? 'معلومات کافی پرانی ہیں' : 'Historical Data Context'}
                        </h3>
                        <p className="text-sm text-orange-800/80 leading-relaxed font-medium">
                            {language === 'ur'
                                ? `آپ کا آخری دورہ ${daysSinceLastVisit} دن پہلے تھا۔ براہ کرم اپنی معلومات کا غور سے جائزہ لیں۔`
                                : `Your last session was ${daysSinceLastVisit} days ago. Ensure medications and allergies are still accurate.`
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* Content Summary */}
            <div className="space-y-6 mb-12">
                {/* Core Profile */}
                <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6">
                    <div className="flex items-center mb-6 pb-2 border-b border-slate-200/50">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mr-4">
                            <User className="text-blue-600" size={20} />
                        </div>
                        <h3 className="font-black text-slate-800 text-base uppercase tracking-widest">
                            {language === 'ur' ? 'بنیادی معلومات' : 'Core Profile'}
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                        {[
                            { label_en: 'Age', label_ur: 'عمر', val: patientAccount.quickBaseline?.demographics?.age, unit: '' },
                            { label_en: 'Sex', label_ur: 'جنس', val: patientAccount.quickBaseline?.demographics?.sex, unit: '' },
                            { label_en: 'Weight', label_ur: 'وزن', val: patientAccount.quickBaseline?.demographics?.weight, unit: 'KG' },
                            { label_en: 'Height', label_ur: 'قد', val: patientAccount.quickBaseline?.demographics?.height, unit: 'CM' }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                                    {language === 'ur' ? stat.label_ur : stat.label_en}
                                </span>
                                <span className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                                    {stat.val || 'N/A'}
                                    {stat.unit && <span className="text-[10px] text-slate-400">{stat.unit}</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Meds */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center mb-4 text-blue-600">
                            <Pill className="mr-3" size={20} />
                            <h3 className="font-black text-xs uppercase tracking-widest">
                                {language === 'ur' ? 'دوائیں' : 'Prescriptions'}
                            </h3>
                        </div>
                        <ul className="space-y-3">
                            {patientAccount.quickBaseline?.medications?.length > 0 ? (
                                patientAccount.quickBaseline.medications.map((m: any, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-800 text-sm">{m.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{m.dosage}</span>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-xs text-slate-400 italic font-medium">No active medications</li>
                            )}
                        </ul>
                    </div>

                    {/* Allergies */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center mb-4 text-red-600">
                            <AlertCircle className="mr-3" size={20} />
                            <h3 className="font-black text-xs uppercase tracking-widest">
                                {language === 'ur' ? 'الرجی' : 'Allergies'}
                            </h3>
                        </div>
                        <ul className="space-y-3">
                            {patientAccount.quickBaseline?.allergies?.length > 0 ? (
                                patientAccount.quickBaseline.allergies.map((a: any, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2"></div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-800 text-sm">{a.substance}</span>
                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{a.reaction}</span>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-xs text-slate-400 italic font-medium">No allergies reported</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
                <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    className={`py-8 text-2xl shadow-xl transition-all duration-500 ${confirmed ? 'bg-green-600 scale-95 shadow-green-100' : 'shadow-blue-100'}`}
                    onClick={handleConfirm}
                    disabled={confirmed}
                    loading={confirmed}
                >
                    <div className="flex items-center justify-center gap-4">
                        <CheckCircle2 size={28} />
                        <span className="font-black">
                            {confirmed
                                ? (language === 'ur' ? 'شکریہ، تصدیق ہو گئی!' : 'Verified & Saved')
                                : (language === 'ur' ? 'ہاں، سب کچھ درست ہے' : 'Yes, Correct')
                            }
                        </span>
                    </div>
                </Button>

                <div className="flex gap-4">
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={onUpdate}
                        className="py-6 border-slate-200 text-slate-700"
                        icon={<Edit3 size={18} />}
                    >
                        {language === 'ur' ? 'تبدیلی کریں' : 'Update Profile'}
                    </Button>
                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={onCancel}
                        className="py-6 text-slate-400 font-bold"
                    >
                        {language === 'ur' ? 'منسوخ' : 'Cancel'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};
