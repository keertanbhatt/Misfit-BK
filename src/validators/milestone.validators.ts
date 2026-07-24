import { MilestoneStatus } from "@prisma/client";
import { z } from "zod";

export const createMilestoneSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(10000).optional(),
  status: z.nativeEnum(MilestoneStatus).optional(),
  dueDate: z.coerce.date().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateMilestoneSchema = createMilestoneSchema.partial();
