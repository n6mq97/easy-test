'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  created_at: string;
}

interface Test {
  id: number;
  section: string;
  question: string;
  answers: string[];
  correct: number;
  created_at: string;
}

interface TestStats {
  testId: number;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
}

export default function Tests() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [tests, setTests] = useState<Test[]>([]);
  const [testStats, setTestStats] = useState<TestStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserAndSections();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedSection) {
      fetchTestsBySection();
    }
  }, [selectedSection]);

  const fetchUserAndSections = async () => {
    try {
      // Загружаем пользователя
      const userResponse = await fetch('/api/users');
      const users = await userResponse.json();
      const currentUser = users.find((u: User) => u.id === parseInt(userId));
      setUser(currentUser || null);

      // Загружаем разделы
      const sectionsResponse = await fetch('/api/sections');
      const sectionsData = await sectionsResponse.json();
      setSections(sectionsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestsBySection = async () => {
    try {
      const response = await fetch(`/api/tests?section=${encodeURIComponent(selectedSection)}`);
      const testsData = await response.json();
      setTests(testsData);
      
      // Загружаем статистику для каждого теста
      const statsPromises = testsData.map(async (test: Test) => {
        const statsResponse = await fetch(`/api/results?userId=${userId}&testId=${test.id}`);
        const statsData = await statsResponse.json();
        return {
          testId: test.id,
          totalAttempts: statsData.length,
          correctAnswers: statsData.filter((r: any) => r.is_correct).length,
          accuracy: statsData.length > 0 ? (statsData.filter((r: any) => r.is_correct).length / statsData.length) * 100 : 0
        };
      });
      
      const stats = await Promise.all(statsPromises);
      setTestStats(stats);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-500';
    if (accuracy >= 60) return 'bg-yellow-500';
    if (accuracy >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTestStats = (testId: number) => {
    return testStats.find(stat => stat.testId === testId) || { totalAttempts: 0, correctAnswers: 0, accuracy: 0 };
  };

  const copyQuestionsToClipboard = async () => {
    if (tests.length === 0) return;
    
    const questions = tests.map(test => test.question).join('\n');
    
    try {
      await navigator.clipboard.writeText(questions);
      // Можно добавить уведомление об успешном копировании
      alert('Питання скопійовано у буфер обміну!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = questions;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Питання скопійовано у буфер обміну!');
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
                Пройти тести
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

          {sections.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Поки що немає тестів
              </h2>
              <p className="text-gray-600 mb-6">
                Додайте тести, щоб почати проходження
              </p>
              <Link
                href={`/add-tests/${userId}`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Додати тести
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Список разделов */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Розділи тестів
                  </h2>
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section}
                        onClick={() => setSelectedSection(section)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedSection === section
                            ? 'bg-blue-100 border-blue-300 text-blue-800'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{section}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Список тестов */}
              <div className="lg:col-span-3">
                {selectedSection ? (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {selectedSection}
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={copyQuestionsToClipboard}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Скопіювати питання у буфер
                        </button>
                        <button
                          onClick={() => router.push(`/tests/${userId}/carousel?section=${encodeURIComponent(selectedSection)}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Карусельний режим
                        </button>
                      </div>
                    </div>
                    
                    {tests.length === 0 ? (
                      <p className="text-gray-600">У цьому розділі поки що немає тестів</p>
                    ) : (
                      <div className="space-y-4">
                        {tests.map((test) => {
                          const stats = getTestStats(test.id);
                          return (
                            <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-medium text-gray-800 flex-1">
                                  {test.question}
                                </h3>
                                {stats.totalAttempts > 0 && (
                                  <div className="flex items-center ml-4">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${getAccuracyColor(stats.accuracy)}`}>
                                      {Math.round(stats.accuracy)}%
                                    </div>
                                    <span className="text-xs text-gray-500 ml-2">
                                      {stats.correctAnswers}/{stats.totalAttempts}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                {test.answers.map((answer, index) => (
                                  <div key={index} className="flex items-center">
                                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                                      {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="text-gray-700">{answer}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4">
                                <Link
                                  href={`/test/${userId}/${test.id}`}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                                >
                                  Пройти тест
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-4xl mb-4">📋</div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Виберіть розділ
                    </h2>
                    <p className="text-gray-600">
                      Оберіть розділ зліва, щоб побачити доступні тести
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 