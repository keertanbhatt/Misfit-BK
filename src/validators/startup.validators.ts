import {
  Industry,
  ServiceType,
  StartupStatus,
} from "@prisma/client";
import { z } from "zod";

export const createStartupSchema = z.object({
  name: z.string().min(2).max(200),
  tagline: z.string().max(300).optional(),
  industry: z.nativeEnum(Industry),
  description: z.string().min(10).max(10000),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  timelineWeeks: z.number().int().positive().optional(),
  requiredServices: z.array(z.nativeEnum(ServiceType)).default([]),
  website: z.string().url().optional(),
  pitchDeckUrl: z.string().url().optional(),
});

export const updateStartupSchema = createStartupSchema.partial();

export const listStartupsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(StartupStatus).optional(),
  industry: z.nativeEnum(Industry).optional(),
  search: z.string().optional(),
  mine: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "true"),
});

export const reviewStartupSchema = z.object({
  status: z.enum([
    StartupStatus.APPROVED,
    StartupStatus.REJECTED,
    StartupStatus.UNDER_REVIEW,
  ]),
  rejectionReason: z.string().max(2000).optional(),
});

export type CreateStartupInput = z.infer<typeof createStartupSchema>;
export type UpdateStartupInput = z.infer<typeof updateStartupSchema>;
