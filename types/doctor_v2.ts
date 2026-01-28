import { Language } from '../types';
import { ComplaintType } from './recommendation';

export type Specialty =
    | 'GENERAL_MEDICINE'
    | 'PEDIATRICS'
    | 'GYNECOLOGY'
    | 'CARDIOLOGY'
    | 'DERMATOLOGY'
    | 'ORTHOPEDICS'
    | 'ENT'
    | 'PSYCHIATRY'
    | 'NEUROLOGY'
    | 'GASTROENTEROLOGY'
    | 'UROLOGY';

export type ConsultationMode = 'ONLINE' | 'PHYSICAL';
export type AgeGroup = 'ADULT' | 'PEDIATRIC' | 'ALL';
export type GenderCare = 'MALE' | 'FEMALE' | 'ALL';

export interface TimeSlot {
    start: string;
    end: string;
}

export interface WeeklySchedule {
    monday?: TimeSlot[];
    tuesday?: TimeSlot[];
    wednesday?: TimeSlot[];
    thursday?: TimeSlot[];
    friday?: TimeSlot[];
    saturday?: TimeSlot[];
    sunday?: TimeSlot[];
}

export interface GeoLocation {
    lat: number;
    lng: number;
}

export interface Clinic {
    id: string;
    name: string;
    city: string;
    address: string;
    geo: GeoLocation;
    consultationFee: number;
    phoneNumber?: string;
    schedule: WeeklySchedule;
}

export interface Doctor {
    id: string;
    fullName: string;
    licenseNumber: string;
    verified: boolean;
    specialties: Specialty[];
    consultationModes: ConsultationMode[];
    ageGroups: AgeGroup[];
    genderCare?: GenderCare;
    languages: Language[];
    experienceYears: number;
    clinics?: Clinic[];
    onlineSchedule?: WeeklySchedule;
    ratings: {
        average: number;
        count: number;
    };
    profileImage?: string;
    bio?: string;
    active: boolean;
    createdAt: Date;
    updatedAt?: Date;
}
