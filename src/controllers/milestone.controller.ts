import { milestoneService } from "../services/milestone.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const milestoneController = {
  create: asyncHandler(async (req, res) => {
    const data = await milestoneService.create(
      req.params.projectId,
      req.user!,
      req.body
    );
    return sendSuccess(res, data, "Milestone created", 201);
  }),

  list: asyncHandler(async (req, res) => {
    const data = await milestoneService.list(req.params.projectId, req.user!);
    return sendSuccess(res, data);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await milestoneService.update(
      req.params.id,
      req.user!,
      req.body
    );
    return sendSuccess(res, data, "Milestone updated");
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await milestoneService.remove(req.params.id, req.user!);
    return sendSuccess(res, data, "Milestone deleted");
  }),
};
