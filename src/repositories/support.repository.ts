import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const supportRepository = {
  create(data: Prisma.SupportTicketCreateInput) {
    return prisma.supportTicket.create({ data });
  },

  findById(id: string) {
    return prisma.supportTicket.findUnique({
      where: { id },
      include: {
        requester: { include: { profile: true } },
        assignee: { include: { profile: true } },
      },
    });
  },

  async list(params: {
    skip: number;
    take: number;
    requesterId?: string;
  }) {
    const where: Prisma.SupportTicketWhereInput = {
      ...(params.requesterId ? { requesterId: params.requesterId } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          requester: { include: { profile: true } },
          assignee: { include: { profile: true } },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);
    return { items, total };
  },
};
