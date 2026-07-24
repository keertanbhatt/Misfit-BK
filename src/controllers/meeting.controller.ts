import { meetingService } from "../services/meeting.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const meetingController = {
  create: asyncHandler(async (req, res) => {
    const data = await meetingService.create(req.user!.id, req.body);
    return sendSuccess(res, data, "Meeting created", 201);
  }),

  list: asyncHandler(async (req, res) => {
    const data = await meetingService.list(req.user!, req.query as never);
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await meetingService.getById(req.params.id, req.user!);
    return sendSuccess(res, data);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await meetingService.update(
      req.params.id,
      req.user!,
      req.body
    );
    return sendSuccess(res, data, "Meeting updated");
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await meetingService.remove(req.params.id, req.user!);
    return sendSuccess(res, data, "Meeting deleted");
  }),
};
