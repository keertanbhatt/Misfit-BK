import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const milestoneRepository = {
  create(data: Prisma.MilestoneCreateInput) {
    return prisma.milestone.create({ data });
  },

  findById(id: string) {
    return prisma.milestone.findUnique({
      where: { id },
      include: { project: true },
    });
  },

  update(id: string, data: Prisma.MilestoneUpdateInput) {
    return prisma.milestone.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.milestone.delete({ where: { id } });
  },

  listByProject(projectId: string) {
    return prisma.milestone.findMany({
      where: { projectId },
      orderBy: { sortOrder: "asc" },
      include: { tasks: { where: { deletedAt: null } } },
    });
  },
};
