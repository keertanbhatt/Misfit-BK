import { taskService } from "../services/task.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const taskController = {
  create: asyncHandler(async (req, res) => {
    const data = await taskService.create(
      req.params.projectId,
      req.user!,
      req.body
    );
    return sendSuccess(res, data, "Task created", 201);
  }),

  list: asyncHandler(async (req, res) => {
    const data = await taskService.list(
      req.params.projectId,
      req.user!,
      req.query as never
    );
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await taskService.getById(req.params.id, req.user!);
    return sendSuccess(res, data);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await taskService.update(req.params.id, req.user!, req.body);
    return sendSuccess(res, data, "Task updated");
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await taskService.remove(req.params.id, req.user!);
    return sendSuccess(res, data, "Task deleted");
  }),
};
