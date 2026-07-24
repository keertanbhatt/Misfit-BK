import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma";
import { verifyAccessToken } from "../utils/jwt";
import { UnauthorizedError } from "../utils/AppError";

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid Authorization header");
    }

    const token = header.slice(7).trim();
    if (!token) {
      throw new UnauthorizedError("Missing access token");
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (user.status === "SUSPENDED" || user.status === "INACTIVE") {
      throw new UnauthorizedError("Account is not active");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.name,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/** Attach user if Bearer token present; otherwise continue anonymously. */
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next();
  }
  return authenticate(req, _res, next);
}
