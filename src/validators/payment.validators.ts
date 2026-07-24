import { InvoiceStatus } from "@prisma/client";
import { z } from "zod";

export const listPaymentsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const listInvoicesSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().cuid(),
  projectId: z.string().cuid().optional(),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative().default(0),
  currency: z.string().length(3).optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().max(5000).optional(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().nonnegative(),
      amount: z.number().nonnegative(),
    })
  ),
  status: z.nativeEnum(InvoiceStatus).optional(),
});
