import React from 'react';
import { RedFlagAlert } from '../../src/intake/logic/medicalQuestionEngine';

interface RedFlagAlertProps {
    alerts: RedFlagAlert[];
    onAcknowledge?: () => void;
    onCallEmergency?: () => void;
    language?: 'en' | 'ur';
}

export const RedFlagAlertComponent: React.FC<RedFlagAlertProps> = ({
    alerts,
    onAcknowledge,
    onCallEmergency,
    language = 'en'
}) => {
    if (alerts.length === 0) return null;

    // Show only the highest urgency alert
    const topAlert = alerts[0]; // Already sorted by urgency

    const getAlertStyles = (urgency: string) => {
        switch (urgency) {
            case 'emergency':
                return {
                    bg: 'bg-red-500',
                    border: 'border-red-600',
                    text: 'text-white',
                    icon: '🚨',
                    ringColor: 'ring-red-300'
                };
            case 'high':
                return {
                    bg: 'bg-orange-500',
                    border: 'border-orange-600',
                    text: 'text-white',
                    icon: '⚠️',
                    ringColor: 'ring-orange-300'
                };
            case 'medium':
                return {
                    bg: 'bg-yellow-500',
                    border: 'border-yellow-600',
                    text: 'text-yellow-900',
                    icon: '⚡',
                    ringColor: 'ring-yellow-300'
                };
            default:
                return {
                    bg: 'bg-blue-500',
                    border: 'border-blue-600',
                    text: 'text-white',
                    icon: 'ℹ️',
                    ringColor: 'ring-blue-300'
                };
        }
    };

    const styles = getAlertStyles(topAlert.urgency);

    const getActionButton = () => {
        switch (topAlert.action) {
            case 'call-911':
                return (
                    <div className="space-y-2">
                        <button
                            onClick={onCallEmergency}
                            className="w-full bg-white text-red-600 hover:bg-red-50 font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg animate-pulse"
                        >
                            <span className="text-2xl">📞</span>
                            {language === 'en' ? 'Call Emergency (911)' : 'ایمرجنسی کال کریں (911)'}
                        </button>
                        <button
                            onClick={onAcknowledge}
                            className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                        >
                            {language === 'en' ? 'I Understand the Risk' : 'میں خطرے کو سمجھتا ہوں'}
                        </button>
                    </div>
                );

            case 'er-visit':
                return (
                    <button
                        onClick={onAcknowledge}
                        className="w-full bg-white hover:bg-opacity-90 text-red-600 font-bold py-4 px-6 rounded-xl transition-colors"
                    >
                        {language === 'en'
                            ? 'I Will Go to the Emergency Room'
                            : 'میں ایمرجنسی روم جاؤں گا'}
                    </button>
                );

            case 'urgent-visit':
                return (
                    <button
                        onClick={onAcknowledge}
                        className="w-full bg-white hover:bg-opacity-90 text-orange-600 font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        {language === 'en'
                            ? 'I Will Seek Medical Care Soon'
                            : 'میں جلد طبی دیکھ بھال حاصل کروں گا'}
                    </button>
                );

            default:
                return (
                    <button
                        onClick={onAcknowledge}
                        className="w-full bg-white hover:bg-opacity-90 font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                        {language === 'en' ? 'I Understand' : 'میں سمجھتا ہوں'}
                    </button>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div
                className={`max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden ${styles.bg} ${styles.text} border-4 ${styles.border} ring-8 ${styles.ringColor} animate-shake`}
            >
                {/* Header */}
                <div className="p-6 text-center border-b-2 border-white border-opacity-30">
                    <div className="text-6xl mb-3 animate-bounce">{styles.icon}</div>
                    <h2 className="text-2xl font-bold uppercase tracking-wide">
                        {topAlert.urgency === 'emergency' && (language === 'en' ? 'MEDICAL EMERGENCY' : 'طبی ایمرجنسی')}
                        {topAlert.urgency === 'high' && (language === 'en' ? 'HIGH PRIORITY' : 'اعلی ترجیح')}
                        {topAlert.urgency === 'medium' && (language === 'en' ? 'ATTENTION NEEDED' : 'توجہ کی ضرورت')}
                        {topAlert.urgency === 'low' && (language === 'en' ? 'NOTICE' : 'نوٹس')}
                    </h2>
                </div>

                {/* Message */}
                <div className="p-6">
                    <p className="text-lg font-semibold mb-6 leading-relaxed">{topAlert.message}</p>

                    {/* Actions */}
                    {getActionButton()}

                    {/* Additional Alerts Count */}
                    {alerts.length > 1 && (
                        <p className="mt-4 text-sm text-center opacity-90">
                            +{alerts.length - 1} {language === 'en' ? 'more warning(s)' : 'مزید انتباہ'}
                        </p>
                    )}
                </div>

                {/* Bottom Notice */}
                {topAlert.urgency === 'emergency' && (
                    <div className="bg-white bg-opacity-20 p-4 text-center text-sm font-medium">
                        {language === 'en'
                            ? '⏱️ Time is critical. Do not wait. Seek immediate medical attention.'
                            : '⏱️ وقت اہم ہے۔ انتظار نہ کریں۔ فوری طبی امداد حاصل کریں۔'}
                    </div>
                )}
            </div>
        </div>
    );
};

// Add shake animation to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
`;
document.head.appendChild(style);

export default RedFlagAlertComponent;
