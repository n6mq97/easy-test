FROM mcr.microsoft.com/devcontainers/javascript-node:20

# Устанавливаем необходимые зависимости для better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем глобальные npm пакеты для разработки
RUN npm install -g npm@latest

# Создаем рабочую директорию
WORKDIR /workspaces/easy-test

# Открываем порт для разработки
EXPOSE 3000

# Устанавливаем пользователя node
USER node 