import type { AssignmentStatus, Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const assignmentRepository = {
  create(data: Prisma.AssignmentCreateInput) {
    return prisma.assignment.create({
      data,
      include: {
        project: true,
        freelancer: { include: { user: { include: { profile: true } } } },
      },
    });
  },

  findById(id: string) {
    return prisma.assignment.findUnique({
      where: { id },
      include: {
        project: true,
        freelancer: { include: { user: { include: { profile: true } } } },
      },
    });
  },

  update(id: string, data: Prisma.AssignmentUpdateInput) {
    return prisma.assignment.update({
      where: { id },
      data,
      include: {
        project: true,
        freelancer: { include: { user: { include: { profile: true } } } },
      },
    });
  },

  async list(params: {
    skip: number;
    take: number;
    status?: AssignmentStatus;
    projectId?: string;
    projectOwnerId?: string;
    freelancerId?: string;
  }) {
    const where: Prisma.AssignmentWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.projectId ? { projectId: params.projectId } : {}),
      ...(params.freelancerId ? { freelancerId: params.freelancerId } : {}),
      ...(params.projectOwnerId
        ? { project: { ownerId: params.projectOwnerId } }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          project: true,
          freelancer: { include: { user: { include: { profile: true } } } },
        },
      }),
      prisma.assignment.count({ where }),
    ]);
    return { items, total };
  },
};
