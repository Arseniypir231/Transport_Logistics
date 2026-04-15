import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { httpError } from "../utils/http.js";

const router = Router();

router.use(authenticate);

const routePointSchema = z.object({
  sequence: z.coerce.number().int().min(1),
  label: z.string().min(2),
  address: z.string().min(3),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  plannedArrival: z.coerce.date().optional()
});

const createRouteSchema = z.object({
  name: z.string().min(2),
  origin: z.string().min(2),
  destination: z.string().min(2),
  distanceKm: z.coerce.number().positive(),
  estimatedHours: z.coerce.number().int().positive(),
  points: z.array(routePointSchema).min(2)
});

const updateRouteSchema = createRouteSchema.omit({ points: true }).partial();

router.get("/", async (_req, res) => {
  const routes = await prisma.route.findMany({
    orderBy: { name: "asc" },
    include: {
      points: {
        orderBy: { sequence: "asc" }
      },
      shipments: {
        select: {
          id: true,
          trackingNumber: true,
          status: true
        }
      }
    }
  });

  res.json({ routes });
});

router.post("/", requireRoles("dispatcher"), async (req, res) => {
  const data = createRouteSchema.parse(req.body);
  const route = await prisma.route.create({
    data: {
      name: data.name,
      origin: data.origin,
      destination: data.destination,
      distanceKm: data.distanceKm,
      estimatedHours: data.estimatedHours,
      points: {
        create: data.points
      }
    },
    include: {
      points: {
        orderBy: { sequence: "asc" }
      }
    }
  });

  res.status(201).json({ route });
});

router.get("/:id", async (req, res) => {
  const route = await prisma.route.findUnique({
    where: { id: req.params.id },
    include: {
      points: {
        orderBy: { sequence: "asc" }
      },
      shipments: {
        include: {
          order: true,
          driver: true,
          vehicle: true
        }
      }
    }
  });

  if (!route) {
    throw httpError("Route was not found", 404);
  }

  res.json({ route });
});

router.patch("/:id", requireRoles("dispatcher"), async (req, res) => {
  const data = updateRouteSchema.parse(req.body);
  const route = await prisma.route.update({
    where: { id: req.params.id },
    data,
    include: {
      points: {
        orderBy: { sequence: "asc" }
      }
    }
  });

  res.json({ route });
});

router.delete("/:id", requireRoles("dispatcher"), async (req, res) => {
  await prisma.route.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export { router as routesRouter };
