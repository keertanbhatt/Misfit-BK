import { Request, Response } from "express";
import { prisma } from "../prisma";
import { sendSuccess } from "../utils/response";
import { env } from "../config/env";
import { asyncHandler } from "../utils/asyncHandler";

export const healthController = {
  check: asyncHandler(async (_req: Request, res: Response) => {
    let database: "connected" | "disconnected" | "not_configured" =
      "not_configured";

    if (!env.databaseUrl) {
      database = "not_configured";
    } else {
      try {
        await prisma.$queryRaw`SELECT 1`;
        database = "connected";
      } catch {
        database = "disconnected";
      }
    }

    return sendSuccess(res, {
      service: "misfit-api",
      status: "ok",
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
      database,
      databaseProvider: "neon-postgresql",
    });
  }),
};
