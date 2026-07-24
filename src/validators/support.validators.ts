import { SupportTicketPriority } from "@prisma/client";
import { z } from "zod";

export const createSupportTicketSchema = z.object({
  subject: z.string().min(3).max(300),
  description: z.string().min(10).max(10000),
  priority: z.nativeEnum(SupportTicketPriority).optional(),
  category: z.string().max(100).optional(),
});

export const listSupportTicketsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});
