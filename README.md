# Онлайн-платформа для транспортной логистики

Google Docs: https://docs.google.com/document/d/1b_zw6MAMQwgBynifPW8H3xW8iasKwWXB/edit?usp=sharing&ouid=111694511079871764699&rtpof=true&sd=true

Курсовой web-проект по предметной области "Разработка онлайн-платформы для транспортной логистики".

## Стек

- Frontend: HTML5, CSS, TypeScript, React, Redux Toolkit, Webpack.
- Backend: Node.js, Express, REST API.
- База данных: PostgreSQL, Prisma ORM.
- Отчеты: PDF через `pdfkit`, Excel через `exceljs`.

## Быстрый запуск

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env` из примера:

```bash
copy .env.example .env
```

3. Запустить PostgreSQL:

```bash
docker compose up -d
```

4. Создать таблицы и заполнить тестовые данные:

```bash
npm run prisma:migrate
npm run seed
```

5. Запустить backend и frontend:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:4000`

## Тестовые аккаунты

Пароль для всех аккаунтов: `password123`.

- `dispatcher@transport.test` - диспетчер: управляет заказами, рейсами, маршрутами, автопарком и отчетами.
- `client@transport.test` - клиент: создает заявки и отслеживает рейсы.
- `carrier@transport.test` - перевозчик: управляет рейсами, водителями, транспортом и отчетами.

## Основной функционал

- Авторизация и регистрация.
- Разделение функций по ролям: диспетчер, клиент, перевозчик.
- Панель показателей.
- CRUD заявок.
- CRUD рейсов и смена статусов.
- Детальная карточка рейса.
- Добавление событий трекинга рейса.
- CRUD транспорта.
- CRUD водителей.
- CRUD маршрутов.
- Просмотр контрольных точек маршрута.
- Два PDF-отчета: сводка рейсов и загрузка автопарка.
- Скачивание Excel-отчетов по рейсам и автопарку.
- Поиск и фильтрация заявок.
- Поиск и фильтрация рейсов.
- Сохранение фильтров, вкладки автопарка и настроек интерфейса в `localStorage`.
- Кнопка сброса пользовательских настроек.
- Адаптивная верстка для desktop, tablet и mobile.

Подробности для записки находятся в [docs/coursework-notes.md](docs/coursework-notes.md).
