
import { RiskClassification } from '../types';

export function calculateTriageScore(symptoms: {
  duration: number; // in days
  painLevel: number; // 1-10
  fever: boolean;
  breathingIssue: boolean;
}): RiskClassification {
  let score = 0;

  score += symptoms.painLevel * 2;
  score += symptoms.duration > 3 ? 2 : 0;
  score += symptoms.fever ? 2 : 0;
  score += symptoms.breathingIssue ? 10 : 0; // High weight for respiratory distress

  if (score >= 12 || symptoms.breathingIssue) return 'Emergency';
  if (score >= 6) return 'Urgent';
  return 'Routine';
}

export function getTriageMessage(level: RiskClassification, lang: 'en' | 'ur') {
  const messages = {
    Emergency: {
      en: "⚠️ Symptoms appear severe. Please seek immediate medical attention or visit an Emergency Room.",
      ur: "⚠️ علامات سنگین معلوم ہوتی ہیں۔ فوری طور پر ڈاکٹر یا اسپتال کے ایمرجنسی وارڈ سے رجوع کریں۔"
    },
    Urgent: {
      en: "🩺 It is recommended to consult a doctor as soon as possible.",
      ur: "🩺 ڈاکٹر سے مشورہ کرنا بہتر ہوگا۔"
    },
    Routine: {
      en: "ℹ️ Currently, symptoms appear mild, but please monitor them closely.",
      ur: "ℹ️ فی الحال علامات ہلکی ہیں، لیکن اپنی صحت پر نظر رکھیں۔"
    }
  };
  return messages[level][lang];
}
