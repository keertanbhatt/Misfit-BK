import type { Prisma, TaskStatus } from "@prisma/client";
import { prisma } from "../prisma";

export const taskRepository = {
  create(data: Prisma.TaskCreateInput) {
    return prisma.task.create({ data });
  },

  findById(id: string) {
    return prisma.task.findFirst({
      where: { id, deletedAt: null },
      include: { project: true, assignee: { include: { profile: true } } },
    });
  },

  update(id: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  listByProject(
    projectId: string,
    filters?: { status?: TaskStatus; assigneeId?: string }
  ) {
    return prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.assigneeId ? { assigneeId: filters.assigneeId } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { assignee: { include: { profile: true } } },
    });
  },
};
