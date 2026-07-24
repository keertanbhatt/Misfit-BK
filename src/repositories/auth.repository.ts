import type { Prisma, RoleName, UserStatus } from "@prisma/client";
import { prisma } from "../prisma";

const userAuthInclude = {
  role: true,
  profile: true,
  freelancer: true,
} satisfies Prisma.UserInclude;

export type UserWithAuth = Prisma.UserGetPayload<{
  include: typeof userAuthInclude;
}>;

export const authRepository = {
  findRoleByName(name: RoleName) {
    return prisma.role.findUnique({ where: { name } });
  },

  findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: userAuthInclude,
    });
  },

  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: userAuthInclude,
    });
  },

  createUser(data: {
    email: string;
    passwordHash: string;
    roleId: string;
    status: UserStatus;
    firstName: string;
    lastName: string;
    phone?: string;
    companyName?: string;
    createFreelancer: boolean;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        roleId: data.roleId,
        status: data.status,
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            displayName: `${data.firstName} ${data.lastName}`.trim(),
            phone: data.phone,
            companyName: data.companyName,
          },
        },
        ...(data.createFreelancer
          ? {
              freelancer: {
                create: {},
              },
            }
          : {}),
      },
      include: userAuthInclude,
    });
  },

  updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  },

  markEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifiedAt: new Date(),
        // Awaiting admin approval before full platform access
        status: "PENDING_APPROVAL",
      },
      include: userAuthInclude,
    });
  },

  updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return prisma.refreshToken.create({ data });
  },

  findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: userAuthInclude } },
    });
  },

  revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },

  revokeAllRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  createEmailVerificationToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.emailVerificationToken.create({ data });
  },

  findEmailVerificationToken(tokenHash: string) {
    return prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  },

  markEmailVerificationUsed(id: string) {
    return prisma.emailVerificationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },

  invalidateEmailVerificationTokens(userId: string) {
    return prisma.emailVerificationToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  },

  createPasswordResetToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.passwordResetToken.create({ data });
  },

  findPasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  },

  markPasswordResetUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },

  invalidatePasswordResetTokens(userId: string) {
    return prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  },
};
