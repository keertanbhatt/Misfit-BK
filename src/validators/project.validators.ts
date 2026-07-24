import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(10000).optional(),
  startupId: z.string().cuid().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  progress: z.number().int().min(0).max(100).optional(),
});

export const updateProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
});

export const listProjectsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startupId: z.string().optional(),
});
