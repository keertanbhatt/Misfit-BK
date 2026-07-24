import { projectService } from "../services/project.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const projectController = {
  create: asyncHandler(async (req, res) => {
    const data = await projectService.create(req.user!.id, req.body);
    return sendSuccess(res, data, "Project created", 201);
  }),

  list: asyncHandler(async (req, res) => {
    const data = await projectService.list(req.query as never, req.user!);
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await projectService.getById(req.params.id, req.user!);
    return sendSuccess(res, data);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await projectService.update(
      req.params.id,
      req.user!,
      req.body
    );
    return sendSuccess(res, data, "Project updated");
  }),

  updateProgress: asyncHandler(async (req, res) => {
    const data = await projectService.updateProgress(
      req.params.id,
      req.user!,
      req.body.progress
    );
    return sendSuccess(res, data, "Progress updated");
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await projectService.remove(req.params.id, req.user!);
    return sendSuccess(res, data, "Project deleted");
  }),
};
