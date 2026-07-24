import { dashboardService } from "../services/dashboard.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const dashboardController = {
  stats: asyncHandler(async (req, res) => {
    const data = await dashboardService.stats(req.user!.id);
    return sendSuccess(res, data);
  }),
};
