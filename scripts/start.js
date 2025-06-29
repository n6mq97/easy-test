const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Проверяем, существует ли база данных
const dbPath = path.join(process.cwd(), 'database.sqlite');

if (!fs.existsSync(dbPath)) {
  console.log('🗄️ База данных не найдена, инициализируем...');
  
  // Запускаем скрипт инициализации
  const initProcess = spawn('node', ['scripts/init-db.js'], {
    stdio: 'inherit'
  });
  
  initProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ База данных инициализирована успешно!');
      startApp();
    } else {
      console.error('❌ Ошибка инициализации базы данных');
      process.exit(1);
    }
  });
} else {
  console.log('✅ База данных найдена, запускаем приложение...');
  startApp();
}

function startApp() {
  console.log('🚀 Запускаем Next.js приложение...');
  
  // Запускаем Next.js
  const appProcess = spawn('npm', ['start'], {
    stdio: 'inherit'
  });
  
  appProcess.on('close', (code) => {
    console.log(`Приложение завершено с кодом: ${code}`);
    process.exit(code);
  });
} 