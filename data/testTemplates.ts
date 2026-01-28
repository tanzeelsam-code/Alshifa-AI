
export const TEST_TEMPLATES = {
  CBC: {
    category: "Hematology",
    name: "Complete Blood Count (CBC)",
    aiReason: "Evaluate infection, anemia, or inflammation",
    explanationUr: "خون کے خلیات کی مکمل جانچ تاکہ انفیکشن یا خون کی کمی کا پتہ چل سکے۔",
    requiresUpload: true
  },
  ESR: {
    category: "Hematology",
    name: "ESR (Sedimentation Rate)",
    aiReason: "Monitor inflammatory activity in the body",
    explanationUr: "جسم میں سوزش کی جانچ کے لیے۔",
    requiresUpload: true
  },
  RBS: {
    category: "Diabetes",
    name: "Random Blood Sugar (RBS)",
    aiReason: "Screen for glycemic control and diabetes",
    explanationUr: "خون میں شوگر کی مقدار کی فوری جانچ۔",
    requiresUpload: true
  },
  FBS: {
    category: "Diabetes",
    name: "Fasting Blood Sugar (FBS)",
    aiReason: "Accurate diagnosis of glycemic levels after fasting",
    explanationUr: "نہار منہ خون میں شوگر کی مقدار کا ٹیسٹ۔",
    requiresUpload: true
  },
  HBA1C: {
    category: "Diabetes",
    name: "HbA1c",
    aiReason: "Assess long-term average blood glucose levels",
    explanationUr: "پچھلے تین ماہ کی شوگر کی اوسط مقدار معلوم کرنے کے لیے۔",
    requiresUpload: true
  },
  ECG: {
    category: "Cardiac",
    name: "Electrocardiogram (ECG)",
    aiReason: "Evaluate heart rhythm and structural activity",
    explanationUr: "دل کی دھڑکن اور رفتار کی برقی جانچ۔",
    requiresUpload: true
  },
  ECHO: {
    category: "Cardiac",
    name: "Echocardiography (Echo)",
    aiReason: "Detailed imaging of heart structure and valves",
    explanationUr: "دل کا الٹراساؤنڈ تاکہ دل کے والوز اور کام کرنے کی صلاحیت دیکھی جا سکے۔",
    requiresUpload: true
  },
  LFTS: {
    category: "Biochemistry",
    name: "Liver Function Tests (LFTs)",
    aiReason: "Assess liver health and enzyme levels",
    explanationUr: "جگر کی صحت اور کارکردگی معلوم کرنے کے لیے۔",
    requiresUpload: true
  },
  RFTS: {
    category: "Biochemistry",
    name: "Renal Function Tests (RFTs)",
    aiReason: "Evaluate kidney function and filtration",
    explanationUr: "گردوں کی کارکردگی اور خون کی صفائی چیک کرنے کے لیے۔",
    requiresUpload: true
  },
  LIPID: {
    category: "Cardiac",
    name: "Lipid Profile",
    aiReason: "Evaluate cholesterol and cardiovascular risk",
    explanationUr: "کولیسٹرول اور خون میں چربی کی مقدار معلوم کرنے کے لیے۔",
    requiresUpload: true
  },
  CRP: {
    category: "Infection",
    name: "C-Reactive Protein (CRP)",
    aiReason: "Measure acute inflammation levels",
    explanationUr: "جسم میں شدید سوزش یا انفیکشن کی جانچ۔",
    requiresUpload: true
  },
  DENGUE: {
    category: "Infection",
    name: "Dengue NS1 / IgM / IgG",
    aiReason: "Detect Dengue virus infection",
    explanationUr: "ڈینگی وائرس کی تشخیص کے لیے خون کا ٹیسٹ۔",
    requiresUpload: true
  },
  URINE_RE: {
    category: "Urine Tests",
    name: "Urine Routine Examination (R/E)",
    aiReason: "Screen for UTI or metabolic markers",
    explanationUr: "پیشاب کی مکمل جانچ تاکہ انفیکشن یا گردوں کے مسئلے کا پتہ چل سکے۔",
    requiresUpload: true
  },
  CXRAY: {
    category: "Respiratory",
    name: "Chest X-Ray",
    aiReason: "Examine lungs, heart and chest cavity",
    explanationUr: "پھیپھڑوں اور سینے کا ایکسرے۔",
    requiresUpload: true
  },
  THYROID: {
    category: "Endocrine",
    name: "Thyroid Profile (TSH, T3, T4)",
    aiReason: "Assess thyroid gland activity",
    explanationUr: "تھائرائیڈ گلینڈ کی کارکردگی اور ہارمونز کی جانچ۔",
    requiresUpload: true
  },
  US_ABD: {
    category: "Imaging",
    name: "Ultrasound Abdomen",
    aiReason: "Imaging of abdominal organs and tissues",
    explanationUr: "پیٹ کے اندرونی اعضاء کا الٹراساؤنڈ۔",
    requiresUpload: true
  }
};
