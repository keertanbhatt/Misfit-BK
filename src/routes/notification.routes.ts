import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { listNotificationsSchema } from "../validators/notification.validators";

const router = Router();

router.use(authenticate);
router.get(
  "/",
  validate(listNotificationsSchema, "query"),
  notificationController.list
);
router.get("/unread-count", notificationController.unreadCount);
router.patch("/read-all", notificationController.markAllRead);
router.post("/read-all", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markRead);

export default router;
