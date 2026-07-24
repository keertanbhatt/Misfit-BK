import { Router } from "express";
import { milestoneController } from "../controllers/milestone.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import {
  createMilestoneSchema,
  updateMilestoneSchema,
} from "../validators/milestone.validators";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.get("/", milestoneController.list);
router.post("/", validate(createMilestoneSchema), milestoneController.create);
router.patch(
  "/:id",
  validate(updateMilestoneSchema),
  milestoneController.update
);
router.delete("/:id", milestoneController.remove);

export default router;
