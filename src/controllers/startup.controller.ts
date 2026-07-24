import { startupService } from "../services/startup.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const startupController = {
  create: asyncHandler(async (req, res) => {
    const data = await startupService.create(req.user!.id, req.body);
    return sendSuccess(res, data, "Startup created", 201);
  }),

  list: asyncHandler(async (req, res) => {
    const data = await startupService.list(req.query as never, req.user);
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await startupService.getById(req.params.id, req.user);
    return sendSuccess(res, data);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await startupService.update(
      req.params.id,
      req.user!.id,
      req.user!.role,
      req.body
    );
    return sendSuccess(res, data, "Startup updated");
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await startupService.remove(
      req.params.id,
      req.user!.id,
      req.user!.role
    );
    return sendSuccess(res, data, "Startup deleted");
  }),

  submit: asyncHandler(async (req, res) => {
    const data = await startupService.submit(req.params.id, req.user!.id);
    return sendSuccess(res, data, "Startup submitted");
  }),

  review: asyncHandler(async (req, res) => {
    const data = await startupService.review(
      req.params.id,
      req.user!.id,
      req.body
    );
    return sendSuccess(res, data, "Startup reviewed");
  }),
};
