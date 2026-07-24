import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import {
  createTaskSchema,
  listTasksSchema,
  updateTaskSchema,
} from "../validators/task.validators";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.get("/", validate(listTasksSchema, "query"), taskController.list);
router.post("/", validate(createTaskSchema), taskController.create);
router.get("/:id", taskController.getById);
router.patch("/:id", validate(updateTaskSchema), taskController.update);
router.delete("/:id", taskController.remove);

export default router;
