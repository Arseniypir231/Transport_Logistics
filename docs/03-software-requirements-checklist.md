# Сверка программной части с методическими требованиями

Источник требований: `Recommendations_for_course_design_2024_4368d16ed4280e72722d19276cd0574e.pdf`, разделы 3-4 и сопутствующие пункты порядка выполнения.

## Извлеченные требования к программной составляющей

| Требование методички | Статус в проекте | Где реализовано |
|---|---|---|
| Web-приложение должно включать frontend и backend | Выполнено | `client/src`, `server/src` |
| Frontend: HTML5, CSS, JavaScript/TypeScript, React | Выполнено | `client/src/index.tsx`, `client/src/App.tsx`, `client/src/pages.tsx`, `client/src/styles.css` |
| Использование Redux Toolkit или MobX | Выполнено | `client/src/store.ts` |
| Использование сборщика Webpack | Выполнено | `client/webpack.config.cjs` |
| Backend: Node.js и Express | Выполнено | `server/src/index.ts` |
| База данных PostgreSQL | Выполнено на уровне схемы и конфигурации | `server/prisma/schema.prisma`, `.env.example` |
| ORM: Prisma или Sequelize | Выполнено | `server/prisma/schema.prisma`, `server/prisma/seed.ts` |
| Минимум две пользовательские роли с разными функциями | Выполнено, реализованы 3 роли: диспетчер, клиент, перевозчик | `server/src/index.ts`, `server/prisma/seed.ts`, `client/src/components.tsx` |
| Страницы авторизации и регистрации | Выполнено | `client/src/pages.tsx`, `/login`, `/register` |
| Не менее 7 страниц кроме авторизации/регистрации | Выполнено, есть 8 внутренних разделов: панель, аналитика, заявки, рейсы, карточка рейса, автопарк, маршруты, отчеты, настройки | `client/src/App.tsx` |
| Не менее 15 функций приложения без учета входа/регистрации | Выполнено | CRUD заявок, CRUD рейсов, CRUD транспорта, CRUD водителей, маршруты, трекинг-события, фильтрация, сортировка, избранное, графики/агрегации, PDF/Excel отчеты, role-gated actions, сохранение настроек |
| Не менее 2 скачиваемых отчетов в `.docs`, `.pdf`, e-mail, Google Docs или аналогичном виде | Выполнено, 2 отчета в PDF и Excel | `server/src/index.ts`, `client/src/pages.tsx` |
| Не менее 20 различных UI-компонентов | Выполнено | `client/src/components.tsx` содержит Button, IconButton, Card, PageHeader, StatCard, StatusBadge, PriorityBadge, Field, SelectField, TextAreaField, FormGrid, FilterPanel, DataTable, Modal, Toast, EmptyState, RoleGate, Tabs, ToggleRow, Timeline, RoutePoints, KpiBar, BarList, FavoriteButton, ReportCard |
| Адаптивность для desktop/tablet/mobile, ширина от 1920/1440 до 320 px, без горизонтального скролла страницы | Выполнено на уровне CSS | `client/src/styles.css`, media queries на 980 px и 640 px, `min-width: 320px` |
| Интерактивные состояния hover/focus/disabled/active, курсор, плавные анимации | Выполнено | `client/src/styles.css` |
| Сохранение пользовательских параметров в `localStorage` и кнопка сброса | Выполнено | `tl_settings`, `tl_order_filters`, `tl_shipment_filters`, `tl_fleet_tab`, `tl_favorite_orders`; сброс в `/settings` |
| Не менее 8 связанных таблиц БД, приведенных к 3НФ | Выполнено, 12 связанных моделей | Role, Company, User, Cargo, LogisticsOrder, Vehicle, Driver, Route, RoutePoint, Shipment, ShipmentEvent, ReportRequest |
| Взаимодействие web-приложения с сервером через RESTful API с базовой CRUD-структурой | Выполнено | `/api/orders`, `/api/shipments`, `/api/vehicles`, `/api/drivers`, `/api/routes`, `/api/reports`, `/api/catalog`, `/api/dashboard`, `/api/analytics` |
| Валидная и семантическая верстка | Выполнено на уровне реализации | Используются `main`, `section`, `header`, `nav`, `table`, `form`, `label`, `dl`, `ol`, `article` |
| Проверка в Google Chrome последней версии | Требует ручной проверки в браузере после запуска | Команды запуска указаны в `README.md` |
| Репозиторий должен содержать backup базы данных с 200+ записями | Выполнено как SQL data backup и seed-скрипт | `server/prisma/backup/transport_logistics_demo_backup.sql`, `server/prisma/seed.ts` |
| История коммитов должна отражать процесс разработки, названия по гайдлайну | Невозможно исправить кодом без выполнения коммитов | Требует последующих git-коммитов в формате Conventional Commits |

## Итог

До доработки проект содержал только собранные `client/dist` и `server/dist`-артефакты без исходников `client/src`, `server/src`, package-файлов рабочих областей и Prisma-схемы в стандартном месте. После доработки программная часть приведена к проверяемому уровню курсовой работы: исходники восстановлены, сборка проходит, Prisma-схема и демо-данные добавлены, функциональный минимум методички закрыт.
