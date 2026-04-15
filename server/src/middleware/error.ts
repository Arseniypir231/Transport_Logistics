import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

type AppError = Error & {
  statusCode?: number;
};

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(Object.assign(new Error(`Route ${req.method} ${req.originalUrl} was not found`), { statusCode: 404 }));
}

export function errorHandler(error: AppError, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      issues: error.flatten()
    });
  }

  const statusCode = error.statusCode ?? 500;

  return res.status(statusCode).json({
    message: error.message || "Internal server error"
  });
}
