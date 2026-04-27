# Transport Logistics

Онлайн‑платформа для транспортной логистики (курсовой проект).

В репозитории есть полноценные исходники и собранные артефакты:
- `client/src` — React/Redux/Webpack frontend
- `server/src` — Node.js/Express REST API
- `server/prisma` — Prisma-схема, seed и SQL backup демо-БД
- `client/dist`, `server/dist` — результат сборки

## Требования

- **Node.js** (рекомендуется LTS)
- **PostgreSQL** (локально)
- **pgAdmin 4** (для удобного запуска/управления БД)

## Конфигурация окружения

1) Создайте `.env` в корне проекта (или проверьте существующий).

Минимальный пример (можно взять за основу `.env.example`):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transport_logistics?schema=public"
PORT=4000
JWT_SECRET="change-me-for-coursework"
CLIENT_URL="http://localhost:3000"
```

## Запуск (Windows / PowerShell)

Откройте PowerShell в корне репозитория `D:\GitHub\Transport_Logistics`.

### 1) Запустить локальный PostgreSQL (через pgAdmin 4)

Запустите ваш PostgreSQL-сервер (службу) и убедитесь, что он слушает `localhost:5432`.

Далее в pgAdmin создайте:
- базу данных **`transport_logistics`**
- пользователя (например **`postgres`**) и пароль (любой, который вы зададите)

После этого обновите `DATABASE_URL` в `.env` под ваши креды. Пример:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/transport_logistics?schema=public"
```

### 2) Подготовить Prisma и структуру БД

```powershell
npm run prisma:generate
npm run prisma:migrate
```

В этом проекте `npm run prisma:migrate` выполняет безопасный `prisma db push`: он синхронизирует учебную локальную БД со схемой без сброса данных. То же действие можно запустить явно:

```powershell
npm run prisma:push
```

Важно: используйте npm-скрипты выше, а не прямой `npx prisma ...`, потому что скрипты загружают `.env` через `scripts/run-with-env.mjs` и не конфликтуют с внешними переменными окружения Windows.

### 3) Заполнить базу тестовыми данными (seed)

Seed‑скрипт очищает таблицы и создаёт демо‑данные (**500+ записей суммарно**).

```powershell
npm run seed
```

Также добавлен SQL backup демо-данных: `server/prisma/backup/transport_logistics_demo_backup.sql`.

### 4) Запустить приложение в режиме разработки

```powershell
npm run dev
```

Frontend будет доступен на `http://localhost:3000`, API — на `http://localhost:4000`.

### 5) Собрать и запустить production-артефакты

```powershell
npm run build
```

Запуск API:

```powershell
node .\server\dist\src\index.js
```

По умолчанию API поднимется на `http://localhost:4000`.

Проверка:

- `GET http://localhost:4000/health` → `{ status: "ok", service: "transport-logistics-api" }`

Запуск UI отдельно:

Фронтенд — это статическая сборка, её удобно раздавать через `serve`.

В новом окне PowerShell:

```powershell
npx serve -s .\client\dist -l 3000
```

Откройте в браузере: `http://localhost:3000`.

## Частые проблемы

### Prisma ругается на DATABASE_URL

Убедитесь, что в `.env` задан корректный URL вида `postgresql://...`, Postgres запущен локально, и порт/логин/пароль в `DATABASE_URL` совпадают с настройками вашей БД.

### Порт занят

- UI: поменяйте `-l 3000` на другой порт (например `-l 5173`) и не забудьте обновить `CLIENT_URL` в `.env`
- API: поменяйте `PORT` в `.env`

Посмотреть, кто занял dev-порты:

```powershell
Get-NetTCPConnection -LocalPort 3000,4000 -State Listen | Select-Object LocalPort,OwningProcess
Get-CimInstance Win32_Process -Filter "ProcessId=<PID>" | Select-Object CommandLine
```

Если это старый процесс этого же проекта, его можно остановить:

```powershell
Stop-Process -Id <PID> -Force
```

