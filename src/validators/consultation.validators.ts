import { z } from "zod";

export const createConsultationSchema = z.object({
  topic: z.string().min(2).max(300),
  description: z.string().min(10).max(10000),
  startupId: z.string().cuid().optional(),
  preferredAt: z.coerce.date().optional(),
});

export const listConsultationsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});
