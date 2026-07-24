import { AvailabilityStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { freelancerController } from "../controllers/freelancer.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { requireActiveAccount } from "../middlewares/requireActiveAccount";
import { validate } from "../middlewares/validate";
import {
  addExperienceSchema,
  addPortfolioSchema,
  addSkillSchema,
  listFreelancersSchema,
  updateFreelancerSchema,
} from "../validators/freelancer.validators";

const router = Router();
const freelancerAuth = [authenticate, authorize("FREELANCER"), requireActiveAccount] as const;

router.get(
  "/",
  validate(listFreelancersSchema, "query"),
  freelancerController.list
);
router.get("/me", ...freelancerAuth, freelancerController.getMe);
router.get(
  "/me/projects",
  ...freelancerAuth,
  freelancerController.myProjects
);
router.get(
  "/me/payments",
  ...freelancerAuth,
  freelancerController.myPayments
);
router.patch(
  "/me",
  ...freelancerAuth,
  validate(updateFreelancerSchema),
  freelancerController.updateMe
);
router.patch(
  "/me/availability",
  ...freelancerAuth,
  validate(
    z.object({ availability: z.nativeEnum(AvailabilityStatus) })
  ),
  freelancerController.updateAvailability
);
router.post(
  "/me/skills",
  ...freelancerAuth,
  validate(addSkillSchema),
  freelancerController.addSkill
);
router.delete(
  "/me/skills/:skillId",
  ...freelancerAuth,
  freelancerController.removeSkill
);
router.post(
  "/me/experience",
  ...freelancerAuth,
  validate(addExperienceSchema),
  freelancerController.addExperience
);
router.delete(
  "/me/experience/:experienceId",
  ...freelancerAuth,
  freelancerController.removeExperience
);
router.post(
  "/me/portfolio",
  ...freelancerAuth,
  validate(addPortfolioSchema),
  freelancerController.addPortfolio
);
router.delete(
  "/me/portfolio/:portfolioId",
  ...freelancerAuth,
  freelancerController.removePortfolio
);
router.get("/:id", freelancerController.getById);

export default router;
