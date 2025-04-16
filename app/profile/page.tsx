"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "../store/authStore";
import {
  CalendarDays,
  Mail,
  ChevronRight,
  User,
  UserRound,
  Award,
  Activity,
  Github,
} from "lucide-react";

export default function ProfilePage() {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 border-t-4 border-b-4 border-blue-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Ładowanie profilu...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Nie renderuj nic, zamiast tego przekieruj na stronę logowania
  }

  // Inicjały użytkownika do avatara
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      {/* Nagłówek z gradientowym tłem */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profil użytkownika</h1>
            <p className="mt-2 text-blue-100">
              Zarządzaj swoimi danymi i śledź postępy na platformie.
            </p>
          </div>
          <Button className="mt-4 sm:mt-0 bg-white text-blue-700 hover:bg-blue-50">
            Edytuj profil
          </Button>
        </div>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 mx-auto sm:mx-0 shadow-md">
            {initials || user.userName?.[0] || "?"}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold mb-1 text-gray-800">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-1">
              <UserRound size={16} />
              <span>@{user.userName}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              {user.roles?.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium shadow-sm"
                >
                  {role}
                </span>
              ))}
              {(!user.roles || user.roles.length === 0) && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  Użytkownik
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
          <Activity size={20} className="text-blue-500" />
          Statystyki
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-blue-100">
            <div className="text-sm text-gray-500 font-medium">Poziom</div>
            <div className="text-3xl font-bold text-blue-600">
              {user.level || 1}
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((user.experiencePoints || 0) % 1000) / 10
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                <span>0 XP</span>
                <span>{user.experiencePoints || 0}/1000 XP</span>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-green-100">
            <div className="text-sm text-gray-500 font-medium">
              Punkty doświadczenia
            </div>
            <div className="text-3xl font-bold text-green-600">
              {user.experiencePoints || 0}
            </div>
            <div className="mt-3 text-sm text-gray-500">
              <p className="flex items-center gap-1">
                <Award size={14} className="text-green-500" />
                Zdobywaj punkty, rozwiązując zadania
              </p>
            </div>
          </div>
          <div className="bg-purple-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-purple-100">
            <div className="text-sm text-gray-500 font-medium">Role</div>
            <div className="text-xl font-bold text-purple-600 truncate">
              {user.roles?.join(", ") || "Użytkownik"}
            </div>
            <div className="mt-3 text-sm text-gray-500">
              <p className="flex items-center gap-1">
                <Github size={14} className="text-purple-500" />
                Dostęp do funkcji na platformie
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
            <User size={20} className="text-blue-500" />
            Informacje osobiste
          </h2>
          <dl className="grid grid-cols-1 gap-y-5">
            <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block"></span>
                Imię
              </dt>
              <dd className="mt-1 text-lg font-medium text-gray-700">
                {user.firstName || "—"}
              </dd>
            </div>
            <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block"></span>
                Nazwisko
              </dt>
              <dd className="mt-1 text-lg font-medium text-gray-700">
                {user.lastName || "—"}
              </dd>
            </div>
            <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block"></span>
                Nazwa użytkownika
              </dt>
              <dd className="mt-1 text-lg font-medium text-gray-700">
                {user.userName || "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
            <Mail size={20} className="text-blue-500" />
            Informacje kontaktowe
          </h2>
          <dl className="grid grid-cols-1 gap-y-5">
            <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block"></span>
                Email
              </dt>
              <dd className="mt-1 text-lg font-medium text-gray-700">
                {user.email || "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-8 border border-gray-100 hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
          <CalendarDays size={20} className="text-blue-500" />
          Ostatnia aktywność
        </h2>
        <div className="rounded-xl overflow-hidden border border-gray-200 divide-y">
          <div className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                <User size={16} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">
                  Dołączenie do platformy
                </h3>
                <p className="text-sm text-gray-500">
                  Witamy w społeczności DSA Learning!
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-400 flex items-center gap-1">
              <span>Dzisiaj</span>
              <ChevronRight size={16} />
            </div>
          </div>

          {/* Można dodać więcej aktywności w miarę rozwijania aplikacji */}

          {user.roles?.includes("Admin") && (
            <div className="p-4 hover:bg-blue-50 transition-colors flex justify-between items-center bg-blue-50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 flex-shrink-0">
                  <Award size={16} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    Przyznano rolę administratora
                  </h3>
                  <p className="text-sm text-gray-500">
                    Masz dostęp do panelu administracyjnego
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-1">
                <span>Dzisiaj</span>
                <ChevronRight size={16} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
