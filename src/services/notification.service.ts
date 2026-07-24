import { notificationRepository } from "../repositories/notification.repository";
import { ForbiddenError, NotFoundError } from "../utils/AppError";
import { getPagination, toPaginated } from "../utils/pagination";

export const notificationService = {
  async list(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      pageSize?: number;
      isRead?: boolean;
      unreadOnly?: boolean | string;
      type?: string;
    }
  ) {
    const { skip, take, page, limit } = getPagination(query);
    const unreadOnly =
      query.unreadOnly === true ||
      query.unreadOnly === "true" ||
      query.isRead === false;
    const { items, total } = await notificationRepository.list({
      userId,
      skip,
      take,
      isRead: unreadOnly ? false : query.isRead,
      type: query.type as never,
    });
    return toPaginated(items, total, page, limit);
  },

  async markRead(id: string, userId: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) throw new NotFoundError("Notification not found");
    if (notification.userId !== userId) {
      throw new ForbiddenError("Not allowed");
    }
    return notificationRepository.markRead(id);
  },

  async markAllRead(userId: string) {
    const result = await notificationRepository.markAllRead(userId);
    return { updated: result.count };
  },

  async unreadCount(userId: string) {
    const count = await notificationRepository.unreadCount(userId);
    return { count };
  },
};
