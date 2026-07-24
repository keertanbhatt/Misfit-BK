import { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../utils/AppError";

type RequestTarget = "body" | "query" | "params";

export function validate(schema: ZodSchema, target: RequestTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(
        new ValidationError("Validation failed", result.error.flatten())
      );
    }
    req[target] = result.data;
    next();
  };
}
