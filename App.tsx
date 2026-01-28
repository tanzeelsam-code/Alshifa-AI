
import React, { useState, useEffect } from 'react';
import { AppState, Role, User, DoctorProfile, Message, Appointment, ConsultationType, PatientSummary, RiskClassification, Medication, MedicationLog, ClinicalSuggestion, MedicalHistory, SOAPNote, MedicationStatus, VisitType } from './types';
// import RoleSelection from './components/RoleSelection'; // Removed per Step 9
import RegistrationForm from './components/RegistrationForm';
import ChatInterface from './components/ChatInterface';
// import { CompleteMedicalIntake } from './components/CompleteMedicalIntake'; // Deprecated
// import { PhasedIntakeFlow } from './components/PhasedIntakeFlow'; // Deprecated
import IntakeScreen from './src/intake/IntakeScreen';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import DoctorSelection from './components/DoctorSelection';
import { uiStrings, patientSummariesData, doctorsData, usersData } from './constants';
import SessionTypeSelection from './components/SessionTypeSelection';
import PreviousHistory from './components/PreviousHistory';
import AppointmentScheduler from './components/AppointmentScheduler';
import OnlineConsultationSelection from './components/OnlineConsultationSelection';
import ConsultationCall from './components/ConsultationCall';
import ConsultationModeSelection from './components/ConsultationModeSelection';
import DoctorDashboard from './components/DoctorDashboard';
import AuthChoice from './components/AuthChoice';
import Login from './components/Login';
import PatientDashboard from './components/PatientDashboard';
import LanguageSwitcher from './components/LanguageSwitcher';
import NotificationBell from './components/NotificationBell';
// import MedicationDashboard from './components/MedicationDashboard'; // Replaced by new module
import { MedicationProvider } from './src/medication/context/MedicationContext';
import { MedicationScreen } from './src/medication/components/MedicationScreen';
import { CostDashboard } from './components/CostDashboard';
import MedicalDisclaimer from './components/MedicalDisclaimer';
import ErrorBoundary from './components/ErrorBoundary';
import AIProviderSelector from './components/AIProviderSelector';
import { VisitTypeSelector } from './components/VisitTypeSelector';
import { encryptData, decryptData, deriveUserKey, clearUserKey } from './utils/security';
import { hashPassword, verifyPassword, isBcryptHash } from './utils/passwordHash';
import { ConsentModal, useConsent } from './components/ConsentModal';
import { BaselineReconfirmation } from './components/BaselineReconfirmation';
import { SummaryService } from './services/summaryService';
import { MedicationService } from './services/medicationService';
import { validateAiResponse } from './services/medicalGuardrails';
import toast from 'react-hot-toast';
import { StorageService } from './src/services/StorageService';
import { SEED_PATIENT_ID, SEED_DOCTOR_ID } from './src/intake/data/SeedData';
import { ResetDataButton } from './components/ResetDataButton';
import { RecommendationScreen } from './components/RecommendationScreen';
import { mapEncounterToIntakeResult } from './utils/recommendationMapper';
import { IntakeResult } from './types/recommendation';
import { AuditService, AuditAction } from './services/AuditService';

const initializeData = <T,>(key: string, initialData: T[], secure = false): T[] => {
  try {
    const storedData = localStorage.getItem(key);
    if (!storedData) {
      const stringified = JSON.stringify(initialData);
      localStorage.setItem(key, secure ? encryptData(stringified) : stringified);
      return initialData;
    }

    try {
      const data = secure ? decryptData(storedData) : storedData;
      const parsed = JSON.parse(data);

      if (parsed === null || parsed === undefined || !Array.isArray(parsed)) {
        throw new Error('Invalid data structure');
      }

      return parsed;
    } catch (parseError) {
      console.error(`🔴 [App] LocalStorage corruption in "${key}":`, parseError);
      localStorage.removeItem(key); // Clear bad data
      return initialData;
    }
  } catch (outerError) {
    console.error(`🔴 [App] Error initializing data for "${key}":`, outerError);
    return initialData;
  }
};

import './App.css';
// import TestIntakeIsolation from './TestIntakeIsolation';

// Mock Account for testing V2 Intake
const MOCK_PATIENT_ACCOUNT: any = {
  id: 'test_patient',
  demographics: { age: 30, gender: 'Male' },
  baselineData: { chronicConditions: [], longTermMedications: [], allergies: [] },
  riskProfile: { smokingStatus: 'Never', alcoholUse: 'None' }
};

const App: React.FC = () => {
  // ============================================================================
  // AUTHENTICATION STATE (Phase 1: Core Auth Layer)
  // ============================================================================
  // ============================================================================
  const { language } = useLanguage();
  const strings = uiStrings[language];
  const { user: authUser, loading: isLoadingAuth, login: sbLogin, register: sbRegister } = useAuth();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const [appState, setAppState] = useState<AppState>(AppState.DISCLAIMER); // Changed from ROLE_SELECTION
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const { hasConsent, showModal, handleAccept, handleDecline } = useConsent();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [consultationMode, setConsultationMode] = useState<'in-person' | 'online' | null>(null);
  const [selectedVisitType, setSelectedVisitType] = useState<VisitType | null>(null);
  const [showAISettings, setShowAISettings] = useState(false);
  const [currentIntakeResult, setCurrentIntakeResult] = useState<IntakeResult | null>(null);

  // ============================================================================
  // AUTHENTICATION CHECK ON MOUNT (SIMPLIFIED - NO DEADLOCK)
  // ============================================================================
  // ============================================================================
  // AUTHENTICATION SYNC (Supabase Single Source of Truth)
  // ============================================================================
  useEffect(() => {
    const syncAuth = async () => {
      if (authUser && !loggedInUser) {
        console.log(`🔄 [Auth] Syncing Supabase user: ${authUser.email} (${authUser.role})`);

        // Map SupabaseUserProfile to legacy User type
        const user: User = {
          id: authUser.uid,
          name: authUser.displayName || authUser.email.split('@')[0],
          mobile: authUser.mobile || '00000',
          idCardNo: authUser.idCardNo || 'PENDING',
          role: authUser.role,
          language: language,
          password: '***', // Secret
          account: {
            id: authUser.uid,
            fullName: authUser.displayName || authUser.email.split('@')[0],
            dateOfBirth: authUser.dateOfBirth || '2000-01-01',
            idCardNo: authUser.idCardNo || 'PENDING',
            sexAtBirth: 'prefer_not_to_say',
            country: 'Pakistan',
            language: language,
            phoneNumber: authUser.mobile || '00000',
            createdAt: authUser.createdAt
          }
        };

        setLoggedInUser(user);

        // Load secondary data
        if (user.role === Role.PATIENT) {
          const [meds, summaries] = await Promise.all([
            MedicationService.getForPatient(user.id!),
            SummaryService.getSummaries(user.id!, user.role)
          ]);
          setAllMedications(meds);
          setAllPatientSummaries(summaries);
        }

        // Check disclaimer
        const disclaimerStatus = localStorage.getItem('alshifa_disclaimer_accepted');
        setDisclaimerAccepted(disclaimerStatus === 'true');
      } else if (!authUser && loggedInUser) {
        // Handle external logout (e.g. from Supabase dashboard or another tab)
        console.log('🔓 [Auth] Supabase session lost - logging out');
        setLoggedInUser(null);
        setDisclaimerAccepted(false);
      }
    };

    syncAuth();
  }, [authUser, loggedInUser]);

  // ============================================================================
  // SESSION TIMEOUT (30 minutes of inactivity)
  // ============================================================================
  useEffect(() => {
    if (!authUser) return;

    let timeout: NodeJS.Timeout;
    const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        console.log('⏱️ [Auth] Session timeout - logging out');
        localStorage.removeItem('alshifa_current_user');
        clearUserKey();
        toast('Session expired. Please log in again.', { icon: 'ℹ️' });
        window.location.reload();
      }, TIMEOUT_DURATION);
    };

    const activityEvents = ['mousemove', 'keypress', 'click', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeout);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [authUser]);

  // ============================================================================
  // MULTI-TAB CONFLICT DETECTION
  // ============================================================================
  useEffect(() => {
    const TAB_ID_KEY = 'alshifa_active_tab';
    const currentTabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    sessionStorage.setItem('alshifa_tab_id', currentTabId);
    localStorage.setItem(TAB_ID_KEY, currentTabId);

    const handleStorageChange = (e: StorageEvent) => {
      // Sync logout across tabs
      if (e.key === 'alshifa_current_user' && !e.newValue) {
        console.log('🔓 [Auth] User logged out in another tab');
        toast('You have been logged out in another tab', { icon: 'ℹ️' });
        setTimeout(() => window.location.reload(), 1000);
      }

      // Detect multiple active tabs
      if (e.key === TAB_ID_KEY) {
        const activeTab = localStorage.getItem(TAB_ID_KEY);
        const thisTab = sessionStorage.getItem('alshifa_tab_id');

        if (activeTab && activeTab !== thisTab) {
          console.warn('⚠️ [MultiTab] Multiple tabs detected');
          toast('Multiple tabs detected. Please use only one tab to avoid data conflicts.', {
            icon: '⚠️',
            duration: 5000
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      const activeTab = localStorage.getItem(TAB_ID_KEY);
      if (activeTab === currentTabId) {
        localStorage.removeItem(TAB_ID_KEY);
      }
    };
  }, []);

  const [allUsers, setAllUsers] = useState<User[]>(() => initializeData('alshifa_users', usersData, true));
  const [allDoctors, setAllDoctors] = useState<DoctorProfile[]>(() => {
    const stored = initializeData('alshifa_doctors', doctorsData, true);
    // Ensure all sample doctors from constants are present
    const existingIds = new Set(stored.map(d => d.id));
    const missing = doctorsData.filter(d => !existingIds.has(d.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      localStorage.setItem('alshifa_doctors', encryptData(JSON.stringify(merged)));
      return merged;
    }
    return stored;
  });
  const [allPatientSummaries, setAllPatientSummaries] = useState<PatientSummary[]>([]);
  const [allMedications, setAllMedications] = useState<Medication[]>([]);
  const [allMedicationLogs, setAllMedicationLogs] = useState<MedicationLog[]>(() => initializeData<MedicationLog>('alshifa_med_logs', [], true));
  const [allMedicalHistories, setAllMedicalHistories] = useState<MedicalHistory[]>(() => initializeData<MedicalHistory>('alshifa_histories', [], true));

  const handleAutoLogin = async (user: User, doctor?: DoctorProfile) => {
    localStorage.setItem('alshifa_current_user', user.id!);

    // Standardize role if it's lowercase string from Firebase
    const normalizedRole = user.role.toString().toLowerCase() === 'doctor'
      ? Role.DOCTOR
      : (user.role.toString().toLowerCase() === 'patient' ? Role.PATIENT : user.role);

    const normalizedUser = { ...user, role: normalizedRole, language };
    setLoggedInUser(normalizedUser);

    // Asynchronously load sensitive data after key derivation
    if (normalizedRole === Role.PATIENT) {
      setAppState(AppState.SESSION_TYPE_SELECTION);
      const [meds, summaries] = await Promise.all([
        MedicationService.getForPatient(user.id),
        SummaryService.getSummaries(user.id, user.role)
      ]);
      setAllMedications(meds);
      setAllPatientSummaries(summaries);
    } else if (normalizedRole === Role.DOCTOR && doctor) {
      setSelectedDoctor(doctor);
      setAppState(AppState.DOCTOR_DASHBOARD);
      const meds = await MedicationService.getForPatient(user.id);
      setAllMedications(meds);
    } else if (normalizedRole === Role.ADMIN) {
      setAppState(AppState.ADMIN_DASHBOARD);
    } else {
      console.error('🔴 [Auth] Invalid login state transition:', { role: normalizedRole, hasDoctorProfile: !!doctor });
      toast.error('Login successful, but profile configuration is incomplete. Please contact support.');
    }
  };

  const handleUpdateSummary = async (updatedSummary: PatientSummary) => {
    await SummaryService.updateSummary(updatedSummary);
    setAllPatientSummaries(prev => prev.map(s =>
      (s.patientId === updatedSummary.patientId && s.appointmentDate === updatedSummary.appointmentDate) ? updatedSummary : s
    ));

    if (loggedInUser) {
      const meds = await MedicationService.getForPatient(loggedInUser.id);
      setAllMedications(meds);
    }
  };

  const handleUpdateDoctor = (updatedDoctor: DoctorProfile) => {
    const updated = allDoctors.map(d => d.id === updatedDoctor.id ? updatedDoctor : d);
    setAllDoctors(updated);
    localStorage.setItem('alshifa_doctors', encryptData(JSON.stringify(updated)));
  };

  const handleUpdateHistory = (newHistory: MedicalHistory) => {
    const updated = allMedicalHistories.map(h => h.patientId === newHistory.patientId ? newHistory : h);
    if (!updated.find(h => h.patientId === newHistory.patientId)) updated.push(newHistory);
    setAllMedicalHistories(updated);
    localStorage.setItem('alshifa_histories', encryptData(JSON.stringify(updated)));
  };

  const handleAddMedication = (med: Medication) => {
    const updated = [...allMedications, med];
    setAllMedications(updated);
    localStorage.setItem('alshifa_medications', encryptData(JSON.stringify(updated)));
  };

  const handleUpdateMedications = (meds: Medication[]) => {
    setAllMedications(meds);
    localStorage.setItem('alshifa_medications', encryptData(JSON.stringify(meds)));
  };

  const handleAddMedLog = (log: MedicationLog) => {
    const updated = [...allMedicationLogs, log];
    setAllMedicationLogs(updated);
    localStorage.setItem('alshifa_med_logs', encryptData(JSON.stringify(updated)));
  };

  const handleStartOver = () => {
    // Audit log logout event
    if (loggedInUser) {
      AuditService.log(loggedInUser.id!, loggedInUser.name!, loggedInUser.role, AuditAction.LOGOUT, 'User', loggedInUser.id!, 'User logged out');
    }
    setCurrentUser(null); setLoggedInUser(null);
    setSelectedDoctor(null); setAppointment(null);
    clearUserKey();
    setAppState(AppState.ROLE_SELECTION);
  };

  useEffect(() => {
    // HARDWARE BACK BUTTON (Capacitor)
    const setupBackButton = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        CapApp.addListener('backButton', (data) => {
          if (!data.canGoBack) {
            CapApp.exitApp();
          } else {
            // Logic to go back in app state if possible
            if (appState !== AppState.ROLE_SELECTION && appState !== AppState.PATIENT_DASHBOARD && appState !== AppState.DOCTOR_DASHBOARD) {
              window.history.back();
            }
          }
        });
      } catch (e) {
        console.log("Capacitor App plugin not found, skipping hardware back button listener.");
      }
    };
    setupBackButton();
  }, [appState]);

  const currentPatientHistory = allMedicalHistories.find(h => h.patientId === loggedInUser?.id);

  // ============================================================================
  // RENDER CONTENT FUNCTION - Must be declared before use
  // ============================================================================

  const renderContent = () => {
    switch (appState) {
      case AppState.DISCLAIMER:
        return (
          <MedicalDisclaimer
            onAccept={() => {
              localStorage.setItem('alshifa_disclaimer_accepted', 'true');
              setAppState(AppState.ROLE_SELECTION);
            }}
          />
        );
      case AppState.ROLE_SELECTION:
        return (
          <div className="text-center w-full max-w-4xl mx-auto px-4 py-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#17a2b8] mb-10">{uiStrings[language].welcomeTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <button
                onClick={() => {
                  setCurrentUser({ role: Role.PATIENT, language });
                  setAppState(AppState.AUTH_CHOICE);
                }}
                className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 rounded-2xl text-white shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="text-5xl mb-4">🤒</div>
                <h3 className="text-2xl font-bold">{uiStrings[language].patientPortalTitle}</h3>
                <p className="opacity-90">{uiStrings[language].patientPortalDesc}</p>
              </button>
              <button
                onClick={() => {
                  setCurrentUser({ role: Role.DOCTOR, language });
                  setAppState(AppState.AUTH_CHOICE);
                }}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-2xl text-white shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="text-5xl mb-4">🩺</div>
                <h3 className="text-2xl font-bold">{uiStrings[language].doctorPortalTitle}</h3>
                <p className="opacity-90">{uiStrings[language].doctorPortalDesc}</p>
              </button>
            </div>
            <p className="mt-12 text-slate-500">{uiStrings[language].securityNote}</p>
          </div>
        );

      case AppState.AUTH_CHOICE: return <AuthChoice onSelect={(c) => setAppState(c === 'login' ? AppState.LOGIN : AppState.REGISTRATION)} onBack={() => setAppState(AppState.ROLE_SELECTION)} role={currentUser?.role!} />;
      case AppState.LOGIN: return <Login role={currentUser?.role!} onLogin={async (creds) => {
        const loadingToast = toast.loading('Authenticating...');
        try {
          // Normalize email for Supabase
          const identifier = creds.identifier;
          const email = identifier.includes('@') ? identifier : `${identifier.replace(/\s+/g, '').toLowerCase()}@alshifa.ai`;

          await sbLogin(email, creds.password!);
          toast.dismiss(loadingToast);
        } catch (error: any) {
          console.error('Login error:', error);
          toast.dismiss(loadingToast);
          toast.error(error.message || 'Login failed');
        }
      }}
        onSwitchToRegister={() => setAppState(AppState.REGISTRATION)} onBack={() => setAppState(AppState.AUTH_CHOICE)} doctors={allDoctors} />;
      case AppState.REGISTRATION: return <RegistrationForm user={currentUser!} onComplete={async (newUser) => {
        const loadingToast = toast.loading('Creating account...');
        try {
          // Normalize email for Supabase (must be valid email format)
          // Use ID Card No as part of the unique email identifier for patients
          const identifier = (newUser.role === Role.PATIENT && newUser.idCardNo)
            ? newUser.idCardNo.replace(/[-\s]/g, '')
            : (newUser.mobile || newUser.name || `user_${Date.now()}`);

          const email = identifier.includes('@') ? identifier : `${identifier.toLowerCase()}@alshifa.ai`;

          await sbRegister(
            email,
            newUser.password!,
            newUser.role as Role,
            newUser.name,
            newUser.mobile,
            newUser.idCardNo,
            newUser.account?.dateOfBirth
          );
          toast.dismiss(loadingToast);
          toast.success('Registration successful!');
          // useEffect will catch authUser change and setLoggedInUser
        } catch (error: any) {
          console.error('Registration error:', error);
          toast.dismiss(loadingToast);
          toast.error(error.message || 'Registration failed');
        }
      }}
        onBack={() => setAppState(AppState.AUTH_CHOICE)} onSwitchToLogin={() => setAppState(AppState.LOGIN)} doctors={allDoctors} />;

      case AppState.DOCTOR_DASHBOARD:
        if (loggedInUser?.role !== Role.DOCTOR) return <div className="text-center p-8"><p>{uiStrings[language].accessDeniedDoctor}</p><button onClick={handleStartOver} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">{uiStrings[language].backToLogin}</button></div>;

        // Safety check for missing doctor profile
        if (!selectedDoctor) {
          const found = allDoctors.find(d => d.id === loggedInUser.id?.replace('DOC-', ''));
          if (found) {
            setSelectedDoctor(found);
            return (
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-indigo-600 font-bold">Resyncing Doctor Profile...</div>
              </div>
            );
          }
          return (
            <div className="p-12 text-center bg-white rounded-2xl shadow-xl max-w-md mx-auto mt-20">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Profile Not Found</h2>
              <p className="text-slate-500 mb-6">Could not locate doctor profile for ID: <span className="font-mono bg-slate-100 px-1 rounded">{loggedInUser.id}</span></p>
              <button onClick={handleStartOver} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition">Return to Login</button>
            </div>
          );
        }

        return (
          <ErrorBoundary componentName="DoctorDashboard">
            <DoctorDashboard doctor={selectedDoctor} onLogout={handleStartOver} summaries={allPatientSummaries} onUpdateSummary={handleUpdateSummary} allDoctors={allDoctors} medicalHistories={allMedicalHistories} medications={allMedications} onUpdateDoctor={handleUpdateDoctor} />
          </ErrorBoundary>
        );
      case AppState.PATIENT_DASHBOARD:
        if (loggedInUser?.role !== Role.PATIENT) return <div className="text-center p-8"><p>{uiStrings[language].accessDeniedPatient}</p><button onClick={handleStartOver} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">{uiStrings[language].backToLogin}</button></div>;
        return (
          <ErrorBoundary componentName="PatientDashboard">
            <PatientDashboard user={loggedInUser!} onBack={() => setAppState(AppState.SESSION_TYPE_SELECTION)} summaries={allPatientSummaries} onStartCall={() => { }} allDoctors={allDoctors} onUpdateSummary={handleUpdateSummary} />
          </ErrorBoundary>
        );
      case AppState.SESSION_TYPE_SELECTION:
        if (loggedInUser?.role !== Role.PATIENT) return <div className="text-center p-8"><p>{uiStrings[language].accessDeniedPatient}</p><button onClick={handleStartOver} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">{uiStrings[language].backToLogin}</button></div>;
        return <SessionTypeSelection onNewSession={() => setAppState(AppState.DOCTOR_SELECTION)} onHistory={() => setAppState(AppState.HISTORY_VIEW)} onDashboard={() => setAppState(AppState.PATIENT_DASHBOARD)} onMedication={() => setAppState(AppState.MEDICATION_DASHBOARD)} onBack={handleStartOver} />;
      case AppState.MEDICATION_DASHBOARD:
        if (loggedInUser?.role !== Role.PATIENT) return <div className="text-center p-8"><p>{uiStrings[language].accessDeniedPatient}</p><button onClick={handleStartOver} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">{uiStrings[language].backToLogin}</button></div>;
        return (
          <ErrorBoundary componentName="MedicationDashboard">
            <MedicationProvider>
              <MedicationScreen onBack={() => setAppState(AppState.SESSION_TYPE_SELECTION)} />
            </MedicationProvider>
          </ErrorBoundary>
        );
      case AppState.DOCTOR_SELECTION: return <DoctorSelection onSelect={(d) => { setSelectedDoctor(d); setAppState(AppState.CONSULTATION_MODE_SELECTION); }} onBack={() => setAppState(AppState.SESSION_TYPE_SELECTION)} doctors={allDoctors} />;
      case AppState.CONSULTATION_MODE_SELECTION: return <ConsultationModeSelection doctor={selectedDoctor!} onSelectInPerson={() => { setConsultationMode('in-person'); setAppState(AppState.APPOINTMENT_SCHEDULING); }} onSelectOnline={() => { setConsultationMode('online'); setAppState(AppState.APPOINTMENT_SCHEDULING); }} onBack={() => setAppState(AppState.DOCTOR_SELECTION)} />;
      case AppState.APPOINTMENT_SCHEDULING: return <AppointmentScheduler doctor={selectedDoctor!} onBook={(d) => {
        setAppointment({ doctor: selectedDoctor!, ...d });

        // VISITOR STATE MACHINE LOGIC:
        // Is user new? -> Skip selector, go straight to NEW visit
        // Is user returning? -> Show selector
        const hasHistory = allPatientSummaries.some(s => s.patientId === loggedInUser?.id);

        if (!hasHistory) {
          setSelectedVisitType('NEW');
          setAppState(AppState.CHAT);
        } else {
          setAppState(AppState.VISIT_TYPE_SELECTION);
        }
      }} onBack={() => setAppState(AppState.CONSULTATION_MODE_SELECTION)} />;
      case AppState.VISIT_TYPE_SELECTION: {
        const patientSummaries = allPatientSummaries.filter(s => s.patientId === loggedInUser?.id);
        const lastSummary = patientSummaries.length > 0 ? patientSummaries[patientSummaries.length - 1] : undefined;

        // Map old summary to new Visit type for display purposes
        // This bridges the gap until we fully migrate to the VisitService backend
        const lastVisitMock = lastSummary ? {
          id: lastSummary.id,
          patientId: lastSummary.patientId,
          visitType: 'NEW_PROBLEM', // Assumption for legacy data
          startedAt: lastSummary.date,
          status: 'completed',
          chiefComplaint: 'Previous Consultation', // Default if missing
          hpi: {},
          redFlagsChecked: true,
          redFlags: [],
          followUpNeeded: false,
          aiAssisted: true,
          diagnosis: lastSummary.summary.split('\n')[0] // Grab first line as pseudo-diagnosis
        } as any : undefined;

        return (
          <VisitTypeSelector
            patientName={loggedInUser?.name || 'Patient'}
            lastVisit={lastVisitMock}
            onSelectType={(type, linkedVisitId) => {
              setSelectedVisitType(type);
              if (type === 'FOLLOW_UP') {
                // In a real app, we'd store linkedVisitId to context
                setAppState(AppState.BASELINE_RECONFIRMATION);
              } else {
                setAppState(AppState.CHAT);
              }
            }}
          />
        );
      }
      case AppState.BASELINE_RECONFIRMATION:
        if (!loggedInUser || !loggedInUser.baseline || !loggedInUser.account) return <div className="text-center p-8"><p>Session required. Please login again.</p><button onClick={handleStartOver} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Back to Login</button></div>;
        return (
          <BaselineReconfirmation
            baseline={loggedInUser.baseline}
            account={loggedInUser.account}
            language={language}
            onConfirm={(updated) => {
              const updatedUser = { ...loggedInUser, baseline: updated };
              setLoggedInUser(updatedUser);
              const updatedUsers = allUsers.map(u => u.id === loggedInUser.id ? updatedUser : u);
              setAllUsers(updatedUsers);
              localStorage.setItem('alshifa_users', encryptData(JSON.stringify(updatedUsers)));
              setAppState(AppState.CHAT);
            }}
            onUpdate={() => {
              // For simplicity, let's say we go to a "profile update" state or just allow them to edit in place.
              // For now, let's just go to CHAT and we can implement the update UI later if needed.
              setAppState(AppState.CHAT);
            }}
          />
        );
      case AppState.CHAT:
        // Ensure we have a patient account structure
        const patientAccount = loggedInUser?.account || (() => {
          // Fallback for guest/test users
          return {
            id: loggedInUser?.id || 'guest',
            demographics: {
              age: 30, // Default for testing
              gender: 'Male'
            },
            baselineData: {
              chronicConditions: [],
              longTermMedications: [],
              allergies: []
            },
            riskProfile: {
              smokingStatus: 'Never',
              alcoholUse: 'None'
            }
          };
        })();

        return (
          <IntakeScreen
            patientAccount={patientAccount}
            currentLanguage={language}
            onExit={() => setAppState(AppState.PATIENT_DASHBOARD)}
            onComplete={(encounter) => {
              // 1. Map encounter results to a PatientSummary
              const newSummary: PatientSummary = {
                patientId: encounter.patientId,
                patientName: loggedInUser?.name || 'Patient',
                appointmentDate: new Date().toISOString().split('T')[0],
                appointmentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                summary: encounter.hpi || encounter.complaintText || 'Medical Intake completed.',
                doctorId: appointment?.doctor.id || SEED_DOCTOR_ID,
                consultationType: appointment?.doctor.id ? 'online' : 'in-house',
                riskClassification: encounter.redFlagsDetected?.length > 0 ? 'Urgent' : 'Routine',
                status: 'Pending',
                intakeMode: selectedVisitType === 'FOLLOW_UP' ? 'follow_up' : 'first_time',
                intakeAnswers: {
                  ...encounter.responses,
                  initialComplaint: (encounter as any).initialComplaint, // Bridge from our orchestrator
                  timeline: (encounter as any).timeline
                },
                soap: {
                  subjective: encounter.hpi || '',
                  objective: 'Vitals stable. See intake details.',
                  assessment: encounter.assessment || '',
                  plan: encounter.plan || ''
                },
                painPoints: encounter.painPoints?.map(p => ({ zoneId: p.zoneId, intensity: p.intensity })),
                risks: encounter.redFlags,
                conditionFocus: encounter.chiefComplaint || encounter.complaintText
              };

              // 2. Save to global state
              const updatedSummaries = [...allPatientSummaries, newSummary];
              setAllPatientSummaries(updatedSummaries);
              localStorage.setItem('alshifa_summaries', encryptData(JSON.stringify(updatedSummaries)));

              toast.success('Intake Completed & Saved!');
              setAppState(AppState.PATIENT_DASHBOARD);
            }}
          />
        );
      case AppState.RECOMMENDATIONS:
        if (!currentIntakeResult) return <div className="text-center p-8">Processing recommendations...</div>;
        return (
          <RecommendationScreen
            intakeResult={currentIntakeResult}
            allDoctors={allDoctors}
            language={language}
            onBack={() => setAppState(AppState.CHAT)}
            onSelectDoctor={(doctor, mode) => {
              setSelectedDoctor(doctor);
              setConsultationMode(mode === 'ONLINE' ? 'online' : 'in-person');
              setAppState(AppState.APPOINTMENT_SCHEDULING);
            }}
          />
        );
      case AppState.ADMIN_DASHBOARD:
        return <CostDashboard onBack={handleStartOver} />;
      default:
        return (
          <div className="text-center p-8">
            <p>Welcome to Alshifa AI. Please visit the portal below:</p>
            <div className="mt-4 flex gap-4 justify-center">
              <button onClick={() => { setCurrentUser({ role: Role.PATIENT, language }); setAppState(AppState.AUTH_CHOICE); }} className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold">Patient Portal</button>
              <button onClick={() => { setCurrentUser({ role: Role.DOCTOR, language }); setAppState(AppState.AUTH_CHOICE); }} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Doctor Portal</button>
            </div>
          </div>
        );
    }
  };

  const handleGoBack = () => {
    // Basic navigation history would be better with a router, but here's a simple state-based one
    const backMap: Record<AppState, AppState> = {
      [AppState.DISCLAIMER]: AppState.DISCLAIMER,
      [AppState.AUTH_CHOICE]: AppState.ROLE_SELECTION,
      [AppState.LOGIN]: AppState.AUTH_CHOICE,
      [AppState.REGISTRATION]: AppState.AUTH_CHOICE,
      [AppState.SESSION_TYPE_SELECTION]: AppState.ROLE_SELECTION,
      [AppState.DOCTOR_SELECTION]: AppState.SESSION_TYPE_SELECTION,
      [AppState.CONSULTATION_MODE_SELECTION]: AppState.DOCTOR_SELECTION,
      [AppState.APPOINTMENT_SCHEDULING]: AppState.CONSULTATION_MODE_SELECTION,
      [AppState.VISIT_TYPE_SELECTION]: AppState.APPOINTMENT_SCHEDULING,
      [AppState.BASELINE_RECONFIRMATION]: AppState.VISIT_TYPE_SELECTION,
      [AppState.CHAT]: AppState.VISIT_TYPE_SELECTION,
      [AppState.HISTORY_VIEW]: AppState.SESSION_TYPE_SELECTION,
      [AppState.RECOMMENDATIONS]: AppState.CHAT,
      [AppState.MEDICATION_DASHBOARD]: AppState.SESSION_TYPE_SELECTION,
      [AppState.PATIENT_DASHBOARD]: AppState.SESSION_TYPE_SELECTION,
      [AppState.DOCTOR_DASHBOARD]: AppState.ROLE_SELECTION,
      [AppState.ADMIN_DASHBOARD]: AppState.ROLE_SELECTION,

      [AppState.PROFILE]: AppState.SESSION_TYPE_SELECTION,
    } as any;

    if (backMap[appState]) setAppState(backMap[appState]);
  };

  // ============================================================================
  // AUTHENTICATION LOADING & LOGIN ENFORCEMENT (AFTER renderContent)
  // ============================================================================

  // Show loading screen while checking authentication
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-600 dark:text-slate-400 font-bold text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // 🔑 ALWAYS RENDER - Simplified Auth Flow (No Deadlock)
  if (!authUser || !loggedInUser) {
    return (
      <ErrorBoundary componentName="UnauthenticatedApp">
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
          {/* Language Switcher - Fixed top-right */}
          <div className="fixed top-4 right-4 z-50">
            <LanguageSwitcher />
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black text-cyan-600 dark:text-cyan-400 mb-2">Alshifa AI</h1>
              <p className="text-slate-600 dark:text-slate-400">Medical Platform</p>
            </div>

            {renderContent()}

            {/* Configuration warnings handled by Supabase initialization */}
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Check disclaimer for authenticated users
  if (!disclaimerAccepted) {
    return (
      <ErrorBoundary componentName="Disclaimer">
        <MedicalDisclaimer
          onAccept={() => {
            localStorage.setItem('alshifa_disclaimer_accepted', 'true');
            setDisclaimerAccepted(true);
            setAppState(AppState.SESSION_TYPE_SELECTION);
          }}
        />
      </ErrorBoundary>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] text-slate-900 overflow-x-hidden p-4 md:p-10">
        <ConsentModal
          isOpen={showModal}
          onAccept={handleAccept}
          onDecline={handleDecline}
          language={language}
        />
        {showAISettings && (
          <AIProviderSelector onClose={() => setShowAISettings(false)} />
        )}
        <div className="max-w-6xl mx-auto bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
          <header className="bg-gradient-to-r from-[#17a2b8] to-[#138496] p-6 md:p-8 text-white relative">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Language Switcher - Premium Style */}
              <div className="flex gap-2">
                <button
                  onClick={() => { /* setLanguage is in LanguageSwitcher but we can trigger it here */ }}
                  className="bg-white/20 border-2 border-white text-white px-4 py-1.5 rounded-full text-sm font-bold hover:scale-105 transition-transform"
                >
                  <LanguageSwitcher />
                </button>
              </div>

              {/* Title Section */}
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-black mb-1 drop-shadow-md">Alshifa AI</h1>
                <p className="text-sm md:text-lg opacity-90 font-medium">{strings.appSubtitle}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleGoBack}
                  className="bg-white/20 border-2 border-white text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white hover:text-[#17a2b8] transition-all disabled:opacity-50"
                  disabled={appState === AppState.ROLE_SELECTION}
                >
                  {language === 'ur' ? '← واپس' : '← Back'}
                </button>
                <button
                  onClick={handleStartOver}
                  className="bg-white/20 border-2 border-white text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white hover:text-[#17a2b8] transition-all"
                >
                  {language === 'ur' ? 'نیا انٹیک' : 'New Intake'}
                </button>
                <NotificationBell onNavigate={(s) => setAppState(s)} />
              </div>
            </div>
          </header>

          <main className="p-6 md:p-12 min-h-[500px]">
            {renderContent()}
          </main>

          {/* Persistent Reset Utility (Footer) */}
          <footer className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center">
            <ResetDataButton />
          </footer>
        </div>

        {/* Floating Debug Tools */}
        <div className="fixed bottom-4 right-4 flex gap-2">
          <button
            onClick={() => setShowAISettings(true)}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all backdrop-blur-sm"
            title="AI Settings"
          >
            AI
          </button>
          {/* 
          <button
            onClick={() => setShowBodyMapTest(!showBodyMapTest)}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all backdrop-blur-sm ${showBodyMapTest
              ? 'bg-cyan-500 text-white'
              : 'bg-white/10 text-white/50 border border-white/20'
              }`}
          >
            {showBodyMapTest ? 'Close Map Test' : 'Test Body Map'}
          </button>
          */}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
