import type { RoleName } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/AppError";

export function authorize(...roles: RoleName[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }
    next();
  };
}
