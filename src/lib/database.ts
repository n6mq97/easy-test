import Database from "better-sqlite3";
import path from "path";

// Используем переменную окружения для пути к базе данных или путь по умолчанию
const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

// Типы для базы данных
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

// Инициализация базы данных
export function initDatabase() {
  // Таблица пользователей
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица тестов
  db.exec(`
    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      question TEXT NOT NULL,
      answers TEXT NOT NULL,
      correct INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица результатов
  db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      test_id INTEGER NOT NULL,
      user_answer INTEGER,
      is_correct BOOLEAN NOT NULL,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (test_id) REFERENCES tests (id)
    )
  `);

  // Создаем индексы для оптимизации
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_results_user_id ON results (user_id);
    CREATE INDEX IF NOT EXISTS idx_results_test_id ON results (test_id);
    CREATE INDEX IF NOT EXISTS idx_tests_section ON tests (section);
  `);
}

// Функции для работы с пользователями
export function createUser(username: string) {
  const stmt = db.prepare("INSERT OR IGNORE INTO users (username) VALUES (?)");
  const result = stmt.run(username);
  return result.lastInsertRowid;
}

export function getUsers(): User[] {
  const stmt = db.prepare("SELECT * FROM users ORDER BY username");
  return stmt.all() as User[];
}

export function getUserById(id: number): User | undefined {
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  return stmt.get(id) as User | undefined;
}

// Функции для работы с тестами
export function addTest(
  section: string,
  question: string,
  answers: string[],
  correct: number
) {
  const stmt = db.prepare(
    "INSERT INTO tests (section, question, answers, correct) VALUES (?, ?, ?, ?)"
  );
  const result = stmt.run(section, question, JSON.stringify(answers), correct);
  return result.lastInsertRowid;
}

export function getTests(): Test[] {
  const stmt = db.prepare("SELECT * FROM tests ORDER BY section, id");
  return stmt.all().map((test: any) => ({
    ...test,
    answers: JSON.parse(test.answers),
  })) as Test[];
}

export function getTestsBySection(section: string): Test[] {
  const stmt = db.prepare("SELECT * FROM tests WHERE section = ? ORDER BY id");
  return stmt.all(section).map((test: any) => ({
    ...test,
    answers: JSON.parse(test.answers),
  })) as Test[];
}

export function getSections(): string[] {
  const stmt = db.prepare(
    "SELECT DISTINCT section FROM tests ORDER BY section"
  );
  return stmt.all().map((row: any) => row.section) as string[];
}

export function getRandomTests(limit: number = 20): Test[] {
  const stmt = db.prepare("SELECT * FROM tests ORDER BY RANDOM() LIMIT ?");
  return stmt.all(limit).map((test: any) => ({
    ...test,
    answers: JSON.parse(test.answers),
  })) as Test[];
}

// Функции для работы с результатами
export function saveResult(
  userId: number,
  testId: number,
  userAnswer: number,
  isCorrect: boolean
) {
  const stmt = db.prepare(
    "INSERT INTO results (user_id, test_id, user_answer, is_correct) VALUES (?, ?, ?, ?)"
  );
  return stmt.run(userId, testId, userAnswer, isCorrect ? 1 : 0);
}

export function getUserResults(userId: number): Result[] {
  const stmt = db.prepare(`
    SELECT r.*, t.section, t.question, t.answers, t.correct
    FROM results r
    JOIN tests t ON r.test_id = t.id
    WHERE r.user_id = ?
    ORDER BY r.answered_at DESC
  `);
  return stmt.all(userId).map((result: any) => ({
    ...result,
    answers: JSON.parse(result.answers),
  })) as Result[];
}

export function getUserStats(userId: number): UserStats {
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total_answered,
      SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
      COUNT(DISTINCT test_id) as unique_tests_answered
    FROM results 
    WHERE user_id = ?
  `);
  const stats = stmt.get(userId) as any;

  const sectionStats = db
    .prepare(
      `
    SELECT 
      t.section,
      COUNT(*) as total_answered,
      SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) as correct_answers
    FROM results r
    JOIN tests t ON r.test_id = t.id
    WHERE r.user_id = ?
    GROUP BY t.section
    ORDER BY t.section
  `
    )
    .all(userId) as any[];

  return {
    ...stats,
    accuracy:
      stats.total_answered > 0
        ? ((stats.correct_answers / stats.total_answered) * 100).toFixed(1)
        : "0",
    sectionStats,
  };
}

// Инициализируем базу данных при импорте
initDatabase();

export default db;
