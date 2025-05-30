'use client';

import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../features/auth/api';
import { UserProfileDto } from '../types/user';



export default function Dashboard() {
  const { data, isLoading, error, refetch } = useQuery<UserProfileDto>({
    queryKey: ['user-profile'],
    queryFn: getProfile,
    retry: false,
  });

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
      {isLoading && <p>Loading your profile...</p>}
      {error && <div className="text-red-500 mb-4">Failed to load profile.</div>}
      {data && (
        <div>
          <p><b>Username:</b> {data.username}</p>
          <p><b>Email:</b> {data.email}</p>
        </div>
      )}
      <button
        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        onClick={() => refetch()}
      >
        Refresh profile
      </button>
    </div>
  );
}