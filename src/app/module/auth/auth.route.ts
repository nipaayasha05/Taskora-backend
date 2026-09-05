import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { userValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(userValidation.userRegistrationZodSchema),
  authController.registerUser,
);

router.post(
  "/verify-email",
  validateRequest(userValidation.PatientEmailVerifyZodSchema),
  authController.verifyUserEmail,
);

router.post(
  "/login",
  validateRequest(userValidation.loginZodSchema),
  authController.loginUser,
);

export const authRoutes = router;
