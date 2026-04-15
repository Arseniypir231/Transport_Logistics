import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type TokenPayload = {
  id: string;
  roleSlug: string;
  companyId?: string | null;
};

function httpError(message: string, statusCode: number) {
  return Object.assign(new Error(message), { statusCode });
}

export const authenticate: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    throw httpError("Authorization token is required", 401);
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret) as TokenPayload;
    next();
  } catch {
    throw httpError("Invalid or expired token", 401);
  }
};

export function requireRoles(...roles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      throw httpError("Authorization token is required", 401);
    }

    if (!roles.includes(req.user.roleSlug)) {
      throw httpError("Not enough permissions for this action", 403);
    }

    next();
  };
}
