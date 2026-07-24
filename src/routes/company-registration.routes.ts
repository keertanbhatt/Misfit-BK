import { Router } from "express";
import { companyRegistrationController } from "../controllers/company-registration.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import {
  adminUpdateCompanyRegSchema,
  createCompanyRegSchema,
  listCompanyRegSchema,
  updateCompanyRegSchema,
} from "../validators/company-registration.validators";

const router = Router();

router.use(authenticate);
router.get(
  "/",
  validate(listCompanyRegSchema, "query"),
  companyRegistrationController.list
);
router.post(
  "/",
  authorize("FOUNDER", "ADMIN"),
  validate(createCompanyRegSchema),
  companyRegistrationController.create
);
router.get("/:id", companyRegistrationController.getById);
router.patch(
  "/:id",
  authorize("FOUNDER", "ADMIN"),
  validate(updateCompanyRegSchema),
  companyRegistrationController.update
);
router.post(
  "/:id/submit",
  authorize("FOUNDER"),
  companyRegistrationController.submit
);
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validate(adminUpdateCompanyRegSchema),
  companyRegistrationController.adminUpdateStatus
);
router.delete("/:id", companyRegistrationController.remove);

export default router;
