/**
 * Booking Confirmation Component
 *
 * Shows combined summary of intake results and appointment details
 * before final confirmation.
 */

import React from 'react';
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  MapPin,
  Phone,
  Video,
  Activity,
  ChevronLeft,
  Edit2
} from 'lucide-react';
import { EncounterIntake } from '../src/intake/models/EncounterIntake';
import { AppointmentUrgencyContext } from '../utils/triageMapper';
import { Language } from '../types';

interface BookingConfirmationProps {
  language: Language;
  encounter: EncounterIntake;
  appointment: {
    doctorId: string;
    doctorName: string;
    specialty?: string;
    slot: { start: Date; end: Date };
    type: 'in-person' | 'video' | 'phone';
    confirmedAt: Date;
  };
  urgencyContext: AppointmentUrgencyContext;
  onConfirm: () => void;
  onEditAppointment: () => void;
  onEditIntake: () => void;
}

const LABELS = {
  en: {
    title: 'Confirm Your Booking',
    subtitle: 'Please review your information before confirming',
    intakeSection: 'Medical Information',
    appointmentSection: 'Appointment Details',
    chiefComplaint: 'Chief Complaint',
    severity: 'Severity',
    urgency: 'Urgency Level',
    doctor: 'Doctor',
    specialty: 'Specialty',
    dateTime: 'Date & Time',
    consultationType: 'Consultation Type',
    inPerson: 'In-Person Visit',
    videoCall: 'Video Call',
    phoneCall: 'Phone Call',
    waitTime: 'Expected Wait Time',
    redFlags: 'Important Alerts',
    edit: 'Edit',
    confirm: 'Confirm Booking',
    back: 'Back',
    emergency: 'Emergency',
    urgent: 'Urgent',
    semiUrgent: 'Semi-Urgent',
    routine: 'Routine',
    painLocations: 'Pain Locations',
    noComplaint: 'General consultation'
  },
  ur: {
    title: 'اپنی بکنگ کی تصدیق کریں',
    subtitle: 'تصدیق سے پہلے اپنی معلومات کا جائزہ لیں',
    intakeSection: 'طبی معلومات',
    appointmentSection: 'اپائنٹمنٹ کی تفصیلات',
    chiefComplaint: 'بنیادی شکایت',
    severity: 'شدت',
    urgency: 'فوری سطح',
    doctor: 'ڈاکٹر',
    specialty: 'ماہر',
    dateTime: 'تاریخ اور وقت',
    consultationType: 'مشاورت کی قسم',
    inPerson: 'ذاتی ملاقات',
    videoCall: 'ویڈیو کال',
    phoneCall: 'فون کال',
    waitTime: 'متوقع انتظار کا وقت',
    redFlags: 'اہم انتباہات',
    edit: 'ترمیم',
    confirm: 'بکنگ کی تصدیق',
    back: 'واپس',
    emergency: 'ایمرجنسی',
    urgent: 'فوری',
    semiUrgent: 'نیم فوری',
    routine: 'معمول',
    painLocations: 'درد کے مقامات',
    noComplaint: 'عمومی مشاورت'
  }
};

const URGENCY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  emergency: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
  urgent: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500' },
  'semi-urgent': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
  routine: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' }
};

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  language,
  encounter,
  appointment,
  urgencyContext,
  onConfirm,
  onEditAppointment,
  onEditIntake
}) => {
  const labels = LABELS[language];
  const urgencyStyle = URGENCY_STYLES[urgencyContext.urgencyLevel] || URGENCY_STYLES.routine;

  const getUrgencyLabel = () => {
    const urgencyLabels: Record<string, string> = {
      emergency: labels.emergency,
      urgent: labels.urgent,
      'semi-urgent': labels.semiUrgent,
      routine: labels.routine
    };
    return urgencyLabels[urgencyContext.urgencyLevel] || labels.routine;
  };

  const getConsultationTypeIcon = () => {
    switch (appointment.type) {
      case 'video':
        return <Video size={20} className="text-blue-600" />;
      case 'phone':
        return <Phone size={20} className="text-green-600" />;
      default:
        return <User size={20} className="text-purple-600" />;
    }
  };

  const getConsultationTypeLabel = () => {
    switch (appointment.type) {
      case 'video':
        return labels.videoCall;
      case 'phone':
        return labels.phoneCall;
      default:
        return labels.inPerson;
    }
  };

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString(language === 'ur' ? 'ur-PK' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const dateTime = formatDateTime(appointment.slot.start);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{labels.title}</h1>
        <p className="text-slate-600">{labels.subtitle}</p>
      </div>

      {/* Urgency Badge */}
      <div className={`mb-6 p-4 rounded-xl border-2 ${urgencyStyle.bg} ${urgencyStyle.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className={urgencyStyle.text} size={24} />
            <div>
              <p className="text-sm text-slate-600">{labels.urgency}</p>
              <p className={`font-bold text-lg ${urgencyStyle.text}`}>{getUrgencyLabel()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">{labels.waitTime}</p>
            <p className="font-medium text-slate-800">
              {language === 'ur' ? urgencyContext.waitTimeRecommendationUr : urgencyContext.waitTimeRecommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Red Flag Warnings */}
      {urgencyContext.redFlagWarnings.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-red-800 mb-2">{labels.redFlags}</p>
              <ul className="space-y-1">
                {urgencyContext.redFlagWarnings.map((warning, i) => (
                  <li key={i} className="text-sm text-red-700">- {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Medical Information Card */}
      <div className="bg-white rounded-xl border-2 border-slate-200 mb-4 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-700">{labels.intakeSection}</h3>
          <button
            onClick={onEditIntake}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Edit2 size={14} />
            {labels.edit}
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Chief Complaint */}
          <div>
            <p className="text-sm text-slate-500 mb-1">{labels.chiefComplaint}</p>
            <p className="font-medium text-slate-800">
              {encounter.chiefComplaint || encounter.complaintText || labels.noComplaint}
            </p>
          </div>

          {/* Pain Locations */}
          {encounter.painPoints && encounter.painPoints.length > 0 && (
            <div>
              <p className="text-sm text-slate-500 mb-2">{labels.painLocations}</p>
              <div className="flex flex-wrap gap-2">
                {encounter.painPoints.map((point, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-200"
                  >
                    {point.zoneId} ({point.intensity}/10)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Severity */}
          {encounter.currentSymptoms?.severity > 0 && (
            <div>
              <p className="text-sm text-slate-500 mb-1">{labels.severity}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${encounter.currentSymptoms.severity >= 7 ? 'bg-red-500' :
                        encounter.currentSymptoms.severity >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${encounter.currentSymptoms.severity * 10}%` }}
                  />
                </div>
                <span className="font-bold text-slate-700">{encounter.currentSymptoms.severity}/10</span>
              </div>
            </div>
          )}

          {/* Recommended Specialty */}
          <div>
            <p className="text-sm text-slate-500 mb-1">{labels.specialty}</p>
            <p className="font-medium text-blue-700">
              {language === 'ur' ? urgencyContext.recommendedSpecialtyUr : urgencyContext.recommendedSpecialty}
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Details Card */}
      <div className="bg-white rounded-xl border-2 border-slate-200 mb-8 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-700">{labels.appointmentSection}</h3>
          <button
            onClick={onEditAppointment}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Edit2 size={14} />
            {labels.edit}
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Doctor */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{labels.doctor}</p>
              <p className="font-bold text-slate-800">{appointment.doctorName}</p>
              {appointment.specialty && (
                <p className="text-sm text-blue-600">{appointment.specialty}</p>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{labels.dateTime}</p>
              <p className="font-medium text-slate-800">{dateTime.date}</p>
              <p className="text-slate-600 flex items-center gap-1">
                <Clock size={14} />
                {dateTime.time}
              </p>
            </div>
          </div>

          {/* Consultation Type */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              {getConsultationTypeIcon()}
            </div>
            <div>
              <p className="text-sm text-slate-500">{labels.consultationType}</p>
              <p className="font-medium text-slate-800">{getConsultationTypeLabel()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onEditAppointment}
          className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          {labels.back}
        </button>

        <button
          onClick={onConfirm}
          className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          {labels.confirm}
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
