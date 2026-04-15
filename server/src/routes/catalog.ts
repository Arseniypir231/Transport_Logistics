import { Router } from "express";
import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", async (_req, res) => {
  const [companies, orders, vehicles, drivers, routes] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.logisticsOrder.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.vehicle.findMany({ orderBy: { plateNumber: "asc" } }),
    prisma.driver.findMany({ orderBy: { name: "asc" } }),
    prisma.route.findMany({ orderBy: { name: "asc" } })
  ]);

  res.json({
    companies,
    orders,
    vehicles,
    drivers,
    routes
  });
});

export { router as catalogRouter };
