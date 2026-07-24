import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const userRepository = {
  findMe(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        role: true,
        profile: true,
        freelancer: true,
      },
    });
  },

  updateProfile(userId: string, data: Prisma.ProfileUpdateInput) {
    return prisma.profile.update({
      where: { userId },
      data,
    });
  },
};
