/**
 * Appointment Booking Component
 * Books appointments after medical intake with urgency-aware scheduling
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Video, Phone, User, Clock, CheckCircle, AlertTriangle, ChevronLeft } from 'lucide-react';
import { DoctorProfile, Language } from '../../../types';

interface TimeSlot {
    start: Date;
    end: Date;
    type: 'in-person' | 'video' | 'phone';
}

interface InternalDoctor {
    id: string;
    name: string;
    specialty: string;
    rating?: number;
    availableSlots: TimeSlot[];
}

interface AppointmentBookingProps {
    language: Language;
    urgencyLevel?: 'emergency' | 'urgent' | 'semi-urgent' | 'routine';
    recommendedSpecialty?: string;
    waitTimeRecommendation?: string;
    allDoctors?: DoctorProfile[];
    onComplete: (appointment: {
        doctorId: string;
        doctorName: string;
        specialty: string;
        slot: TimeSlot;
        type: 'in-person' | 'video' | 'phone';
        confirmedAt: Date;
    }) => void;
    onBack?: () => void;
}

const LABELS = {
    en: {
        title: 'Book Appointment',
        recommended: 'Recommended',
        selectDoctor: 'Select a doctor',
        priorityNeeded: 'Priority Appointment Needed',
        seeImmediately: 'See a doctor immediately',
        within4to6: 'Within 4-6 hours',
        within24to48: 'Within 24-48 hours',
        appointmentType: 'Appointment Type',
        inPerson: 'In-Person',
        videoCall: 'Video Call',
        phoneCall: 'Phone',
        selectDoctorTitle: 'Select Doctor',
        selectTime: 'Select Time',
        noSlots: 'No slots available for this type',
        back: 'Back',
        confirm: 'Confirm Appointment',
        emergencyWarning: 'Your symptoms indicate an emergency. If you feel this is life-threatening, please call 1122 immediately.',
        allDoctors: 'All Doctors',
        matchingSpecialty: 'Matching Specialty'
    },
    ur: {
        title: 'اپائنٹمنٹ بک کریں',
        recommended: 'تجویز کردہ',
        selectDoctor: 'ڈاکٹر منتخب کریں',
        priorityNeeded: 'فوری طبی امداد کی ضرورت',
        seeImmediately: 'فوری طور پر ڈاکٹر سے ملیں',
        within4to6: '4-6 گھنٹوں کے اندر',
        within24to48: '24-48 گھنٹوں کے اندر',
        appointmentType: 'اپائنٹمنٹ کی قسم',
        inPerson: 'حاضری',
        videoCall: 'ویڈیو',
        phoneCall: 'فون',
        selectDoctorTitle: 'ڈاکٹر منتخب کریں',
        selectTime: 'وقت منتخب کریں',
        noSlots: 'اس قسم کے لیے کوئی سلاٹ دستیاب نہیں',
        back: 'واپس',
        confirm: 'تصدیق کریں',
        emergencyWarning: 'آپ کی علامات ایمرجنسی کی نشاندہی کرتی ہیں۔ اگر یہ جان لیوا ہے تو فوری طور پر 1122 پر کال کریں۔',
        allDoctors: 'تمام ڈاکٹرز',
        matchingSpecialty: 'متعلقہ ماہر'
    }
};

// Generate dynamic time slots for the next 7 days
function generateTimeSlots(urgencyLevel: string): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const types: Array<'in-person' | 'video' | 'phone'> = ['in-person', 'video', 'phone'];

    // For emergency/urgent, start from today with earlier slots
    const startDay = urgencyLevel === 'emergency' || urgencyLevel === 'urgent' ? 0 : 1;
    const daysToGenerate = urgencyLevel === 'emergency' ? 2 : urgencyLevel === 'urgent' ? 3 : 7;

    for (let dayOffset = startDay; dayOffset < startDay + daysToGenerate; dayOffset++) {
        const date = new Date(now);
        date.setDate(date.getDate() + dayOffset);

        // Generate slots from 9 AM to 5 PM
        const startHour = dayOffset === 0 ? Math.max(9, now.getHours() + 1) : 9;

        for (let hour = startHour; hour < 17; hour += 2) {
            types.forEach(type => {
                const start = new Date(date);
                start.setHours(hour, 0, 0, 0);
                const end = new Date(start);
                end.setMinutes(30);

                slots.push({ start, end, type });
            });
        }
    }

    return slots;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
    language,
    urgencyLevel = 'routine',
    recommendedSpecialty,
    waitTimeRecommendation,
    allDoctors,
    onComplete,
    onBack
}) => {
    const labels = LABELS[language];
    const [selectedDoctor, setSelectedDoctor] = useState<InternalDoctor | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedType, setSelectedType] = useState<'in-person' | 'video' | 'phone'>('in-person');

    // Convert DoctorProfile to internal format and add time slots
    const doctors: InternalDoctor[] = useMemo(() => {
        const timeSlots = generateTimeSlots(urgencyLevel);

        if (allDoctors && allDoctors.length > 0) {
            return allDoctors.map(doc => ({
                id: doc.id,
                name: doc.name[language] || doc.name['en'],
                specialty: doc.specialization[language] || doc.specialization['en'],
                rating: 4.5 + Math.random() * 0.5, // Simulated rating
                availableSlots: timeSlots
            }));
        }

        // Fallback mock doctors
        return [
            {
                id: 'doc_1',
                name: language === 'ur' ? 'ڈاکٹر احمد خان' : 'Dr. Ahmed Khan',
                specialty: language === 'ur' ? 'جنرل میڈیسن' : 'General Medicine',
                rating: 4.8,
                availableSlots: timeSlots
            },
            {
                id: 'doc_2',
                name: language === 'ur' ? 'ڈاکٹر سارہ علی' : 'Dr. Sara Ali',
                specialty: language === 'ur' ? 'داخلی امراض' : 'Internal Medicine',
                rating: 4.9,
                availableSlots: timeSlots
            },
            {
                id: 'doc_3',
                name: language === 'ur' ? 'ڈاکٹر عمر فاروق' : 'Dr. Umar Farooq',
                specialty: language === 'ur' ? 'امراض قلب' : 'Cardiology',
                rating: 4.7,
                availableSlots: timeSlots
            },
            {
                id: 'doc_4',
                name: language === 'ur' ? 'ڈاکٹر فاطمہ حسن' : 'Dr. Fatima Hassan',
                specialty: language === 'ur' ? 'اعصابی امراض' : 'Neurology',
                rating: 4.6,
                availableSlots: timeSlots
            }
        ];
    }, [allDoctors, language, urgencyLevel]);

    // Filter and sort doctors by specialty match
    const { matchingDoctors, otherDoctors } = useMemo(() => {
        if (!recommendedSpecialty) {
            return { matchingDoctors: [], otherDoctors: doctors };
        }

        const specialtyLower = recommendedSpecialty.toLowerCase();
        const matching: InternalDoctor[] = [];
        const others: InternalDoctor[] = [];

        doctors.forEach(doc => {
            const docSpecialty = doc.specialty.toLowerCase();
            if (docSpecialty.includes(specialtyLower) ||
                specialtyLower.includes(docSpecialty) ||
                docSpecialty.includes('general')) {
                matching.push(doc);
            } else {
                others.push(doc);
            }
        });

        return { matchingDoctors: matching, otherDoctors: others };
    }, [doctors, recommendedSpecialty]);

    const handleConfirm = () => {
        if (!selectedDoctor || !selectedSlot) return;

        onComplete({
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            specialty: selectedDoctor.specialty,
            slot: selectedSlot,
            type: selectedType,
            confirmedAt: new Date()
        });
    };

    const getUrgencyMessage = () => {
        switch (urgencyLevel) {
            case 'emergency':
                return labels.seeImmediately;
            case 'urgent':
                return labels.within4to6;
            case 'semi-urgent':
                return labels.within24to48;
            default:
                return '';
        }
    };

    const availableSlots = selectedDoctor?.availableSlots.filter(s => s.type === selectedType) || [];

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{labels.title}</h1>
                <p className="text-slate-600">
                    {recommendedSpecialty
                        ? `${labels.recommended}: ${recommendedSpecialty}`
                        : labels.selectDoctor}
                </p>
            </div>

            {/* Emergency Warning */}
            {urgencyLevel === 'emergency' && (
                <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={24} />
                        <div>
                            <p className="font-bold text-red-800">{labels.emergencyWarning}</p>
                            <a
                                href="tel:1122"
                                className="inline-block mt-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                            >
                                {language === 'ur' ? '1122 کال کریں' : 'Call 1122'}
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Urgency Banner */}
            {urgencyLevel && urgencyLevel !== 'routine' && urgencyLevel !== 'emergency' && (
                <div className={`mb-6 p-4 rounded-xl ${urgencyLevel === 'urgent'
                        ? 'bg-orange-100 border-2 border-orange-500'
                        : 'bg-yellow-100 border-2 border-yellow-500'
                    }`}>
                    <p className="font-semibold">{labels.priorityNeeded}</p>
                    <p className="text-sm">{getUrgencyMessage()}</p>
                    {waitTimeRecommendation && (
                        <p className="text-sm mt-1 font-medium">{waitTimeRecommendation}</p>
                    )}
                </div>
            )}

            {/* Appointment Type Selection */}
            <div className="mb-6">
                <h3 className="font-semibold mb-3">{labels.appointmentType}</h3>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => { setSelectedType('in-person'); setSelectedSlot(null); }}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedType === 'in-person'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-blue-300'
                            }`}
                    >
                        <User className="mx-auto mb-2" size={24} />
                        <p className="text-sm font-medium">{labels.inPerson}</p>
                    </button>
                    <button
                        onClick={() => { setSelectedType('video'); setSelectedSlot(null); }}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedType === 'video'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-blue-300'
                            }`}
                    >
                        <Video className="mx-auto mb-2" size={24} />
                        <p className="text-sm font-medium">{labels.videoCall}</p>
                    </button>
                    <button
                        onClick={() => { setSelectedType('phone'); setSelectedSlot(null); }}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedType === 'phone'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-blue-300'
                            }`}
                    >
                        <Phone className="mx-auto mb-2" size={24} />
                        <p className="text-sm font-medium">{labels.phoneCall}</p>
                    </button>
                </div>
            </div>

            {/* Doctor Selection */}
            <div className="mb-6">
                <h3 className="font-semibold mb-3">{labels.selectDoctorTitle}</h3>

                {/* Matching Specialty Doctors */}
                {matchingDoctors.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm text-blue-600 font-medium mb-2 flex items-center gap-1">
                            <CheckCircle size={14} />
                            {labels.matchingSpecialty}
                        </p>
                        <div className="grid gap-3">
                            {matchingDoctors.map(doctor => (
                                <button
                                    key={doctor.id}
                                    onClick={() => { setSelectedDoctor(doctor); setSelectedSlot(null); }}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${selectedDoctor?.id === doctor.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-blue-300 bg-white'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User size={28} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg">{doctor.name}</h4>
                                                <p className="text-slate-600">{doctor.specialty}</p>
                                                <p className="text-sm text-yellow-600">
                                                    {'★'.repeat(Math.floor(doctor.rating || 4))} {doctor.rating?.toFixed(1)}/5.0
                                                </p>
                                            </div>
                                        </div>
                                        {selectedDoctor?.id === doctor.id && (
                                            <CheckCircle className="text-blue-600" size={28} />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other Doctors */}
                {otherDoctors.length > 0 && (
                    <div>
                        {matchingDoctors.length > 0 && (
                            <p className="text-sm text-slate-500 font-medium mb-2">{labels.allDoctors}</p>
                        )}
                        <div className="grid gap-3">
                            {otherDoctors.map(doctor => (
                                <button
                                    key={doctor.id}
                                    onClick={() => { setSelectedDoctor(doctor); setSelectedSlot(null); }}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${selectedDoctor?.id === doctor.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-blue-300 bg-white'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                                                <User size={28} className="text-slate-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg">{doctor.name}</h4>
                                                <p className="text-slate-600">{doctor.specialty}</p>
                                                <p className="text-sm text-yellow-600">
                                                    {'★'.repeat(Math.floor(doctor.rating || 4))} {doctor.rating?.toFixed(1)}/5.0
                                                </p>
                                            </div>
                                        </div>
                                        {selectedDoctor?.id === doctor.id && (
                                            <CheckCircle className="text-blue-600" size={28} />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Time Slot Selection */}
            {selectedDoctor && (
                <div className="mb-6">
                    <h3 className="font-semibold mb-3">{labels.selectTime}</h3>
                    {availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                            {availableSlots.slice(0, 16).map((slot, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`p-3 rounded-xl border-2 transition-all ${selectedSlot === slot
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-blue-300'
                                        }`}
                                >
                                    <Clock className="mx-auto mb-1" size={18} />
                                    <p className="font-medium text-sm">
                                        {slot.start.toLocaleTimeString(language === 'ur' ? 'ur-PK' : 'en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        {slot.start.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">{labels.noSlots}</p>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <ChevronLeft size={20} />
                        {labels.back}
                    </button>
                )}

                <button
                    disabled={!selectedDoctor || !selectedSlot}
                    onClick={handleConfirm}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${selectedDoctor && selectedSlot
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    <CheckCircle size={20} />
                    {labels.confirm}
                </button>
            </div>
        </div>
    );
};

export default AppointmentBooking;
