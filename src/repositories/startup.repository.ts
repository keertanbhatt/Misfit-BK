import type { Industry, Prisma, StartupStatus } from "@prisma/client";
import { prisma } from "../prisma";

export const startupRepository = {
  create(data: Prisma.StartupCreateInput) {
    return prisma.startup.create({ data });
  },

  findById(id: string) {
    return prisma.startup.findFirst({
      where: { id, deletedAt: null },
      include: {
        founder: { include: { profile: true } },
        documents: { where: { deletedAt: null } },
      },
    });
  },

  findBySlug(slug: string) {
    return prisma.startup.findFirst({
      where: { slug, deletedAt: null },
    });
  },

  update(id: string, data: Prisma.StartupUpdateInput) {
    return prisma.startup.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.startup.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async list(params: {
    skip: number;
    take: number;
    founderId?: string;
    status?: StartupStatus;
    industry?: Industry;
    search?: string;
  }) {
    const where: Prisma.StartupWhereInput = {
      deletedAt: null,
      ...(params.founderId ? { founderId: params.founderId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.industry ? { industry: params.industry } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { tagline: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.startup.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          founder: { include: { profile: true } },
        },
      }),
      prisma.startup.count({ where }),
    ]);

    return { items, total };
  },
};
