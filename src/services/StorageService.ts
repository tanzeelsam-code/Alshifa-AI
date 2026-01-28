import { encryptData, decryptData } from '../../utils/security';
import { SEED_PATIENT_USER, SEED_DOCTOR_USER, SEED_DOCTOR_PROFILE } from '../intake/data/SeedData';
import { User, DoctorProfile } from '../../types';

/**
 * StorageService
 * Manages persistence for medical data using localStorage with encryption.
 */
export class StorageService {
    private static KEYS = {
        USERS: 'alshifa_users',
        CURRENT_USER: 'alshifa_current_user',
        DOCTORS: 'alshifa_doctors',
        MEDICATIONS: 'alshifa_medications',
        HISTORIES: 'alshifa_histories',
        SUMMARIES: 'alshifa_patient_summaries',
        DISCLAIMER: 'alshifa_disclaimer_accepted'
    };

    /**
     * Initializes the application storage with seed data if empty.
     */
    static initialize() {
        // Initialize Users
        if (!localStorage.getItem(this.KEYS.USERS)) {
            const initialUsers = [SEED_PATIENT_USER, SEED_DOCTOR_USER];
            this.saveItem(this.KEYS.USERS, initialUsers, true);
        }

        // Initialize Doctors
        if (!localStorage.getItem(this.KEYS.DOCTORS)) {
            const initialDoctors = [SEED_DOCTOR_PROFILE];
            this.saveItem(this.KEYS.DOCTORS, initialDoctors, true);
        }
    }

    /**
     * Resets all application data to seed defaults.
     */
    static resetToDefaults() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
        this.initialize();
        window.location.reload();
    }

    /**
     * Saves an item to local storage with optional encryption.
     */
    static saveItem<T>(key: string, value: T, secure: boolean = false) {
        try {
            const stringified = JSON.stringify(value);
            localStorage.setItem(key, secure ? encryptData(stringified) : stringified);
        } catch (error) {
            console.error(`[StorageService] Error saving ${key}:`, error);
        }
    }

    /**
     * Loads an item from local storage with optional decryption.
     */
    static loadItem<T>(key: string, secure: boolean = false): T | null {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;

            const data = secure ? decryptData(stored) : stored;
            return JSON.parse(data);
        } catch (error) {
            console.error(`[StorageService] Error loading ${key}:`, error);
            return null;
        }
    }

    /**
     * Updates the current user profile in the persistent users list.
     */
    static updateProfile(updatedUser: User) {
        const users = this.loadItem<User[]>(this.KEYS.USERS, true) || [];
        const index = users.findIndex(u => u.id === updatedUser.id);

        if (index !== -1) {
            users[index] = updatedUser;
        } else {
            users.push(updatedUser);
        }

        this.saveItem(this.KEYS.USERS, users, true);
    }
}
