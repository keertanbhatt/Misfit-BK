import { freelancerService } from "../services/freelancer.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const freelancerController = {
  list: asyncHandler(async (req, res) => {
    const data = await freelancerService.list(req.query as never);
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await freelancerService.getById(req.params.id);
    return sendSuccess(res, data);
  }),

  getMe: asyncHandler(async (req, res) => {
    const data = await freelancerService.getMine(req.user!.id);
    return sendSuccess(res, data);
  }),

  updateMe: asyncHandler(async (req, res) => {
    const data = await freelancerService.updateMine(req.user!.id, req.body);
    return sendSuccess(res, data, "Profile updated");
  }),

  updateAvailability: asyncHandler(async (req, res) => {
    const data = await freelancerService.updateAvailability(
      req.user!.id,
      req.body.availability
    );
    return sendSuccess(res, data, "Availability updated");
  }),

  addSkill: asyncHandler(async (req, res) => {
    const data = await freelancerService.addSkill(req.user!.id, req.body);
    return sendSuccess(res, data, "Skill added", 201);
  }),

  removeSkill: asyncHandler(async (req, res) => {
    const data = await freelancerService.removeSkill(
      req.user!.id,
      req.params.skillId
    );
    return sendSuccess(res, data, "Skill removed");
  }),

  addExperience: asyncHandler(async (req, res) => {
    const data = await freelancerService.addExperience(req.user!.id, req.body);
    return sendSuccess(res, data, "Experience added", 201);
  }),

  removeExperience: asyncHandler(async (req, res) => {
    const data = await freelancerService.removeExperience(
      req.user!.id,
      req.params.experienceId
    );
    return sendSuccess(res, data, "Experience removed");
  }),

  addPortfolio: asyncHandler(async (req, res) => {
    const data = await freelancerService.addPortfolio(req.user!.id, req.body);
    return sendSuccess(res, data, "Portfolio item added", 201);
  }),

  removePortfolio: asyncHandler(async (req, res) => {
    const data = await freelancerService.removePortfolio(
      req.user!.id,
      req.params.portfolioId
    );
    return sendSuccess(res, data, "Portfolio item removed");
  }),

  myProjects: asyncHandler(async (req, res) => {
    const data = await freelancerService.myProjects(
      req.user!.id,
      req.query as never
    );
    return sendSuccess(res, data);
  }),

  myPayments: asyncHandler(async (req, res) => {
    const data = await freelancerService.myPayments(
      req.user!.id,
      req.query as never
    );
    return sendSuccess(res, data);
  }),
};
