import { NotFoundError } from "../utils/AppError";
import { userRepository } from "../repositories/user.repository";
import type { UpdateProfileInput } from "../validators/user.validators";

export const userService = {
  async getMe(userId: string) {
    const user = await userRepository.findMe(userId);
    if (!user) throw new NotFoundError("User not found");
    const { passwordHash: _, ...safe } = user;
    return safe;
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userRepository.findMe(userId);
    if (!user?.profile) throw new NotFoundError("Profile not found");

    const profile = await userRepository.updateProfile(userId, input);
    return profile;
  },
};
