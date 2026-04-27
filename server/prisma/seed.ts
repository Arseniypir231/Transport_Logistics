import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { loadProjectEnv } from "../src/env.js";

loadProjectEnv();

const prisma = new PrismaClient();

function pad(value: number, size = 2) {
  return String(value).padStart(size, "0");
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

async function main() {
  console.log("[seed] Clearing database...");
  await prisma.reportRequest.deleteMany();
  await prisma.shipmentEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.routePoint.deleteMany();
  await prisma.logisticsOrder.deleteMany();
  await prisma.cargo.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.company.deleteMany();
  await prisma.route.deleteMany();

  console.log("[seed] Creating roles, companies and users...");
  const [dispatcherRole, clientRole, carrierRole] = await Promise.all([
    prisma.role.create({
      data: {
        slug: "dispatcher",
        name: "Диспетчер",
        description: "Управляет заявками, рейсами, маршрутами и отчетами"
      }
    }),
    prisma.role.create({
      data: {
        slug: "client",
        name: "Клиент",
        description: "Создает заявки и отслеживает перевозки"
      }
    }),
    prisma.role.create({
      data: {
        slug: "carrier",
        name: "Перевозчик",
        description: "Управляет автопарком и выполнением рейсов"
      }
    })
  ]);

  const platformCompany = await prisma.company.create({
    data: {
      name: "Transport Hub",
      type: "PARTNER",
      taxNumber: "190000000",
      address: "Минск, пр. Независимости, 1",
      contactEmail: "dispatch@transport.test",
      phone: "+375291110000"
    }
  });

  const clientCompanies = [];
  const carrierCompanies = [];

  for (let i = 1; i <= 12; i += 1) {
    clientCompanies.push(
      await prisma.company.create({
        data: {
          name: `Клиентская компания ${pad(i)}`,
          type: "CLIENT",
          taxNumber: `191000${pad(i, 3)}`,
          address: `Минск, ул. Складская, ${i}`,
          contactEmail: `client${pad(i)}@transport.test`,
          phone: `+37529111${pad(i, 4)}`
        }
      })
    );
  }

  for (let i = 1; i <= 12; i += 1) {
    carrierCompanies.push(
      await prisma.company.create({
        data: {
          name: `Перевозчик ${pad(i)}`,
          type: "CARRIER",
          taxNumber: `192000${pad(i, 3)}`,
          address: `Минск, ул. Транспортная, ${i}`,
          contactEmail: `carrier${pad(i)}@transport.test`,
          phone: `+37529222${pad(i, 4)}`
        }
      })
    );
  }

  const passwordHash = await bcrypt.hash("password123", 10);
  const dispatcher = await prisma.user.create({
    data: {
      name: "Анна Диспетчер",
      email: "dispatcher@transport.test",
      passwordHash,
      roleId: dispatcherRole.id,
      companyId: platformCompany.id
    }
  });

  await prisma.user.create({
    data: {
      name: "Игорь Клиент",
      email: "client@transport.test",
      passwordHash,
      roleId: clientRole.id,
      companyId: clientCompanies[0].id
    }
  });

  await prisma.user.create({
    data: {
      name: "Мария Перевозчик",
      email: "carrier@transport.test",
      passwordHash,
      roleId: carrierRole.id,
      companyId: carrierCompanies[0].id
    }
  });

  for (let i = 1; i <= 33; i += 1) {
    const role = pick([dispatcherRole, clientRole, carrierRole], i);
    const company =
      role.slug === "client"
        ? pick(clientCompanies, i)
        : role.slug === "carrier"
          ? pick(carrierCompanies, i)
          : platformCompany;

    await prisma.user.create({
      data: {
        name: `Пользователь ${pad(i)}`,
        email: `user${pad(i)}@transport.test`,
        passwordHash,
        roleId: role.id,
        companyId: company.id
      }
    });
  }

  console.log("[seed] Creating reference data...");
  const vehicles = [];
  for (let i = 1; i <= 35; i += 1) {
    vehicles.push(
      await prisma.vehicle.create({
        data: {
          plateNumber: `${7000 + i} AB-${(i % 7) + 1}`,
          type: pick(["Тентованный грузовик", "Рефрижератор", "Контейнеровоз", "Фургон"], i),
          make: pick(["Volvo", "MAN", "DAF", "Mercedes-Benz"], i),
          model: pick(["FH", "TGX", "XF", "Actros"], i),
          year: 2018 + (i % 7),
          capacityKg: 9000 + i * 350,
          capacityM3: 42 + (i % 12) * 3,
          status: pick(["AVAILABLE", "ASSIGNED", "MAINTENANCE"] as const, i),
          companyId: pick(carrierCompanies, i).id
        }
      })
    );
  }

  const drivers = [];
  for (let i = 1; i <= 35; i += 1) {
    drivers.push(
      await prisma.driver.create({
        data: {
          licenseNumber: `DL-${pad(i, 5)}`,
          name: `Водитель ${pad(i)}`,
          phone: `+37529333${pad(i, 4)}`,
          email: `driver${pad(i)}@transport.test`,
          rating: 4 + (i % 10) / 10,
          status: pick(["AVAILABLE", "ON_ROUTE", "VACATION"] as const, i),
          companyId: pick(carrierCompanies, i).id
        }
      })
    );
  }

  const routes = [];
  const cityPairs = [
    ["Минск", "Гомель"],
    ["Минск", "Брест"],
    ["Минск", "Гродно"],
    ["Минск", "Витебск"],
    ["Минск", "Могилев"]
  ];

  for (let i = 1; i <= 20; i += 1) {
    const [origin, destination] = pick(cityPairs, i);
    routes.push(
      await prisma.route.create({
        data: {
          name: `${origin} - ${destination} ${pad(i)}`,
          origin,
          destination,
          distanceKm: 160 + i * 12,
          estimatedHours: 3 + (i % 8),
          points: {
            create: [
              {
                sequence: 1,
                label: "Погрузка",
                address: `${origin}, логистический терминал ${i}`,
                latitude: 53.9 + i / 1000,
                longitude: 27.56 + i / 1000
              },
              {
                sequence: 2,
                label: "Контрольная точка",
                address: `Трасса М-${(i % 8) + 1}, км ${45 + i}`,
                latitude: 53.5 + i / 1000,
                longitude: 28.1 + i / 1000
              },
              {
                sequence: 3,
                label: "Разгрузка",
                address: `${destination}, склад получателя ${i}`,
                latitude: 52.4 + i / 1000,
                longitude: 30.9 + i / 1000
              }
            ]
          }
        }
      })
    );
  }

  console.log("[seed] Creating orders and shipments...");
  const cargoItems = [];
  for (let i = 1; i <= 60; i += 1) {
    cargoItems.push(
      await prisma.cargo.create({
        data: {
          name: `Груз ${pad(i)}`,
          type: pick(["PALLET", "BULK", "CONTAINER", "REFRIGERATED", "HAZARDOUS"] as const, i),
          weightKg: 1200 + i * 85,
          volumeM3: 8 + (i % 12) * 1.7,
          temperatureFrom: i % 5 === 0 ? -18 : undefined,
          temperatureTo: i % 5 === 0 ? -12 : undefined,
          hazardClass: i % 11 === 0 ? "3" : undefined
        }
      })
    );
  }

  const orders = [];
  const today = new Date("2026-04-16T09:00:00.000Z");
  for (let i = 1; i <= 60; i += 1) {
    orders.push(
      await prisma.logisticsOrder.create({
        data: {
          code: `TL-${pad(i, 4)}`,
          title: `Перевозка партии ${pad(i)}`,
          status: pick(["NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const, i),
          priority: pick(["LOW", "NORMAL", "HIGH", "URGENT"] as const, i),
          pickupAddress: `${pick(cityPairs, i)[0]}, склад ${i}`,
          deliveryAddress: `${pick(cityPairs, i)[1]}, РЦ ${i}`,
          pickupDate: addDays(today, i % 12),
          deliveryDate: addDays(today, (i % 12) + 1),
          price: 400 + i * 23,
          notes: i % 7 === 0 ? "Требуется контроль температуры" : undefined,
          clientId: pick(clientCompanies, i).id,
          cargoId: cargoItems[i - 1].id,
          createdById: dispatcher.id
        }
      })
    );
  }

  const shipments = [];
  for (let i = 1; i <= 60; i += 1) {
    shipments.push(
      await prisma.shipment.create({
        data: {
          trackingNumber: `TRK-${pad(i, 5)}`,
          status: pick(["PLANNED", "LOADING", "IN_TRANSIT", "DELIVERED", "DELAYED"] as const, i),
          orderId: orders[i - 1].id,
          carrierId: pick(carrierCompanies, i).id,
          driverId: pick(drivers, i).id,
          vehicleId: pick(vehicles, i).id,
          routeId: pick(routes, i).id,
          plannedStart: addDays(today, i % 10),
          plannedFinish: addDays(today, (i % 10) + 1),
          currentLatitude: 53.8 + i / 1000,
          currentLongitude: 27.6 + i / 1000
        }
      })
    );
  }

  for (let i = 1; i <= 120; i += 1) {
    await prisma.shipmentEvent.create({
      data: {
        shipmentId: pick(shipments, i).id,
        type: pick(["CREATED", "LOADED", "DEPARTED", "CHECKPOINT", "ARRIVED", "DELIVERED", "PROBLEM"] as const, i),
        message: `Событие рейса ${pad(i)}`,
        location: `Контрольная точка ${pad(i)}`,
        latitude: 53.7 + i / 1000,
        longitude: 27.5 + i / 1000,
        createdById: dispatcher.id,
        createdAt: addDays(today, -1 * (i % 20))
      }
    });
  }

  for (let i = 1; i <= 8; i += 1) {
    await prisma.reportRequest.create({
      data: {
        type: pick(["SHIPMENT_SUMMARY", "FLEET_UTILIZATION"] as const, i),
        delivery: "DOWNLOAD",
        fileName: i % 2 === 0 ? "fleet-report.xlsx" : "shipments-report.pdf",
        createdById: dispatcher.id
      }
    });
  }

  const counts = {
    roles: await prisma.role.count(),
    companies: await prisma.company.count(),
    users: await prisma.user.count(),
    cargo: await prisma.cargo.count(),
    orders: await prisma.logisticsOrder.count(),
    vehicles: await prisma.vehicle.count(),
    drivers: await prisma.driver.count(),
    routes: await prisma.route.count(),
    routePoints: await prisma.routePoint.count(),
    shipments: await prisma.shipment.count(),
    shipmentEvents: await prisma.shipmentEvent.count(),
    reportRequests: await prisma.reportRequest.count()
  };

  console.log("[seed] Completed. Demo credentials:");
  console.log("  dispatcher@transport.test / password123");
  console.log("  client@transport.test / password123");
  console.log("  carrier@transport.test / password123");
  console.log("[seed] Total records:", Object.values(counts).reduce((sum, value) => sum + value, 0), counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
