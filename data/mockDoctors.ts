import { Doctor } from '../types/doctor_v2';

export const MOCK_DOCTORS: Doctor[] = [
    {
        id: 'dr_1',
        fullName: 'Dr. Ayesha Khan',
        licenseNumber: 'PMC-12345',
        verified: true,
        specialties: ['GYNECOLOGY', 'GENERAL_MEDICINE'],
        consultationModes: ['ONLINE', 'PHYSICAL'],
        ageGroups: ['ADULT'],
        genderCare: 'FEMALE',
        languages: ['EN', 'UR'],
        experienceYears: 12,
        ratings: { average: 4.8, count: 156 },
        active: true,
        createdAt: new Date(),
        clinics: [
            {
                id: 'c1',
                name: 'Al-Noor Clinic',
                city: 'Islamabad',
                address: 'Sector F-8, Street 12',
                geo: { lat: 33.7, lng: 73.0 },
                consultationFee: 1500,
                schedule: { monday: [{ start: "09:00", end: "13:00" }] }
            }
        ],
        onlineSchedule: { monday: [{ start: "18:00", end: "21:00" }] }
    },
    {
        id: 'dr_2',
        fullName: 'Dr. Haris Naveed',
        licenseNumber: 'PMC-33445',
        verified: true,
        specialties: ['NEUROLOGY', 'GENERAL_MEDICINE'],
        consultationModes: ['ONLINE', 'PHYSICAL'],
        ageGroups: ['ADULT', 'ALL'],
        languages: ['EN', 'UR'],
        experienceYears: 18,
        ratings: { average: 4.9, count: 215 },
        active: true,
        createdAt: new Date(),
        clinics: [
            {
                id: 'c6',
                name: 'Neurology Care',
                city: 'Lahore',
                address: 'Jail Road',
                geo: { lat: 31.5, lng: 74.3 },
                consultationFee: 3000,
                schedule: { monday: [{ start: "16:00", end: "20:00" }] }
            }
        ],
        onlineSchedule: { monday: [{ start: "21:00", end: "23:00" }] }
    },
    {
        id: 'dr_3',
        fullName: 'Dr. Omar Farooq',
        licenseNumber: 'PMC-44556',
        verified: true,
        specialties: ['GASTROENTEROLOGY', 'GENERAL_MEDICINE'],
        consultationModes: ['ONLINE'],
        ageGroups: ['ADULT'],
        languages: ['EN', 'UR'],
        experienceYears: 15,
        ratings: { average: 4.6, count: 112 },
        active: true,
        createdAt: new Date(),
        onlineSchedule: { monday: [{ start: "09:00", end: "22:00" }] }
    },
    {
        id: 'dr_4',
        fullName: 'Dr. Zainab Bilal',
        licenseNumber: 'PMC-11223',
        verified: true,
        specialties: ['PEDIATRICS'],
        consultationModes: ['ONLINE', 'PHYSICAL'],
        ageGroups: ['PEDIATRIC'],
        languages: ['EN', 'UR'],
        experienceYears: 8,
        ratings: { average: 4.7, count: 89 },
        active: true,
        createdAt: new Date(),
        clinics: [
            {
                id: 'c3',
                name: 'Kids Care Clinic',
                city: 'Lahore',
                address: 'Gulberg III, Main Blvd',
                geo: { lat: 31.5, lng: 74.3 },
                consultationFee: 1200,
                schedule: { monday: [{ start: "14:00", end: "18:00" }] }
            }
        ]
    }
];
