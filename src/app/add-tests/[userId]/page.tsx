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
  section: string;
  question: string;
  answers: string[];
  correct: number;
}

export default function AddTests() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      const currentUser = users.find((u: User) => u.id === parseInt(userId));
      setUser(currentUser || null);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Парсим JSON
      let tests: Test[];
      try {
        tests = JSON.parse(jsonInput);
        if (!Array.isArray(tests)) {
          throw new Error('JSON повинен бути масивом');
        }
      } catch (parseError) {
        setError('Неправильний формат JSON. Перевірте синтаксис.');
        setSubmitting(false);
        return;
      }

      // Валидируем структуру тестов
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        if (!test.section || !test.question || !Array.isArray(test.answers) || typeof test.correct !== 'number') {
          setError(`Тест ${i + 1}: відсутні обов'язкові поля (section, question, answers, correct)`);
          setSubmitting(false);
          return;
        }
        if (test.correct < 0 || test.correct >= test.answers.length) {
          setError(`Тест ${i + 1}: індекс правильної відповіді поза межами масиву відповідей`);
          setSubmitting(false);
          return;
        }
      }

      // Отправляем на сервер
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tests),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`Успішно додано ${result.added} тестів!`);
        setJsonInput('');
      } else {
        setError(result.error || 'Помилка при додаванні тестів');
      }
    } catch (error) {
      setError('Помилка при обробці запиту');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
    } catch (error) {
      setError('Не вдалося отримати дані з буфера обміну');
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
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Додати тести
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

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Додати тести з буфера обміну
            </h2>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Формат JSON:</h3>
              <pre className="text-sm text-blue-700 bg-blue-100 p-3 rounded overflow-x-auto">
{`[
  {
    "section": "Назва розділу",
    "question": "Питання",
    "answers": ["Відповідь 1", "Відповідь 2", "Відповідь 3", "Відповідь 4"],
    "correct": 2
  }
]`}
              </pre>
              <p className="text-sm text-blue-600 mt-2">
                <strong>correct</strong> - індекс правильної відповіді (починається з 0)
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="jsonInput" className="block text-sm font-medium text-gray-700 mb-2">
                  JSON з тестами:
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Вставити з буфера
                  </button>
                  <button
                    type="button"
                    onClick={() => setJsonInput('')}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    Очистити
                  </button>
                </div>
                <textarea
                  id="jsonInput"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Вставте JSON з тестами або введіть вручну..."
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting || !jsonInput.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Додавання...' : 'Додати тести'}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push(`/tests/${userId}`)}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Пройти тести
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 