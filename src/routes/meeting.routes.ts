import { Router } from "express";
import { meetingController } from "../controllers/meeting.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import {
  createMeetingSchema,
  listMeetingsSchema,
  updateMeetingSchema,
} from "../validators/meeting.validators";

const router = Router();

router.use(authenticate);
router.get("/", validate(listMeetingsSchema, "query"), meetingController.list);
router.post("/", validate(createMeetingSchema), meetingController.create);
router.get("/:id", meetingController.getById);
router.patch("/:id", validate(updateMeetingSchema), meetingController.update);
router.delete("/:id", meetingController.remove);

export default router;
