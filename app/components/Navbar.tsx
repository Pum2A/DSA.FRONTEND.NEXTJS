'use client';

import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-indigo-700 p-4 flex justify-between items-center text-white">
      <div>
        <Link href="/dashboard" className="font-bold text-xl mr-6">DSA Dashboard</Link>
        <Link href="/modules" className="mr-4 hover:underline">Modules</Link>
        <Link href="/profile" className="hover:underline">Profile</Link>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="font-semibold">{user.username}</span>
            <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}