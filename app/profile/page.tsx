'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfileDto } from '../types/user';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
    if (user) {
      setProfile(user);
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading || !profile) {
    return <div className="p-6 text-center">Ładowanie profilu...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Twój profil</h1>
      <div className="flex items-center mb-4">
        {profile.avatar && (
          <img src={profile.avatar} alt="avatar" className="w-16 h-16 rounded-full mr-4" />
        )}
        <div>
          <div className="font-semibold">{profile.username}</div>
          <div className="text-gray-500 text-sm">{profile.email}</div>
        </div>
      </div>
      <div className="mb-2">Zweryfikowany email: <b>{profile.emailVerified ? 'Tak' : 'Nie'}</b></div>
      <div className="mb-2">XP: <b>{profile.xpPoints}</b></div>
      <div className="mb-2">Streak: <b>{profile.currentStreak} / {profile.maxStreak}</b></div>
      {/* Dodaj inne statystyki, jeśli masz */}
      <div className="mt-6">
        <h2 className="font-bold mb-2">Statystyki</h2>
        <ul className="list-disc list-inside">
          <li>Ukończone lekcje: {profile.stats?.completedLessons ?? '-'}</li>
          <li>Ukończone moduły: {profile.stats?.completedModules ?? '-'}</li>
          <li>Ukończone quizy: {profile.stats?.completedQuizzes ?? '-'}</li>
          <li>Średni wynik quizów: {profile.stats?.averageQuizScore ?? '-'}</li>
          <li>Ranking: {profile.stats?.ranking ?? '-'}</li>
        </ul>
      </div>
    </div>
  );
}