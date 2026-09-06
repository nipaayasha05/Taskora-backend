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

router.post(
  "/google",
  validateRequest(userValidation.googleLoginZodSchema),
  authController.googleLogin,
);

router.post("/refresh-token", authController.refreshToken);

export const authRoutes = router;
