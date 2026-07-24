import { notificationService } from "../services/notification.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const notificationController = {
  list: asyncHandler(async (req, res) => {
    const data = await notificationService.list(
      req.user!.id,
      req.query as never
    );
    return sendSuccess(res, data);
  }),

  unreadCount: asyncHandler(async (req, res) => {
    const data = await notificationService.unreadCount(req.user!.id);
    return sendSuccess(res, data);
  }),

  markRead: asyncHandler(async (req, res) => {
    const data = await notificationService.markRead(
      req.params.id,
      req.user!.id
    );
    return sendSuccess(res, data, "Marked as read");
  }),

  markAllRead: asyncHandler(async (req, res) => {
    const data = await notificationService.markAllRead(req.user!.id);
    return sendSuccess(res, data, "All notifications marked as read");
  }),
};
