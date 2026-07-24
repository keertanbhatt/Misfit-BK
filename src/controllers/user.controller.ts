import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const userController = {
  getMe: asyncHandler(async (req, res) => {
    const data = await userService.getMe(req.user!.id);
    return sendSuccess(res, data);
  }),

  updateMe: asyncHandler(async (req, res) => {
    const data = await userService.updateProfile(req.user!.id, req.body);
    return sendSuccess(res, data, "Profile updated");
  }),
};
