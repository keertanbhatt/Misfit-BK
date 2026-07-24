import { NotificationType } from "@prisma/client";
import { z } from "zod";

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  unreadOnly: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) =>
      v === undefined ? undefined : v === true || v === "true"
    ),
  isRead: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) =>
      v === undefined ? undefined : v === true || v === "true"
    ),
  type: z.nativeEnum(NotificationType).optional(),
});
