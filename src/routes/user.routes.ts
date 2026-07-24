import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { updateProfileSchema } from "../validators/user.validators";

const router = Router();

router.use(authenticate);
router.get("/me", userController.getMe);
router.patch("/me", validate(updateProfileSchema), userController.updateMe);

export default router;
