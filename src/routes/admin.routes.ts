import {
  AssignmentStatus,
  ConsultationStatus,
  StartupStatus,
  UserStatus,
} from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { adminController } from "../controllers/admin.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import {
  adminListSchema,
  adminListUsersSchema,
} from "../validators/admin.validators";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/analytics", adminController.analytics);
router.get("/reports", adminController.reportsSummary);

router.get(
  "/requests",
  validate(adminListSchema, "query"),
  adminController.listPendingApprovals
);
router.post("/requests/:id/approve", adminController.approveRegistration);
router.post(
  "/requests/:id/reject",
  validate(z.object({ reason: z.string().max(1000).optional() })),
  adminController.rejectRegistration
);

router.get(
  "/users",
  validate(adminListUsersSchema, "query"),
  adminController.listUsers
);
router.get("/users/:id", adminController.getUserDetail);
router.patch(
  "/users/:id/status",
  validate(
    z.object({
      status: z.enum([
        UserStatus.ACTIVE,
        UserStatus.INACTIVE,
        UserStatus.SUSPENDED,
      ]),
    })
  ),
  adminController.updateUserStatus
);

router.get(
  "/startups",
  validate(adminListSchema, "query"),
  adminController.listStartups
);
router.get("/startups/:id", adminController.getStartupDetail);
router.patch(
  "/startups/:id/status",
  validate(
    z.object({
      status: z.nativeEnum(StartupStatus),
      rejectionReason: z.string().max(2000).optional(),
    })
  ),
  adminController.updateStartupStatus
);

router.get(
  "/projects",
  validate(adminListSchema, "query"),
  adminController.listProjects
);

router.get(
  "/freelancers",
  validate(adminListSchema, "query"),
  adminController.listFreelancers
);
router.get("/freelancers/:id", adminController.getFreelancerDetail);
router.patch(
  "/freelancers/:id/verify",
  validate(z.object({ isVerified: z.boolean() })),
  adminController.setFreelancerVerified
);

router.get(
  "/founders",
  validate(adminListSchema, "query"),
  adminController.listFounders
);

router.get(
  "/consultations",
  validate(adminListSchema, "query"),
  adminController.listConsultations
);
router.patch(
  "/consultations/:id/status",
  validate(
    z.object({
      status: z.nativeEnum(ConsultationStatus),
      notes: z.string().max(2000).optional(),
    })
  ),
  adminController.updateConsultationStatus
);

router.get(
  "/documents",
  validate(adminListSchema, "query"),
  adminController.listDocuments
);

router.get(
  "/assignments",
  validate(adminListSchema, "query"),
  adminController.listAssignments
);
router.patch(
  "/assignments/:id/status",
  validate(z.object({ status: z.nativeEnum(AssignmentStatus) })),
  adminController.updateAssignmentStatus
);

export default router;
