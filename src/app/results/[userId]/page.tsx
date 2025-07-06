'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface User {
  id: number;
  username: string;
  created_at: string;
}

interface Result {
  id: number;
  user_id: number;
  test_id: number;
  user_answer: number;
  is_correct: boolean;
  answered_at: string;
  section?: string;
  question?: string;
  answers?: string[];
  correct?: number;
}

export default function Results() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      // Загружаем пользователя
      const userResponse = await fetch('/api/users');
      const users = await userResponse.json();
      const currentUser = users.find((u: User) => u.id === parseInt(userId));
      setUser(currentUser || null);

      // Загружаем результаты
      const resultsResponse = await fetch(`/api/results?userId=${userId}`);
      const resultsData = await resultsResponse.json();
      setResults(resultsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
                Історія відповідей
              </h1>
              <p className="text-gray-600 mt-2">
                Користувач: {user.username}
              </p>
            </div>
            <Link
              href={`/dashboard/${userId}`}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Назад до дашборду
            </Link>
          </div>

          {results.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Поки що немає результатів
              </h2>
              <p className="text-gray-600 mb-6">
                Пройдіть тести, щоб побачити історію відповідей
              </p>
              <Link
                href={`/tests/${userId}`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Пройти тести
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((result) => (
                <div key={result.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.is_correct 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.is_correct ? 'Правильно' : 'Неправильно'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {result.section}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(result.answered_at).toLocaleString('uk-UA')}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-800 mb-3">
                        {result.question}
                      </h3>
                    </div>
                  </div>

                  {result.answers && (
                    <div className="space-y-2 mb-4">
                      {result.answers.map((answer, index) => (
                        <div
                          key={index}
                          className={`flex items-center p-3 rounded-lg ${
                            index === result.user_answer
                              ? result.is_correct
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                              : index === result.correct
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                            index === result.user_answer
                              ? result.is_correct
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                              : index === result.correct
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-gray-800">{answer}</span>
                          
                          {index === result.user_answer && (
                            <span className="ml-auto text-sm font-medium">
                              {result.is_correct ? '✅ Ваша відповідь' : '❌ Ваша відповідь'}
                            </span>
                          )}
                          
                          {index === result.correct && !result.is_correct && (
                            <span className="ml-auto text-sm font-medium text-green-600">
                              ✅ Правильна відповідь
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Тест #{result.test_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 