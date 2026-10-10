import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { userController } from "./user.controller";
import { SystemRole } from "../../../../prisma/generated/prisma/enums";

const router = Router();

router.get("/user/overview", auth(), userController.getUserOverview);

router.get(
  "/admin/overview",
  auth(SystemRole.ADMIN),
  userController.getAdminView,
);

export const userRoutes = router;
