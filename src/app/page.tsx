'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  username: string;
  created_at: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername }),
      });

      if (response.ok) {
        setNewUsername('');
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to create user:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            Easy Test - Система проходження тестів
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Вибір користувача */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Виберіть користувача
              </h2>
              
              {users.length === 0 ? (
                <p className="text-gray-600 mb-4">Поки що немає користувачів</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/dashboard/${user.id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="font-medium text-gray-800">{user.username}</div>
                      <div className="text-sm text-gray-500">
                        Створено: {new Date(user.created_at).toLocaleDateString('uk-UA')}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Форма створення нового користувача */}
              <form onSubmit={createUser} className="space-y-3">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Новий користувач
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Введіть ім'я користувача"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Створити користувача
                </button>
              </form>
            </div>

            {/* Інформація про додаток */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Про додаток
              </h2>
              
              <div className="space-y-4 text-gray-600">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Функції:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Проходження тестів з варіантами відповідей</li>
                    <li>• Статистика по кожному користувачу</li>
                    <li>• Групування тестів за розділами</li>
                    <li>• Додавання тестів з буфера обміну</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Як додати тести:</h3>
                  <ol className="space-y-1 text-sm">
                    <li>1. Виберіть користувача</li>
                    <li>2. Перейдіть до розділу "Додати тести"</li>
                    <li>3. Вставте JSON з буфера обміну</li>
                    <li>4. Натисніть "Додати тести"</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
