import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate, optionalAuthenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/auth.validators";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail
);
router.post(
  "/resend-verification",
  optionalAuthenticate,
  validate(resendVerificationSchema),
  authController.resendVerification
);

export default router;
