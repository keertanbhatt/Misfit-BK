import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { UnauthorizedError } from "../utils/AppError";
import { sendSuccess } from "../utils/response";
import { env } from "../config/env";

const REFRESH_COOKIE = "refreshToken";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: !env.isDev,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });
}

function clientMeta(req: Request) {
  return {
    userAgent: req.get("user-agent") ?? undefined,
    ipAddress: req.ip,
  };
}

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    setRefreshCookie(res, result.refreshToken);
    return sendSuccess(res, result, "Registered successfully", 201);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body, clientMeta(req));
    setRefreshCookie(res, result.refreshToken);
    return sendSuccess(res, result, "Logged in successfully");
  }),

  refresh: asyncHandler(async (req, res) => {
    const refreshToken =
      req.body.refreshToken ||
      (req.cookies?.[REFRESH_COOKIE] as string | undefined);
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token required");
    }
    const result = await authService.refresh(refreshToken, clientMeta(req));
    setRefreshCookie(res, result.refreshToken);
    return sendSuccess(res, result, "Token refreshed");
  }),

  logout: asyncHandler(async (req, res) => {
    const refreshToken =
      req.body?.refreshToken ||
      (req.cookies?.[REFRESH_COOKIE] as string | undefined);
    await authService.logout(refreshToken, req.user?.id);
    clearRefreshCookie(res);
    return sendSuccess(res, null, "Logged out");
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.me(req.user!.id);
    return sendSuccess(res, user);
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);
    return sendSuccess(res, result);
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const result = await authService.resetPassword(
      req.body.token,
      req.body.password
    );
    return sendSuccess(res, result);
  }),

  verifyEmail: asyncHandler(async (req, res) => {
    const user = await authService.verifyEmail(req.body.token);
    return sendSuccess(res, user, "Email verified");
  }),

  resendVerification: asyncHandler(async (req, res) => {
    const result = await authService.resendVerification(
      req.body?.email,
      req.user?.id
    );
    return sendSuccess(res, result);
  }),
};
