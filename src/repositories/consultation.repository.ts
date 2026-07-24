import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const consultationRepository = {
  create(data: Prisma.ConsultationCreateInput) {
    return prisma.consultation.create({
      data,
      include: { startup: true },
    });
  },

  async list(params: {
    skip: number;
    take: number;
    userId?: string;
  }) {
    const where: Prisma.ConsultationWhereInput = {
      ...(params.userId ? { userId: params.userId } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          startup: true,
          user: { include: { profile: true } },
        },
      }),
      prisma.consultation.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.consultation.findUnique({
      where: { id },
      include: { startup: true, user: { include: { profile: true } } },
    });
  },

  update(id: string, data: Prisma.ConsultationUpdateInput) {
    return prisma.consultation.update({ where: { id }, data });
  },
};
