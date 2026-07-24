import { Router } from "express";
import { assignmentController } from "../controllers/assignment.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import {
  createAssignmentSchema,
  listAssignmentsSchema,
  updateAssignmentStatusSchema,
} from "../validators/assignment.validators";

const router = Router();

router.use(authenticate);
router.get(
  "/",
  validate(listAssignmentsSchema, "query"),
  assignmentController.list
);
router.post(
  "/",
  authorize("FOUNDER", "ADMIN"),
  validate(createAssignmentSchema),
  assignmentController.create
);
router.patch(
  "/:id/status",
  validate(updateAssignmentStatusSchema),
  assignmentController.updateStatus
);

export default router;
