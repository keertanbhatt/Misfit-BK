import { AssignmentStatus } from "@prisma/client";
import { z } from "zod";

export const createAssignmentSchema = z.object({
  projectId: z.string().cuid(),
  freelancerId: z.string().cuid(),
  roleTitle: z.string().max(200).optional(),
  rate: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  notes: z.string().max(5000).optional(),
});

export const updateAssignmentStatusSchema = z.object({
  status: z.nativeEnum(AssignmentStatus),
});

export const listAssignmentsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(AssignmentStatus).optional(),
  projectId: z.string().optional(),
});
