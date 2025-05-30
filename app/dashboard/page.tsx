'use client';

import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import apiService from '../lib/api';
import { UserProgressResponse } from '../types/lessons';

export default function Dashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await apiService.user.getProgress();
        setProgress(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load progress data');
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Your Progress
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Keep learning and improving your DSA skills.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                {loading ? (
                  <div className="py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-500">Loading your progress...</p>
                  </div>
                ) : error ? (
                  <div className="py-10 text-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : (
                  <>
                    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">XP Points</dt>
                        <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                          {user?.xpPoints || 0}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Current Streak</dt>
                        <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                          {user?.currentStreak || 0} days
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Max Streak</dt>
                        <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                          {user?.maxStreak || 0} days
                        </dd>
                      </div>
                    </dl>

                    {progress && (
                      <div className="mt-8">
                        <div className="mb-2 flex justify-between items-end">
                          <h4 className="text-lg font-medium text-gray-900">Overall Progress</h4>
                          <p className="text-sm text-gray-500">{progress.overallProgressPercentage}% Complete</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress.overallProgressPercentage}%` }}></div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-gray-700">Lessons</h5>
                            <p className="text-sm text-gray-500">{progress.completedLessons} of {progress.totalLessons} completed</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-700">Quizzes</h5>
                            <p className="text-sm text-gray-500">{progress.completedQuizzes} of {progress.totalQuizzes} completed</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {progress && progress.moduleProgresses.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Modules</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {progress.moduleProgresses.map((module) => (
                            <div key={module.id} className="border rounded-lg p-4">
                              <div className="flex justify-between">
                                <h5 className="font-medium text-gray-800">{module.title}</h5>
                                <span className={`px-2 py-1 text-xs rounded-full ${module.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {module.isCompleted ? 'Completed' : 'In Progress'}
                                </span>
                              </div>
                              <div className="mt-2 mb-1 flex justify-between items-end">
                                <p className="text-sm text-gray-500">
                                  {module.completedLessons}/{module.totalLessons} lessons • 
                                  {module.completedQuizzes}/{module.totalQuizzes} quizzes
                                </p>
                                <p className="text-sm text-gray-500">{module.progressPercentage}%</p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${module.progressPercentage}%` }}></div>
                              </div>
                              <div className="mt-3">
                                <Link href={`/modules/${module.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                  Continue learning →
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}