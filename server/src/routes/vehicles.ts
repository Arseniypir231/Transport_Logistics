import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { httpError } from "../utils/http.js";

const router = Router();

router.use(authenticate);

const createVehicleSchema = z.object({
  plateNumber: z.string().min(4),
  type: z.string().min(2),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().int().min(1980).max(2100).optional(),
  capacityKg: z.coerce.number().positive(),
  capacityM3: z.coerce.number().positive(),
  status: z.enum(["AVAILABLE", "ASSIGNED", "MAINTENANCE"]).default("AVAILABLE"),
  companyId: z.string().optional()
});

const updateVehicleSchema = createVehicleSchema.partial();

router.get("/", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const where: Prisma.VehicleWhereInput = {
    ...(status ? { status: status as Prisma.EnumVehicleStatusFilter["equals"] } : {}),
    ...(search
      ? {
          OR: [
            { plateNumber: { contains: search, mode: "insensitive" } },
            { type: { contains: search, mode: "insensitive" } },
            { make: { contains: search, mode: "insensitive" } },
            { model: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { plateNumber: "asc" },
    include: {
      company: true,
      shipments: {
        select: {
          id: true,
          status: true,
          trackingNumber: true
        }
      }
    }
  });

  res.json({ vehicles });
});

router.post("/", requireRoles("dispatcher", "carrier"), async (req, res) => {
  const data = createVehicleSchema.parse(req.body);
  const companyId =
    data.companyId ??
    req.user?.companyId ??
    (await prisma.company.findFirst({ where: { type: "CARRIER" }, select: { id: true } }))?.id;

  if (!companyId) {
    throw httpError("Carrier company is required to create a vehicle", 400);
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      ...data,
      companyId
    },
    include: {
      company: true
    }
  });

  res.status(201).json({ vehicle });
});

router.patch("/:id", requireRoles("dispatcher", "carrier"), async (req, res) => {
  const data = updateVehicleSchema.parse(req.body);
  const vehicle = await prisma.vehicle.update({
    where: { id: req.params.id },
    data,
    include: {
      company: true
    }
  });

  res.json({ vehicle });
});

router.delete("/:id", requireRoles("dispatcher"), async (req, res) => {
  await prisma.vehicle.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export { router as vehiclesRouter };
