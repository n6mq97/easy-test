# Easy Test - Dev Container

Этот dev container настроен для разработки Next.js приложения Easy Test.

## Запуск

1. Убедитесь, что у вас установлены:
   - Docker Desktop (запущен)
   - VS Code с расширением "Dev Containers"

2. Откройте проект в VS Code

3. Нажмите `Ctrl+Shift+P` (или `Cmd+Shift+P` на Mac) и выберите:
   ```
   Dev Containers: Reopen in Container
   ```

4. Дождитесь инициализации контейнера и установки зависимостей

5. После успешного запуска контейнера, запустите приложение:
   ```bash
   npm run dev
   ```

## Что происходит при запуске

- ✅ Устанавливаются все зависимости Node.js (`npm install`)
- ✅ Инициализируется база данных SQLite (`npm run init-db`)
- ✅ Устанавливаются расширения VS Code
- ⏸️ Приложение НЕ запускается автоматически (нужно запустить вручную)

## Доступные команды

- `npm run dev` - запуск сервера разработки
- `npm run build` - сборка приложения
- `npm run lint` - проверка кода
- `npm run init-db` - инициализация базы данных

## Порт

После запуска `npm run dev` приложение будет доступно по адресу: http://localhost:3000

## Решение проблем

### Если возникает ошибка сборки Docker образа:

1. **Попробуйте альтернативную конфигурацию:**
   - Переименуйте `devcontainer.json` в `devcontainer-backup.json`
   - Переименуйте `devcontainer-simple.json` в `devcontainer.json`
   - Попробуйте запустить снова

2. **Очистите Docker кэш:**
   ```bash
   docker system prune -a
   ```

3. **Проверьте, что Docker Desktop запущен и работает**

4. **Попробуйте перезапустить VS Code**

### Если проблемы с SQLite:

Приложение использует `better-sqlite3`, который требует компиляции. Если возникают проблемы, попробуйте:

```bash
# Внутри контейнера
npm rebuild better-sqlite3
```

## Расширения VS Code

Автоматически устанавливаются следующие расширения:
- Tailwind CSS IntelliSense
- Prettier
- TypeScript
- ESLint
- Path Intellisense
- Auto Rename Tag 