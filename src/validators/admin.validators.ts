import { z } from "zod";
import { UserStatus } from "@prisma/client";

export const adminListUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().optional(),
  role: z.string().optional(),
});

export const adminListSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  status: z.string().optional(),
  verified: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional(),
});
