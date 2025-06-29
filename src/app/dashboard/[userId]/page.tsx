'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface User {
  id: number;
  username: string;
  created_at: string;
}

interface UserStats {
  total_answered: number;
  correct_answers: number;
  unique_tests_answered: number;
  accuracy: string;
  sectionStats: Array<{
    section: string;
    total_answered: number;
    correct_answers: number;
  }>;
}

export default function Dashboard() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      // Загружаем данные пользователя
      const userResponse = await fetch(`/api/users`);
      const users = await userResponse.json();
      const currentUser = users.find((u: User) => u.id === parseInt(userId));
      setUser(currentUser || null);

      // Загружаем статистику
      const statsResponse = await fetch(`/api/results?userId=${userId}&type=stats`);
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Користувача не знайдено</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Повернутися на головну
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Доброго дня, {user.username}!
              </h1>
              <p className="text-gray-600 mt-2">
                Користувач з {new Date(user.created_at).toLocaleDateString('uk-UA')}
              </p>
            </div>
            <Link
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              На головну
            </Link>
          </div>

          {/* Статистика */}
          {stats && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ваша статистика</h2>
              
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total_answered}</div>
                  <div className="text-sm text-gray-600">Всього відповідей</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.correct_answers}</div>
                  <div className="text-sm text-gray-600">Правильних відповідей</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.unique_tests_answered}</div>
                  <div className="text-sm text-gray-600">Унікальних тестів</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{stats.accuracy}%</div>
                  <div className="text-sm text-gray-600">Точність</div>
                </div>
              </div>

              {stats.sectionStats.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">По розділах:</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stats.sectionStats.map((section, index) => (
                      <div key={index} className="border border-gray-200 p-3 rounded-lg">
                        <div className="font-medium text-gray-800 mb-1">{section.section}</div>
                        <div className="text-sm text-gray-600">
                          {section.correct_answers}/{section.total_answered} правильних
                          ({section.total_answered > 0 ? Math.round(section.correct_answers / section.total_answered * 100) : 0}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Навігація */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href={`/tests/${userId}`}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Пройти тести</h3>
              <p className="text-gray-600">Виберіть розділ та пройдіть тести</p>
            </Link>

            <Link
              href={`/add-tests/${userId}`}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="text-3xl mb-4">➕</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Додати тести</h3>
              <p className="text-gray-600">Додайте нові тести з буфера обміну</p>
            </Link>

            <Link
              href={`/results/${userId}`}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Результати</h3>
              <p className="text-gray-600">Перегляньте детальну історію відповідей</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 