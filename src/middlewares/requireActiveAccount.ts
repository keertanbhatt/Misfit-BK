import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../utils/AppError";
import { prisma } from "../prisma";

/**
 * Blocks FOUNDER/FREELANCER accounts that are not ACTIVE.
 * Admins always pass. Do not mount on /auth routes.
 */
export async function requireActiveAccount(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new ForbiddenError("Authentication required");
    }
    if (req.user.role === "ADMIN") {
      return next();
    }

    const user = await prisma.user.findFirst({
      where: { id: req.user.id, deletedAt: null },
      select: { status: true },
    });

    if (!user) {
      throw new ForbiddenError("User not found");
    }

    if (user.status === "PENDING_VERIFICATION") {
      throw new ForbiddenError(
        "Please verify your email before continuing."
      );
    }

    if (user.status === "PENDING_APPROVAL") {
      throw new ForbiddenError(
        "Your account is awaiting admin approval."
      );
    }

    if (user.status !== "ACTIVE") {
      throw new ForbiddenError("Your account is not active.");
    }

    next();
  } catch (error) {
    next(error);
  }
}
