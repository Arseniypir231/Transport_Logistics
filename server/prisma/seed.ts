import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.shipmentEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.routePoint.deleteMany();
  await prisma.logisticsOrder.deleteMany();
  await prisma.cargo.deleteMany();
  await prisma.reportRequest.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.company.deleteMany();
  await prisma.route.deleteMany();

  const [dispatcherRole, clientRole, carrierRole] = await Promise.all([
    prisma.role.create({
      data: {
        slug: "dispatcher",
        name: "Диспетчер",
        description: "Управляет заказами, рейсами, маршрутами и отчетами"
      }
    }),
    prisma.role.create({
      data: {
        slug: "client",
        name: "Клиент",
        description: "Создает заявки и отслеживает доставку"
      }
    }),
    prisma.role.create({
      data: {
        slug: "carrier",
        name: "Перевозчик",
        description: "Управляет транспортом, водителями и выполнением рейсов"
      }
    })
  ]);

  const [clientCompany, carrierCompany, platformCompany] = await Promise.all([
    prisma.company.create({
      data: {
        name: "FreshMarket",
        type: "CLIENT",
        taxNumber: "190000001",
        address: "Минск, ул. Складская, 12",
        contactEmail: "client@freshmarket.test",
        phone: "+375291110001"
      }
    }),
    prisma.company.create({
      data: {
        name: "North Line Logistics",
        type: "CARRIER",
        taxNumber: "190000002",
        address: "Минск, ул. Транспортная, 9",
        contactEmail: "carrier@northline.test",
        phone: "+375291110002"
      }
    }),
    prisma.company.create({
      data: {
        name: "Transport Hub",
        type: "PARTNER",
        taxNumber: "190000003",
        address: "Минск, пр. Независимости, 1",
        contactEmail: "dispatch@transport.test",
        phone: "+375291110003"
      }
    })
  ]);

  const [retailCompany, expressCarrierCompany] = await Promise.all([
    prisma.company.create({
      data: {
        name: "BelAgro Distribution",
        type: "CLIENT",
        taxNumber: "190000004",
        address: "Минская область, агрогородок Колодищи, ул. Полевая, 7",
        contactEmail: "orders@belagro.test",
        phone: "+375291110004"
      }
    }),
    prisma.company.create({
      data: {
        name: "East Cargo Service",
        type: "CARRIER",
        taxNumber: "190000005",
        address: "Минск, ул. Монтажников, 18",
        contactEmail: "fleet@eastcargo.test",
        phone: "+375291110005"
      }
    })
  ]);

  const passwordHash = await bcrypt.hash("password123", 10);

  const [dispatcher, client, carrier] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Анна Диспетчер",
        email: "dispatcher@transport.test",
        passwordHash,
        roleId: dispatcherRole.id,
        companyId: platformCompany.id
      }
    }),
    prisma.user.create({
      data: {
        name: "Игорь Клиент",
        email: "client@transport.test",
        passwordHash,
        roleId: clientRole.id,
        companyId: clientCompany.id
      }
    }),
    prisma.user.create({
      data: {
        name: "Мария Перевозчик",
        email: "carrier@transport.test",
        passwordHash,
        roleId: carrierRole.id,
        companyId: carrierCompany.id
      }
    })
  ]);

  const [retailClient, expressCarrier] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Елена Закупщик",
        email: "retail@transport.test",
        passwordHash,
        roleId: clientRole.id,
        companyId: retailCompany.id
      }
    }),
    prisma.user.create({
      data: {
        name: "Павел Логист",
        email: "eastcarrier@transport.test",
        passwordHash,
        roleId: carrierRole.id,
        companyId: expressCarrierCompany.id
      }
    })
  ]);

  const [vehicleA, vehicleB, vehicleC] = await Promise.all([
    prisma.vehicle.create({
      data: {
        plateNumber: "7821 AB-7",
        type: "Refrigerated truck",
        make: "Volvo",
        model: "FH",
        year: 2022,
        capacityKg: 18000,
        capacityM3: 82,
        status: "ASSIGNED",
        companyId: carrierCompany.id
      }
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: "5544 KC-5",
        type: "Tent truck",
        make: "MAN",
        model: "TGX",
        year: 2021,
        capacityKg: 20000,
        capacityM3: 90,
        status: "AVAILABLE",
        companyId: carrierCompany.id
      }
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: "9012 MP-7",
        type: "Container carrier",
        make: "DAF",
        model: "XF",
        year: 2020,
        capacityKg: 22000,
        capacityM3: 76,
        status: "MAINTENANCE",
        companyId: carrierCompany.id
      }
    })
  ]);

  const [vehicleD, vehicleE] = await Promise.all([
    prisma.vehicle.create({
      data: {
        plateNumber: "4412 KT-7",
        type: "Box truck",
        make: "Mercedes-Benz",
        model: "Actros",
        year: 2023,
        capacityKg: 16000,
        capacityM3: 68,
        status: "ASSIGNED",
        companyId: expressCarrierCompany.id
      }
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: "1188 TM-5",
        type: "Mega trailer",
        make: "Scania",
        model: "R450",
        year: 2021,
        capacityKg: 21000,
        capacityM3: 100,
        status: "AVAILABLE",
        companyId: expressCarrierCompany.id
      }
    })
  ]);

  const [driverA, driverB, driverC] = await Promise.all([
    prisma.driver.create({
      data: {
        licenseNumber: "BY-DRV-1001",
        name: "Сергей Ковалев",
        phone: "+375291220001",
        email: "kovalev@northline.test",
        rating: 4.8,
        status: "ON_ROUTE",
        companyId: carrierCompany.id
      }
    }),
    prisma.driver.create({
      data: {
        licenseNumber: "BY-DRV-1002",
        name: "Олег Миронов",
        phone: "+375291220002",
        email: "mironov@northline.test",
        rating: 4.6,
        status: "AVAILABLE",
        companyId: carrierCompany.id
      }
    }),
    prisma.driver.create({
      data: {
        licenseNumber: "BY-DRV-1003",
        name: "Денис Левченко",
        phone: "+375291220003",
        email: "levchenko@northline.test",
        rating: 4.9,
        status: "VACATION",
        companyId: carrierCompany.id
      }
    })
  ]);

  const [driverD, driverE] = await Promise.all([
    prisma.driver.create({
      data: {
        licenseNumber: "BY-DRV-1004",
        name: "Артем Сидоров",
        phone: "+375291220004",
        email: "sidorov@eastcargo.test",
        rating: 4.7,
        status: "ON_ROUTE",
        companyId: expressCarrierCompany.id
      }
    }),
    prisma.driver.create({
      data: {
        licenseNumber: "BY-DRV-1005",
        name: "Максим Романов",
        phone: "+375291220005",
        email: "romanov@eastcargo.test",
        rating: 4.5,
        status: "AVAILABLE",
        companyId: expressCarrierCompany.id
      }
    })
  ]);

  const routeMinskGrodno = await prisma.route.create({
    data: {
      name: "Минск - Гродно",
      origin: "Минск",
      destination: "Гродно",
      distanceKm: 278,
      estimatedHours: 4,
      points: {
        create: [
          {
            sequence: 1,
            label: "Погрузка",
            address: "Минск, ул. Складская, 12",
            latitude: 53.9045,
            longitude: 27.5615
          },
          {
            sequence: 2,
            label: "Контрольная точка",
            address: "Лида, трасса М6",
            latitude: 53.8833,
            longitude: 25.3022
          },
          {
            sequence: 3,
            label: "Разгрузка",
            address: "Гродно, ул. Производственная, 4",
            latitude: 53.6694,
            longitude: 23.8131
          }
        ]
      }
    }
  });

  const routeMinskBrest = await prisma.route.create({
    data: {
      name: "Минск - Брест",
      origin: "Минск",
      destination: "Брест",
      distanceKm: 349,
      estimatedHours: 5,
      points: {
        create: [
          {
            sequence: 1,
            label: "Погрузка",
            address: "Минск, ул. Складская, 12",
            latitude: 53.9045,
            longitude: 27.5615
          },
          {
            sequence: 2,
            label: "Стоянка",
            address: "Барановичи, сервисная зона",
            latitude: 53.1327,
            longitude: 26.0139
          },
          {
            sequence: 3,
            label: "Разгрузка",
            address: "Брест, ул. Московская, 210",
            latitude: 52.0976,
            longitude: 23.7341
          }
        ]
      }
    }
  });

  const routeMinskVitebsk = await prisma.route.create({
    data: {
      name: "Минск - Витебск",
      origin: "Минск",
      destination: "Витебск",
      distanceKm: 279,
      estimatedHours: 4,
      points: {
        create: [
          {
            sequence: 1,
            label: "Погрузка",
            address: "Минск, ул. Монтажников, 18",
            latitude: 53.9045,
            longitude: 27.5615
          },
          {
            sequence: 2,
            label: "Контрольная точка",
            address: "Орша, трасса М1",
            latitude: 54.5081,
            longitude: 30.4172
          },
          {
            sequence: 3,
            label: "Разгрузка",
            address: "Витебск, ул. Терешковой, 11",
            latitude: 55.1904,
            longitude: 30.2049
          }
        ]
      }
    }
  });

  const routeMinskMogilev = await prisma.route.create({
    data: {
      name: "Минск - Могилев",
      origin: "Минск",
      destination: "Могилев",
      distanceKm: 199,
      estimatedHours: 3,
      points: {
        create: [
          {
            sequence: 1,
            label: "Погрузка",
            address: "Минская область, агрогородок Колодищи, ул. Полевая, 7",
            latitude: 53.9408,
            longitude: 27.7826
          },
          {
            sequence: 2,
            label: "Контрольная точка",
            address: "Березино, трасса М4",
            latitude: 53.8391,
            longitude: 28.9879
          },
          {
            sequence: 3,
            label: "Разгрузка",
            address: "Могилев, ул. Челюскинцев, 105",
            latitude: 53.9006,
            longitude: 30.3314
          }
        ]
      }
    }
  });

  const [cargoA, cargoB] = await Promise.all([
    prisma.cargo.create({
      data: {
        name: "Охлажденные продукты",
        type: "REFRIGERATED",
        weightKg: 7200,
        volumeM3: 34,
        temperatureFrom: 2,
        temperatureTo: 6
      }
    }),
    prisma.cargo.create({
      data: {
        name: "Паллеты с упаковкой",
        type: "PALLET",
        weightKg: 10500,
        volumeM3: 52
      }
    })
  ]);

  const [cargoC, cargoD, cargoE, cargoF] = await Promise.all([
    prisma.cargo.create({
      data: {
        name: "Зерновые культуры",
        type: "BULK",
        weightKg: 18500,
        volumeM3: 64
      }
    }),
    prisma.cargo.create({
      data: {
        name: "Контейнер с электроникой",
        type: "CONTAINER",
        weightKg: 12300,
        volumeM3: 48
      }
    }),
    prisma.cargo.create({
      data: {
        name: "Медицинские реагенты",
        type: "HAZARDOUS",
        weightKg: 2600,
        volumeM3: 12,
        temperatureFrom: 4,
        temperatureTo: 8,
        hazardClass: "ADR 6.1"
      }
    }),
    prisma.cargo.create({
      data: {
        name: "Паллеты с бытовой химией",
        type: "PALLET",
        weightKg: 9100,
        volumeM3: 46
      }
    })
  ]);

  const [orderA, orderB] = await Promise.all([
    prisma.logisticsOrder.create({
      data: {
        code: "TL-0001",
        title: "Доставка охлажденных продуктов",
        status: "IN_PROGRESS",
        priority: "HIGH",
        pickupAddress: "Минск, ул. Складская, 12",
        deliveryAddress: "Гродно, ул. Производственная, 4",
        pickupDate: new Date("2026-04-12T08:00:00.000Z"),
        deliveryDate: new Date("2026-04-12T15:00:00.000Z"),
        price: 1320,
        notes: "Соблюдать температурный режим",
        clientId: clientCompany.id,
        cargoId: cargoA.id,
        createdById: client.id
      }
    }),
    prisma.logisticsOrder.create({
      data: {
        code: "TL-0002",
        title: "Доставка упаковочных материалов",
        status: "NEW",
        priority: "NORMAL",
        pickupAddress: "Минск, ул. Складская, 12",
        deliveryAddress: "Брест, ул. Московская, 210",
        pickupDate: new Date("2026-04-13T09:30:00.000Z"),
        deliveryDate: new Date("2026-04-13T18:00:00.000Z"),
        price: 1490,
        clientId: clientCompany.id,
        cargoId: cargoB.id,
        createdById: dispatcher.id
      }
    })
  ]);

  const [orderC, orderD, orderE, orderF, orderG] = await Promise.all([
    prisma.logisticsOrder.create({
      data: {
        code: "TL-0003",
        title: "Перевозка зерновых культур",
        status: "COMPLETED",
        priority: "NORMAL",
        pickupAddress: "Минская область, агрогородок Колодищи, ул. Полевая, 7",
        deliveryAddress: "Могилев, ул. Челюскинцев, 105",
        pickupDate: new Date("2026-04-08T07:30:00.000Z"),
        deliveryDate: new Date("2026-04-08T14:30:00.000Z"),
        price: 980,
        notes: "Проверить пломбу перед разгрузкой",
        clientId: retailCompany.id,
        cargoId: cargoC.id,
        createdById: retailClient.id
      }
    }),
    prisma.logisticsOrder.create({
      data: {
        code: "TL-0004",
        title: "Доставка контейнера с электроникой",
        status: "IN_PROGRESS",
        priority: "URGENT",
        pickupAddress: "Минск, ул. Монтажников, 18",
        deliveryAddress: "Витебск, ул. Терешковой, 11",
        pickupDate: new Date("2026-04-12T11:00:00.000Z"),
        deliveryDate: new Date("2026-04-12T17:30:00.000Z"),
        price: 1680,
        notes: "Требуется фотофиксация загрузки",
        clientId: clientCompany.id,
        cargoId: cargoD.id,
        createdById: dispatcher.id
      }
    }),
    prisma.logisticsOrder.create({
      data: {
        code: "TL-0005",
        title: "Перевозка медицинских реагентов",
        status: "IN_PROGRESS",
        priority: "URGENT",
        pickupAddress: "Минск, пр. Дзержинского, 104",
        deliveryAddress: "Гродно, ул. Горького, 91",
        pickupDate: new Date("2026-04-12T06:00:00.000Z"),
        deliveryDate: new Date("2026-04-12T13:00:00.000Z"),
        price: 2210,
        notes: "ADR, контроль температуры каждые два часа",
        clientId: retailCompany.id,
        cargoId: cargoE.id,
        createdById: dispatcher.id
      }
    }),
    prisma.logisticsOrder.create({
      data: {
        code: "TL-0006",
        title: "Региональная доставка бытовой химии",
        status: "NEW",
        priority: "HIGH",
        pickupAddress: "Минск, ул. Складская, 12",
        deliveryAddress: "Брест, ул. Московская, 210",
        pickupDate: new Date("2026-04-14T08:45:00.000Z"),
        deliveryDate: new Date("2026-04-14T18:30:00.000Z"),
        price: 1570,
        clientId: retailCompany.id,
        cargoId: cargoF.id,
        createdById: retailClient.id
      }
    }),
    prisma.logisticsOrder.create({
      data: {
        code: "TL-0007",
        title: "Допоставка упаковочных материалов",
        status: "DRAFT",
        priority: "LOW",
        pickupAddress: "Минск, ул. Складская, 12",
        deliveryAddress: "Витебск, ул. Терешковой, 11",
        pickupDate: new Date("2026-04-15T10:00:00.000Z"),
        deliveryDate: new Date("2026-04-15T18:00:00.000Z"),
        price: 1120,
        notes: "Согласовать точное окно разгрузки",
        clientId: clientCompany.id,
        cargoId: cargoB.id,
        createdById: client.id
      }
    })
  ]);

  await prisma.shipment.create({
    data: {
      trackingNumber: "TRK-00001",
      status: "IN_TRANSIT",
      orderId: orderA.id,
      carrierId: carrierCompany.id,
      driverId: driverA.id,
      vehicleId: vehicleA.id,
      routeId: routeMinskGrodno.id,
      plannedStart: new Date("2026-04-12T08:00:00.000Z"),
      actualStart: new Date("2026-04-12T08:15:00.000Z"),
      plannedFinish: new Date("2026-04-12T15:00:00.000Z"),
      currentLatitude: 53.8833,
      currentLongitude: 25.3022,
      events: {
        create: [
          {
            type: "CREATED",
            message: "Рейс создан диспетчером",
            location: "Минск",
            createdById: dispatcher.id
          },
          {
            type: "LOADED",
            message: "Груз принят водителем",
            location: "Минск",
            createdById: carrier.id
          },
          {
            type: "CHECKPOINT",
            message: "Машина прошла контрольную точку",
            location: "Лида",
            latitude: 53.8833,
            longitude: 25.3022,
            createdById: carrier.id
          }
        ]
      }
    }
  });

  await prisma.shipment.create({
    data: {
      trackingNumber: "TRK-00002",
      status: "PLANNED",
      orderId: orderB.id,
      carrierId: carrierCompany.id,
      driverId: driverB.id,
      vehicleId: vehicleB.id,
      routeId: routeMinskBrest.id,
      plannedStart: new Date("2026-04-13T09:30:00.000Z"),
      plannedFinish: new Date("2026-04-13T18:00:00.000Z"),
      events: {
        create: {
          type: "CREATED",
          message: "Рейс запланирован",
          location: "Минск",
          createdById: dispatcher.id
        }
      }
    }
  });

  await Promise.all([
    prisma.shipment.create({
      data: {
        trackingNumber: "TRK-00003",
        status: "DELIVERED",
        orderId: orderC.id,
        carrierId: expressCarrierCompany.id,
        driverId: driverD.id,
        vehicleId: vehicleD.id,
        routeId: routeMinskMogilev.id,
        plannedStart: new Date("2026-04-08T07:30:00.000Z"),
        actualStart: new Date("2026-04-08T07:40:00.000Z"),
        plannedFinish: new Date("2026-04-08T14:30:00.000Z"),
        actualFinish: new Date("2026-04-08T14:10:00.000Z"),
        currentLatitude: 53.9006,
        currentLongitude: 30.3314,
        events: {
          create: [
            {
              type: "CREATED",
              message: "Рейс создан по заявке клиента",
              location: "Колодищи",
              createdById: dispatcher.id
            },
            {
              type: "LOADED",
              message: "Зерновые загружены, пломба проверена",
              location: "Колодищи",
              createdById: expressCarrier.id
            },
            {
              type: "DEPARTED",
              message: "Автомобиль вышел на маршрут",
              location: "Минская область",
              createdById: expressCarrier.id
            },
            {
              type: "DELIVERED",
              message: "Груз доставлен и принят складом",
              location: "Могилев",
              latitude: 53.9006,
              longitude: 30.3314,
              createdById: dispatcher.id
            }
          ]
        }
      }
    }),
    prisma.shipment.create({
      data: {
        trackingNumber: "TRK-00004",
        status: "LOADING",
        orderId: orderD.id,
        carrierId: expressCarrierCompany.id,
        driverId: driverE.id,
        vehicleId: vehicleE.id,
        routeId: routeMinskVitebsk.id,
        plannedStart: new Date("2026-04-12T11:00:00.000Z"),
        plannedFinish: new Date("2026-04-12T17:30:00.000Z"),
        currentLatitude: 53.9045,
        currentLongitude: 27.5615,
        events: {
          create: [
            {
              type: "CREATED",
              message: "Срочный рейс согласован с перевозчиком",
              location: "Минск",
              createdById: dispatcher.id
            },
            {
              type: "LOADED",
              message: "Идет погрузка контейнера",
              location: "Минск, ул. Монтажников",
              latitude: 53.9045,
              longitude: 27.5615,
              createdById: expressCarrier.id
            }
          ]
        }
      }
    }),
    prisma.shipment.create({
      data: {
        trackingNumber: "TRK-00005",
        status: "DELAYED",
        orderId: orderE.id,
        carrierId: carrierCompany.id,
        driverId: driverA.id,
        vehicleId: vehicleA.id,
        routeId: routeMinskGrodno.id,
        plannedStart: new Date("2026-04-12T06:00:00.000Z"),
        actualStart: new Date("2026-04-12T06:20:00.000Z"),
        plannedFinish: new Date("2026-04-12T13:00:00.000Z"),
        currentLatitude: 53.8833,
        currentLongitude: 25.3022,
        events: {
          create: [
            {
              type: "CREATED",
              message: "Рейс ADR создан диспетчером",
              location: "Минск",
              createdById: dispatcher.id
            },
            {
              type: "LOADED",
              message: "Груз принят с температурным контролем",
              location: "Минск",
              createdById: carrier.id
            },
            {
              type: "PROBLEM",
              message: "Задержка на контрольной точке, ожидается окно разгрузки",
              location: "Лида",
              latitude: 53.8833,
              longitude: 25.3022,
              createdById: carrier.id
            }
          ]
        }
      }
    }),
    prisma.shipment.create({
      data: {
        trackingNumber: "TRK-00006",
        status: "PLANNED",
        orderId: orderF.id,
        carrierId: carrierCompany.id,
        driverId: driverB.id,
        vehicleId: vehicleB.id,
        routeId: routeMinskBrest.id,
        plannedStart: new Date("2026-04-14T08:45:00.000Z"),
        plannedFinish: new Date("2026-04-14T18:30:00.000Z"),
        events: {
          create: {
            type: "CREATED",
            message: "Рейс ожидает подтверждения окна погрузки",
            location: "Минск",
            createdById: dispatcher.id
          }
        }
      }
    })
  ]);

  await Promise.all([
    prisma.reportRequest.create({
      data: {
        type: "SHIPMENT_SUMMARY",
        delivery: "DOWNLOAD",
        fileName: "otchet-po-reysam.xlsx",
        createdById: dispatcher.id
      }
    }),
    prisma.reportRequest.create({
      data: {
        type: "FLEET_UTILIZATION",
        delivery: "DOWNLOAD",
        fileName: "zagruzka-avtoparka.pdf",
        createdById: carrier.id
      }
    })
  ]);

  const counts = await prisma.$transaction([
    prisma.role.count(),
    prisma.company.count(),
    prisma.user.count(),
    prisma.cargo.count(),
    prisma.logisticsOrder.count(),
    prisma.vehicle.count(),
    prisma.driver.count(),
    prisma.route.count(),
    prisma.routePoint.count(),
    prisma.shipment.count(),
    prisma.shipmentEvent.count(),
    prisma.reportRequest.count()
  ]);
  const totalRecords = counts.reduce((sum, count) => sum + count, 0);

  console.info(`Seed completed: ${totalRecords} records across ${counts.length} tables.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
