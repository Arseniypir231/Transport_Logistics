import "express-async-errors";

import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import cors from "cors";
import ExcelJS from "exceljs";
import express, { type Request, type RequestHandler } from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import { z } from "zod";
import { loadProjectEnv } from "./env.js";

loadProjectEnv();

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const JWT_SECRET = process.env.JWT_SECRET ?? "transport-logistics-coursework-secret";
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:3000";

type RoleSlug = "dispatcher" | "client" | "carrier";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: RoleSlug;
  companyId?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const roleLabels: Record<RoleSlug, string> = {
  dispatcher: "Диспетчер",
  client: "Клиент",
  carrier: "Перевозчик"
};

class HttpError extends Error {
  constructor(
    message: string,
    public status = 500
  ) {
    super(message);
  }
}

function httpError(message: string, status = 500) {
  return new HttpError(message, status);
}

function signToken(user: {
  id: string;
  email: string;
  name: string;
  role: { slug: string };
  companyId?: string | null;
}) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.slug,
      companyId: user.companyId
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function currentUser(req: Request) {
  if (!req.user) {
    throw httpError("Authentication is required", 401);
  }
  return req.user;
}

function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  status: string;
  role: { slug: string; name: string };
  company?: { id: string; name: string; type: string } | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    role: user.role,
    company: user.company
  };
}

const authenticate: RequestHandler = async (req, _res, next) => {
  const raw = req.headers.authorization;
  const token = raw?.startsWith("Bearer ") ? raw.slice(7) : undefined;

  if (!token) {
    throw httpError("Authorization token is required", 401);
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch {
    throw httpError("Authorization token is invalid", 401);
  }
};

function requireRoles(...roles: RoleSlug[]): RequestHandler {
  return (req, _res, next) => {
    const user = currentUser(req);
    if (!roles.includes(user.role)) {
      throw httpError("Not enough permissions for this action", 403);
    }
    next();
  };
}

function parseQueryString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

const cargoTypeValues = ["PALLET", "BULK", "CONTAINER", "REFRIGERATED", "HAZARDOUS"] as const;
const orderStatusValues = ["DRAFT", "NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
const shipmentStatusValues = ["PLANNED", "LOADING", "IN_TRANSIT", "DELIVERED", "DELAYED", "CANCELLED"] as const;

function parseEnumQuery<T extends readonly string[]>(value: unknown, allowed: T) {
  const raw = parseQueryString(value);
  return raw && allowed.includes(raw) ? (raw as T[number]) : undefined;
}

function createFileResponse(fileName: string, mimeType: string, buffer: Buffer) {
  return {
    fileName,
    mimeType,
    buffer
  };
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ru-RU");
}

async function ensureRole(slug: RoleSlug) {
  return prisma.role.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      name: roleLabels[slug],
      description:
        slug === "dispatcher"
          ? "Управляет заявками, рейсами, справочниками и отчетами"
          : slug === "carrier"
            ? "Управляет автопарком и выполнением рейсов"
            : "Создает заявки и отслеживает доставку"
    }
  });
}

app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:3000", "http://localhost:5173"],
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "transport-logistics-api" });
});

const authRouter = express.Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  roleSlug: z.enum(["client", "carrier"]).default("client"),
  companyName: z.string().min(2).optional(),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

authRouter.post("/register", async (req, res) => {
  const data = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: data.email } });

  if (exists) {
    throw httpError("User with this email already exists", 409);
  }

  const role = await ensureRole(data.roleSlug);
  const company = await prisma.company.create({
    data: {
      name: data.companyName ?? `${data.name} company`,
      type: data.roleSlug === "carrier" ? "CARRIER" : "CLIENT",
      contactEmail: data.email,
      phone: data.phone
    }
  });
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 10),
      roleId: role.id,
      companyId: company.id
    },
    include: { role: true, company: true }
  });

  res.status(201).json({ token: signToken(user), user: toPublicUser(user) });
});

authRouter.post("/login", async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { role: true, company: true }
  });

  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    throw httpError("Invalid email or password", 401);
  }

  if (user.status === "BLOCKED") {
    throw httpError("User is blocked", 403);
  }

  res.json({ token: signToken(user), user: toPublicUser(user) });
});

authRouter.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: currentUser(req).id },
    include: { role: true, company: true }
  });

  if (!user) {
    throw httpError("User was not found", 404);
  }

  res.json({ user: toPublicUser(user) });
});

const catalogRouter = express.Router();
catalogRouter.use(authenticate);
catalogRouter.get("/", async (_req, res) => {
  const [companies, cargo, orders, drivers, vehicles, routes] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.cargo.findMany({ orderBy: { name: "asc" } }),
    prisma.logisticsOrder.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.driver.findMany({ orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { plateNumber: "asc" } }),
    prisma.route.findMany({ orderBy: { name: "asc" }, include: { points: { orderBy: { sequence: "asc" } } } })
  ]);

  res.json({ companies, cargo, orders, drivers, vehicles, routes });
});

const dashboardRouter = express.Router();
dashboardRouter.use(authenticate);
dashboardRouter.get("/", async (_req, res) => {
  const [ordersTotal, activeOrders, shipmentsTotal, delayedShipments, vehicles, drivers, lastShipments] =
    await Promise.all([
      prisma.logisticsOrder.count(),
      prisma.logisticsOrder.count({ where: { status: { in: ["NEW", "IN_PROGRESS"] } } }),
      prisma.shipment.count(),
      prisma.shipment.count({ where: { status: "DELAYED" } }),
      prisma.vehicle.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.driver.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.shipment.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: { order: { include: { client: true } }, carrier: true, driver: true, vehicle: true }
      })
    ]);

  res.json({
    metrics: {
      ordersTotal,
      activeOrders,
      shipmentsTotal,
      delayedShipments,
      vehiclesAvailable: vehicles.find((item) => item.status === "AVAILABLE")?._count._all ?? 0,
      driversAvailable: drivers.find((item) => item.status === "AVAILABLE")?._count._all ?? 0
    },
    vehicleStatuses: vehicles,
    driverStatuses: drivers,
    lastShipments
  });
});

const analyticsRouter = express.Router();
analyticsRouter.use(authenticate);
analyticsRouter.get("/", async (req, res) => {
  const requestedMonths = Number.parseInt(parseQueryString(req.query.months) ?? "12", 10);
  const months = Math.min(24, Math.max(3, Number.isFinite(requestedMonths) ? requestedMonths : 12));
  const cargoType = parseEnumQuery(req.query.cargoType, cargoTypeValues);
  const orderStatus = parseEnumQuery(req.query.orderStatus, orderStatusValues);
  const shipmentStatus = parseEnumQuery(req.query.shipmentStatus, shipmentStatusValues);
  const now = new Date();
  const fromDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  const orderWhere: Prisma.LogisticsOrderWhereInput = {
    pickupDate: { gte: fromDate },
    ...(cargoType ? { cargo: { type: cargoType } } : {}),
    ...(orderStatus ? { status: orderStatus } : {})
  };
  const shipmentOrderWhere: Prisma.LogisticsOrderWhereInput = {
    ...(cargoType ? { cargo: { type: cargoType } } : {}),
    ...(orderStatus ? { status: orderStatus } : {})
  };
  const shipmentWhere: Prisma.ShipmentWhereInput = {
    plannedStart: { gte: fromDate },
    ...(shipmentStatus ? { status: shipmentStatus } : {}),
    ...(Object.keys(shipmentOrderWhere).length ? { order: shipmentOrderWhere } : {})
  };

  const [orders, shipments, vehicleStatuses, driverStatuses] = await Promise.all([
    prisma.logisticsOrder.findMany({
      where: orderWhere,
      include: { cargo: true, client: true },
      orderBy: { pickupDate: "asc" }
    }),
    prisma.shipment.findMany({
      where: shipmentWhere,
      include: {
        order: { include: { cargo: true, client: true } },
        vehicle: true,
        route: true
      },
      orderBy: { plannedStart: "asc" }
    }),
    prisma.vehicle.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.driver.groupBy({ by: ["status"], _count: { _all: true } })
  ]);

  const monthFormatter = new Intl.DateTimeFormat("ru-RU", { month: "short", year: "2-digit" });
  const monthBuckets = Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - months + index + 1, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      label: monthFormatter.format(date),
      revenue: 0,
      orders: 0,
      shipments: 0,
      prices: [] as number[]
    };
  });
  const monthlyMap = new Map(monthBuckets.map((bucket) => [bucket.key, bucket]));

  orders.forEach((order) => {
    const date = new Date(order.pickupDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const bucket = monthlyMap.get(key);
    const price = Number(order.price);

    if (bucket) {
      bucket.revenue += price;
      bucket.orders += 1;
      bucket.prices.push(price);
    }
  });

  shipments.forEach((shipment) => {
    const date = new Date(shipment.plannedStart);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const bucket = monthlyMap.get(key);

    if (bucket) {
      bucket.shipments += 1;
    }
  });

  const countBy = <T>(items: T[], getKey: (item: T) => string) => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const key = getKey(item);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([key, value]) => ({ key, value }))
      .sort((left, right) => right.value - left.value);
  };

  const cargoTypeMap = new Map<string, { type: string; value: number; revenue: number }>();
  const cargoMap = new Map<string, { key: string; label: string; value: number; revenue: number }>();
  const clientMap = new Map<string, { key: string; label: string; value: number; revenue: number }>();

  orders.forEach((order) => {
    const price = Number(order.price);
    const typeRow = cargoTypeMap.get(order.cargo.type) ?? { type: order.cargo.type, value: 0, revenue: 0 };
    typeRow.value += 1;
    typeRow.revenue += price;
    cargoTypeMap.set(order.cargo.type, typeRow);

    const cargoRow = cargoMap.get(order.cargo.id) ?? { key: order.cargo.id, label: order.cargo.name, value: 0, revenue: 0 };
    cargoRow.value += 1;
    cargoRow.revenue += price;
    cargoMap.set(order.cargo.id, cargoRow);

    const clientRow = clientMap.get(order.client.id) ?? { key: order.client.id, label: order.client.name, value: 0, revenue: 0 };
    clientRow.value += 1;
    clientRow.revenue += price;
    clientMap.set(order.client.id, clientRow);
  });

  const monthlyRevenue = monthBuckets.map((bucket) => {
    const totalPrice = bucket.prices.reduce((sum, value) => sum + value, 0);
    return {
      key: bucket.key,
      label: bucket.label,
      revenue: Math.round(bucket.revenue),
      orders: bucket.orders,
      shipments: bucket.shipments,
      averagePrice: bucket.prices.length ? Math.round(totalPrice / bucket.prices.length) : 0,
      minPrice: bucket.prices.length ? Math.round(Math.min(...bucket.prices)) : 0,
      maxPrice: bucket.prices.length ? Math.round(Math.max(...bucket.prices)) : 0
    };
  });
  const revenue = orders.reduce((sum, order) => sum + Number(order.price), 0);

  res.json({
    filters: { months, cargoType, orderStatus, shipmentStatus },
    totals: {
      revenue: Math.round(revenue),
      orders: orders.length,
      shipments: shipments.length,
      averageOrderPrice: orders.length ? Math.round(revenue / orders.length) : 0,
      delayedShipments: shipments.filter((shipment) => shipment.status === "DELAYED").length
    },
    monthlyRevenue,
    priceComparison: monthlyRevenue.map((item) => ({
      key: item.key,
      label: item.label,
      averagePrice: item.averagePrice,
      minPrice: item.minPrice,
      maxPrice: item.maxPrice
    })),
    ordersByStatus: countBy(orders, (order) => order.status),
    shipmentsByStatus: countBy(shipments, (shipment) => shipment.status),
    cargoByType: Array.from(cargoTypeMap.values()).sort((left, right) => right.value - left.value),
    topCargo: Array.from(cargoMap.values()).sort((left, right) => right.value - left.value).slice(0, 10),
    topClients: Array.from(clientMap.values()).sort((left, right) => right.revenue - left.revenue).slice(0, 10),
    vehicleStatuses,
    driverStatuses,
    filterOptions: {
      months: [3, 6, 12, 24],
      cargoTypes: cargoTypeValues,
      orderStatuses: orderStatusValues,
      shipmentStatuses: shipmentStatusValues
    }
  });
});

const ordersRouter = express.Router();
ordersRouter.use(authenticate);

const cargoSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["PALLET", "BULK", "CONTAINER", "REFRIGERATED", "HAZARDOUS"]).default("PALLET"),
  weightKg: z.coerce.number().positive(),
  volumeM3: z.coerce.number().positive(),
  temperatureFrom: z.coerce.number().optional(),
  temperatureTo: z.coerce.number().optional(),
  hazardClass: z.string().optional()
});

const createOrderSchema = z.object({
  title: z.string().min(3),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  pickupAddress: z.string().min(3),
  deliveryAddress: z.string().min(3),
  pickupDate: z.coerce.date(),
  deliveryDate: z.coerce.date(),
  price: z.coerce.number().nonnegative(),
  notes: z.string().optional(),
  clientId: z.string().optional(),
  cargo: cargoSchema
});

const updateOrderSchema = createOrderSchema
  .omit({ cargo: true, clientId: true })
  .partial()
  .extend({ status: z.enum(["DRAFT", "NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional() });

ordersRouter.get("/", async (req, res) => {
  const status = parseQueryString(req.query.status);
  const search = parseQueryString(req.query.search);
  const sort = parseQueryString(req.query.sort) ?? "createdAt";

  const orders = await prisma.logisticsOrder.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { title: { contains: search, mode: "insensitive" } },
              { pickupAddress: { contains: search, mode: "insensitive" } },
              { deliveryAddress: { contains: search, mode: "insensitive" } }
            ]
          }
        : {})
    },
    orderBy: sort === "price" ? { price: "desc" } : sort === "priority" ? { priority: "desc" } : { createdAt: "desc" },
    include: {
      client: true,
      cargo: true,
      shipments: { select: { id: true, trackingNumber: true, status: true } }
    }
  });

  res.json({ orders });
});

ordersRouter.post("/", requireRoles("dispatcher", "client"), async (req, res) => {
  const data = createOrderSchema.parse(req.body);
  const user = currentUser(req);
  const fallbackClient = await prisma.company.findFirst({ where: { type: "CLIENT" }, select: { id: true } });
  const clientId = data.clientId ?? user.companyId ?? fallbackClient?.id;

  if (!clientId) {
    throw httpError("Client company is required to create an order", 400);
  }

  const count = await prisma.logisticsOrder.count();
  const order = await prisma.logisticsOrder.create({
    data: {
      code: `TL-${String(count + 1).padStart(4, "0")}`,
      title: data.title,
      priority: data.priority,
      pickupAddress: data.pickupAddress,
      deliveryAddress: data.deliveryAddress,
      pickupDate: data.pickupDate,
      deliveryDate: data.deliveryDate,
      price: data.price,
      notes: data.notes,
      client: { connect: { id: clientId } },
      createdBy: { connect: { id: user.id } },
      cargo: { create: data.cargo }
    },
    include: { client: true, cargo: true, shipments: true }
  });

  res.status(201).json({ order });
});

ordersRouter.get("/:id", async (req, res) => {
  const order = await prisma.logisticsOrder.findUnique({
    where: { id: req.params.id },
    include: {
      client: true,
      cargo: true,
      createdBy: { select: { id: true, name: true, email: true } },
      shipments: { include: { carrier: true, driver: true, vehicle: true, route: true } }
    }
  });

  if (!order) {
    throw httpError("Order was not found", 404);
  }

  res.json({ order });
});

ordersRouter.patch("/:id", requireRoles("dispatcher", "client"), async (req, res) => {
  const order = await prisma.logisticsOrder.update({
    where: { id: req.params.id },
    data: updateOrderSchema.parse(req.body),
    include: { client: true, cargo: true, shipments: true }
  });
  res.json({ order });
});

ordersRouter.delete("/:id", requireRoles("dispatcher"), async (req, res) => {
  await prisma.logisticsOrder.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

const shipmentsRouter = express.Router();
shipmentsRouter.use(authenticate);

const createShipmentSchema = z.object({
  orderId: z.string(),
  carrierId: z.string(),
  driverId: z.string(),
  vehicleId: z.string(),
  routeId: z.string().optional(),
  plannedStart: z.coerce.date(),
  plannedFinish: z.coerce.date(),
  status: z.enum(["PLANNED", "LOADING", "IN_TRANSIT", "DELIVERED", "DELAYED", "CANCELLED"]).default("PLANNED")
});

const updateShipmentSchema = createShipmentSchema
  .omit({ orderId: true, carrierId: true, plannedStart: true, plannedFinish: true })
  .partial()
  .extend({
    actualStart: z.coerce.date().nullable().optional(),
    actualFinish: z.coerce.date().nullable().optional(),
    currentLatitude: z.coerce.number().nullable().optional(),
    currentLongitude: z.coerce.number().nullable().optional()
  });

const eventSchema = z.object({
  type: z.enum(["CREATED", "LOADED", "DEPARTED", "CHECKPOINT", "ARRIVED", "DELIVERED", "PROBLEM"]),
  message: z.string().min(3),
  location: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional()
});

shipmentsRouter.get("/", async (req, res) => {
  const status = parseQueryString(req.query.status);
  const search = parseQueryString(req.query.search);

  const shipments = await prisma.shipment.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { trackingNumber: { contains: search, mode: "insensitive" } },
              { order: { code: { contains: search, mode: "insensitive" } } },
              { order: { title: { contains: search, mode: "insensitive" } } },
              { driver: { name: { contains: search, mode: "insensitive" } } },
              { vehicle: { plateNumber: { contains: search, mode: "insensitive" } } }
            ]
          }
        : {})
    },
    orderBy: { updatedAt: "desc" },
    include: {
      order: { include: { client: true, cargo: true } },
      carrier: true,
      driver: true,
      vehicle: true,
      route: true,
      events: { orderBy: { createdAt: "desc" }, take: 3 }
    }
  });

  res.json({ shipments });
});

shipmentsRouter.post("/", requireRoles("dispatcher", "carrier"), async (req, res) => {
  const data = createShipmentSchema.parse(req.body);
  const user = currentUser(req);
  const count = await prisma.shipment.count();
  const shipment = await prisma.shipment.create({
    data: {
      ...data,
      trackingNumber: `TRK-${String(count + 1).padStart(5, "0")}`,
      events: {
        create: { type: "CREATED", message: "Рейс запланирован", createdById: user.id }
      }
    },
    include: { order: true, carrier: true, driver: true, vehicle: true, route: true, events: true }
  });

  await prisma.logisticsOrder.update({ where: { id: data.orderId }, data: { status: "IN_PROGRESS" } });
  res.status(201).json({ shipment });
});

shipmentsRouter.get("/:id", async (req, res) => {
  const shipment = await prisma.shipment.findUnique({
    where: { id: req.params.id },
    include: {
      order: { include: { client: true, cargo: true } },
      carrier: true,
      driver: true,
      vehicle: true,
      route: { include: { points: { orderBy: { sequence: "asc" } } } },
      events: { orderBy: { createdAt: "desc" }, include: { createdBy: { select: { id: true, name: true } } } }
    }
  });

  if (!shipment) {
    throw httpError("Shipment was not found", 404);
  }

  res.json({ shipment });
});

shipmentsRouter.patch("/:id", requireRoles("dispatcher", "carrier"), async (req, res) => {
  const shipment = await prisma.shipment.update({
    where: { id: req.params.id },
    data: updateShipmentSchema.parse(req.body),
    include: { order: true, carrier: true, driver: true, vehicle: true, route: true, events: true }
  });
  res.json({ shipment });
});

shipmentsRouter.post("/:id/events", requireRoles("dispatcher", "carrier"), async (req, res) => {
  const user = currentUser(req);
  const event = await prisma.shipmentEvent.create({
    data: { ...eventSchema.parse(req.body), shipmentId: req.params.id, createdById: user.id }
  });
  res.status(201).json({ event });
});

shipmentsRouter.delete("/:id", requireRoles("dispatcher"), async (req, res) => {
  await prisma.shipment.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

function buildCrudRouter<T extends z.AnyZodObject>(
  modelName: "vehicle" | "driver",
  schema: T,
  searchFields: string[]
) {
  const router = express.Router();
  router.use(authenticate);

  router.get("/", async (req, res) => {
    const search = parseQueryString(req.query.search);
    const where = search
      ? {
          OR: searchFields.map((field) => ({ [field]: { contains: search, mode: "insensitive" } }))
        }
      : {};
    const model = prisma[modelName] as never as {
      findMany(args: unknown): Promise<unknown[]>;
    };
    const rows = await model.findMany({ where, orderBy: modelName === "vehicle" ? { plateNumber: "asc" } : { name: "asc" } });
    res.json({ [modelName === "vehicle" ? "vehicles" : "drivers"]: rows });
  });

  router.post("/", requireRoles("dispatcher", "carrier"), async (req, res) => {
    const model = prisma[modelName] as never as {
      create(args: unknown): Promise<unknown>;
    };
    const row = await model.create({ data: schema.parse(req.body) });
    res.status(201).json({ [modelName]: row });
  });

  router.patch("/:id", requireRoles("dispatcher", "carrier"), async (req, res) => {
    const model = prisma[modelName] as never as {
      update(args: unknown): Promise<unknown>;
    };
    const row = await model.update({ where: { id: req.params.id }, data: schema.partial().parse(req.body) });
    res.json({ [modelName]: row });
  });

  router.delete("/:id", requireRoles("dispatcher"), async (req, res) => {
    const model = prisma[modelName] as never as {
      delete(args: unknown): Promise<unknown>;
    };
    await model.delete({ where: { id: req.params.id } });
    res.status(204).send();
  });

  return router;
}

const vehicleSchema = z.object({
  plateNumber: z.string().min(3),
  type: z.string().min(2),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().int().optional(),
  capacityKg: z.coerce.number().positive(),
  capacityM3: z.coerce.number().positive(),
  status: z.enum(["AVAILABLE", "ASSIGNED", "MAINTENANCE"]).default("AVAILABLE"),
  companyId: z.string()
});

const driverSchema = z.object({
  licenseNumber: z.string().min(3),
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional(),
  rating: z.coerce.number().min(1).max(5).default(5),
  status: z.enum(["AVAILABLE", "ON_ROUTE", "VACATION"]).default("AVAILABLE"),
  companyId: z.string()
});

const routesRouter = express.Router();
routesRouter.use(authenticate);

const routeSchema = z.object({
  name: z.string().min(3),
  origin: z.string().min(2),
  destination: z.string().min(2),
  distanceKm: z.coerce.number().positive(),
  estimatedHours: z.coerce.number().int().positive(),
  points: z
    .array(
      z.object({
        sequence: z.coerce.number().int().positive(),
        label: z.string().min(2),
        address: z.string().min(3),
        latitude: z.coerce.number(),
        longitude: z.coerce.number()
      })
    )
    .min(2)
});

routesRouter.get("/", async (_req, res) => {
  const routes = await prisma.route.findMany({ orderBy: { name: "asc" }, include: { points: { orderBy: { sequence: "asc" } } } });
  res.json({ routes });
});

routesRouter.post("/", requireRoles("dispatcher", "carrier"), async (req, res) => {
  const data = routeSchema.parse(req.body);
  const route = await prisma.route.create({
    data: {
      name: data.name,
      origin: data.origin,
      destination: data.destination,
      distanceKm: data.distanceKm,
      estimatedHours: data.estimatedHours,
      points: { create: data.points }
    },
    include: { points: { orderBy: { sequence: "asc" } } }
  });
  res.status(201).json({ route });
});

routesRouter.patch("/:id", requireRoles("dispatcher", "carrier"), async (req, res) => {
  const data = routeSchema.partial().parse(req.body);
  const route = await prisma.route.update({
    where: { id: req.params.id },
    data: {
      name: data.name,
      origin: data.origin,
      destination: data.destination,
      distanceKm: data.distanceKm,
      estimatedHours: data.estimatedHours
    },
    include: { points: { orderBy: { sequence: "asc" } } }
  });
  res.json({ route });
});

routesRouter.delete("/:id", requireRoles("dispatcher"), async (req, res) => {
  await prisma.route.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

function resolveCyrillicFont(): { regular?: string; bold?: string } {
  const winDir = process.env.WINDIR ?? "C:\\Windows";
  const candidates = {
    regular: [
      process.env.PDF_FONT_PATH,
      path.join(winDir, "Fonts", "arial.ttf"),
      "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
      "/usr/share/fonts/TTF/DejaVuSans.ttf",
      "/Library/Fonts/Arial.ttf",
      "/System/Library/Fonts/Supplemental/Arial.ttf"
    ],
    bold: [
      process.env.PDF_FONT_BOLD_PATH,
      path.join(winDir, "Fonts", "arialbd.ttf"),
      "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
      "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
      "/Library/Fonts/Arial Bold.ttf",
      "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    ]
  };

  const pick = (paths: (string | undefined)[]) =>
    paths.find((value): value is string => Boolean(value) && fs.existsSync(value as string));

  return { regular: pick(candidates.regular), bold: pick(candidates.bold) };
}

const cyrillicFont = resolveCyrillicFont();

async function makePdfReport(type: "shipments" | "fleet") {
  const doc = new PDFDocument({ margin: 42, size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  if (cyrillicFont.regular) {
    doc.registerFont("Cyrillic", cyrillicFont.regular);
    doc.registerFont("Cyrillic-Bold", cyrillicFont.bold ?? cyrillicFont.regular);
    doc.font("Cyrillic-Bold");
  } else {
    console.warn("[reports] No Cyrillic-capable TTF found; PDF text may render as garbled characters. Set PDF_FONT_PATH in .env to a TTF with Cyrillic support.");
  }

  doc.fontSize(18).text(type === "shipments" ? "Отчет по рейсам" : "Отчет по загрузке автопарка");
  if (cyrillicFont.regular) {
    doc.font("Cyrillic");
  }
  doc.moveDown();
  doc.fontSize(10).text(`Сформировано: ${new Date().toLocaleString("ru-RU")}`);
  doc.moveDown();

  if (type === "shipments") {
    const shipments = await prisma.shipment.findMany({
      orderBy: { plannedStart: "desc" },
      take: 50,
      include: { order: true, carrier: true, driver: true, vehicle: true }
    });
    shipments.forEach((shipment) => {
      doc
        .fontSize(10)
        .text(
          `${shipment.trackingNumber} | ${shipment.status} | ${shipment.order.code} | ${shipment.driver.name} | ${formatDate(
            shipment.plannedStart
          )}`
        );
    });
  } else {
    const vehicles = await prisma.vehicle.findMany({ orderBy: { plateNumber: "asc" }, include: { company: true } });
    vehicles.forEach((vehicle) => {
      doc
        .fontSize(10)
        .text(`${vehicle.plateNumber} | ${vehicle.status} | ${vehicle.type} | ${vehicle.company.name} | ${vehicle.capacityKg} кг`);
    });
  }

  doc.end();
  const buffer = await done;
  return createFileResponse(`${type}-report.pdf`, "application/pdf", buffer);
}

async function makeExcelReport(type: "shipments" | "fleet") {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(type === "shipments" ? "Рейсы" : "Автопарк");

  if (type === "shipments") {
    sheet.columns = [
      { header: "Трекинг", key: "trackingNumber", width: 18 },
      { header: "Статус", key: "status", width: 16 },
      { header: "Заявка", key: "order", width: 14 },
      { header: "Водитель", key: "driver", width: 24 },
      { header: "Транспорт", key: "vehicle", width: 18 },
      { header: "Дата старта", key: "plannedStart", width: 16 }
    ];
    const shipments = await prisma.shipment.findMany({
      orderBy: { plannedStart: "desc" },
      include: { order: true, driver: true, vehicle: true }
    });
    shipments.forEach((shipment) => {
      sheet.addRow({
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        order: shipment.order.code,
        driver: shipment.driver.name,
        vehicle: shipment.vehicle.plateNumber,
        plannedStart: formatDate(shipment.plannedStart)
      });
    });
  } else {
    sheet.columns = [
      { header: "Номер", key: "plateNumber", width: 18 },
      { header: "Статус", key: "status", width: 16 },
      { header: "Тип", key: "type", width: 20 },
      { header: "Компания", key: "company", width: 24 },
      { header: "Грузоподъемность", key: "capacityKg", width: 20 }
    ];
    const vehicles = await prisma.vehicle.findMany({ orderBy: { plateNumber: "asc" }, include: { company: true } });
    vehicles.forEach((vehicle) => {
      sheet.addRow({
        plateNumber: vehicle.plateNumber,
        status: vehicle.status,
        type: vehicle.type,
        company: vehicle.company.name,
        capacityKg: String(vehicle.capacityKg)
      });
    });
  }

  sheet.getRow(1).font = { bold: true };
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  return createFileResponse(
    `${type}-report.xlsx`,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer
  );
}

const reportsRouter = express.Router();
reportsRouter.use(authenticate);

reportsRouter.get("/:type.:format", async (req, res) => {
  const type = z.enum(["shipments", "fleet"]).parse(req.params.type);
  const format = z.enum(["pdf", "xlsx"]).parse(req.params.format);
  const user = currentUser(req);
  const report = format === "pdf" ? await makePdfReport(type) : await makeExcelReport(type);

  await prisma.reportRequest.create({
    data: {
      type: type === "shipments" ? "SHIPMENT_SUMMARY" : "FLEET_UTILIZATION",
      delivery: "DOWNLOAD",
      fileName: report.fileName,
      createdById: user.id
    }
  });

  res.setHeader("Content-Type", report.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${report.fileName}"`);
  res.send(report.buffer);
});

app.use("/api/auth", authRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/shipments", shipmentsRouter);
app.use("/api/vehicles", buildCrudRouter("vehicle", vehicleSchema, ["plateNumber", "type", "make", "model"]));
app.use("/api/drivers", buildCrudRouter("driver", driverSchema, ["name", "phone", "email", "licenseNumber"]));
app.use("/api/routes", routesRouter);
app.use("/api/reports", reportsRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "..", "..", "..", "client", "dist");
app.use(express.static(clientDistPath));
app.use("/app", express.static(clientDistPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/health") {
    next();
    return;
  }
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.use((_req, _res) => {
  throw httpError("Route was not found", 404);
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ message: "Validation error", issues: err.issues });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const server = app.listen(PORT, () => {
  console.log(`Transport logistics API is running on http://localhost:${PORT}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the previous API process or set another PORT in .env.`);
    process.exit(1);
  }

  throw error;
});

process.on("SIGINT", async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});
