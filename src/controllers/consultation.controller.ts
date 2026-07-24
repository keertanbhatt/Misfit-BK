import { consultationService } from "../services/consultation.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const consultationController = {
  create: asyncHandler(async (req, res) => {
    const data = await consultationService.create(req.user!.id, req.body);
    return sendSuccess(res, data, "Consultation requested", 201);
  }),

  list: asyncHandler(async (req, res) => {
    const data = await consultationService.list(req.user!, req.query as never);
    return sendSuccess(res, data);
  }),
};
