import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Role, User, Company } from "@prisma/client";
import { env } from "../config/env.js";

type UserWithRole = User & {
  role: Role;
  company?: Company | null;
};

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(user: UserWithRole) {
  return jwt.sign(
    {
      id: user.id,
      roleSlug: user.role.slug,
      companyId: user.companyId
    },
    env.jwtSecret,
    { expiresIn: "8h" }
  );
}

export function toPublicUser(user: UserWithRole) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    role: {
      id: user.role.id,
      slug: user.role.slug,
      name: user.role.name
    },
    company: user.company
      ? {
          id: user.company.id,
          name: user.company.name,
          type: user.company.type
        }
      : null
  };
}
