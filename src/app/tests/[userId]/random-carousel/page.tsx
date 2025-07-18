"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Test {
  id: number;
  section: string;
  question: string;
  answers: string[];
  correct: number;
  created_at: string;
}

export default function RandomCarousel() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [tests, setTests] = useState<Test[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<
    { isCorrect: boolean; correct: number; user: number }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRandomTests();
  }, [userId]);

  const fetchRandomTests = async () => {
    try {
      const response = await fetch("/api/tests?random=true&limit=20");
      const data = await response.json();
      setTests(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch random tests:", error);
      setLoading(false);
    }
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return; // нельзя менять после выбора
    setSelected(idx);
    setSubmitting(true);

    const requestData = {
      userId: parseInt(userId),
      testId: tests[current].id,
      userAnswer: idx,
    };

    console.log("Sending result:", requestData);

    // Сохраняем результат
    fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    })
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Response data:", data);
        setResults((prev) => [
          ...prev,
          { isCorrect: data.isCorrect, correct: data.correctAnswer, user: idx },
        ]);
        setSubmitting(false);
      })
      .catch((error) => {
        console.error("Failed to save result:", error);
        setSubmitting(false);
      });
  };

  const handleNext = () => {
    setSelected(null);
    setCurrent((c) => c + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Завантаження випадкових тестів...
          </p>
        </div>
      </div>
    );
  }

  if (!tests.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Немає доступних тестів</h2>
          <p className="text-gray-600 mb-4">
            Додайте тести, щоб почати рандомну карусель
          </p>
          <Link
            href={`/tests/${userId}`}
            className="text-blue-600 hover:underline"
          >
            Повернутися до вибору розділу
          </Link>
        </div>
      </div>
    );
  }

  if (current >= tests.length) {
    // Экран результата
    const correctCount = results.filter((r) => r.isCorrect).length;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl w-full text-center">
          <h2 className="text-3xl font-bold mb-4">
            Результат рандомної каруселі
          </h2>
          <div className="text-2xl mb-2">
            Правильних відповідей:{" "}
            <span className="font-bold text-green-600">{correctCount}</span> з{" "}
            {tests.length}
          </div>
          <div className="mb-6">
            Точність:{" "}
            <span className="font-bold text-blue-600">
              {((correctCount / tests.length) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setCurrent(0);
                setResults([]);
                setSelected(null);
                fetchRandomTests();
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Нова карусель
            </button>
            <button
              onClick={() => router.push(`/tests/${userId}`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              До розділів
            </button>
          </div>
        </div>
      </div>
    );
  }

  const test = tests[current];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl w-full">
        <div className="mb-4 text-gray-500 text-sm">
          Питання {current + 1} з {tests.length} | Рандомна карусель
        </div>

        <div className="mb-2 text-sm text-gray-600">
          Розділ:{" "}
          <span className="font-semibold text-gray-700">{test.section}</span>
        </div>

        <h2 className="text-2xl font-bold mb-6">{test.question}</h2>

        <div className="space-y-3 mb-6">
          {test.answers.map((answer, idx) => {
            let color = "border-gray-200 hover:border-gray-300";
            if (selected !== null) {
              if (idx === test.correct) color = "border-green-500 bg-green-50";
              if (idx === selected && idx !== test.correct)
                color = "border-red-500 bg-red-50";
            }
            return (
              <button
                key={idx}
                disabled={selected !== null}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 border-2 rounded-lg transition-colors focus:outline-none ${color} ${
                  selected === idx ? "ring-2 ring-blue-400" : ""
                }`}
              >
                <span className="font-bold mr-2">
                  {String.fromCharCode(65 + idx)}.
                </span>{" "}
                {answer}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={selected === null}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {current + 1 === tests.length ? "Завершити" : "Продовжити"}
          </button>
        </div>
      </div>
    </div>
  );
}
