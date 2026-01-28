import React from 'react';
import { Visit } from '../types/MedicalRecord';

interface VisitTypeSelectorProps {
    patientName: string;
    lastVisit?: Visit;
    onSelectType: (type: 'NEW_PROBLEM' | 'FOLLOW_UP', linkedVisitId?: string) => void;
}

export const VisitTypeSelector: React.FC<VisitTypeSelectorProps> = ({
    patientName,
    lastVisit,
    onSelectType
}) => {

    return (
        <div style={{
            padding: '24px',
            maxWidth: '600px',
            margin: '0 auto',
            direction: 'rtl'
        }}>

            {/* Welcome message */}
            <h2 style={{
                fontSize: '24px',
                marginBottom: '8px',
                color: '#2C5F8D'
            }}>
                خوش آمدید، {patientName}
            </h2>

            <p style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '32px'
            }}>
                آج آپ کیوں آئے ہیں؟
            </p>

            {/* NEW PROBLEM button */}
            <button
                onClick={() => onSelectType('NEW_PROBLEM')}
                style={{
                    width: '100%',
                    padding: '20px',
                    marginBottom: '16px',
                    backgroundColor: '#17A2B8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'right',
                    display: 'block'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>🆕</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            نیا مسئلہ / نئی شکایت
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
                            نئی علامات یا نیا صحت کا مسئلہ
                        </div>
                    </div>
                </div>
            </button>

            {/* FOLLOW-UP button (only if last visit exists) */}
            {lastVisit && (
                <button
                    onClick={() => onSelectType('FOLLOW_UP', lastVisit.id)}
                    style={{
                        width: '100%',
                        padding: '20px',
                        backgroundColor: '#28A745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'right',
                        display: 'block'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>🔁</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                پچھلی شکایت کا فالو اپ
                            </div>
                            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
                                {formatDate(lastVisit.startedAt)}: {lastVisit.chiefComplaint}
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* Show previous visits list */}
            {lastVisit && (
                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: '#F8F9FA',
                    borderRadius: '8px'
                }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#666' }}>
                        پچھلی ملاقاتیں:
                    </h3>
                    <div style={{ fontSize: '14px', color: '#333' }}>
                        📅 {formatDate(lastVisit.startedAt)}<br />
                        🩺 {lastVisit.chiefComplaint}<br />
                        {lastVisit.diagnosis && `💊 ${lastVisit.diagnosis}`}
                    </div>
                </div>
            )}
        </div>
    );
};

function formatDate(isoDate: string): string {
    try {
        return new Date(isoDate).toLocaleDateString('ur-PK');
    } catch (e) {
        return isoDate;
    }
}
