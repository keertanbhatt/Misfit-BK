import { adminService } from "../services/admin.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const adminController = {
  analytics: asyncHandler(async (_req, res) => {
    const data = await adminService.analytics();
    return sendSuccess(res, data);
  }),

  listUsers: asyncHandler(async (req, res) => {
    const data = await adminService.listUsers(req.query as never);
    return sendSuccess(res, data);
  }),

  listStartups: asyncHandler(async (req, res) => {
    const data = await adminService.listStartups(req.query as never);
    return sendSuccess(res, data);
  }),

  listFreelancers: asyncHandler(async (req, res) => {
    const data = await adminService.listFreelancers(req.query as never);
    return sendSuccess(res, data);
  }),

  listConsultations: asyncHandler(async (req, res) => {
    const data = await adminService.listConsultations(req.query as never);
    return sendSuccess(res, data);
  }),

  listProjects: asyncHandler(async (req, res) => {
    const data = await adminService.listProjects(req.query as never);
    return sendSuccess(res, data);
  }),

  listFounders: asyncHandler(async (req, res) => {
    const data = await adminService.listFounders(req.query as never);
    return sendSuccess(res, data);
  }),

  listDocuments: asyncHandler(async (req, res) => {
    const data = await adminService.listDocuments(req.query as never);
    return sendSuccess(res, data);
  }),

  listPendingApprovals: asyncHandler(async (req, res) => {
    const data = await adminService.listPendingApprovals(req.query as never);
    return sendSuccess(res, data);
  }),

  listAssignments: asyncHandler(async (req, res) => {
    const data = await adminService.listAssignments(req.query as never);
    return sendSuccess(res, data);
  }),

  getUserDetail: asyncHandler(async (req, res) => {
    const data = await adminService.getUserDetail(req.params.id);
    return sendSuccess(res, data);
  }),

  getStartupDetail: asyncHandler(async (req, res) => {
    const data = await adminService.getStartupDetail(req.params.id);
    return sendSuccess(res, data);
  }),

  getFreelancerDetail: asyncHandler(async (req, res) => {
    const data = await adminService.getFreelancerDetail(req.params.id);
    return sendSuccess(res, data);
  }),

  approveRegistration: asyncHandler(async (req, res) => {
    const data = await adminService.approveRegistration(
      req.params.id,
      req.user!.id
    );
    return sendSuccess(res, data, "Registration approved");
  }),

  rejectRegistration: asyncHandler(async (req, res) => {
    const data = await adminService.rejectRegistration(
      req.params.id,
      req.user!.id,
      req.body?.reason
    );
    return sendSuccess(res, data, "Registration rejected");
  }),

  updateUserStatus: asyncHandler(async (req, res) => {
    const data = await adminService.updateUserStatus(
      req.params.id,
      req.body.status,
      req.user!.id
    );
    return sendSuccess(res, data, "User status updated");
  }),

  updateStartupStatus: asyncHandler(async (req, res) => {
    const data = await adminService.updateStartupStatus(
      req.params.id,
      req.user!.id,
      req.body
    );
    return sendSuccess(res, data, "Startup status updated");
  }),

  setFreelancerVerified: asyncHandler(async (req, res) => {
    const data = await adminService.setFreelancerVerified(
      req.params.id,
      Boolean(req.body.isVerified),
      req.user!.id
    );
    return sendSuccess(res, data, "Freelancer verification updated");
  }),

  updateConsultationStatus: asyncHandler(async (req, res) => {
    const data = await adminService.updateConsultationStatus(
      req.params.id,
      req.body.status,
      req.body.notes,
      req.user!.id
    );
    return sendSuccess(res, data, "Consultation updated");
  }),

  updateAssignmentStatus: asyncHandler(async (req, res) => {
    const data = await adminService.updateAssignmentStatus(
      req.params.id,
      req.body.status,
      req.user!.id
    );
    return sendSuccess(res, data, "Assignment updated");
  }),

  reportsSummary: asyncHandler(async (_req, res) => {
    const data = await adminService.reportsSummary();
    return sendSuccess(res, data);
  }),
};
