import { Router } from "express";
import { consultationController } from "../controllers/consultation.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import {
  createConsultationSchema,
  listConsultationsSchema,
} from "../validators/consultation.validators";

const router = Router();

router.use(authenticate);
router.get(
  "/",
  validate(listConsultationsSchema, "query"),
  consultationController.list
);
router.post(
  "/",
  validate(createConsultationSchema),
  consultationController.create
);

export default router;
