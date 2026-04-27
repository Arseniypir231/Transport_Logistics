-- Demo data backup for the coursework database.
-- Restore after applying Prisma schema/migrations:
--   psql "$DATABASE_URL" -f server/prisma/backup/transport_logistics_demo_backup.sql
-- The script recreates 200+ interconnected rows across the normalized tables.

TRUNCATE TABLE
  report_requests,
  shipment_events,
  shipments,
  route_points,
  orders,
  cargo,
  drivers,
  vehicles,
  users,
  roles,
  companies,
  routes
RESTART IDENTITY CASCADE;

INSERT INTO roles (id, slug, name, description) VALUES
  ('role-dispatcher', 'dispatcher', 'Диспетчер', 'Управляет заявками, рейсами, маршрутами и отчетами'),
  ('role-client', 'client', 'Клиент', 'Создает заявки и отслеживает перевозки'),
  ('role-carrier', 'carrier', 'Перевозчик', 'Управляет автопарком и выполнением рейсов');

INSERT INTO companies (id, name, type, "taxNumber", address, "contactEmail", phone, "createdAt", "updatedAt")
SELECT
  'company-client-' || lpad(i::text, 2, '0'),
  'Клиентская компания ' || lpad(i::text, 2, '0'),
  'CLIENT',
  '191000' || lpad(i::text, 3, '0'),
  'Минск, ул. Складская, ' || i,
  'client' || lpad(i::text, 2, '0') || '@transport.test',
  '+37529111' || lpad(i::text, 4, '0'),
  now(),
  now()
FROM generate_series(1, 12) AS i;

INSERT INTO companies (id, name, type, "taxNumber", address, "contactEmail", phone, "createdAt", "updatedAt")
SELECT
  'company-carrier-' || lpad(i::text, 2, '0'),
  'Перевозчик ' || lpad(i::text, 2, '0'),
  'CARRIER',
  '192000' || lpad(i::text, 3, '0'),
  'Минск, ул. Транспортная, ' || i,
  'carrier' || lpad(i::text, 2, '0') || '@transport.test',
  '+37529222' || lpad(i::text, 4, '0'),
  now(),
  now()
FROM generate_series(1, 12) AS i;

INSERT INTO companies (id, name, type, "taxNumber", address, "contactEmail", phone, "createdAt", "updatedAt")
VALUES ('company-platform', 'Transport Hub', 'PARTNER', '190000000', 'Минск, пр. Независимости, 1', 'dispatch@transport.test', '+375291110000', now(), now());

INSERT INTO users (id, email, "passwordHash", name, status, "roleId", "companyId", "createdAt", "updatedAt")
VALUES
  ('user-dispatcher', 'dispatcher@transport.test', '$2b$10$gY8mZe5Vqvm2HQ7pR0lYfOx1DUEF4njVAH0wHTT6NZL3r77Hb31Qe', 'Анна Диспетчер', 'ACTIVE', 'role-dispatcher', 'company-platform', now(), now()),
  ('user-client', 'client@transport.test', '$2b$10$gY8mZe5Vqvm2HQ7pR0lYfOx1DUEF4njVAH0wHTT6NZL3r77Hb31Qe', 'Игорь Клиент', 'ACTIVE', 'role-client', 'company-client-01', now(), now()),
  ('user-carrier', 'carrier@transport.test', '$2b$10$gY8mZe5Vqvm2HQ7pR0lYfOx1DUEF4njVAH0wHTT6NZL3r77Hb31Qe', 'Мария Перевозчик', 'ACTIVE', 'role-carrier', 'company-carrier-01', now(), now());

INSERT INTO users (id, email, "passwordHash", name, status, "roleId", "companyId", "createdAt", "updatedAt")
SELECT
  'user-demo-' || lpad(i::text, 2, '0'),
  'user' || lpad(i::text, 2, '0') || '@transport.test',
  '$2b$10$gY8mZe5Vqvm2HQ7pR0lYfOx1DUEF4njVAH0wHTT6NZL3r77Hb31Qe',
  'Пользователь ' || lpad(i::text, 2, '0'),
  'ACTIVE',
  CASE WHEN i % 3 = 0 THEN 'role-dispatcher' WHEN i % 3 = 1 THEN 'role-client' ELSE 'role-carrier' END,
  CASE WHEN i % 3 = 0 THEN 'company-platform' WHEN i % 3 = 1 THEN 'company-client-' || lpad(((i % 12) + 1)::text, 2, '0') ELSE 'company-carrier-' || lpad(((i % 12) + 1)::text, 2, '0') END,
  now(),
  now()
FROM generate_series(1, 33) AS i;

INSERT INTO cargo (id, name, type, "weightKg", "volumeM3", "temperatureFrom", "temperatureTo", "hazardClass")
SELECT
  'cargo-' || lpad(i::text, 3, '0'),
  'Груз ' || lpad(i::text, 3, '0'),
  (ARRAY['PALLET'::"CargoType",'BULK'::"CargoType",'CONTAINER'::"CargoType",'REFRIGERATED'::"CargoType",'HAZARDOUS'::"CargoType"])[1 + (i % 5)],
  1200 + i * 85,
  8 + (i % 12) * 1.7,
  CASE WHEN i % 5 = 0 THEN -18 ELSE NULL END,
  CASE WHEN i % 5 = 0 THEN -12 ELSE NULL END,
  CASE WHEN i % 11 = 0 THEN '3' ELSE NULL END
FROM generate_series(1, 60) AS i;

INSERT INTO vehicles (id, "plateNumber", type, make, model, year, "capacityKg", "capacityM3", status, "companyId", "createdAt", "updatedAt")
SELECT
  'vehicle-' || lpad(i::text, 3, '0'),
  (7000 + i)::text || ' AB-' || ((i % 7) + 1)::text,
  (ARRAY['Тентованный грузовик','Рефрижератор','Контейнеровоз','Фургон'])[1 + (i % 4)],
  (ARRAY['Volvo','MAN','DAF','Mercedes-Benz'])[1 + (i % 4)],
  (ARRAY['FH','TGX','XF','Actros'])[1 + (i % 4)],
  2018 + (i % 7),
  9000 + i * 350,
  42 + (i % 12) * 3,
  (ARRAY['AVAILABLE'::"VehicleStatus",'ASSIGNED'::"VehicleStatus",'MAINTENANCE'::"VehicleStatus"])[1 + (i % 3)],
  'company-carrier-' || lpad(((i % 12) + 1)::text, 2, '0'),
  now(),
  now()
FROM generate_series(1, 35) AS i;

INSERT INTO drivers (id, "licenseNumber", name, phone, email, rating, status, "companyId", "createdAt", "updatedAt")
SELECT
  'driver-' || lpad(i::text, 3, '0'),
  'DL-' || lpad(i::text, 5, '0'),
  'Водитель ' || lpad(i::text, 2, '0'),
  '+37529333' || lpad(i::text, 4, '0'),
  'driver' || lpad(i::text, 2, '0') || '@transport.test',
  4 + (i % 10) / 10.0,
  (ARRAY['AVAILABLE'::"DriverStatus",'ON_ROUTE'::"DriverStatus",'VACATION'::"DriverStatus"])[1 + (i % 3)],
  'company-carrier-' || lpad(((i % 12) + 1)::text, 2, '0'),
  now(),
  now()
FROM generate_series(1, 35) AS i;

INSERT INTO routes (id, name, origin, destination, "distanceKm", "estimatedHours", "createdAt", "updatedAt")
SELECT
  'route-' || lpad(i::text, 3, '0'),
  'Маршрут ' || lpad(i::text, 2, '0'),
  (ARRAY['Минск','Гомель','Брест','Гродно','Витебск'])[1 + (i % 5)],
  (ARRAY['Гомель','Брест','Гродно','Витебск','Могилев'])[1 + (i % 5)],
  160 + i * 12,
  3 + (i % 8),
  now(),
  now()
FROM generate_series(1, 20) AS i;

INSERT INTO route_points (id, "routeId", sequence, label, address, latitude, longitude, "plannedArrival", "createdAt")
SELECT
  'route-point-' || lpad(((r * 3) + p)::text, 3, '0'),
  'route-' || lpad(r::text, 3, '0'),
  p,
  (ARRAY['Погрузка','Контрольная точка','Разгрузка'])[p],
  'Адрес точки ' || p || ' маршрута ' || r,
  53.0 + r / 1000.0 + p / 10000.0,
  27.0 + r / 1000.0 + p / 10000.0,
  now() + (p || ' hours')::interval,
  now()
FROM generate_series(1, 20) AS r
CROSS JOIN generate_series(1, 3) AS p;

INSERT INTO orders (id, code, title, status, priority, "pickupAddress", "deliveryAddress", "pickupDate", "deliveryDate", price, notes, "clientId", "cargoId", "createdById", "createdAt", "updatedAt")
SELECT
  'order-' || lpad(i::text, 3, '0'),
  'TL-' || lpad(i::text, 4, '0'),
  'Перевозка партии ' || lpad(i::text, 2, '0'),
  (ARRAY['NEW'::"OrderStatus",'IN_PROGRESS'::"OrderStatus",'COMPLETED'::"OrderStatus",'CANCELLED'::"OrderStatus"])[1 + (i % 4)],
  (ARRAY['LOW'::"Priority",'NORMAL'::"Priority",'HIGH'::"Priority",'URGENT'::"Priority"])[1 + (i % 4)],
  'Склад отправителя ' || i,
  'Склад получателя ' || i,
  now() + (i || ' days')::interval,
  now() + ((i + 1) || ' days')::interval,
  400 + i * 23,
  CASE WHEN i % 7 = 0 THEN 'Требуется контроль температуры' ELSE NULL END,
  'company-client-' || lpad(((i % 12) + 1)::text, 2, '0'),
  'cargo-' || lpad(i::text, 3, '0'),
  'user-dispatcher',
  now(),
  now()
FROM generate_series(1, 60) AS i;

INSERT INTO shipments (id, "trackingNumber", status, "orderId", "carrierId", "driverId", "vehicleId", "routeId", "plannedStart", "plannedFinish", "currentLatitude", "currentLongitude", "createdAt", "updatedAt")
SELECT
  'shipment-' || lpad(i::text, 3, '0'),
  'TRK-' || lpad(i::text, 5, '0'),
  (ARRAY['PLANNED'::"ShipmentStatus",'LOADING'::"ShipmentStatus",'IN_TRANSIT'::"ShipmentStatus",'DELIVERED'::"ShipmentStatus",'DELAYED'::"ShipmentStatus"])[1 + (i % 5)],
  'order-' || lpad(i::text, 3, '0'),
  'company-carrier-' || lpad(((i % 12) + 1)::text, 2, '0'),
  'driver-' || lpad(((i % 35) + 1)::text, 3, '0'),
  'vehicle-' || lpad(((i % 35) + 1)::text, 3, '0'),
  'route-' || lpad(((i % 20) + 1)::text, 3, '0'),
  now() + (i || ' days')::interval,
  now() + ((i + 1) || ' days')::interval,
  53.8 + i / 1000.0,
  27.6 + i / 1000.0,
  now(),
  now()
FROM generate_series(1, 60) AS i;

INSERT INTO shipment_events (id, "shipmentId", type, message, location, latitude, longitude, "createdById", "createdAt")
SELECT
  'event-' || lpad(i::text, 3, '0'),
  'shipment-' || lpad(((i % 60) + 1)::text, 3, '0'),
  (ARRAY['CREATED'::"EventType",'LOADED'::"EventType",'DEPARTED'::"EventType",'CHECKPOINT'::"EventType",'ARRIVED'::"EventType",'DELIVERED'::"EventType",'PROBLEM'::"EventType"])[1 + (i % 7)],
  'Событие рейса ' || lpad(i::text, 3, '0'),
  'Контрольная точка ' || lpad(i::text, 3, '0'),
  53.7 + i / 1000.0,
  27.5 + i / 1000.0,
  'user-dispatcher',
  now() - ((i % 20) || ' days')::interval
FROM generate_series(1, 120) AS i;

INSERT INTO report_requests (id, type, delivery, "recipientEmail", "fileName", status, "createdById", "createdAt")
SELECT
  'report-' || lpad(i::text, 2, '0'),
  CASE WHEN i % 2 = 0 THEN 'FLEET_UTILIZATION'::"ReportType" ELSE 'SHIPMENT_SUMMARY'::"ReportType" END,
  'DOWNLOAD'::"ReportDelivery",
  NULL,
  CASE WHEN i % 2 = 0 THEN 'fleet-report.xlsx' ELSE 'shipments-report.pdf' END,
  'READY',
  'user-dispatcher',
  now()
FROM generate_series(1, 8) AS i;
