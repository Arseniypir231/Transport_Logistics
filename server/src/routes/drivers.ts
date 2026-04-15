import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { httpError } from "../utils/http.js";

const router = Router();

router.use(authenticate);

const createDriverSchema = z.object({
  licenseNumber: z.string().min(4),
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional(),
  rating: z.coerce.number().min(0).max(5).default(5),
  status: z.enum(["AVAILABLE", "ON_ROUTE", "VACATION"]).default("AVAILABLE"),
  companyId: z.string().optional(),
  userId: z.string().optional()
});

const updateDriverSchema = createDriverSchema.partial();

router.get("/", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const where: Prisma.DriverWhereInput = {
    ...(status ? { status: status as Prisma.EnumDriverStatusFilter["equals"] } : {}),
    ...(search
      ? {
          OR: [
            { licenseNumber: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const drivers = await prisma.driver.findMany({
    where,
    orderBy: { name: "asc" },
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

  res.json({ drivers });
});

router.post("/", requireRoles("dispatcher", "carrier"), async (req, res) => {
  const data = createDriverSchema.parse(req.body);
  const companyId =
    data.companyId ??
    req.user?.companyId ??
    (await prisma.company.findFirst({ where: { type: "CARRIER" }, select: { id: true } }))?.id;

  if (!companyId) {
    throw httpError("Carrier company is required to create a driver", 400);
  }

  const driver = await prisma.driver.create({
    data: {
      ...data,
      companyId
    },
    include: {
      company: true
    }
  });

  res.status(201).json({ driver });
});

router.patch("/:id", requireRoles("dispatcher", "carrier"), async (req, res) => {
  const data = updateDriverSchema.parse(req.body);
  const driver = await prisma.driver.update({
    where: { id: req.params.id },
    data,
    include: {
      company: true
    }
  });

  res.json({ driver });
});

router.delete("/:id", requireRoles("dispatcher"), async (req, res) => {
  await prisma.driver.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export { router as driversRouter };
