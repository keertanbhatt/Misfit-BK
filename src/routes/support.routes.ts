import { Router } from "express";
import { supportController } from "../controllers/support.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import {
  createSupportTicketSchema,
  listSupportTicketsSchema,
} from "../validators/support.validators";

const router = Router();

router.use(authenticate);
router.get(
  "/",
  validate(listSupportTicketsSchema, "query"),
  supportController.list
);
router.post(
  "/",
  validate(createSupportTicketSchema),
  supportController.create
);
router.get("/:id", supportController.getById);

export default router;
