import { supportService } from "../services/support.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const supportController = {
  create: asyncHandler(async (req, res) => {
    const data = await supportService.create(req.user!.id, req.body);
    return sendSuccess(res, data, "Support ticket created", 201);
  }),

  list: asyncHandler(async (req, res) => {
    const data = await supportService.list(req.user!, req.query as never);
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await supportService.getById(req.params.id, req.user!);
    return sendSuccess(res, data);
  }),
};
