import { Router } from "express";
import { startupController } from "../controllers/startup.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import {
  createStartupSchema,
  listStartupsSchema,
  reviewStartupSchema,
  updateStartupSchema,
} from "../validators/startup.validators";

const router = Router();

router.get(
  "/",
  authenticate,
  validate(listStartupsSchema, "query"),
  startupController.list
);
router.get("/:id", authenticate, startupController.getById);
router.post(
  "/",
  authenticate,
  authorize("FOUNDER", "ADMIN"),
  validate(createStartupSchema),
  startupController.create
);
router.patch(
  "/:id",
  authenticate,
  authorize("FOUNDER", "ADMIN"),
  validate(updateStartupSchema),
  startupController.update
);
router.delete(
  "/:id",
  authenticate,
  authorize("FOUNDER", "ADMIN"),
  startupController.remove
);
router.post(
  "/:id/submit",
  authenticate,
  authorize("FOUNDER"),
  startupController.submit
);
router.post(
  "/:id/review",
  authenticate,
  authorize("ADMIN"),
  validate(reviewStartupSchema),
  startupController.review
);

export default router;
