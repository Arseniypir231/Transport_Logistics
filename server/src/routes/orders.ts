import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { httpError } from "../utils/http.js";

const router = Router();

router.use(authenticate);

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

const updateOrderSchema = z.object({
  title: z.string().min(3).optional(),
  status: z.enum(["DRAFT", "NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  pickupAddress: z.string().min(3).optional(),
  deliveryAddress: z.string().min(3).optional(),
  pickupDate: z.coerce.date().optional(),
  deliveryDate: z.coerce.date().optional(),
  price: z.coerce.number().nonnegative().optional(),
  notes: z.string().nullable().optional()
});

router.get("/", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const where: Prisma.LogisticsOrderWhereInput = {
    ...(status ? { status: status as Prisma.EnumOrderStatusFilter["equals"] } : {}),
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
  };

  const orders = await prisma.logisticsOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      cargo: true,
      shipments: {
        select: {
          id: true,
          trackingNumber: true,
          status: true
        }
      }
    }
  });

  res.json({ orders });
});

router.post("/", requireRoles("dispatcher", "client"), async (req, res) => {
  const data = createOrderSchema.parse(req.body);
  const clientId =
    data.clientId ??
    req.user?.companyId ??
    (await prisma.company.findFirst({ where: { type: "CLIENT" }, select: { id: true } }))?.id;

  if (!clientId) {
    throw httpError("Client company is required to create an order", 400);
  }

  const createdCount = await prisma.logisticsOrder.count();

  const order = await prisma.logisticsOrder.create({
    data: {
      code: `TL-${String(createdCount + 1).padStart(4, "0")}`,
      title: data.title,
      priority: data.priority,
      pickupAddress: data.pickupAddress,
      deliveryAddress: data.deliveryAddress,
      pickupDate: data.pickupDate,
      deliveryDate: data.deliveryDate,
      price: data.price,
      notes: data.notes,
      client: {
        connect: { id: clientId }
      },
      createdBy: {
        connect: { id: req.user!.id }
      },
      cargo: {
        create: data.cargo
      }
    },
    include: {
      client: true,
      cargo: true
    }
  });

  res.status(201).json({ order });
});

router.get("/:id", async (req, res) => {
  const order = await prisma.logisticsOrder.findUnique({
    where: { id: req.params.id },
    include: {
      client: true,
      cargo: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      shipments: {
        include: {
          carrier: true,
          driver: true,
          vehicle: true,
          route: true
        }
      }
    }
  });

  if (!order) {
    throw httpError("Order was not found", 404);
  }

  res.json({ order });
});

router.patch("/:id", requireRoles("dispatcher", "client"), async (req, res) => {
  const data = updateOrderSchema.parse(req.body);
  const order = await prisma.logisticsOrder.update({
    where: { id: req.params.id },
    data,
    include: {
      client: true,
      cargo: true,
      shipments: true
    }
  });

  res.json({ order });
});

router.delete("/:id", requireRoles("dispatcher"), async (req, res) => {
  await prisma.logisticsOrder.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export { router as ordersRouter };
