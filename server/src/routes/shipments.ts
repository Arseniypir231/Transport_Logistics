import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { httpError } from "../utils/http.js";

const router = Router();

router.use(authenticate);

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

const updateShipmentSchema = z.object({
  status: z.enum(["PLANNED", "LOADING", "IN_TRANSIT", "DELIVERED", "DELAYED", "CANCELLED"]).optional(),
  driverId: z.string().optional(),
  vehicleId: z.string().optional(),
  routeId: z.string().nullable().optional(),
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

router.get("/", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const where: Prisma.ShipmentWhereInput = {
    ...(status ? { status: status as Prisma.EnumShipmentStatusFilter["equals"] } : {}),
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
  };

  const shipments = await prisma.shipment.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      order: {
        include: {
          client: true,
          cargo: true
        }
      },
      carrier: true,
      driver: true,
      vehicle: true,
      route: true,
      events: {
        orderBy: { createdAt: "desc" },
        take: 3
      }
    }
  });

  res.json({ shipments });
});

router.post("/", requireRoles("dispatcher", "carrier"), async (req, res) => {
  const data = createShipmentSchema.parse(req.body);
  const shipmentCount = await prisma.shipment.count();
  const shipment = await prisma.shipment.create({
    data: {
      ...data,
      trackingNumber: `TRK-${String(shipmentCount + 1).padStart(5, "0")}`,
      events: {
        create: {
          type: "CREATED",
          message: "Shipment was planned",
          createdById: req.user!.id
        }
      }
    },
    include: {
      order: true,
      carrier: true,
      driver: true,
      vehicle: true,
      route: true,
      events: true
    }
  });

  await prisma.logisticsOrder.update({
    where: { id: data.orderId },
    data: { status: "IN_PROGRESS" }
  });

  res.status(201).json({ shipment });
});

router.get("/:id", async (req, res) => {
  const shipment = await prisma.shipment.findUnique({
    where: { id: req.params.id },
    include: {
      order: {
        include: {
          client: true,
          cargo: true
        }
      },
      carrier: true,
      driver: true,
      vehicle: true,
      route: {
        include: {
          points: {
            orderBy: { sequence: "asc" }
          }
        }
      },
      events: {
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!shipment) {
    throw httpError("Shipment was not found", 404);
  }

  res.json({ shipment });
});

router.patch("/:id", requireRoles("dispatcher", "carrier"), async (req, res) => {
  const data = updateShipmentSchema.parse(req.body);
  const shipment = await prisma.shipment.update({
    where: { id: req.params.id },
    data,
    include: {
      order: true,
      carrier: true,
      driver: true,
      vehicle: true,
      route: true,
      events: true
    }
  });

  res.json({ shipment });
});

router.post("/:id/events", requireRoles("dispatcher", "carrier"), async (req, res) => {
  const data = eventSchema.parse(req.body);
  const event = await prisma.shipmentEvent.create({
    data: {
      ...data,
      shipmentId: req.params.id,
      createdById: req.user!.id
    }
  });

  res.status(201).json({ event });
});

router.delete("/:id", requireRoles("dispatcher"), async (req, res) => {
  await prisma.shipment.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export { router as shipmentsRouter };
