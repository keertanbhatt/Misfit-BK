import { CompanyRegStatus, CompanyRegType } from "@prisma/client";
import { z } from "zod";

export const createCompanyRegSchema = z.object({
  type: z.nativeEnum(CompanyRegType),
  legalName: z.string().min(2).max(300),
  tradeName: z.string().max(300).optional(),
  startupId: z.string().cuid().optional(),
  panNumber: z.string().max(50).optional(),
  gstNumber: z.string().max(50).optional(),
  cinNumber: z.string().max(50).optional(),
  trademarkNumber: z.string().max(50).optional(),
  startupIndiaId: z.string().max(50).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateCompanyRegSchema = createCompanyRegSchema.partial();

export const adminUpdateCompanyRegSchema = z.object({
  status: z.nativeEnum(CompanyRegStatus),
  adminNotes: z.string().max(5000).optional(),
});

export const listCompanyRegSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(CompanyRegStatus).optional(),
});
