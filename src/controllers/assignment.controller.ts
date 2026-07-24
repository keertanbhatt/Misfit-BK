import { assignmentService } from "../services/assignment.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const assignmentController = {
  create: asyncHandler(async (req, res) => {
    const data = await assignmentService.create(req.user!, req.body);
    return sendSuccess(res, data, "Assignment created", 201);
  }),

  list: asyncHandler(async (req, res) => {
    const data = await assignmentService.list(req.user!, req.query as never);
    return sendSuccess(res, data);
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const data = await assignmentService.updateStatus(
      req.params.id,
      req.user!,
      req.body.status
    );
    return sendSuccess(res, data, "Assignment status updated");
  }),
};
