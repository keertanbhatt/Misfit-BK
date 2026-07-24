import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const notificationRepository = {
  create(data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({ data });
  },

  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },

  async list(params: {
    userId: string;
    skip: number;
    take: number;
    isRead?: boolean;
    type?: NotificationType;
  }) {
    const where: Prisma.NotificationWhereInput = {
      userId: params.userId,
      ...(params.isRead !== undefined ? { isRead: params.isRead } : {}),
      ...(params.type ? { type: params.type } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);
    return { items, total };
  },

  markRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  },

  unreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },
};
