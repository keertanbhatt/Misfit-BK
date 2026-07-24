import type { Prisma, ProjectStatus } from "@prisma/client";
import { prisma } from "../prisma";

export const projectRepository = {
  create(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({
      data,
      include: { startup: true, owner: { include: { profile: true } } },
    });
  },

  findById(id: string) {
    return prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        startup: true,
        owner: { include: { profile: true } },
        milestones: { orderBy: { sortOrder: "asc" } },
        tasks: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
      },
    });
  },

  update(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async list(params: {
    skip: number;
    take: number;
    ownerId?: string;
    status?: ProjectStatus;
    startupId?: string;
  }) {
    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
      ...(params.ownerId ? { ownerId: params.ownerId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.startupId ? { startupId: params.startupId } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { startup: true },
      }),
      prisma.project.count({ where }),
    ]);
    return { items, total };
  },
};
