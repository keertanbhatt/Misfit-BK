import { DocumentOwnerType, DocumentType } from "@prisma/client";
import { z } from "zod";

export const uploadDocumentMetaSchema = z.object({
  ownerType: z.nativeEnum(DocumentOwnerType),
  ownerId: z.string().min(1),
  type: z.nativeEnum(DocumentType).optional(),
  startupId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  companyRegId: z.string().cuid().optional(),
  freelancerId: z.string().cuid().optional(),
  name: z.string().min(1).max(255).optional(),
});

export const listDocumentsSchema = z.object({
  ownerType: z.nativeEnum(DocumentOwnerType).optional(),
  ownerId: z.string().optional(),
  type: z.nativeEnum(DocumentType).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});
