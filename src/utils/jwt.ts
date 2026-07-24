import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import type { RoleName } from "@prisma/client";
import { env } from "../config/env";
import { UnauthorizedError } from "./AppError";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: RoleName;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
}

export function signAccessToken(payload: {
  userId: string;
  email: string;
  role: RoleName;
}): string {
  const options: SignOptions = {
    expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(
    {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
      type: "access",
    } satisfies AccessTokenPayload,
    env.jwtAccessSecret,
    options
  );
}

export function signRefreshToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.jwtRefreshExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(
    {
      sub: userId,
      type: "refresh",
    } satisfies RefreshTokenPayload,
    env.jwtRefreshSecret,
    options
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as JwtPayload &
      AccessTokenPayload;
    if (decoded.type !== "access" || !decoded.sub) {
      throw new UnauthorizedError("Invalid access token");
    }
    return {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      type: "access",
    };
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwtRefreshSecret) as JwtPayload &
      RefreshTokenPayload;
    if (decoded.type !== "refresh" || !decoded.sub) {
      throw new UnauthorizedError("Invalid refresh token");
    }
    return { sub: decoded.sub, type: "refresh" };
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}

/** Convert duration strings like "15m", "7d", "1h" to a future Date. */
export function expiresAtFromDuration(duration: string): Date {
  const match = /^(\d+)([smhd])$/i.exec(duration.trim());
  if (!match) {
    // Fallback: 7 days
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return new Date(Date.now() + amount * (multipliers[unit] ?? multipliers.d));
}
