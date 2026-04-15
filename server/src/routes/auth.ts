import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/auth.js";
import { comparePassword, hashPassword, signToken, toPublicUser } from "../utils/auth.js";
import { httpError } from "../utils/http.js";

const router = Router();

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

const roleNames: Record<"client" | "carrier", string> = {
  client: "Клиент",
  carrier: "Перевозчик"
};

router.post("/register", async (req, res) => {
  const data = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: data.email } });

  if (exists) {
    throw httpError("User with this email already exists", 409);
  }

  const role = await prisma.role.upsert({
    where: { slug: data.roleSlug },
    update: {},
    create: {
      slug: data.roleSlug,
      name: roleNames[data.roleSlug],
      description: data.roleSlug === "carrier" ? "Manages fleet and shipment execution" : "Creates orders and tracks shipments"
    }
  });

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
      passwordHash: await hashPassword(data.password),
      roleId: role.id,
      companyId: company.id
    },
    include: {
      role: true,
      company: true
    }
  });

  res.status(201).json({
    token: signToken(user),
    user: toPublicUser(user)
  });
});

router.post("/login", async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      role: true,
      company: true
    }
  });

  if (!user || !(await comparePassword(data.password, user.passwordHash))) {
    throw httpError("Invalid email or password", 401);
  }

  if (user.status === "BLOCKED") {
    throw httpError("User is blocked", 403);
  }

  res.json({
    token: signToken(user),
    user: toPublicUser(user)
  });
});

router.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      role: true,
      company: true
    }
  });

  if (!user) {
    throw httpError("User was not found", 404);
  }

  res.json({
    user: toPublicUser(user)
  });
});

export { router as authRouter };
