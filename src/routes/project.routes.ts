import { Router } from "express";
import { projectController } from "../controllers/project.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import {
  createProjectSchema,
  listProjectsSchema,
  updateProgressSchema,
  updateProjectSchema,
} from "../validators/project.validators";

const router = Router();

router.use(authenticate);
router.get("/", validate(listProjectsSchema, "query"), projectController.list);
router.post("/", validate(createProjectSchema), projectController.create);
router.get("/:id", projectController.getById);
router.patch("/:id", validate(updateProjectSchema), projectController.update);
router.patch(
  "/:id/progress",
  validate(updateProgressSchema),
  projectController.updateProgress
);
router.delete("/:id", projectController.remove);

export default router;
