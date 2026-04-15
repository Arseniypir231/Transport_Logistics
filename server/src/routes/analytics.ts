import { Router } from "express";
import type { ShipmentStatus } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();

router.use(authenticate);

const statusLabels: Record<ShipmentStatus, string> = {
  PLANNED: "Запланирован",
  LOADING: "Погрузка",
  IN_TRANSIT: "В пути",
  DELIVERED: "Доставлен",
  DELAYED: "Задержан",
  CANCELLED: "Отменен"
};

const monthFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "short",
  year: "numeric"
});

function numberValue(value: unknown) {
  return Number(value ?? 0);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonths(count: number) {
  const now = new Date();

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - index - 1), 1);

    return {
      key: monthKey(date),
      label: monthFormatter.format(date).replace(".", ""),
      revenue: 0,
      orders: 0,
      shipments: 0
    };
  });
}

router.get("/", async (req, res) => {
  const period = req.query.period === "12m" ? "12m" : "6m";
  const months = buildMonths(period === "12m" ? 12 : 6);
  const startDate = new Date(new Date().getFullYear(), new Date().getMonth() - months.length + 1, 1);
  const byMonth = new Map(months.map((month) => [month.key, { ...month }]));

  const [orders, shipments, vehicles, drivers] = await Promise.all([
    prisma.logisticsOrder.findMany({
      where: {
        pickupDate: {
          gte: startDate
        }
      },
      include: {
        cargo: true
      }
    }),
    prisma.shipment.findMany({
      where: {
        plannedStart: {
          gte: startDate
        }
      },
      include: {
        order: {
          include: {
            cargo: true
          }
        },
        route: true
      }
    }),
    prisma.vehicle.count(),
    prisma.driver.count()
  ]);

  orders.forEach((order) => {
    const item = byMonth.get(monthKey(order.pickupDate));

    if (item) {
      item.orders += 1;
      item.revenue += numberValue(order.price);
    }
  });

  shipments.forEach((shipment) => {
    const item = byMonth.get(monthKey(shipment.plannedStart));

    if (item) {
      item.shipments += 1;
    }
  });

  const shipmentsByStatus = Object.entries(statusLabels).map(([status, label]) => ({
    status,
    label,
    count: shipments.filter((shipment) => shipment.status === status).length
  }));

  const routes = new Map<string, { route: string; shipments: number; revenue: number; weightKg: number }>();

  shipments.forEach((shipment) => {
    const routeName = shipment.route?.name ?? "Без маршрута";
    const route = routes.get(routeName) ?? {
      route: routeName,
      shipments: 0,
      revenue: 0,
      weightKg: 0
    };

    route.shipments += 1;
    route.revenue += numberValue(shipment.order.price);
    route.weightKg += numberValue(shipment.order.cargo.weightKg);
    routes.set(routeName, route);
  });

  const topRoutes = Array.from(routes.values())
    .sort((left, right) => right.shipments - left.shipments || right.revenue - left.revenue)
    .slice(0, 10);

  res.json({
    period,
    summary: {
      orders: orders.length,
      shipments: shipments.length,
      vehicles,
      drivers,
      revenue: orders.reduce((sum, order) => sum + numberValue(order.price), 0),
      cargoWeightKg: orders.reduce((sum, order) => sum + numberValue(order.cargo.weightKg), 0)
    },
    monthly: Array.from(byMonth.values()),
    shipmentsByStatus,
    topRoutes
  });
});

export { router as analyticsRouter };
