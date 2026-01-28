import { QuestionI18n } from './types';

export const QUESTIONS: Record<string, QuestionI18n> = {
    // ============================================
    // SAFETY (HEADACHE)
    // ============================================
    worst_headache_ever: {
        type: 'yesNo',
        text: {
            en: { label: 'Is this the worst headache of your life?' },
            ur: { label: 'کیا یہ آپ کی زندگی کا سب سے شدید سر درد ہے؟' },
            roman: { label: 'Kya yeh aap ki zindagi ka sab se shadeed sar dard hai?' }
        }
    },
    sudden_onset: {
        type: 'yesNo',
        text: {
            en: { label: 'Did it start suddenly (thunderclap)?' },
            ur: { label: 'کیا یہ اچانک شروع ہوا؟ (ایک دم زور سے)' },
            roman: { label: 'Kya yeh achanak shuru hua? (Ek dam zor se)' }
        }
    },
    fever_neck_stiffness: {
        type: 'yesNo',
        text: {
            en: { label: 'Do you have fever and neck stiffness?' },
            ur: { label: 'کیا آپ کو بخار اور گردن میں اکڑاہٹ ہے؟' },
            roman: { label: 'Kya aap ko bukhaar aur gardan mein akrahat hai?' }
        }
    },
    vision_or_speech_change: {
        type: 'yesNo',
        text: {
            en: { label: 'Any vision or speech changes?' },
            ur: { label: 'کیا نظر یا بولنے میں کوئی تبدیلی ہے؟' },
            roman: { label: 'Kya nazar ya bolne mein koi tabdeeli hai?' }
        }
    },
    vomiting_with_pain: {
        type: 'yesNo',
        text: {
            en: { label: 'Vomiting along with headache?' },
            ur: { label: 'کیا سر درد کے ساتھ الٹی ہو رہی ہے؟' },
            roman: { label: 'Kya sar dard ke saath ulti ho rahi hai?' }
        }
    },
    recent_head_trauma: {
        type: 'yesNo',
        text: {
            en: { label: 'Any recent head injury?' },
            ur: { label: 'کیا حال ہی میں سر میں چوٹ لگی؟' },
            roman: { label: 'Kya haal hi mein sar mein chot lagi?' }
        }
    },
    // ============================================
    // SAFETY (GENERAL / PAIN)
    // ============================================
    severe_chest_pain: {
        type: 'yesNo',
        text: {
            en: { label: 'Severe chest pain?' },
            ur: { label: 'کیا سینے میں شدید درد ہے؟' },
            roman: { label: 'Kya seene mein shadeed dard hai?' }
        }
    },
    shortness_of_breath: {
        type: 'yesNo',
        text: {
            en: { label: 'Any difficulty breathing?' },
            ur: { label: 'کیا سانس لینے میں کوئی دشواری ہے؟' },
            roman: { label: 'Kya saans lene mein koi dushwari hai?' }
        }
    },
    loss_of_consciousness: {
        type: 'yesNo',
        text: {
            en: { label: 'Have you fainted or lost consciousness?' },
            ur: { label: 'کیا آپ بے ہوش ہوئے؟' },
            roman: { label: 'Kya aap behosh hue?' }
        }
    },

    // ============================================
    // CHARACTERIZATION
    // ============================================
    location: {
        type: 'choice',
        text: {
            en: {
                label: 'Where is the headache?',
                options: ['Front', 'Back', 'One side', 'All over', 'Behind eyes']
            },
            ur: {
                label: 'سر درد کہاں ہے؟',
                options: [
                    'سامنے (Front)',
                    'پیچھے (Back)',
                    'ایک طرف (One side)',
                    'پورے سر میں (All over)',
                    'آنکھوں کے پیچھے (Behind eyes)'
                ]
            },
            roman: {
                label: 'Sar dard kahan hai?',
                options: [
                    'Samnay',
                    'Peechay',
                    'Aik taraf',
                    'Pooray sar mein',
                    'Aankhon ke peechay'
                ]
            }
        }
    },
    quality: {
        type: 'multiChoice',
        text: {
            en: {
                label: 'What does it feel like?',
                options: ['Throbbing', 'Pressure', 'Sharp', 'Burning', 'Squeezing']
            },
            ur: {
                label: 'کیسا محسوس ہوتا ہے؟',
                options: [
                    'دھڑکن (Throbbing)',
                    'دباؤ (Pressure)',
                    'تیز درد (Sharp)',
                    'جلن (Burning)',
                    'کسنا (Squeezing)'
                ]
            },
            roman: {
                label: 'Kaisa mehsoos hota hai?',
                options: [
                    'Dhadkan',
                    'Dabao',
                    'Tez dard',
                    'Jalan',
                    'Kasna'
                ]
            }
        }
    },
    severity_0_10: {
        type: 'scale',
        text: {
            en: { label: 'How severe is it? (1-10)' },
            ur: { label: 'شدت کتنی ہے؟ (1 سے 10)' },
            roman: { label: 'Dard ki shiddat kitni hai? (1 se 10)' }
        }
    },
    onset_time: {
        type: 'choice',
        text: {
            en: {
                label: 'When did it start?',
                options: ['Hours ago', 'Today', 'Yesterday', '2-3 days ago', 'A week ago', 'Longer']
            },
            ur: {
                label: 'کب شروع ہوا؟',
                options: ['چند گھنٹے پہلے', 'آج', 'کل', '2-3 دن پہلے', 'ایک ہفتہ پہلے', 'زیادہ عرصہ']
            },
            roman: {
                label: 'Kab shuru hua?',
                options: ['Chand ghantay pehlay', 'Aaj', 'Kal', '2-3 din pehlay', 'Ek hafta pehlay', 'Zyada arsa']
            }
        }
    },
    duration_pattern: {
        type: 'choice',
        text: {
            en: {
                label: 'Is it constant or comes and goes?',
                options: ['Constant', 'Comes and goes', 'Attacks']
            },
            ur: {
                label: 'یہ تکلیف کیسی ہے؟',
                options: ['مسلسل', 'آتی جاتی ہے', 'حملوں میں']
            },
            roman: {
                label: 'Yeh takleef kaisi hai?',
                options: ['Musalsal', 'Aati jaati hai', 'Hamlon mein']
            }
        }
    },
    triggers: {
        type: 'multiChoice',
        text: {
            en: {
                label: 'What triggers it?',
                options: ['Stress', 'Food', 'Light', 'Noise', 'Lack of sleep', 'Nothing']
            },
            ur: {
                label: 'کن چیزوں سے شروع ہوتا ہے؟',
                options: ['تناؤ', 'کھانا', 'روشنی', 'شور', 'نیند کی کمی', 'کچھ نہیں']
            },
            roman: {
                label: 'Kin cheezon se shuru hota hai?',
                options: ['Tanao', 'Khana', 'Roshni', 'Shor', 'Neend ki kami', 'Kuch nahi']
            }
        }
    },
    relief_factors: {
        type: 'multiChoice',
        text: {
            en: {
                label: 'What makes it better?',
                options: ['Rest', 'Medication', 'Dark room', 'Sleep', 'Nothing']
            },
            ur: {
                label: 'کن چیزوں سے آرام ملتا ہے؟',
                options: ['آرام', 'دوا', 'اندھیرا کمرہ', 'نیند', 'کچھ نہیں']
            },
            roman: {
                label: 'Kin cheezon se araam milta hai?',
                options: ['Araam', 'Dawa', 'Andhera kamra', 'Neend', 'Kuch nahi']
            }
        }
    },

    // ============================================
    // ASSOCIATED
    // ============================================
    nausea: {
        type: 'yesNo',
        text: {
            en: { label: 'Feeling nauseous?' },
            ur: { label: 'کیا متلی ہو رہی ہے؟' },
            roman: { label: 'Kya matli ho rahi hai?' }
        }
    },
    vomiting: {
        type: 'yesNo',
        text: {
            en: { label: 'Have you vomited?' },
            ur: { label: 'کیا الٹی ہوئی ہے؟' },
            roman: { label: 'Kya ulti hui hai?' }
        }
    },
    photophobia: {
        type: 'yesNo',
        text: {
            en: { label: 'Does light bother you?' },
            ur: { label: 'کیا روشنی بری لگتی ہے؟' },
            roman: { label: 'Kya roshni buri lagti hai?' }
        }
    },
    phonophobia: {
        type: 'yesNo',
        text: {
            en: { label: 'Do loud sounds bother you?' },
            ur: { label: 'کیا آوازیں بری لگتی ہیں؟' },
            roman: { label: 'Kya awazain buri lagti hain?' }
        }
    },
    weakness: {
        type: 'yesNo',
        text: {
            en: { label: 'Any weakness in arms or legs?' },
            ur: { label: 'کیا بازو یا ٹانگوں میں کمزوری ہے؟' },
            roman: { label: 'Kya baazu ya taangon mein kamzori hai?' }
        }
    },
    numbness: {
        type: 'yesNo',
        text: {
            en: { label: 'Any numbness or tingling?' },
            ur: { label: 'کیا جسم سن ہو رہا ہے یا سوئیاں چبھ رہی ہیں؟' },
            roman: { label: 'Kya jism sun ho raha hai ya suiyan chubh rahi hain?' }
        }
    },
    confusion: {
        type: 'yesNo',
        text: {
            en: { label: 'Any confusion or mental changes?' },
            ur: { label: 'کیا آپ کو الجھن محسوس ہو رہی ہے؟' },
            roman: { label: 'Kya aap ko uljhan mehsoos ho rahi hai?' }
        }
    },
    aura: {
        type: 'yesNo',
        text: {
            en: { label: 'Do you see flashing lights or zigzag lines before headache?' },
            ur: { label: 'کیا سر درد سے پہلے آنکھوں کے سامنے روشنیاں آتی ہیں؟' },
            roman: { label: 'Kya sar dard se pehlay aankhon ke samnay roshniyan aati hain?' }
        }
    },

    // ============================================
    // HISTORY
    // ============================================
    previous_similar: {
        type: 'yesNo',
        text: {
            en: { label: 'Have you had this type of headache before?' },
            ur: { label: 'کیا پہلے بھی ایسا سر درد ہوا ہے؟' },
            roman: { label: 'Kya pehlay bhi aisa sar dard hua hai?' }
        }
    },
    diagnosed_migraine: {
        type: 'yesNo',
        text: {
            en: { label: 'Ever diagnosed with migraines?' },
            ur: { label: 'کیا کبھی مائیگرین (آدھے سر کا درد) کی تشخیص ہوئی ہے؟' },
            roman: { label: 'Kya kabhi migraine (aadhay sar ka dard) ki tashkhees hui hai?' }
        }
    },
    medications_taken: {
        type: 'text',
        text: {
            en: { label: 'What medicines have you tried?' },
            ur: { label: 'کون سی دوائیں استعمال کی ہیں؟' },
            roman: { label: 'Kaun si dawaiyan istemal ki hain?' }
        }
    },
    response_to_meds: {
        type: 'choice',
        text: {
            en: {
                label: 'Did the medicines help?',
                options: ['Yes, fully', 'Somewhat', 'No, not at all']
            },
            ur: {
                label: 'کیا دواؤں سے فائدہ ہوا؟',
                options: ['ہاں، مکمل', 'کچھ حد تک', 'بالکل نہیں']
            },
            roman: {
                label: 'Kya dawaon se faida hua?',
                options: ['Haan, mukammal', 'Kuch had tak', 'Bilkul nahi']
            }
        }
    },
    frequency: {
        type: 'choice',
        text: {
            en: {
                label: 'How often do you get headaches?',
                options: ['Daily', 'Weekly', 'Monthly', 'Rarely']
            },
            ur: {
                label: 'سر درد کتنی بار ہوتا ہے؟',
                options: ['روزانہ', 'ہفتہ وار', 'ماہانہ', 'کبھی کبھار']
            },
            roman: {
                label: 'Sar dard kitni baar hota hai?',
                options: ['Rozana', 'Hafta war', 'Mahana', 'Kabhi kabhaar']
            }
        }
    },
    family_history_migraine: {
        type: 'yesNo',
        text: {
            en: { label: 'Does anyone in family have migraines?' },
            ur: { label: 'کیا خاندان میں کسی کو مائیگرین ہے؟' },
            roman: { label: 'Kya khandan mein kisi ko migraine hai?' }
        }
    },

    // ============================================
    // RISK FACTORS
    // ============================================
    hypertension: {
        type: 'yesNo',
        text: {
            en: { label: 'Do you have high blood pressure?' },
            ur: { label: 'کیا آپ کو ہائی بلڈ پریشر ہے؟' },
            roman: { label: 'Kya aap ko high blood pressure hai?' }
        }
    },
    diabetes: {
        type: 'yesNo',
        text: {
            en: { label: 'Do you have diabetes?' },
            ur: { label: 'کیا آپ کو شوگر (ذیابیطس) ہے؟' },
            roman: { label: 'Kya aap ko sugar (diabetes) hai?' }
        }
    },
    smoking: {
        type: 'yesNo',
        text: {
            en: { label: 'Do you smoke?' },
            ur: { label: 'کیا آپ سگریٹ پیتے ہیں؟' },
            roman: { label: 'Kya aap cigarette peetay hain?' }
        }
    },
    recent_infection: {
        type: 'yesNo',
        text: {
            en: { label: 'Any recent infection or fever?' },
            ur: { label: 'کیا حال ہی میں کوئی انفیکشن یا بخار ہوا؟' },
            roman: { label: 'Kya haal hi mein koi infection ya bukhaar hua?' }
        }
    },
    sleep_stress: {
        type: 'yesNo',
        text: {
            en: { label: 'Sleep problems or high stress?' },
            ur: { label: 'کیا نیند کا مسئلہ یا بہت ٹینشن ہے؟' },
            roman: { label: 'Kya neend ka masla ya bohat tension hai?' }
        }
    },
    caffeine_intake: {
        type: 'choice',
        text: {
            en: {
                label: 'How much caffeine do you drink daily?',
                options: ['None', '1-2 cups', '3+ cups']
            },
            ur: {
                label: 'روزانہ کتنی چائے/کافی پیتے ہیں؟',
                options: ['کوئی نہیں', '1-2 کپ', '3 سے زیادہ']
            },
            roman: {
                label: 'Rozana kitni chai/coffee peetay hain?',
                options: ['Koi nahi', '1-2 cup', '3 se zyada']
            }
        }
    }
};
