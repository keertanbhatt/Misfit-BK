import { RoleName } from "@prisma/client";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../config/mailer";
import { env } from "../config/env";
import { authRepository, type UserWithAuth } from "../repositories/auth.repository";
import { createAuditLog } from "./audit.service";
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "../utils/AppError";
import { comparePassword, hashPassword } from "../utils/password";
import {
  expiresAtFromDuration,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { createHashedToken, hashToken } from "../utils/tokens";
import type { LoginInput, RegisterInput } from "../validators/auth.validators";

function sanitizeUser(user: UserWithAuth) {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

function issueTokens(user: UserWithAuth) {
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role.name,
  });
  const refreshToken = signRefreshToken(user.id);
  return { accessToken, refreshToken };
}

async function storeRefreshToken(
  userId: string,
  refreshToken: string,
  meta?: { userAgent?: string; ipAddress?: string }
) {
  await authRepository.createRefreshToken({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: expiresAtFromDuration(env.jwtRefreshExpiresIn),
    userAgent: meta?.userAgent,
    ipAddress: meta?.ipAddress,
  });
}

async function issueVerification(userId: string, email: string) {
  await authRepository.invalidateEmailVerificationTokens(userId);
  const { raw, hash } = createHashedToken();
  await authRepository.createEmailVerificationToken({
    userId,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  await sendVerificationEmail(email, raw);
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const role = await authRepository.findRoleByName(input.role);
    if (!role) {
      throw new ValidationError("Role not found. Run database seed.");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      roleId: role.id,
      status: "PENDING_VERIFICATION",
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      companyName: input.companyName,
      createFreelancer: input.role === RoleName.FREELANCER,
    });

    await issueVerification(user.id, user.email);

    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entityType: "User",
      entityId: user.id,
      metadata: { role: input.role },
    });

    const tokens = issueTokens(user);
    await storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  },

  async login(
    input: LoginInput,
    meta?: { userAgent?: string; ipAddress?: string }
  ) {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.status === "SUSPENDED" || user.status === "INACTIVE") {
      throw new ForbiddenError("Account is not active");
    }

    await authRepository.updateLastLogin(user.id);
    const tokens = issueTokens(user);
    await storeRefreshToken(user.id, tokens.refreshToken, meta);

    await createAuditLog({
      userId: user.id,
      action: "LOGIN",
      entityType: "User",
      entityId: user.id,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  },

  async refresh(
    refreshToken: string,
    meta?: { userAgent?: string; ipAddress?: string }
  ) {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const stored = await authRepository.findRefreshToken(tokenHash);

    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt < new Date() ||
      stored.userId !== payload.sub
    ) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (stored.user.deletedAt || stored.user.status === "SUSPENDED") {
      throw new UnauthorizedError("Account is not active");
    }

    await authRepository.revokeRefreshToken(stored.id);
    const tokens = issueTokens(stored.user);
    await storeRefreshToken(stored.user.id, tokens.refreshToken, meta);

    return {
      user: sanitizeUser(stored.user),
      ...tokens,
    };
  },

  async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      const stored = await authRepository.findRefreshToken(
        hashToken(refreshToken)
      );
      if (stored && !stored.revokedAt) {
        await authRepository.revokeRefreshToken(stored.id);
        await createAuditLog({
          userId: stored.userId,
          action: "LOGOUT",
          entityType: "User",
          entityId: stored.userId,
        });
      }
      return;
    }

    if (userId) {
      await authRepository.revokeAllRefreshTokens(userId);
      await createAuditLog({
        userId,
        action: "LOGOUT",
        entityType: "User",
        entityId: userId,
      });
    }
  },

  async me(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    return sanitizeUser(user);
  },

  async forgotPassword(email: string) {
    const user = await authRepository.findByEmail(email);
    // Always succeed to avoid email enumeration
    if (!user) {
      return { message: "If that email exists, a reset link was sent" };
    }

    await authRepository.invalidatePasswordResetTokens(user.id);
    const { raw, hash } = createHashedToken();
    await authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    await sendPasswordResetEmail(user.email, raw);

    await createAuditLog({
      userId: user.id,
      action: "PASSWORD_RESET",
      entityType: "User",
      entityId: user.id,
      metadata: { stage: "requested" },
    });

    return { message: "If that email exists, a reset link was sent" };
  },

  async resetPassword(token: string, password: string) {
    const stored = await authRepository.findPasswordResetToken(
      hashToken(token)
    );
    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new ValidationError("Invalid or expired reset token");
    }

    const passwordHash = await hashPassword(password);
    await authRepository.updatePassword(stored.userId, passwordHash);
    await authRepository.markPasswordResetUsed(stored.id);
    await authRepository.revokeAllRefreshTokens(stored.userId);

    await createAuditLog({
      userId: stored.userId,
      action: "PASSWORD_RESET",
      entityType: "User",
      entityId: stored.userId,
      metadata: { stage: "completed" },
    });

    return { message: "Password reset successful" };
  },

  async verifyEmail(token: string) {
    const stored = await authRepository.findEmailVerificationToken(
      hashToken(token)
    );
    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new ValidationError("Invalid or expired verification token");
    }

    const user = await authRepository.markEmailVerified(stored.userId);
    await authRepository.markEmailVerificationUsed(stored.id);

    await createAuditLog({
      userId: stored.userId,
      action: "EMAIL_VERIFY",
      entityType: "User",
      entityId: stored.userId,
    });

    return sanitizeUser(user);
  },

  async resendVerification(email?: string, userId?: string) {
    let targetEmail = email;
    if (!targetEmail && userId) {
      const user = await authRepository.findById(userId);
      targetEmail = user?.email;
    }
    if (!targetEmail) {
      throw new ValidationError("Email is required");
    }
    return this.resendVerificationByEmail(targetEmail);
  },

  async resendVerificationByEmail(email: string) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      return { message: "If that email exists, a verification link was sent" };
    }
    if (user.emailVerifiedAt) {
      return { message: "Email is already verified" };
    }

    await issueVerification(user.id, user.email);
    return { message: "If that email exists, a verification link was sent" };
  },
};
