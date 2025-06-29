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

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const testId = params.testId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctAnswer: number;
    userAnswer: number;
  } | null>(null);

  useEffect(() => {
    if (userId && testId) {
      fetchData();
    }
  }, [userId, testId]);

  const fetchData = async () => {
    try {
      // Загружаем пользователя
      const userResponse = await fetch('/api/users');
      const users = await userResponse.json();
      const currentUser = users.find((u: User) => u.id === parseInt(userId));
      setUser(currentUser || null);

      // Загружаем тест
      const testResponse = await fetch('/api/tests');
      const tests = await testResponse.json();
      const currentTest = tests.find((t: Test) => t.id === parseInt(testId));
      setTest(currentTest || null);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          testId: parseInt(testId),
          userAnswer: selectedAnswer,
        }),
      });

      const resultData = await response.json();
      setResult({
        isCorrect: resultData.isCorrect,
        correctAnswer: resultData.correctAnswer,
        userAnswer: selectedAnswer,
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextTest = () => {
    router.push(`/tests/${userId}`);
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

  if (!user || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Тест не знайдено</h1>
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
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Проходження тесту
              </h1>
              <p className="text-gray-600 mt-2">
                Користувач: {user.username} | Розділ: {test.section}
              </p>
            </div>
            <Link
              href={`/tests/${userId}`}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Назад до тестів
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            {!result ? (
              <>
                {/* Вопрос */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    {test.question}
                  </h2>
                </div>

                {/* Варианты ответов */}
                <div className="space-y-4 mb-8">
                  {test.answers.map((answer, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedAnswer === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={index}
                        checked={selectedAnswer === index}
                        onChange={() => setSelectedAnswer(index)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                        selectedAnswer === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswer === index && (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-gray-800 text-lg">{answer}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Кнопка отправки */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null || submitting}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-medium"
                  >
                    {submitting ? 'Перевірка...' : 'Відповісти'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Результат */}
                <div className="text-center mb-8">
                  <div className={`text-6xl mb-4 ${result.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {result.isCorrect ? '✅' : '❌'}
                  </div>
                  <h2 className={`text-3xl font-bold mb-2 ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {result.isCorrect ? 'Правильно!' : 'Неправильно'}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Ваша відповідь: {String.fromCharCode(65 + result.userAnswer)}
                  </p>
                  {!result.isCorrect && (
                    <p className="text-gray-600 text-lg">
                      Правильна відповідь: {String.fromCharCode(65 + result.correctAnswer)}
                    </p>
                  )}
                </div>

                {/* Правильный ответ с объяснением */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Правильна відповідь:
                  </h3>
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-600 mr-3">
                      {String.fromCharCode(65 + result.correctAnswer)}
                    </span>
                    <span className="text-gray-800 text-lg">
                      {test.answers[result.correctAnswer]}
                    </span>
                  </div>
                </div>

                {/* Кнопки навигации */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleNextTest}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    До наступного тесту
                  </button>
                  <Link
                    href={`/dashboard/${userId}`}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    До дашборду
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 