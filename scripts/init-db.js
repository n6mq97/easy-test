const Database = require("better-sqlite3");
const path = require("path");

// Создаем базу данных
const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "database.sqlite");
const db = new Database(dbPath);

// Включаем WAL режим для лучшей производительности
db.pragma("journal_mode = WAL");

// Создаем таблицы
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    question TEXT NOT NULL,
    answers TEXT NOT NULL,
    correct INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    user_answer INTEGER NOT NULL,
    is_correct INTEGER NOT NULL,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (test_id) REFERENCES tests (id)
  );
`);

// Добавляем индекс для быстрого поиска
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_results_user_id ON results (user_id);
  CREATE INDEX IF NOT EXISTS idx_results_test_id ON results (test_id);
  CREATE INDEX IF NOT EXISTS idx_tests_section ON tests (section);
`);

console.log("✅ База данных инициализирована успешно!");
console.log("📁 Файл базы данных:", dbPath);

db.close();
