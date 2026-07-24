import type { DocumentOwnerType, DocumentType, Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const documentRepository = {
  create(data: Prisma.DocumentCreateInput) {
    return prisma.document.create({ data });
  },

  findById(id: string) {
    return prisma.document.findFirst({
      where: { id, deletedAt: null },
    });
  },

  softDelete(id: string) {
    return prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async list(params: {
    skip: number;
    take: number;
    uploaderId?: string;
    ownerType?: DocumentOwnerType;
    ownerId?: string;
    type?: DocumentType;
  }) {
    const where: Prisma.DocumentWhereInput = {
      deletedAt: null,
      ...(params.uploaderId ? { uploaderId: params.uploaderId } : {}),
      ...(params.ownerType ? { ownerType: params.ownerType } : {}),
      ...(params.ownerId ? { ownerId: params.ownerId } : {}),
      ...(params.type ? { type: params.type } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.document.count({ where }),
    ]);
    return { items, total };
  },
};
