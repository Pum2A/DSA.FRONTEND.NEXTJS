'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import apiService from '../lib/api';
import { ModuleDto, ModuleListResponse } from '../types/lessons';

export default function ModulesPage() {
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiService.lessons.getAllModules()
      .then((res: ModuleListResponse) => {
        setModules(res.modules ?? []);
        setLoading(false);
      })
      .catch(err => {
        setError('Nie udało się pobrać listy modułów.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Ładowanie modułów...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dostępne moduły</h1>
      <ul className="space-y-4">
        {modules.map(module => (
          <li key={module.id} className="border rounded p-4 hover:bg-gray-50">
            <h2 className="font-semibold text-lg">{module.title}</h2>
            <p className="text-gray-600 mb-2">{module.description}</p>
            <Link href={`/modules/${module.id}`}>
              <span className="text-blue-600 hover:underline">Zobacz moduł →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}