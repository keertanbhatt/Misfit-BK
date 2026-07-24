import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(10000).optional(),
  milestoneId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.coerce.date().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const listTasksSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  assigneeId: z.string().optional(),
});
