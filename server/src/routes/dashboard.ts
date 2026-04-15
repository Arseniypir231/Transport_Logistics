import { Router } from "express";
import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", async (_req, res) => {
  const [ordersTotal, shipmentsTotal, vehiclesTotal, driversTotal, activeShipments, delayedShipments, byStatus, recentShipments] =
    await Promise.all([
      prisma.logisticsOrder.count(),
      prisma.shipment.count(),
      prisma.vehicle.count(),
      prisma.driver.count(),
      prisma.shipment.count({ where: { status: { in: ["PLANNED", "LOADING", "IN_TRANSIT"] } } }),
      prisma.shipment.count({ where: { status: "DELAYED" } }),
      prisma.shipment.groupBy({
        by: ["status"],
        _count: { status: true }
      }),
      prisma.shipment.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          order: {
            include: {
              client: true
            }
          },
          driver: true,
          vehicle: true
        }
      })
    ]);

  res.json({
    metrics: {
      ordersTotal,
      shipmentsTotal,
      vehiclesTotal,
      driversTotal,
      activeShipments,
      delayedShipments
    },
    shipmentsByStatus: byStatus.map((item) => ({
      status: item.status,
      count: item._count.status
    })),
    recentShipments
  });
});

export { router as dashboardRouter };
