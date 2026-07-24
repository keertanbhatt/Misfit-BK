import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import startupRoutes from "./startup.routes";
import projectRoutes from "./project.routes";
import taskRoutes from "./task.routes";
import milestoneRoutes from "./milestone.routes";
import documentRoutes from "./document.routes";
import companyRegistrationRoutes from "./company-registration.routes";
import freelancerRoutes from "./freelancer.routes";
import assignmentRoutes from "./assignment.routes";
import notificationRoutes from "./notification.routes";
import meetingRoutes from "./meeting.routes";
import { paymentsRouter, invoicesRouter } from "./payment.routes";
import consultationRoutes from "./consultation.routes";
import supportRoutes from "./support.routes";
import adminRoutes from "./admin.routes";
import dashboardRoutes from "./dashboard.routes";
import { authenticate } from "../middlewares/authenticate";
import { requireActiveAccount } from "../middlewares/requireActiveAccount";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);

// Authenticated + active account required for product routes
const active = [authenticate, requireActiveAccount] as const;

router.use("/users", ...active, userRoutes);
router.use("/dashboard", ...active, dashboardRoutes);
router.use("/startups", ...active, startupRoutes);
router.use("/projects", ...active, projectRoutes);
router.use("/projects/:projectId/tasks", ...active, taskRoutes);
router.use("/projects/:projectId/milestones", ...active, milestoneRoutes);
router.use("/documents", ...active, documentRoutes);
router.use("/company-registrations", ...active, companyRegistrationRoutes);
router.use("/company-registration", ...active, companyRegistrationRoutes);
router.use("/freelancers", freelancerRoutes);
router.use("/assignments", ...active, assignmentRoutes);
router.use("/notifications", authenticate, notificationRoutes);
router.use("/meetings", ...active, meetingRoutes);
router.use("/payments", ...active, paymentsRouter);
router.use("/invoices", ...active, invoicesRouter);
router.use("/consultations", ...active, consultationRoutes);
router.use("/support", ...active, supportRoutes);
router.use("/admin", adminRoutes);

export default router;
