// Doctor Recommendation UI Component
// React + TypeScript - Mobile-First Design

import React, { useState, useEffect } from 'react';
import type { Doctor, IntakeResult, ScoredDoctor, ConsultationMode } from '../types';

interface DoctorRecommendationProps {
  intake: IntakeResult;
  onBookDoctor?: (doctorId: string, mode: ConsultationMode) => void;
}

export const DoctorRecommendation: React.FC<DoctorRecommendationProps> = ({
  intake,
  onBookDoctor
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ConsultationMode>('ONLINE');
  const [recommendations, setRecommendations] = useState<ScoredDoctor[]>([]);
  const [safetyWarnings, setSafetyWarnings] = useState<string[]>([]);

  useEffect(() => {
    fetchRecommendations();
  }, [intake, selectedMode]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intake,
          mode: selectedMode,
          limit: 5,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresPhysical) {
          // Online blocked, switch to physical
          setSelectedMode('PHYSICAL');
          setSafetyWarnings([data.message]);
        } else {
          throw new Error(data.error || 'Failed to fetch recommendations');
        }
        return;
      }

      setRecommendations(data.data.doctors);
      setSafetyWarnings(data.data.safetyWarnings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (doctorId: string) => {
    if (onBookDoctor) {
      onBookDoctor(doctorId, selectedMode);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          🩺 Recommended Doctors
        </h1>
        <p className="text-gray-600">
          Based on your symptoms & safety guidelines
        </p>
      </div>

      {/* Safety Warnings */}
      {safetyWarnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Important Safety Information
              </h3>
              {safetyWarnings.map((warning, index) => (
                <p key={index} className="text-yellow-800 text-sm">
                  {warning}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setSelectedMode('ONLINE')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${selectedMode === 'ONLINE'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600'
            }`}
        >
          💻 Online
        </button>
        <button
          onClick={() => setSelectedMode('PHYSICAL')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${selectedMode === 'PHYSICAL'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600'
            }`}
        >
          🏥 In-Person
        </button>
      </div>

      {/* Doctor Cards */}
      {recommendations.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No doctors available for this consultation type.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try switching to {selectedMode === 'ONLINE' ? 'In-Person' : 'Online'} consultation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map(({ doctor, score, scoreBreakdown }) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              score={score}
              mode={selectedMode}
              onBook={() => handleBooking(doctor.id)}
            />
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <p>
          All doctors are verified and licensed.
          <br />
          Recommendations based on specialty match, availability, and ratings.
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// DOCTOR CARD COMPONENT
// =============================================================================

interface DoctorCardProps {
  doctor: Doctor;
  score: number;
  mode: ConsultationMode;
  onBook: () => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  score,
  mode,
  onBook,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start space-x-4">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <img
            src={doctor.profileImage || '/default-doctor.png'}
            alt={doctor.fullName}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {doctor.fullName}
          </h3>
          <p className="text-sm text-gray-600">
            {doctor.specialties.join(', ')} • {doctor.experienceYears} yrs
          </p>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {mode === 'ONLINE' && doctor.onlineSchedule && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🟢 Online Today
              </span>
            )}

            {doctor.languages.includes('UR') && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                🗣️ {doctor.languages.join(' / ')}
              </span>
            )}

            {doctor.verified && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                ✓ Verified
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center mt-2">
            <span className="text-yellow-500">⭐</span>
            <span className="ml-1 text-sm font-medium text-gray-900">
              {doctor.ratings.average.toFixed(1)}
            </span>
            <span className="ml-1 text-sm text-gray-500">
              ({doctor.ratings.count} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Clinic Info (Physical Mode) */}
      {mode === 'PHYSICAL' && doctor.clinics && doctor.clinics.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-900">
            📍 {doctor.clinics[0].name}
          </p>
          <p className="text-sm text-gray-600">
            {doctor.clinics[0].city} • Fee: PKR {doctor.clinics[0].consultationFee}
          </p>
        </div>
      )}

      {/* Bio */}
      {doctor.bio && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          {doctor.bio}
        </p>
      )}

      {/* Book Button */}
      <button
        onClick={onBook}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        Book Consultation
      </button>
    </div>
  );
};

export default DoctorRecommendation;
