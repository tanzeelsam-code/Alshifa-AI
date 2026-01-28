
import { whoMedications } from '../data/whoMedications';

export function getMedicationSafetyInfo(name: string, lang: 'en' | 'ur') {
  const normalized = name.toLowerCase().trim();
  
  // Strict block on dosage requests
  if (normalized.match(/\b(mg|ml|dose|dosage|خوراک|ملی گرام)\b/i)) {
    return {
      error: lang === 'ur' 
        ? "❌ معذرت، میں دوا کی خوراک (Dosage) نہیں بتا سکتا۔ براہِ کرم اپنے ڈاکٹر سے مشورہ کریں۔"
        : "❌ I cannot provide medication dosages. Please consult your physician for specific instructions."
    };
  }

  const info = whoMedications[normalized];
  if (!info) return null;

  return {
    purpose: info[lang],
    warning: lang === 'ur'
      ? "⚠️ اہم نوٹ: خوراک اور استعمال کی مدت کا فیصلہ صرف آپ کا معالج (Doctor) ہی کر سکتا ہے۔"
      : "⚠️ Note: Dosage and duration of use must be determined solely by your physician."
  };
}
