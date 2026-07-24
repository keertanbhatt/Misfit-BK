import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/response";
import { env } from "../config/env";

export function notFoundHandler(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  next(new AppError("Route not found", 404, "ROUTE_NOT_FOUND"));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // Prisma / Neon misconfiguration
  const message = err instanceof Error ? err.message : String(err);
  if (
    message.includes("DATABASE_URL") ||
    message.includes("Environment variable not found: DATABASE_URL") ||
    message.includes("nonempty URL")
  ) {
    return sendError(
      res,
      "Database is not configured. Set DATABASE_URL in .env to your Neon PostgreSQL connection string.",
      503,
      "DATABASE_NOT_CONFIGURED"
    );
  }

  // eslint-disable-next-line no-console
  console.error("[UnhandledError]", err);

  return sendError(
    res,
    env.isDev && err instanceof Error ? err.message : "Internal server error",
    500,
    "INTERNAL_ERROR"
  );
}
