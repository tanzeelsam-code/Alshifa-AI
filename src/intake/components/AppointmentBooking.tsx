/**
 * Appointment Booking Component
 * Phase 10: Doctor availability and appointment scheduling
 */

import React, { useState } from 'react';
import { Calendar, Video, Phone, User, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    photoUrl?: string;
    rating?: number;
    availableSlots: TimeSlot[];
}

interface TimeSlot {
    start: Date;
    end: Date;
    type: 'in-person' | 'video' | 'phone';
}

interface AppointmentBookingProps {
    language: 'en' | 'ur';
    urgencyLevel?: 'emergency' | 'urgent' | 'semi-urgent' | 'routine';
    recommendedSpecialty?: string;
    onComplete: (appointment: any) => void;
    onBack?: () => void;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
    language,
    urgencyLevel = 'routine',
    recommendedSpecialty,
    onComplete,
    onBack
}) => {
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedType, setSelectedType] = useState<'in-person' | 'video' | 'phone'>('in-person');

    // Mock doctors data (replace with API call)
    const mockDoctors: Doctor[] = [
        {
            id: '1',
            name: 'Dr. Ahmed Khan',
            specialty: 'General Medicine',
            rating: 4.8,
            availableSlots: [
                { start: new Date(2026, 0, 16, 10, 0), end: new Date(2026, 0, 16, 10, 30), type: 'in-person' },
                { start: new Date(2026, 0, 16, 14, 0), end: new Date(2026, 0, 16, 14, 30), type: 'video' },
            ]
        },
        {
            id: '2',
            name: 'Dr. Sara Ali',
            specialty: 'Internal Medicine',
            rating: 4.9,
            availableSlots: [
                { start: new Date(2026, 0, 16, 11, 0), end: new Date(2026, 0, 16, 11, 30), type: 'in-person' },
                { start: new Date(2026, 0, 16, 15, 0), end: new Date(2026, 0, 16, 15, 30), type: 'video' },
            ]
        }
    ];

    const handleConfirm = () => {
        if (!selectedDoctor || !selectedSlot) return;

        const appointment = {
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            slot: selectedSlot,
            type: selectedType,
            confirmedAt: new Date()
        };

        onComplete(appointment);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {language === 'ur' ? 'اپائنٹمنٹ بک کریں' : 'Book Appointment'}
                </h1>
                <p className="text-slate-600">
                    {language === 'ur'
                        ? recommendedSpecialty ? `تجویز کردہ: ${recommendedSpecialty}` : 'ڈاکٹر منتخب کریں'
                        : recommendedSpecialty ? `Recommended: ${recommendedSpecialty}` : 'Select a doctor'
                    }
                </p>
            </div>

            {/* Urgency Banner */}
            {urgencyLevel && urgencyLevel !== 'routine' && (
                <div className={`mb-6 p-4 rounded-xl ${urgencyLevel === 'emergency' ? 'bg-red-100 border-2 border-red-500' :
                    urgencyLevel === 'urgent' ? 'bg-orange-100 border-2 border-orange-500' :
                        'bg-yellow-100 border-2 border-yellow-500'
                    }`}>
                    <p className="font-semibold">
                        {language === 'ur' ? 'فوری طبی امداد کی ضرورت' : 'Priority Appointment Needed'}
                    </p>
                    <p className="text-sm">
                        {urgencyLevel === 'emergency' && (language === 'ur' ? 'فوری طور پر ڈاکٹر سے ملیں' : 'See a doctor immediately')}
                        {urgencyLevel === 'urgent' && (language === 'ur' ? '4-6 گھنٹوں کے اندر' : 'Within 4-6 hours')}
                        {urgencyLevel === 'semi-urgent' && (language === 'ur' ? '24-48 گھنٹوں کے اندر' : 'Within 24-48 hours')}
                    </p>
                </div>
            )}

            {/* Appointment Type Selection */}
            <div className="mb-6">
                <h3 className="font-semibold mb-3">
                    {language === 'ur' ? 'اپائنٹمنٹ کی قسم' : 'Appointment Type'}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => setSelectedType('in-person')}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedType === 'in-person'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                            }`}
                    >
                        <User className="mx-auto mb-2" size={24} />
                        <p className="text-sm font-medium">
                            {language === 'ur' ? 'حاضری' : 'In-Person'}
                        </p>
                    </button>
                    <button
                        onClick={() => setSelectedType('video')}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedType === 'video'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                            }`}
                    >
                        <Video className="mx-auto mb-2" size={24} />
                        <p className="text-sm font-medium">
                            {language === 'ur' ? 'ویڈیو' : 'Video Call'}
                        </p>
                    </button>
                    <button
                        onClick={() => setSelectedType('phone')}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedType === 'phone'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                            }`}
                    >
                        <Phone className="mx-auto mb-2" size={24} />
                        <p className="text-sm font-medium">
                            {language === 'ur' ? 'فون' : 'Phone'}
                        </p>
                    </button>
                </div>
            </div>

            {/* Doctor Selection */}
            <div className="mb-6">
                <h3 className="font-semibold mb-3">
                    {language === 'ur' ? 'ڈاکٹر منتخب کریں' : 'Select Doctor'}
                </h3>
                <div className="grid gap-4">
                    {mockDoctors.map(doctor => (
                        <Card
                            key={doctor.id}
                            variant={selectedDoctor?.id === doctor.id ? 'bordered' : 'default'}
                            hoverable
                            onClick={() => setSelectedDoctor(doctor)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                                        <User size={32} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">{doctor.name}</h4>
                                        <p className="text-slate-600">{doctor.specialty}</p>
                                        <p className="text-sm text-yellow-600">⭐ {doctor.rating}/5.0</p>
                                    </div>
                                </div>
                                {selectedDoctor?.id === doctor.id && (
                                    <CheckCircle className="text-blue-600" size={32} />
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Time Slot Selection */}
            {selectedDoctor && (
                <div className="mb-6">
                    <h3 className="font-semibold mb-3">
                        {language === 'ur' ? 'وقت منتخب کریں' : 'Select Time'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedDoctor.availableSlots.filter(s => s.type === selectedType).map((slot, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-4 rounded-xl border-2 transition-all ${selectedSlot === slot
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-slate-200 hover:border-blue-300'
                                    }`}
                            >
                                <Clock className="mx-auto mb-2" size={20} />
                                <p className="font-medium">{slot.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                <p className="text-xs text-slate-600">
                                    {slot.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-8">
                {onBack && (
                    <Button variant="ghost" onClick={onBack}>
                        {language === 'ur' ? 'واپس' : 'Back'}
                    </Button>
                )}

                <Button
                    variant="primary"
                    size="lg"
                    disabled={!selectedDoctor || !selectedSlot}
                    onClick={handleConfirm}
                >
                    {language === 'ur' ? 'تصدیق کریں' : 'Confirm Appointment'}
                </Button>
            </div>
        </div>
    );
};
